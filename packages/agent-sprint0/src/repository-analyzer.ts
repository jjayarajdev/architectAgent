import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createLogger } from '@ea-mcp/common';

const execAsync = promisify(exec);
const logger = createLogger('repository-analyzer');

export interface RepositoryAnalysis {
  repository?: string;
  architecture: {
    stack: string[];
    patterns: string[];
    structure: string;
  };
  database: {
    type: string;
    tables: string[];
    relationships: string[];
  };
  codeMetrics: {
    files: number;
    languages: Record<string, number>;
    testCoverage: string;
  };
  dependencies: Record<string, string>;
  apis: {
    endpoints: string[];
    authentication: string;
  };
  fileSystem?: {
    files: string[];
    directories: string[];
  };
}

export class RepositoryAnalyzer {
  private tempDir = '/tmp/repo-analysis';
  
  async analyzeRepository(repoUrl: string, branch: string = 'main'): Promise<RepositoryAnalysis> {
    logger.info(`Analyzing repository: ${repoUrl}`);
    
    // Clone repository
    await this.cloneRepository(repoUrl, branch);
    
    // Analyze different aspects
    const [architecture, database, codeMetrics, dependencies, apis, fileSystem] = await Promise.all([
      this.analyzeArchitecture(),
      this.analyzeDatabase(),
      this.analyzeCodeMetrics(),
      this.analyzeDependencies(),
      this.analyzeAPIs(),
      this.analyzeFileSystem()
    ]);
    
    // Cleanup
    await this.cleanup();
    
    return {
      repository: repoUrl,
      architecture,
      database,
      codeMetrics,
      dependencies,
      apis,
      fileSystem
    };
  }
  
  private async cloneRepository(repoUrl: string, branch: string): Promise<void> {
    try {
      await fs.rm(this.tempDir, { recursive: true, force: true });
      await fs.mkdir(this.tempDir, { recursive: true });
      
      const { stdout, stderr } = await execAsync(
        `git clone --depth 1 --branch ${branch} ${repoUrl} ${this.tempDir}`
      );
      
      logger.info('Repository cloned successfully');
    } catch (error) {
      logger.error(`Failed to clone repository: ${error}`);
      throw error;
    }
  }
  
  private async analyzeArchitecture(): Promise<any> {
    const architecture = {
      stack: [] as string[],
      patterns: [] as string[],
      structure: 'unknown'
    };
    
    try {
      // Check for common files
      const files = await fs.readdir(this.tempDir);
      
      // Detect stack
      if (files.includes('package.json')) {
        const packageJson = JSON.parse(
          await fs.readFile(path.join(this.tempDir, 'package.json'), 'utf-8')
        );
        
        if (packageJson.dependencies) {
          if (packageJson.dependencies.express) architecture.stack.push('Express.js');
          if (packageJson.dependencies.react) architecture.stack.push('React');
          if (packageJson.dependencies.next) architecture.stack.push('Next.js');
          if (packageJson.dependencies.vue) architecture.stack.push('Vue');
          if (packageJson.dependencies.angular) architecture.stack.push('Angular');
        }
      }
      
      if (files.includes('requirements.txt')) {
        architecture.stack.push('Python');
      }
      
      if (files.includes('Gemfile')) {
        architecture.stack.push('Ruby');
      }
      
      if (files.includes('pom.xml')) {
        architecture.stack.push('Java/Maven');
      }
      
      // Detect patterns
      if (files.includes('docker-compose.yml') || files.includes('Dockerfile')) {
        architecture.patterns.push('Containerized');
      }
      
      if (files.includes('.github')) {
        architecture.patterns.push('CI/CD');
      }
      
      // Detect structure
      if (files.includes('server') && files.includes('client')) {
        architecture.structure = 'Full-stack monorepo';
      } else if (files.includes('src') && files.includes('public')) {
        architecture.structure = 'Single-page application';
      } else if (files.includes('api') || files.includes('server')) {
        architecture.structure = 'Backend service';
      }
      
    } catch (error) {
      logger.error(`Architecture analysis failed: ${error}`);
    }
    
    return architecture;
  }
  
  private async analyzeDatabase(): Promise<any> {
    const database = {
      type: 'unknown',
      tables: [] as string[],
      relationships: [] as string[]
    };
    
    try {
      // Check for schema files
      const schemaPath = path.join(this.tempDir, 'schema.sql');
      const prismaPath = path.join(this.tempDir, 'prisma/schema.prisma');
      const modelsPath = path.join(this.tempDir, 'models');
      
      if (await this.fileExists(schemaPath)) {
        const schema = await fs.readFile(schemaPath, 'utf-8');
        database.type = 'PostgreSQL';
        
        // Extract table names
        const tableMatches = schema.match(/CREATE TABLE (\w+)/gi);
        if (tableMatches) {
          database.tables = tableMatches.map(m => m.replace(/CREATE TABLE /i, ''));
        }
        
        // Extract foreign keys
        const fkMatches = schema.match(/REFERENCES (\w+)/gi);
        if (fkMatches) {
          database.relationships = [...new Set(fkMatches.map(m => m.replace(/REFERENCES /i, '')))];
        }
      }
      
      if (await this.fileExists(prismaPath)) {
        database.type = 'Prisma ORM';
      }
      
      if (await this.fileExists(modelsPath)) {
        const models = await fs.readdir(modelsPath);
        database.tables = models.filter(f => f.endsWith('.js') || f.endsWith('.ts'))
          .map(f => f.replace(/\.(js|ts)$/, ''));
      }
      
    } catch (error) {
      logger.error(`Database analysis failed: ${error}`);
    }
    
    return database;
  }
  
  private async analyzeCodeMetrics(): Promise<any> {
    const metrics = {
      files: 0,
      languages: {} as Record<string, number>,
      testCoverage: 'unknown'
    };
    
    try {
      // Count files by extension
      const files = await this.getAllFiles(this.tempDir);
      metrics.files = files.length;
      
      for (const file of files) {
        const ext = path.extname(file);
        if (ext) {
          metrics.languages[ext] = (metrics.languages[ext] || 0) + 1;
        }
      }
      
      // Check for test files
      const testFiles = files.filter(f => 
        f.includes('.test.') || f.includes('.spec.') || f.includes('__tests__')
      );
      
      if (testFiles.length > 0) {
        const ratio = (testFiles.length / files.length * 100).toFixed(1);
        metrics.testCoverage = `${ratio}% (estimated)`;
      }
      
    } catch (error) {
      logger.error(`Code metrics analysis failed: ${error}`);
    }
    
    return metrics;
  }
  
  private async analyzeDependencies(): Promise<Record<string, string>> {
    const dependencies: Record<string, string> = {};
    
    try {
      const packageJsonPath = path.join(this.tempDir, 'package.json');
      if (await this.fileExists(packageJsonPath)) {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        Object.assign(dependencies, packageJson.dependencies || {});
      }
    } catch (error) {
      logger.error(`Dependencies analysis failed: ${error}`);
    }
    
    return dependencies;
  }
  
  private async analyzeAPIs(): Promise<any> {
    const apis = {
      endpoints: [] as string[],
      authentication: 'unknown'
    };
    
    try {
      // Search for route files
      const files = await this.getAllFiles(this.tempDir);
      const routeFiles = files.filter(f => 
        f.includes('routes') || f.includes('api') || f.includes('endpoints')
      );
      
      for (const file of routeFiles.slice(0, 10)) { // Limit to first 10 files
        try {
          const content = await fs.readFile(file, 'utf-8');
          
          // Extract route patterns
          const routeMatches = content.match(/\.(get|post|put|delete|patch)\(['"`]([^'"`]+)/gi);
          if (routeMatches) {
            apis.endpoints.push(...routeMatches.map(m => {
              const parts = m.split(/['"`]/);
              return parts[1] || '';
            }).filter(Boolean));
          }
          
          // Detect authentication
          if (content.includes('jwt') || content.includes('JWT')) {
            apis.authentication = 'JWT';
          } else if (content.includes('oauth') || content.includes('OAuth')) {
            apis.authentication = 'OAuth';
          } else if (content.includes('passport')) {
            apis.authentication = 'Passport.js';
          }
        } catch (err) {
          // Skip files that can't be read
        }
      }
      
      apis.endpoints = [...new Set(apis.endpoints)].slice(0, 20); // Unique and limit
      
    } catch (error) {
      logger.error(`API analysis failed: ${error}`);
    }
    
    return apis;
  }
  
  private async getAllFiles(dir: string, files: string[] = []): Promise<string[]> {
    try {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules') continue;
        
        const fullPath = path.join(dir, item);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          await this.getAllFiles(fullPath, files);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return files;
  }
  
  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
  
  private async analyzeFileSystem(): Promise<{ files: string[], directories: string[] }> {
    try {
      const { stdout } = await execAsync(`find ${this.tempDir} -type f -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.java" -o -name "*.go" -o -name "*.json" -o -name "*.yaml" -o -name "*.yml" | head -100`);
      const files = stdout.split('\n').filter(Boolean).map(f => f.replace(this.tempDir + '/', ''));
      
      const { stdout: dirOut } = await execAsync(`find ${this.tempDir} -type d | head -50`);
      const directories = dirOut.split('\n').filter(Boolean).map(d => d.replace(this.tempDir + '/', ''));
      
      return { files, directories };
    } catch {
      return { files: [], directories: [] };
    }
  }

  private async cleanup(): Promise<void> {
    try {
      await fs.rm(this.tempDir, { recursive: true, force: true });
    } catch (error) {
      logger.error(`Cleanup failed: ${error}`);
    }
  }
}