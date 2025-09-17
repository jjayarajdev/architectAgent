/**
 * Repository Intelligence Agent
 * 
 * Specializes in deep repository analysis, code introspection,
 * and structural understanding of codebases.
 */

import { BaseAgent } from './base-agent.js';
import { RepositoryAnalyzer } from '../analyzers/repository-analyzer.js';
import fs from 'fs';
import path from 'path';

export class RepoIntelAgent extends BaseAgent {
  constructor(options = {}) {
    super('RepoIntelAgent', options);
    
    this.capabilities = [
      'repository_structure_analysis',
      'dependency_detection',
      'framework_identification',
      'database_schema_extraction',
      'api_route_mapping',
      'component_discovery'
    ];
    
    this.analyzer = null;
  }

  async initialize() {
    await super.initialize();
    this.log('Repository Intelligence Agent ready for analysis');
    return true;
  }

  async execute(context) {
    this.validateContext(context);
    this.setStatus('analyzing');
    
    const { repoPath, options = {} } = context;
    
    try {
      this.currentTask = 'repository_analysis';
      this.log(`Starting repository analysis for: ${repoPath}`);
      
      // Initialize repository analyzer
      this.analyzer = new RepositoryAnalyzer(repoPath, {
        verbose: this.verbose,
        ...options
      });
      
      // Perform deep analysis
      const analysis = await this.analyzer.analyze();
      
      // Enhance analysis with additional insights
      const enhancedAnalysis = await this.enhanceAnalysis(analysis);
      
      // Store results
      this.results.push({
        timestamp: new Date().toISOString(),
        task: 'repository_analysis',
        data: enhancedAnalysis
      });
      
      this.log('Repository analysis completed successfully', 'success');
      this.setStatus('completed');
      
      return {
        success: true,
        agent: this.name,
        analysis: enhancedAnalysis,
        metrics: this.extractMetrics(enhancedAnalysis)
      };
      
    } catch (error) {
      this.handleError(error);
      return {
        success: false,
        agent: this.name,
        error: error.message
      };
    }
  }

  /**
   * Enhance basic analysis with additional insights
   */
  async enhanceAnalysis(analysis) {
    const enhanced = { ...analysis };
    
    // Add code quality metrics
    enhanced.quality = {
      hasTests: this.detectTests(analysis),
      hasDocumentation: this.detectDocumentation(analysis),
      hasCICD: this.detectCICD(analysis),
      hasLinting: this.detectLinting(analysis)
    };
    
    // Add architecture patterns
    enhanced.patterns = {
      isMonolith: this.detectMonolithPattern(analysis),
      isMicroservices: this.detectMicroservicesPattern(analysis),
      isServerless: this.detectServerlessPattern(analysis),
      isEventDriven: this.detectEventDrivenPattern(analysis)
    };
    
    // Add technology stack summary
    enhanced.techStack = this.summarizeTechStack(analysis);
    
    return enhanced;
  }

  /**
   * Detect if repository has tests
   */
  detectTests(analysis) {
    const testPatterns = ['test', 'spec', '__tests__', 'tests'];
    return analysis.structure.directories.some(dir => 
      testPatterns.some(pattern => dir.toLowerCase().includes(pattern))
    );
  }

  /**
   * Detect if repository has documentation
   */
  detectDocumentation(analysis) {
    const docPatterns = ['README', 'docs', 'documentation', 'CONTRIBUTING'];
    return analysis.structure.files.some(file => 
      docPatterns.some(pattern => file.toUpperCase().includes(pattern.toUpperCase()))
    );
  }

  /**
   * Detect CI/CD configuration
   */
  detectCICD(analysis) {
    const ciPatterns = ['.github/workflows', '.gitlab-ci', 'Jenkinsfile', '.circleci'];
    return analysis.structure.files.some(file => 
      ciPatterns.some(pattern => file.includes(pattern))
    );
  }

  /**
   * Detect linting configuration
   */
  detectLinting(analysis) {
    const lintPatterns = ['eslint', 'prettier', 'tslint', 'pylint'];
    return analysis.dependencies?.dev?.some(dep => 
      lintPatterns.some(pattern => dep.toLowerCase().includes(pattern))
    ) || false;
  }

  /**
   * Detect monolith architecture pattern
   */
  detectMonolithPattern(analysis) {
    return !this.detectMicroservicesPattern(analysis) && 
           analysis.structure.directories.length < 10;
  }

  /**
   * Detect microservices architecture pattern
   */
  detectMicroservicesPattern(analysis) {
    const servicePatterns = ['services', 'microservices', 'apps'];
    return analysis.structure.directories.some(dir => 
      servicePatterns.some(pattern => dir.toLowerCase().includes(pattern))
    );
  }

  /**
   * Detect serverless architecture pattern
   */
  detectServerlessPattern(analysis) {
    const serverlessPatterns = ['serverless.yml', 'lambda', 'functions'];
    return analysis.structure.files.some(file => 
      serverlessPatterns.some(pattern => file.toLowerCase().includes(pattern))
    );
  }

  /**
   * Detect event-driven architecture pattern
   */
  detectEventDrivenPattern(analysis) {
    const eventPatterns = ['kafka', 'rabbitmq', 'eventbridge', 'pubsub'];
    return analysis.dependencies?.prod?.some(dep => 
      eventPatterns.some(pattern => dep.toLowerCase().includes(pattern))
    ) || false;
  }

  /**
   * Summarize technology stack
   */
  summarizeTechStack(analysis) {
    return {
      language: analysis.structure.language || 'Unknown',
      framework: analysis.structure.framework || 'None detected',
      database: analysis.database.type || 'None detected',
      frontend: analysis.frontend.framework || 'None detected',
      testing: this.detectTests(analysis) ? 'Present' : 'Not found',
      deployment: this.detectCICD(analysis) ? 'Configured' : 'Not configured'
    };
  }

  /**
   * Extract key metrics from analysis
   */
  extractMetrics(analysis) {
    return {
      totalFiles: analysis.structure.files.length,
      totalDirectories: analysis.structure.directories.length,
      databaseTables: analysis.database.tables.length,
      apiRoutes: analysis.api.routes.length,
      frontendComponents: analysis.frontend.components.length,
      hasTests: analysis.quality.hasTests,
      hasDocumentation: analysis.quality.hasDocumentation
    };
  }
}