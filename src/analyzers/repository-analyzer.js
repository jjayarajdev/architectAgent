import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export class RepositoryAnalyzer {
  constructor(repoPath, options = {}) {
    this.repoPath = repoPath;
    this.tempPath = null;
    this.projectName = path.basename(repoPath);
    this.verbose = options.verbose || false;
  }

  log(message, data = null) {
    if (this.verbose) {
      console.log(`[RepositoryAnalyzer] ${message}`);
      if (data) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  async analyze() {
    this.log(`Starting analysis of ${this.repoPath}`);
    
    // Clone if it's a URL
    if (this.repoPath.startsWith('http')) {
      await this.cloneRepository();
    }

    const analysis = {
      structure: await this.analyzeStructure(),
      database: await this.analyzeDatabase(),
      api: await this.analyzeAPI(),
      frontend: await this.analyzeFrontend(),
      patterns: await this.analyzePatterns(),
      dependencies: await this.analyzeDependencies()
    };

    this.log('Analysis complete', analysis);
    
    // Clean up temp directory if created
    if (this.tempPath) {
      this.cleanup();
    }

    return analysis;
  }

  async cloneRepository() {
    const tempDir = `/tmp/${this.projectName}-${Date.now()}`;
    this.log(`Cloning repository to ${tempDir}`);
    
    try {
      execSync(`git clone ${this.repoPath} ${tempDir}`, { stdio: 'pipe' });
      this.tempPath = tempDir;
      this.repoPath = tempDir;
      this.log('Repository cloned successfully');
    } catch (error) {
      console.error('Failed to clone repository:', error.message);
      throw error;
    }
  }

  async analyzeStructure() {
    const structure = {
      type: 'unknown',
      framework: null,
      languages: [],
      directories: []
    };

    // Detect project type
    const files = fs.readdirSync(this.repoPath);
    
    if (files.includes('package.json')) {
      const pkg = JSON.parse(fs.readFileSync(path.join(this.repoPath, 'package.json'), 'utf8'));
      structure.type = 'node';
      structure.languages.push('JavaScript', 'TypeScript');
      
      // Detect framework
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['next']) structure.framework = 'Next.js';
      else if (deps['react']) structure.framework = 'React';
      else if (deps['vue']) structure.framework = 'Vue';
      else if (deps['express']) structure.framework = 'Express';
      else if (deps['fastify']) structure.framework = 'Fastify';
      else if (deps['@nestjs/core']) structure.framework = 'NestJS';
    }

    if (files.includes('requirements.txt') || files.includes('setup.py')) {
      structure.type = 'python';
      structure.languages.push('Python');
    }

    if (files.includes('pom.xml')) {
      structure.type = 'java';
      structure.framework = 'Maven';
      structure.languages.push('Java');
    }

    if (files.includes('build.gradle')) {
      structure.type = 'java';
      structure.framework = 'Gradle';
      structure.languages.push('Java');
    }

    // Get main directories
    structure.directories = files.filter(f => {
      const stats = fs.statSync(path.join(this.repoPath, f));
      return stats.isDirectory() && !f.startsWith('.');
    });

    this.log('Structure analysis:', structure);
    return structure;
  }

  async analyzeDatabase() {
    const db = {
      type: null,
      tables: [],
      schemas: [],
      migrations: []
    };

    // Check for Prisma
    const prismaPath = path.join(this.repoPath, 'prisma');
    if (fs.existsSync(prismaPath)) {
      db.type = 'prisma';
      const schemaFile = path.join(prismaPath, 'schema.prisma');
      if (fs.existsSync(schemaFile)) {
        const content = fs.readFileSync(schemaFile, 'utf8');
        const models = content.match(/model\s+(\w+)\s*{/g);
        if (models) {
          db.tables = models.map(m => m.match(/model\s+(\w+)/)[1]);
        }
      }
    }

    // Check for Sequelize models
    const modelsPath = path.join(this.repoPath, 'models');
    if (fs.existsSync(modelsPath)) {
      const modelFiles = fs.readdirSync(modelsPath).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
      for (const file of modelFiles) {
        const content = fs.readFileSync(path.join(modelsPath, file), 'utf8');
        if (content.includes('sequelize.define') || content.includes('DataTypes')) {
          db.type = 'sequelize';
          const modelName = file.replace(/\.(js|ts)$/, '');
          db.tables.push(modelName);
        }
      }
    }

    // Check for TypeORM entities
    const entitiesPath = path.join(this.repoPath, 'entities');
    if (fs.existsSync(entitiesPath)) {
      const entityFiles = fs.readdirSync(entitiesPath).filter(f => f.endsWith('.entity.ts'));
      for (const file of entityFiles) {
        db.type = 'typeorm';
        const entityName = file.replace('.entity.ts', '');
        db.tables.push(entityName);
      }
    }

    // Check for raw SQL schemas
    const sqlFiles = this.findFiles(this.repoPath, '.sql');
    for (const sqlFile of sqlFiles) {
      const content = fs.readFileSync(sqlFile, 'utf8');
      const tables = this.extractSQLTables(content);
      db.schemas.push(...tables);
    }

    // Check for migrations
    const migrationsPath = path.join(this.repoPath, 'migrations');
    if (fs.existsSync(migrationsPath)) {
      db.migrations = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.js') || f.endsWith('.sql'));
    }

    // Deduplicate tables
    db.tables = [...new Set([...db.tables, ...db.schemas])];

    this.log('Database analysis:', db);
    return db;
  }

  async analyzeAPI() {
    const api = {
      type: 'REST',
      routes: [],
      controllers: [],
      services: []
    };

    // Find route files
    const routePatterns = ['routes', 'api', 'controllers', 'endpoints'];
    for (const pattern of routePatterns) {
      const routePath = path.join(this.repoPath, pattern);
      if (fs.existsSync(routePath)) {
        const files = this.getFilesRecursive(routePath);
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf8');
          const routes = this.extractRoutes(content);
          api.routes.push(...routes);
          
          if (file.includes('controller')) {
            api.controllers.push(path.basename(file));
          }
          if (file.includes('service')) {
            api.services.push(path.basename(file));
          }
        }
      }
    }

    // Check for GraphQL
    if (this.findFiles(this.repoPath, '.graphql').length > 0 || 
        this.findFiles(this.repoPath, 'schema.gql').length > 0) {
      api.type = 'GraphQL';
    }

    // Check for gRPC
    if (this.findFiles(this.repoPath, '.proto').length > 0) {
      api.type = 'gRPC';
    }

    // Deduplicate routes
    api.routes = [...new Set(api.routes)];

    this.log('API analysis:', api);
    return api;
  }

  async analyzeFrontend() {
    const frontend = {
      framework: null,
      components: [],
      pages: [],
      state: null,
      styling: null
    };

    // Check for React/Next.js
    const componentsPath = path.join(this.repoPath, 'components');
    const srcPath = path.join(this.repoPath, 'src');
    const pagesPath = path.join(this.repoPath, 'pages');
    const appPath = path.join(this.repoPath, 'app');

    if (fs.existsSync(componentsPath)) {
      frontend.components = this.getFilesRecursive(componentsPath)
        .filter(f => f.endsWith('.jsx') || f.endsWith('.tsx'))
        .map(f => path.basename(f));
    }

    if (fs.existsSync(srcPath)) {
      const srcComponents = this.getFilesRecursive(srcPath)
        .filter(f => (f.endsWith('.jsx') || f.endsWith('.tsx')) && f.includes('component'))
        .map(f => path.basename(f));
      frontend.components.push(...srcComponents);
    }

    if (fs.existsSync(pagesPath)) {
      frontend.pages = this.getFilesRecursive(pagesPath)
        .filter(f => f.endsWith('.jsx') || f.endsWith('.tsx') || f.endsWith('.js'))
        .map(f => path.basename(f));
    }

    if (fs.existsSync(appPath)) {
      frontend.pages = this.getFilesRecursive(appPath)
        .filter(f => f.includes('page.'))
        .map(f => path.basename(f));
    }

    // Check for state management
    const storeFiles = this.findFiles(this.repoPath, 'store');
    if (storeFiles.length > 0) {
      const storeContent = fs.readFileSync(storeFiles[0], 'utf8');
      if (storeContent.includes('redux')) frontend.state = 'Redux';
      else if (storeContent.includes('zustand')) frontend.state = 'Zustand';
      else if (storeContent.includes('mobx')) frontend.state = 'MobX';
      else if (storeContent.includes('recoil')) frontend.state = 'Recoil';
    }

    // Check for styling
    if (this.findFiles(this.repoPath, '.scss').length > 0) frontend.styling = 'SCSS';
    else if (this.findFiles(this.repoPath, 'tailwind.config').length > 0) frontend.styling = 'Tailwind CSS';
    else if (this.findFiles(this.repoPath, 'styled-components').length > 0) frontend.styling = 'Styled Components';
    else if (this.findFiles(this.repoPath, '.css').length > 0) frontend.styling = 'CSS';

    this.log('Frontend analysis:', frontend);
    return frontend;
  }

  async analyzePatterns() {
    const patterns = {
      architecture: 'monolithic',
      testing: null,
      ci: null,
      containerization: false,
      authentication: null
    };

    // Check for microservices
    if (fs.existsSync(path.join(this.repoPath, 'services')) || 
        fs.existsSync(path.join(this.repoPath, 'packages'))) {
      patterns.architecture = 'microservices';
    }

    // Check for testing
    const testFiles = this.findFiles(this.repoPath, '.test.') || this.findFiles(this.repoPath, '.spec.');
    if (testFiles.length > 0) {
      const testContent = fs.readFileSync(testFiles[0], 'utf8');
      if (testContent.includes('jest')) patterns.testing = 'Jest';
      else if (testContent.includes('mocha')) patterns.testing = 'Mocha';
      else if (testContent.includes('vitest')) patterns.testing = 'Vitest';
      else if (testContent.includes('pytest')) patterns.testing = 'Pytest';
    }

    // Check for CI/CD
    if (fs.existsSync(path.join(this.repoPath, '.github/workflows'))) patterns.ci = 'GitHub Actions';
    else if (fs.existsSync(path.join(this.repoPath, '.gitlab-ci.yml'))) patterns.ci = 'GitLab CI';
    else if (fs.existsSync(path.join(this.repoPath, 'Jenkinsfile'))) patterns.ci = 'Jenkins';

    // Check for containerization
    if (fs.existsSync(path.join(this.repoPath, 'Dockerfile')) || 
        fs.existsSync(path.join(this.repoPath, 'docker-compose.yml'))) {
      patterns.containerization = true;
    }

    // Check for authentication
    const authPatterns = ['auth', 'login', 'jwt', 'oauth', 'passport'];
    for (const pattern of authPatterns) {
      const authFiles = this.findFiles(this.repoPath, pattern);
      if (authFiles.length > 0) {
        const content = fs.readFileSync(authFiles[0], 'utf8');
        if (content.includes('jwt')) patterns.authentication = 'JWT';
        else if (content.includes('oauth')) patterns.authentication = 'OAuth';
        else if (content.includes('passport')) patterns.authentication = 'Passport';
        else patterns.authentication = 'Custom';
        break;
      }
    }

    this.log('Patterns analysis:', patterns);
    return patterns;
  }

  async analyzeDependencies() {
    const deps = {
      total: 0,
      production: {},
      development: {}
    };

    const packagePath = path.join(this.repoPath, 'package.json');
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      deps.production = pkg.dependencies || {};
      deps.development = pkg.devDependencies || {};
      deps.total = Object.keys(deps.production).length + Object.keys(deps.development).length;
    }

    this.log('Dependencies analysis:', { total: deps.total });
    return deps;
  }

  // Helper methods
  findFiles(dir, pattern) {
    const results = [];
    try {
      const files = this.getFilesRecursive(dir);
      return files.filter(f => f.includes(pattern));
    } catch (error) {
      return results;
    }
  }

  getFilesRecursive(dir) {
    const results = [];
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          results.push(...this.getFilesRecursive(fullPath));
        } else if (stat.isFile()) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    return results;
  }

  extractSQLTables(content) {
    const tables = [];
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?/gi;
    let match;
    while ((match = createTableRegex.exec(content)) !== null) {
      tables.push(match[1]);
    }
    return tables;
  }

  extractRoutes(content) {
    const routes = [];
    const routePatterns = [
      /app\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/gi,
      /router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/gi,
      /@(Get|Post|Put|Delete|Patch)\(['"]([^'"]+)['"]/gi,
      /route:\s*['"]([^'"]+)['"]/gi
    ];

    for (const pattern of routePatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const route = match[2] || match[1];
        if (route && !route.includes('*')) {
          routes.push(route);
        }
      }
    }

    return routes;
  }

  cleanup() {
    if (this.tempPath) {
      try {
        execSync(`rm -rf ${this.tempPath}`, { stdio: 'pipe' });
        this.log(`Cleaned up temporary directory: ${this.tempPath}`);
      } catch (error) {
        console.error('Failed to cleanup temp directory:', error.message);
      }
    }
  }
}