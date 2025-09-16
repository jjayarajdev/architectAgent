#!/usr/bin/env node

/**
 * Real EA Assessment Generator
 * Actually analyzes repositories and generates context-specific recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RepositoryAnalyzer {
  constructor(repoPath) {
    this.repoPath = repoPath;
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
    
    // Analyze project structure
    this.analysis.structure = await this.analyzeStructure();
    
    // Analyze database
    this.analysis.database = await this.analyzeDatabase();
    
    // Analyze APIs
    this.analysis.api = await this.analyzeAPIs();
    
    // Analyze frontend
    this.analysis.frontend = await this.analyzeFrontend();
    
    // Analyze dependencies
    this.analysis.dependencies = await this.analyzeDependencies();
    
    // Detect patterns
    this.analysis.patterns = await this.detectPatterns();
    
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

    // Check for package.json
    const packageJsonPath = path.join(this.repoPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      structure.type = 'node';
      structure.framework = this.detectFramework(packageJson);
      if (packageJson.main) structure.entryPoints.push(packageJson.main);
      if (packageJson.scripts?.start) structure.entryPoints.push('start script');
    }

    // Scan directories
    const items = fs.readdirSync(this.repoPath);
    for (const item of items) {
      const itemPath = path.join(this.repoPath, item);
      if (fs.statSync(itemPath).isDirectory() && !item.startsWith('.')) {
        structure.directories.push(item);
      }
    }

    // Detect languages
    const files = this.getAllFiles(this.repoPath);
    const extensions = new Set();
    files.forEach(file => {
      const ext = path.extname(file);
      if (ext) extensions.add(ext);
    });
    
    structure.languages = this.mapExtensionsToLanguages(extensions);
    
    return structure;
  }

  async analyzeDatabase() {
    const db = {
      type: null,
      models: [],
      migrations: [],
      schemas: [],
      connections: []
    };

    // Check for Prisma
    const prismaPath = path.join(this.repoPath, 'prisma');
    if (fs.existsSync(prismaPath)) {
      db.type = 'prisma';
      const schemaPath = path.join(prismaPath, 'schema.prisma');
      if (fs.existsSync(schemaPath)) {
        const content = fs.readFileSync(schemaPath, 'utf8');
        db.models = this.extractPrismaModels(content);
      }
    }

    // Check for TypeORM
    const entitiesPath = path.join(this.repoPath, 'src', 'entities');
    if (fs.existsSync(entitiesPath)) {
      db.type = 'typeorm';
      db.models = this.scanForEntities(entitiesPath);
    }

    // Check for Mongoose
    const modelsPath = path.join(this.repoPath, 'models');
    if (fs.existsSync(modelsPath)) {
      const files = fs.readdirSync(modelsPath);
      for (const file of files) {
        if (file.endsWith('.js') || file.endsWith('.ts')) {
          const content = fs.readFileSync(path.join(modelsPath, file), 'utf8');
          if (content.includes('mongoose.Schema')) {
            db.type = 'mongoose';
            db.models.push(file.replace(/\.(js|ts)$/, ''));
          }
        }
      }
    }

    // Check for migrations
    const migrationsPath = path.join(this.repoPath, 'migrations');
    if (fs.existsSync(migrationsPath)) {
      db.migrations = fs.readdirSync(migrationsPath)
        .filter(f => f.endsWith('.sql') || f.endsWith('.js'));
    }

    // Check for raw SQL schemas
    const sqlFiles = this.findFiles(this.repoPath, '.sql');
    for (const sqlFile of sqlFiles) {
      const content = fs.readFileSync(sqlFile, 'utf8');
      const tables = this.extractSQLTables(content);
      db.schemas.push(...tables);
    }

    return db;
  }

  async analyzeAPIs() {
    const api = {
      type: null,
      routes: [],
      controllers: [],
      services: [],
      middleware: []
    };

    // Check for Express routes
    const routesPath = path.join(this.repoPath, 'routes');
    if (fs.existsSync(routesPath)) {
      api.type = 'express';
      api.routes = this.scanDirectory(routesPath, ['.js', '.ts']);
    }

    // Check for Next.js API routes
    const nextApiPath = path.join(this.repoPath, 'pages', 'api');
    if (fs.existsSync(nextApiPath)) {
      api.type = 'nextjs';
      api.routes = this.scanDirectory(nextApiPath, ['.js', '.ts', '.jsx', '.tsx']);
    }

    // Check for controllers
    const controllersPath = path.join(this.repoPath, 'controllers');
    if (fs.existsSync(controllersPath)) {
      api.controllers = this.scanDirectory(controllersPath, ['.js', '.ts']);
    }

    // Check for services
    const servicesPath = path.join(this.repoPath, 'services');
    if (fs.existsSync(servicesPath)) {
      api.services = this.scanDirectory(servicesPath, ['.js', '.ts']);
    }

    // Scan for API definitions in code
    const apiFiles = this.findFiles(this.repoPath, '.js', '.ts');
    for (const file of apiFiles.slice(0, 20)) { // Limit scan for performance
      const content = fs.readFileSync(file, 'utf8');
      const endpoints = this.extractAPIEndpoints(content);
      api.routes.push(...endpoints);
    }

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

    // Check for React
    const packageJsonPath = path.join(this.repoPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.dependencies?.react) {
        frontend.framework = 'react';
        
        // Check for state management
        if (packageJson.dependencies?.redux) frontend.state = 'redux';
        if (packageJson.dependencies?.mobx) frontend.state = 'mobx';
        if (packageJson.dependencies?.zustand) frontend.state = 'zustand';
        
        // Check for styling
        if (packageJson.dependencies?.['styled-components']) frontend.styling = 'styled-components';
        if (packageJson.dependencies?.['@emotion/react']) frontend.styling = 'emotion';
        if (packageJson.dependencies?.tailwindcss) frontend.styling = 'tailwind';
      }
      
      if (packageJson.dependencies?.vue) frontend.framework = 'vue';
      if (packageJson.dependencies?.['@angular/core']) frontend.framework = 'angular';
    }

    // Scan for components
    const componentsPath = path.join(this.repoPath, 'components');
    if (fs.existsSync(componentsPath)) {
      frontend.components = this.scanDirectory(componentsPath, ['.jsx', '.tsx', '.vue']);
    }

    // Scan for pages
    const pagesPath = path.join(this.repoPath, 'pages');
    if (fs.existsSync(pagesPath)) {
      frontend.pages = this.scanDirectory(pagesPath, ['.jsx', '.tsx', '.vue']);
    }

    return frontend;
  }

  async analyzeDependencies() {
    const deps = {
      production: {},
      development: {},
      total: 0
    };

    const packageJsonPath = path.join(this.repoPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      deps.production = packageJson.dependencies || {};
      deps.development = packageJson.devDependencies || {};
      deps.total = Object.keys(deps.production).length + Object.keys(deps.development).length;
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

    // Detect architecture pattern
    const hasSrc = fs.existsSync(path.join(this.repoPath, 'src'));
    const hasControllers = fs.existsSync(path.join(this.repoPath, 'controllers'));
    const hasServices = fs.existsSync(path.join(this.repoPath, 'services'));
    const hasModels = fs.existsSync(path.join(this.repoPath, 'models'));
    
    if (hasControllers && hasServices && hasModels) {
      patterns.architecture = 'mvc';
    } else if (hasSrc) {
      const srcDirs = fs.readdirSync(path.join(this.repoPath, 'src'));
      if (srcDirs.includes('domain') || srcDirs.includes('application')) {
        patterns.architecture = 'clean';
      } else if (srcDirs.includes('features')) {
        patterns.architecture = 'feature-based';
      } else {
        patterns.architecture = 'modular';
      }
    }

    // Detect testing
    const hasTests = fs.existsSync(path.join(this.repoPath, 'tests')) || 
                    fs.existsSync(path.join(this.repoPath, '__tests__'));
    if (hasTests) {
      const packageJsonPath = path.join(this.repoPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.devDependencies?.jest) patterns.testing = 'jest';
        if (packageJson.devDependencies?.mocha) patterns.testing = 'mocha';
        if (packageJson.devDependencies?.vitest) patterns.testing = 'vitest';
      }
    }

    // Detect CI/CD
    if (fs.existsSync(path.join(this.repoPath, '.github', 'workflows'))) {
      patterns.ci = 'github-actions';
    } else if (fs.existsSync(path.join(this.repoPath, '.gitlab-ci.yml'))) {
      patterns.ci = 'gitlab';
    } else if (fs.existsSync(path.join(this.repoPath, 'Jenkinsfile'))) {
      patterns.ci = 'jenkins';
    }

    // Detect containerization
    patterns.containerization = fs.existsSync(path.join(this.repoPath, 'Dockerfile'));

    // Detect authentication
    const authFiles = this.findFiles(this.repoPath, 'auth');
    if (authFiles.length > 0) {
      // Scan for auth libraries
      const packageJsonPath = path.join(this.repoPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.dependencies?.['passport']) patterns.authentication = 'passport';
        if (packageJson.dependencies?.['jsonwebtoken']) patterns.authentication = 'jwt';
        if (packageJson.dependencies?.['@auth0/nextjs-auth0']) patterns.authentication = 'auth0';
      }
    }

    return patterns;
  }

  // Helper methods
  detectFramework(packageJson) {
    if (packageJson.dependencies?.express) return 'express';
    if (packageJson.dependencies?.next) return 'nextjs';
    if (packageJson.dependencies?.['@nestjs/core']) return 'nestjs';
    if (packageJson.dependencies?.fastify) return 'fastify';
    if (packageJson.dependencies?.koa) return 'koa';
    return null;
  }

  getAllFiles(dirPath, files = []) {
    if (!fs.existsSync(dirPath)) return files;
    
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      if (item.startsWith('.') || item === 'node_modules') continue;
      
      const fullPath = path.join(dirPath, item);
      if (fs.statSync(fullPath).isDirectory()) {
        this.getAllFiles(fullPath, files);
      } else {
        files.push(fullPath);
      }
    }
    return files;
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
      '.sql': 'SQL'
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
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi;
    let match;
    while ((match = tableRegex.exec(content)) !== null) {
      tables.push(match[1]);
    }
    return tables;
  }

  extractAPIEndpoints(content) {
    const endpoints = [];
    const routeRegex = /\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)/gi;
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      endpoints.push(`${match[1].toUpperCase()} ${match[2]}`);
    }
    return endpoints;
  }

  scanDirectory(dirPath, extensions) {
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

  findFiles(dirPath, ...patterns) {
    const results = [];
    const files = this.getAllFiles(dirPath);
    
    for (const file of files) {
      if (patterns.some(pattern => file.includes(pattern))) {
        results.push(file);
      }
    }
    return results;
  }
}

class LLMAnalyzer {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateAssessment(repoAnalysis, changeRequest, projectName) {
    console.log('🤖 Generating comprehensive change request document...');
    
    const prompt = this.buildPrompt(repoAnalysis, changeRequest, projectName);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a Senior Enterprise Architect creating a comprehensive Change Request document. Generate a production-ready document that includes:

1. Executive Summary with clear business objectives
2. Detailed functional requirements (FR) with specific acceptance criteria
3. Non-functional requirements (NFR) covering security, performance, privacy
4. Complete data model changes with SQL migrations and ER diagrams
5. API contracts in OpenAPI 3.0 format
6. Solution architecture with flow diagrams
7. Detailed workflow diagrams (BPMN-style)
8. Classification service logic with actual code
9. RBAC and visibility matrix
10. Test strategy covering unit, integration, E2E, security tests
11. Observability requirements with specific metrics and SLAs
12. Rollout plan with feature flags and phases
13. Risk assessment and mitigations
14. Actual code examples that work with the existing codebase

The document must be specific to the repository analyzed, using actual table names, API patterns, and architectural decisions found in the codebase.
Format everything in proper Markdown with Mermaid diagrams.
Be extremely detailed and technical - this is for implementation teams.`
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

  buildPrompt(analysis, changeRequest, projectName) {
    return `Analyze this repository and provide a detailed technical assessment for implementing the requested change.

PROJECT: ${projectName}
CHANGE REQUEST: ${changeRequest}

REPOSITORY ANALYSIS:

## Structure
- Type: ${analysis.structure.type}
- Framework: ${analysis.structure.framework || 'None detected'}
- Languages: ${analysis.structure.languages.join(', ')}
- Main directories: ${analysis.structure.directories.join(', ')}

## Database
- Type: ${analysis.database.type || 'None detected'}
- Existing Models: ${analysis.database.models.join(', ') || 'None found'}
- Existing Tables: ${analysis.database.schemas.join(', ') || 'None found'}
- Migrations: ${analysis.database.migrations.length} migration files

## APIs
- Type: ${analysis.api.type || 'None detected'}
- Routes: ${analysis.api.routes.length} endpoints found
- Controllers: ${analysis.api.controllers.join(', ') || 'None'}
- Services: ${analysis.api.services.join(', ') || 'None'}

## Frontend
- Framework: ${analysis.frontend.framework || 'None detected'}
- Components: ${analysis.frontend.components.length} components
- Pages: ${analysis.frontend.pages.length} pages
- State Management: ${analysis.frontend.state || 'None'}
- Styling: ${analysis.frontend.styling || 'Default'}

## Patterns & Practices
- Architecture: ${analysis.patterns.architecture}
- Testing Framework: ${analysis.patterns.testing || 'None'}
- CI/CD: ${analysis.patterns.ci || 'None'}
- Containerized: ${analysis.patterns.containerization ? 'Yes' : 'No'}
- Authentication: ${analysis.patterns.authentication || 'None detected'}

## Dependencies
- Total: ${analysis.dependencies.total} packages
- Key dependencies: ${Object.keys(analysis.dependencies.production).slice(0, 10).join(', ')}

Based on this actual repository structure, provide:

1. SPECIFIC DATA MODEL CHANGES
   - Extend the existing models/tables listed above
   - Create new tables that follow the same patterns
   - Include actual SQL or schema definitions matching the database type
   - Create an ER diagram showing relationships with existing tables

2. API MODIFICATIONS
   - New endpoints following the existing routing patterns
   - Modifications to existing controllers/services listed above
   - Request/response schemas matching current patterns

3. FRONTEND CHANGES
   - Components to modify from the list above
   - New components following the existing component structure
   - State management changes using the detected state solution

4. IMPLEMENTATION STEPS
   - Specific files to modify based on the directory structure
   - Order of implementation considering existing architecture
   - Testing approach using the detected testing framework

5. TECHNICAL CONSIDERATIONS
   - Performance impacts on the existing architecture
   - Security considerations with the current auth system
   - Scalability given the current patterns

Be specific and reference the actual files, models, and patterns found in the repository analysis.`;
  }

  async generateERDiagram(analysis, changeRequest) {
    const existingTables = [
      ...analysis.database.models,
      ...analysis.database.schemas
    ];

    const prompt = `Based on this change request: "${changeRequest}"
And these existing database tables: ${existingTables.join(', ')}

Generate a Mermaid ER diagram showing:
1. The existing tables (simplified with key fields only)
2. New tables needed for this change
3. Relationships between existing and new tables

Return ONLY the Mermaid diagram syntax, nothing else.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Generate only Mermaid ER diagram syntax. No explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  }
}

class EAGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generate(repoPath, changeRequest, projectName) {
    // Clone repo if it's a URL
    if (repoPath.startsWith('http')) {
      console.log('📦 Cloning repository...');
      const tempDir = path.join('/tmp', `ea-analysis-${Date.now()}`);
      execSync(`git clone ${repoPath} ${tempDir}`, { stdio: 'inherit' });
      repoPath = tempDir;
    }

    // Analyze repository
    const analyzer = new RepositoryAnalyzer(repoPath);
    const analysis = await analyzer.analyze();

    // Generate assessment with LLM
    const llm = new LLMAnalyzer(this.apiKey);
    const assessment = await llm.generateAssessment(analysis, changeRequest, projectName);
    const erDiagram = await llm.generateERDiagram(analysis, changeRequest);

    // Create full report
    const report = this.createReport(projectName, changeRequest, analysis, assessment, erDiagram);

    // Save report
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${projectName}-assessment-${timestamp}.md`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, report);
    console.log(`✅ Assessment saved to: ${filepath}`);

    // Cleanup temp directory if we cloned
    if (repoPath.startsWith('/tmp')) {
      execSync(`rm -rf ${repoPath}`);
    }

    return filepath;
  }

  createReport(projectName, changeRequest, analysis, assessment, erDiagram) {
    const timestamp = new Date().toISOString().split('T')[0];
    const crId = `CR-${timestamp.replace(/-/g, '')}-${projectName.toUpperCase().substring(0, 3)}-001`;
    
    return `# Change Request (CR)

**ID:** ${crId}
**Title:** ${changeRequest}
**Date:** ${timestamp}
**Requester:** Product/Engineering Team
**Owner:** Enterprise Architecture
**Project:** ${projectName}

---

## Repository Context

**Analyzed Repository:** ${projectName}
- **Architecture Pattern:** ${analysis.patterns.architecture}
- **Framework:** ${analysis.structure.framework || 'Custom'}
- **Database:** ${analysis.database.type || 'SQL'} with ${analysis.database.schemas.length} existing tables
- **API Layer:** ${analysis.api.type || 'REST'} with ${analysis.api.routes.length} existing endpoints
- **Frontend:** ${analysis.frontend.framework || 'React'} with ${analysis.frontend.components.length} components
- **Dependencies:** ${analysis.dependencies.total} packages

**Existing Tables Found:**
${analysis.database.schemas.map(t => `- ${t}`).join('\n') || '- No tables detected'}

**Existing API Patterns:**
${analysis.api.routes.slice(0, 5).map(r => `- ${r}`).join('\n') || '- No routes detected'}

---

${assessment}

---

## Appendix A: Entity Relationship Diagram (Generated)

\`\`\`mermaid
${erDiagram}
\`\`\`

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
*This document contains implementation-ready specifications tailored to your codebase*`;
  }
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node ea-generator.js <repo-path-or-url> "<change-request>" <project-name>');
    console.log('Example: node ea-generator.js https://github.com/user/repo.git "Add authentication" ProjectName');
    console.log('\nNote: Requires OPENAI_API_KEY environment variable');
    process.exit(1);
  }

  const [repoPath, changeRequest, projectName] = args;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('❌ ERROR: OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  const generator = new EAGenerator(apiKey);
  generator.generate(repoPath, changeRequest, projectName)
    .then(filepath => {
      console.log(`\n✅ SUCCESS: Assessment generated at ${filepath}`);
    })
    .catch(error => {
      console.error('❌ ERROR:', error.message);
      process.exit(1);
    });
}

export default EAGenerator;