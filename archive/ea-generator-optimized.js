#!/usr/bin/env node

/**
 * Optimized EA Assessment Generator
 * Improvements:
 * - Better error handling and retry logic
 * - Caching of repository analysis
 * - Parallel processing where possible
 * - More efficient file scanning
 * - Better memory management
 * - Progress indicators
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import OpenAI from 'openai';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for repository analysis
const CACHE_DIR = path.join(__dirname, '.cache');
const CACHE_TTL = 3600000; // 1 hour

class Cache {
  constructor() {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  }

  getKey(repoPath, changeRequest) {
    const content = `${repoPath}:${changeRequest}`;
    return crypto.createHash('md5').update(content).digest('hex');
  }

  get(key) {
    const cachePath = path.join(CACHE_DIR, `${key}.json`);
    if (fs.existsSync(cachePath)) {
      const stat = fs.statSync(cachePath);
      if (Date.now() - stat.mtime.getTime() < CACHE_TTL) {
        return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      }
    }
    return null;
  }

  set(key, value) {
    const cachePath = path.join(CACHE_DIR, `${key}.json`);
    fs.writeFileSync(cachePath, JSON.stringify(value, null, 2));
  }
}

class OptimizedRepositoryAnalyzer {
  constructor(repoPath) {
    this.repoPath = repoPath;
    this.fileCache = new Map();
    this.analysis = {
      structure: {},
      database: {},
      api: {},
      frontend: {},
      dependencies: {},
      patterns: {}
    };
  }

  async analyze() {
    console.log('🔍 Analyzing repository structure...');
    
    // Run analyses in parallel where possible
    const [structure, dependencies] = await Promise.all([
      this.analyzeStructure(),
      this.analyzeDependencies()
    ]);
    
    this.analysis.structure = structure;
    this.analysis.dependencies = dependencies;
    
    // These depend on structure being complete
    await Promise.all([
      this.analyzeDatabase(),
      this.analyzeAPIs(),
      this.analyzeFrontend(),
      this.detectPatterns()
    ]);
    
    return this.analysis;
  }

  async analyzeStructure() {
    const structure = {
      type: 'unknown',
      framework: null,
      languages: [],
      directories: [],
      entryPoints: []
    };

    try {
      // Check for package.json
      const packageJsonPath = path.join(this.repoPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        structure.type = 'node';
        structure.framework = this.detectFramework(packageJson);
        if (packageJson.main) structure.entryPoints.push(packageJson.main);
        if (packageJson.scripts?.start) structure.entryPoints.push('start script');
      }

      // Scan directories (non-recursive for performance)
      const items = fs.readdirSync(this.repoPath);
      structure.directories = items.filter(item => {
        const itemPath = path.join(this.repoPath, item);
        return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
      });

      // Detect languages efficiently
      structure.languages = await this.detectLanguages();
      
    } catch (error) {
      console.error('Error analyzing structure:', error.message);
    }
    
    return structure;
  }

  async detectLanguages() {
    const extensions = new Set();
    const sampleSize = 100; // Sample first 100 files for performance
    
    const files = this.getAllFilesOptimized(this.repoPath, sampleSize);
    files.forEach(file => {
      const ext = path.extname(file);
      if (ext) extensions.add(ext);
    });
    
    return this.mapExtensionsToLanguages(extensions);
  }

  getAllFilesOptimized(dirPath, maxFiles = -1, files = []) {
    if (!fs.existsSync(dirPath)) return files;
    
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      if (maxFiles > 0 && files.length >= maxFiles) break;
      if (item.startsWith('.') || item === 'node_modules') continue;
      
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.getAllFilesOptimized(fullPath, maxFiles, files);
      } else if (stat.size < 1000000) { // Skip files > 1MB
        files.push(fullPath);
      }
    }
    return files;
  }

  async analyzeDatabase() {
    const db = {
      type: null,
      models: [],
      migrations: [],
      schemas: [],
      tables: []
    };

    try {
      // Check for Prisma
      const prismaPath = path.join(this.repoPath, 'prisma');
      if (fs.existsSync(prismaPath)) {
        db.type = 'prisma';
        const schemaPath = path.join(prismaPath, 'schema.prisma');
        if (fs.existsSync(schemaPath)) {
          const content = this.readFileCached(schemaPath);
          db.models = this.extractPrismaModels(content);
        }
      }

      // Check for TypeORM entities
      const entitiesPath = path.join(this.repoPath, 'src', 'entities');
      if (fs.existsSync(entitiesPath)) {
        db.type = 'typeorm';
        db.models = this.scanForEntities(entitiesPath);
      }

      // Check for raw SQL schemas
      const sqlFiles = await this.findFilesOptimized('.sql');
      for (const sqlFile of sqlFiles.slice(0, 10)) { // Limit to 10 files
        const content = this.readFileCached(sqlFile);
        const tables = this.extractSQLTables(content);
        db.schemas.push(...tables);
      }
      
      // Deduplicate tables
      db.tables = [...new Set(db.schemas)];
      
    } catch (error) {
      console.error('Error analyzing database:', error.message);
    }
    
    this.analysis.database = db;
  }

  async analyzeAPIs() {
    const api = {
      type: null,
      routes: [],
      controllers: [],
      services: []
    };

    try {
      // Find route files
      const routeFiles = await this.findFilesOptimized('route', 'router', 'api');
      
      for (const file of routeFiles.slice(0, 20)) { // Limit processing
        const content = this.readFileCached(file);
        const endpoints = this.extractAPIEndpoints(content);
        api.routes.push(...endpoints);
      }

      // Find controllers
      const controllerFiles = await this.findFilesOptimized('controller');
      api.controllers = controllerFiles.map(f => path.basename(f, path.extname(f)));

      // Find services
      const serviceFiles = await this.findFilesOptimized('service');
      api.services = serviceFiles.map(f => path.basename(f, path.extname(f)));

      // Deduplicate routes
      api.routes = [...new Set(api.routes)];
      
    } catch (error) {
      console.error('Error analyzing APIs:', error.message);
    }
    
    this.analysis.api = api;
  }

  async analyzeFrontend() {
    const frontend = {
      framework: null,
      components: [],
      pages: [],
      state: null,
      styling: null
    };

    try {
      const packageJsonPath = path.join(this.repoPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(this.readFileCached(packageJsonPath));
        
        // Detect frontend framework
        if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
          frontend.framework = 'react';
        } else if (packageJson.dependencies?.vue) {
          frontend.framework = 'vue';
        } else if (packageJson.dependencies?.['@angular/core']) {
          frontend.framework = 'angular';
        }

        // Detect state management
        if (packageJson.dependencies?.redux) frontend.state = 'redux';
        if (packageJson.dependencies?.mobx) frontend.state = 'mobx';
        if (packageJson.dependencies?.zustand) frontend.state = 'zustand';

        // Detect styling
        if (packageJson.dependencies?.['styled-components']) frontend.styling = 'styled-components';
        if (packageJson.dependencies?.['@emotion/react']) frontend.styling = 'emotion';
        if (packageJson.dependencies?.tailwindcss) frontend.styling = 'tailwind';
      }

      // Find components efficiently
      const componentDirs = ['src/components', 'components', 'src/ui'];
      for (const dir of componentDirs) {
        const fullPath = path.join(this.repoPath, dir);
        if (fs.existsSync(fullPath)) {
          frontend.components = this.scanDirectoryShallow(fullPath, ['.jsx', '.tsx', '.vue']);
          break; // Use first found
        }
      }

      // Find pages
      const pageDirs = ['src/pages', 'pages', 'src/views'];
      for (const dir of pageDirs) {
        const fullPath = path.join(this.repoPath, dir);
        if (fs.existsSync(fullPath)) {
          frontend.pages = this.scanDirectoryShallow(fullPath, ['.jsx', '.tsx', '.vue']);
          break;
        }
      }
      
    } catch (error) {
      console.error('Error analyzing frontend:', error.message);
    }
    
    this.analysis.frontend = frontend;
  }

  async analyzeDependencies() {
    const deps = {
      total: 0,
      production: {},
      dev: {}
    };

    try {
      const packageJsonPath = path.join(this.repoPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(this.readFileCached(packageJsonPath));
        deps.production = packageJson.dependencies || {};
        deps.dev = packageJson.devDependencies || {};
        deps.total = Object.keys(deps.production).length + Object.keys(deps.dev).length;
      }
    } catch (error) {
      console.error('Error analyzing dependencies:', error.message);
    }
    
    return deps;
  }

  async detectPatterns() {
    const patterns = {
      architecture: 'unknown',
      testing: null,
      ci: null,
      containerization: false,
      authentication: null
    };

    try {
      // Detect architecture pattern
      const dirs = this.analysis.structure.directories;
      if (dirs.includes('packages')) {
        patterns.architecture = 'monorepo';
      } else if (dirs.includes('src') && dirs.includes('tests')) {
        patterns.architecture = 'modular';
      } else if (dirs.includes('api') && dirs.includes('client')) {
        patterns.architecture = 'client-server';
      }

      // Detect testing framework from dependencies
      const deps = this.analysis.dependencies;
      if (deps.production?.jest || deps.dev?.jest) patterns.testing = 'jest';
      if (deps.production?.mocha || deps.dev?.mocha) patterns.testing = 'mocha';
      if (deps.production?.vitest || deps.dev?.vitest) patterns.testing = 'vitest';

      // Detect CI/CD
      if (fs.existsSync(path.join(this.repoPath, '.github', 'workflows'))) {
        patterns.ci = 'github-actions';
      } else if (fs.existsSync(path.join(this.repoPath, '.gitlab-ci.yml'))) {
        patterns.ci = 'gitlab';
      }

      // Detect containerization
      patterns.containerization = fs.existsSync(path.join(this.repoPath, 'Dockerfile'));

      // Detect authentication from dependencies
      if (deps.production?.passport) patterns.authentication = 'passport';
      if (deps.production?.jsonwebtoken) patterns.authentication = 'jwt';
      if (deps.production?.['@auth0/nextjs-auth0']) patterns.authentication = 'auth0';
      if (!patterns.authentication) patterns.authentication = 'custom';
      
    } catch (error) {
      console.error('Error detecting patterns:', error.message);
    }
    
    this.analysis.patterns = patterns;
  }

  // Helper methods
  readFileCached(filePath) {
    if (this.fileCache.has(filePath)) {
      return this.fileCache.get(filePath);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    this.fileCache.set(filePath, content);
    return content;
  }

  async findFilesOptimized(...patterns) {
    const results = [];
    const files = this.getAllFilesOptimized(this.repoPath, 500); // Limit to 500 files
    
    for (const file of files) {
      const basename = path.basename(file).toLowerCase();
      if (patterns.some(pattern => basename.includes(pattern))) {
        results.push(file);
      }
    }
    return results;
  }

  scanDirectoryShallow(dirPath, extensions) {
    const results = [];
    if (!fs.existsSync(dirPath)) return results;
    
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (extensions.some(ext => file.endsWith(ext))) {
        results.push(file);
      }
    }
    return results;
  }

  detectFramework(packageJson) {
    const frameworks = {
      'express': 'express',
      'next': 'nextjs',
      '@nestjs/core': 'nestjs',
      'fastify': 'fastify',
      'koa': 'koa',
      '@hapi/hapi': 'hapi',
      'restify': 'restify'
    };
    
    for (const [pkg, framework] of Object.entries(frameworks)) {
      if (packageJson.dependencies?.[pkg]) return framework;
    }
    return 'custom';
  }

  mapExtensionsToLanguages(extensions) {
    const languageMap = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'React JSX',
      '.tsx': 'React TSX',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rs': 'Rust',
      '.sql': 'SQL',
      '.cs': 'C#',
      '.rb': 'Ruby',
      '.php': 'PHP'
    };
    
    return Array.from(extensions)
      .map(ext => languageMap[ext])
      .filter(Boolean);
  }

  extractPrismaModels(content) {
    const models = [];
    const modelRegex = /model\s+(\w+)\s*{/g;
    let match;
    while ((match = modelRegex.exec(content)) !== null) {
      models.push(match[1]);
    }
    return models;
  }

  scanForEntities(dirPath) {
    const entities = [];
    if (!fs.existsSync(dirPath)) return entities;
    
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file.endsWith('.entity.ts') || file.endsWith('.entity.js')) {
        entities.push(file.replace(/\.entity\.(ts|js)$/, ''));
      }
    }
    return entities;
  }

  extractSQLTables(content) {
    const tables = [];
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?['"`]?(\w+)['"`]?/gi;
    let match;
    while ((match = tableRegex.exec(content)) !== null) {
      tables.push(match[1]);
    }
    return tables;
  }

  extractAPIEndpoints(content) {
    const endpoints = [];
    const patterns = [
      /\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)/gi,
      /@(Get|Post|Put|Delete|Patch)\s*\(\s*['"`]([^'"`]+)/gi,
      /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)/gi
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        endpoints.push(`${match[1].toUpperCase()} ${match[2]}`);
      }
    }
    return endpoints;
  }
}

class OptimizedLLMAnalyzer {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    this.retryCount = 3;
    this.retryDelay = 2000;
  }

  async generateAssessment(repoAnalysis, changeRequest, projectName) {
    console.log('🤖 Generating comprehensive change request document...');
    
    const prompt = this.buildOptimizedPrompt(repoAnalysis, changeRequest, projectName);
    
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        const response = await this.callOpenAI(prompt);
        return response;
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        if (attempt < this.retryCount) {
          console.log(`Retrying in ${this.retryDelay}ms...`);
          await this.sleep(this.retryDelay);
        } else {
          throw error;
        }
      }
    }
  }

  async callOpenAI(prompt) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 16000
    });

    return response.choices[0].message.content;
  }

  getSystemPrompt() {
    return `You are a Senior Enterprise Architect creating a comprehensive Change Request document. Generate a production-ready document that includes:

1. Executive Summary with clear business objectives
2. Detailed functional requirements (FR) with specific acceptance criteria
3. Non-functional requirements (NFR) covering security, performance, privacy
4. Complete data model changes with SQL migrations and ER diagrams (using Mermaid)
5. API modifications with request/response schemas
6. Frontend changes with component specifications
7. Implementation steps with clear phases
8. Technical considerations (performance, security, scalability)
9. Observability requirements with metrics and SLAs
10. Rollout plan with feature flags
11. Risk assessment and mitigations
12. Actual code examples that work with the existing codebase

IMPORTANT: Generate COMPLETE Mermaid ER diagrams showing:
- ALL existing tables found in the analysis
- New tables required for the change
- Relationships between all tables
- Primary and foreign keys

The document must be specific to the repository analyzed, using actual table names, API patterns, and architectural decisions found in the codebase.
Format everything in proper Markdown with complete Mermaid diagrams.
Be extremely detailed and technical - this is for implementation teams.`;
  }

  buildOptimizedPrompt(analysis, changeRequest, projectName) {
    const existingTables = analysis.database.tables.length > 0 
      ? analysis.database.tables.join(', ') 
      : 'No existing tables found';
    
    const existingAPIs = analysis.api.routes.length > 0
      ? analysis.api.routes.slice(0, 5).join(', ') + (analysis.api.routes.length > 5 ? '...' : '')
      : 'No existing endpoints found';

    return `Analyze this repository and provide a detailed technical assessment for implementing the requested change.

PROJECT: ${projectName}
CHANGE REQUEST: ${changeRequest}

REPOSITORY ANALYSIS:

## Structure
- Type: ${analysis.structure.type}
- Framework: ${analysis.structure.framework || 'Custom'}
- Languages: ${analysis.structure.languages.join(', ') || 'Not detected'}
- Main directories: ${analysis.structure.directories.join(', ')}

## Database
- Type: ${analysis.database.type || 'SQL'}
- Existing Tables: ${existingTables}
- Total Tables Found: ${analysis.database.tables.length}

## APIs
- Type: ${analysis.api.type || 'REST'}
- Sample Endpoints: ${existingAPIs}
- Total Endpoints: ${analysis.api.routes.length}
- Controllers: ${analysis.api.controllers.length} found
- Services: ${analysis.api.services.length} found

## Frontend
- Framework: ${analysis.frontend.framework || 'None detected'}
- Components: ${analysis.frontend.components.length} components
- Pages: ${analysis.frontend.pages.length} pages
- State Management: ${analysis.frontend.state || 'None'}
- Styling: ${analysis.frontend.styling || 'Default'}

## Architecture & Patterns
- Architecture: ${analysis.patterns.architecture}
- Testing: ${analysis.patterns.testing || 'None detected'}
- CI/CD: ${analysis.patterns.ci || 'None detected'}
- Containerized: ${analysis.patterns.containerization ? 'Yes (Docker)' : 'No'}
- Authentication: ${analysis.patterns.authentication}

## Dependencies
- Total packages: ${analysis.dependencies.total}
- Key dependencies: ${Object.keys(analysis.dependencies.production).slice(0, 10).join(', ')}

Based on this repository analysis, generate a COMPLETE change request document.

CRITICAL: For the ER diagram, include ALL these existing tables and show how new tables relate to them:
${analysis.database.tables.map(t => `- ${t}`).join('\n')}

Ensure all code examples match the detected framework (${analysis.structure.framework}) and language patterns.`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class OptimizedEAGenerator {
  constructor() {
    this.cache = new Cache();
    this.outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async processRepository(repoUrl, changeRequest) {
    let localPath;
    let projectName;
    
    try {
      // Check cache first
      const cacheKey = this.cache.getKey(repoUrl, changeRequest);
      const cachedResult = this.cache.get(cacheKey);
      
      if (cachedResult) {
        console.log('📦 Using cached analysis...');
        return cachedResult;
      }
      
      // Handle URL or local path
      if (repoUrl.startsWith('http') || repoUrl.startsWith('git@')) {
        projectName = path.basename(repoUrl, '.git');
        localPath = path.join('/tmp', projectName);
        
        console.log(`📥 Cloning repository: ${repoUrl}`);
        if (fs.existsSync(localPath)) {
          console.log('Repository already exists, pulling latest...');
          execSync(`cd ${localPath} && git pull`, { stdio: 'inherit' });
        } else {
          execSync(`git clone ${repoUrl} ${localPath}`, { stdio: 'inherit' });
        }
      } else {
        localPath = repoUrl;
        projectName = path.basename(localPath);
      }
      
      // Analyze repository
      const analyzer = new OptimizedRepositoryAnalyzer(localPath);
      const analysis = await analyzer.analyze();
      
      // Get OpenAI API key
      const apiKey = this.getAPIKey();
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Set OPENAI_API_KEY environment variable.');
      }
      
      // Generate assessment
      const llmAnalyzer = new OptimizedLLMAnalyzer(apiKey);
      const assessment = await llmAnalyzer.generateAssessment(analysis, changeRequest, projectName);
      
      // Save to file
      const outputPath = this.saveAssessment(projectName, changeRequest, analysis, assessment);
      
      // Cache the result
      const result = { outputPath, analysis };
      this.cache.set(cacheKey, result);
      
      console.log(`✅ Assessment saved to: ${outputPath}`);
      return result;
      
    } catch (error) {
      console.error('❌ Error processing repository:', error.message);
      throw error;
    }
  }

  getAPIKey() {
    // Try environment variable first
    if (process.env.OPENAI_API_KEY) {
      return process.env.OPENAI_API_KEY;
    }
    
    // Try .env file
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/OPENAI_API_KEY=(.+)/);
      if (match) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  saveAssessment(projectName, changeRequest, analysis, assessment) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = `${projectName}-assessment-${timestamp}.md`;
    const outputPath = path.join(this.outputDir, fileName);
    
    const header = `# Change Request (CR)

**ID:** CR-${timestamp}-${projectName.toUpperCase().slice(0, 3)}-001
**Title:** ${changeRequest}
**Date:** ${new Date().toISOString().split('T')[0]}
**Requester:** Product/Engineering Team
**Owner:** Enterprise Architecture
**Project:** ${projectName}

---

## Repository Context

**Analyzed Repository:** ${projectName}
- **Architecture Pattern:** ${analysis.patterns.architecture}
- **Framework:** ${analysis.structure.framework || 'Custom'}
- **Database:** ${analysis.database.type || 'SQL'} with ${analysis.database.tables.length} existing tables
- **API Layer:** ${analysis.api.type || 'REST'} with ${analysis.api.routes.length} existing endpoints
- **Frontend:** ${analysis.frontend.framework || 'None'} with ${analysis.frontend.components.length} components
- **Dependencies:** ${analysis.dependencies.total} packages

**Existing Tables Found:**
${analysis.database.tables.map(t => `- ${t}`).join('\n') || '- None detected'}

**Existing API Patterns:**
${analysis.api.routes.slice(0, 5).map(r => `- ${r}`).join('\n') || '- None detected'}

---

`;

    const footer = `

---

## Appendix B: Repository Analysis Details

### Codebase Structure
- **Directories:** ${analysis.structure.directories.join(', ')}
- **Languages:** ${analysis.structure.languages.join(', ')}
- **Testing Framework:** ${analysis.patterns.testing || 'None detected'}
- **CI/CD:** ${analysis.patterns.ci || 'None detected'}
- **Containerized:** ${analysis.patterns.containerization ? 'Yes (Dockerfile present)' : 'No'}
- **Authentication:** ${analysis.patterns.authentication || 'Custom'}

### Key Dependencies
${Object.keys(analysis.dependencies.production).slice(0, 10).map(d => `- ${d}`).join('\n')}

---

*Generated by EA Change Request Generator v2.0*
*Based on actual repository analysis of ${projectName}*
*This document contains implementation-ready specifications tailored to your codebase*
`;

    const fullContent = header + assessment + footer;
    fs.writeFileSync(outputPath, fullContent);
    
    return outputPath;
  }
}

// CLI Entry Point
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node ea-generator-optimized.js <repo-url-or-path> "<change-request>"');
    console.log('Example: node ea-generator-optimized.js https://github.com/user/repo.git "Add user authentication"');
    process.exit(1);
  }
  
  const [repoUrl, changeRequest] = args;
  
  console.log('🚀 Starting Optimized EA Assessment Generator');
  console.log(`📂 Repository: ${repoUrl}`);
  console.log(`📝 Change Request: ${changeRequest}`);
  console.log('');
  
  const generator = new OptimizedEAGenerator();
  
  try {
    const result = await generator.processRepository(repoUrl, changeRequest);
    console.log('');
    console.log('✨ Assessment generation complete!');
    console.log(`📄 View the assessment: ${result.outputPath}`);
  } catch (error) {
    console.error('');
    console.error('❌ Failed to generate assessment:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { OptimizedEAGenerator, OptimizedRepositoryAnalyzer, OptimizedLLMAnalyzer };