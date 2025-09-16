import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { RepositoryAnalyzer } from './repository-analyzer.js';

class Cache {
  constructor(ttl = 3600000) { // 1 hour default
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

export class OptimizedRepositoryAnalyzer extends RepositoryAnalyzer {
  constructor(repoPath, options = {}) {
    super(repoPath, options);
    this.cache = new Cache(options.cacheTTL);
    this.maxFileSize = options.maxFileSize || 1024 * 1024; // 1MB
    this.maxFilesToAnalyze = options.maxFilesToAnalyze || 100;
    this.sampleRate = options.sampleRate || 0.3; // Sample 30% of files
  }

  async analyze() {
    const cacheKey = `analysis_${this.repoPath}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      this.log('Using cached analysis');
      return cached;
    }

    this.log(`Starting optimized analysis of ${this.repoPath}`);
    
    // Clone if it's a URL
    if (this.repoPath.startsWith('http')) {
      await this.cloneRepository();
    }

    // Run analyses in parallel where possible
    const [structure, dependencies] = await Promise.all([
      this.analyzeStructure(),
      this.analyzeDependencies()
    ]);

    // Sequential analyses that depend on structure
    const [database, api, frontend, patterns] = await Promise.all([
      this.analyzeDatabase(),
      this.analyzeAPI(),
      this.analyzeFrontend(),
      this.analyzePatterns()
    ]);

    const analysis = {
      structure,
      database,
      api,
      frontend,
      patterns,
      dependencies
    };

    this.cache.set(cacheKey, analysis);
    this.log('Analysis complete and cached', analysis);
    
    // Clean up temp directory if created
    if (this.tempPath) {
      this.cleanup();
    }

    return analysis;
  }

  async analyzeDatabase() {
    const db = {
      type: null,
      tables: [],
      schemas: [],
      migrations: []
    };

    // Check for Prisma with early return
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
      // Early return for Prisma projects
      if (db.tables.length > 0) {
        this.log('Database analysis (Prisma):', db);
        return db;
      }
    }

    // Parallel check for other ORMs
    const checks = await Promise.all([
      this.checkSequelizeModels(),
      this.checkTypeORMEntities(),
      this.checkSQLSchemas(),
      this.checkMigrations()
    ]);

    // Merge results
    const [sequelize, typeorm, sqlSchemas, migrations] = checks;
    
    if (sequelize.tables.length > 0) {
      db.type = 'sequelize';
      db.tables.push(...sequelize.tables);
    }
    
    if (typeorm.tables.length > 0) {
      db.type = 'typeorm';
      db.tables.push(...typeorm.tables);
    }
    
    db.schemas.push(...sqlSchemas);
    db.migrations = migrations;

    // Deduplicate tables
    db.tables = [...new Set([...db.tables, ...db.schemas])];

    this.log('Database analysis:', db);
    return db;
  }

  async checkSequelizeModels() {
    const result = { tables: [] };
    const modelsPath = path.join(this.repoPath, 'models');
    
    if (!fs.existsSync(modelsPath)) return result;
    
    const modelFiles = fs.readdirSync(modelsPath)
      .filter(f => f.endsWith('.js') || f.endsWith('.ts'))
      .slice(0, this.maxFilesToAnalyze);
      
    for (const file of modelFiles) {
      try {
        const filePath = path.join(modelsPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.size > this.maxFileSize) continue;
        
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('sequelize.define') || content.includes('DataTypes')) {
          const modelName = file.replace(/\.(js|ts)$/, '');
          result.tables.push(modelName);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    return result;
  }

  async checkTypeORMEntities() {
    const result = { tables: [] };
    const entitiesPath = path.join(this.repoPath, 'entities');
    
    if (!fs.existsSync(entitiesPath)) return result;
    
    const entityFiles = fs.readdirSync(entitiesPath)
      .filter(f => f.endsWith('.entity.ts'))
      .slice(0, this.maxFilesToAnalyze);
      
    for (const file of entityFiles) {
      const entityName = file.replace('.entity.ts', '');
      result.tables.push(entityName);
    }
    
    return result;
  }

  async checkSQLSchemas() {
    const schemas = [];
    const sqlFiles = this.findFiles(this.repoPath, '.sql')
      .slice(0, Math.floor(this.maxFilesToAnalyze * this.sampleRate));
      
    for (const sqlFile of sqlFiles) {
      try {
        const stats = fs.statSync(sqlFile);
        if (stats.size > this.maxFileSize) continue;
        
        const content = fs.readFileSync(sqlFile, 'utf8');
        const tables = this.extractSQLTables(content);
        schemas.push(...tables);
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    return schemas;
  }

  async checkMigrations() {
    const migrations = [];
    const migrationsPath = path.join(this.repoPath, 'migrations');
    
    if (!fs.existsSync(migrationsPath)) return migrations;
    
    return fs.readdirSync(migrationsPath)
      .filter(f => f.endsWith('.js') || f.endsWith('.sql'))
      .slice(0, this.maxFilesToAnalyze);
  }

  async analyzeAPI() {
    const api = {
      type: 'REST',
      routes: [],
      controllers: [],
      services: []
    };

    // Sample files for API analysis
    const routePatterns = ['routes', 'api', 'controllers', 'endpoints'];
    const filesToAnalyze = [];
    
    for (const pattern of routePatterns) {
      const routePath = path.join(this.repoPath, pattern);
      if (fs.existsSync(routePath)) {
        const files = this.getFilesRecursive(routePath)
          .filter(f => f.endsWith('.js') || f.endsWith('.ts'))
          .slice(0, Math.floor(this.maxFilesToAnalyze * this.sampleRate));
        filesToAnalyze.push(...files);
      }
    }

    // Analyze files in batches
    const batchSize = 10;
    for (let i = 0; i < filesToAnalyze.length; i += batchSize) {
      const batch = filesToAnalyze.slice(i, i + batchSize);
      await Promise.all(batch.map(async (file) => {
        try {
          const stats = fs.statSync(file);
          if (stats.size > this.maxFileSize) return;
          
          const content = fs.readFileSync(file, 'utf8');
          const routes = this.extractRoutes(content);
          api.routes.push(...routes);
          
          const basename = path.basename(file);
          if (basename.includes('controller')) {
            api.controllers.push(basename);
          }
          if (basename.includes('service')) {
            api.services.push(basename);
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }));
    }

    // Quick checks for API type
    const hasGraphQL = this.findFiles(this.repoPath, '.graphql').length > 0 || 
                      this.findFiles(this.repoPath, 'schema.gql').length > 0;
    const hasProto = this.findFiles(this.repoPath, '.proto').length > 0;
    
    if (hasGraphQL) api.type = 'GraphQL';
    else if (hasProto) api.type = 'gRPC';

    // Deduplicate
    api.routes = [...new Set(api.routes)];
    api.controllers = [...new Set(api.controllers)];
    api.services = [...new Set(api.services)];

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

    const paths = [
      { dir: 'components', type: 'components' },
      { dir: 'src/components', type: 'components' },
      { dir: 'pages', type: 'pages' },
      { dir: 'app', type: 'pages' }
    ];

    // Parallel path checking
    await Promise.all(paths.map(async ({ dir, type }) => {
      const fullPath = path.join(this.repoPath, dir);
      if (fs.existsSync(fullPath)) {
        const files = this.getFilesRecursive(fullPath)
          .filter(f => f.endsWith('.jsx') || f.endsWith('.tsx') || f.endsWith('.js'))
          .slice(0, Math.floor(this.maxFilesToAnalyze * this.sampleRate))
          .map(f => path.basename(f));
          
        if (type === 'components') {
          frontend.components.push(...files);
        } else if (type === 'pages') {
          frontend.pages.push(...files);
        }
      }
    }));

    // Quick state management check
    const storeFiles = this.findFiles(this.repoPath, 'store').slice(0, 1);
    if (storeFiles.length > 0) {
      try {
        const content = fs.readFileSync(storeFiles[0], 'utf8');
        if (content.includes('redux')) frontend.state = 'Redux';
        else if (content.includes('zustand')) frontend.state = 'Zustand';
        else if (content.includes('mobx')) frontend.state = 'MobX';
        else if (content.includes('recoil')) frontend.state = 'Recoil';
      } catch (error) {
        // Skip if can't read
      }
    }

    // Quick styling check
    const styleChecks = [
      { pattern: '.scss', name: 'SCSS' },
      { pattern: 'tailwind.config', name: 'Tailwind CSS' },
      { pattern: 'styled-components', name: 'Styled Components' }
    ];

    for (const { pattern, name } of styleChecks) {
      if (this.findFiles(this.repoPath, pattern).length > 0) {
        frontend.styling = name;
        break;
      }
    }

    if (!frontend.styling && this.findFiles(this.repoPath, '.css').length > 0) {
      frontend.styling = 'CSS';
    }

    this.log('Frontend analysis:', frontend);
    return frontend;
  }

  // Override getFilesRecursive for better performance
  getFilesRecursive(dir, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return [];
    
    const results = [];
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== 'build') {
          results.push(...this.getFilesRecursive(fullPath, depth + 1, maxDepth));
        } else if (stat.isFile()) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    return results;
  }
}