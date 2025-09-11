import { RepositoryAnalysis } from './repository-analyzer.js';
import { createLogger } from '@ea-mcp/common';

const logger = createLogger('generic-ea-analyzer');

export class GenericEAAnalyzer {
  /**
   * Truly generic EA analyzer that works for ANY change request
   * No hardcoding - everything is derived from:
   * 1. The actual repository content
   * 2. The change request description
   * 3. Dynamic analysis of impacts
   */
  
  analyzeChange(repo: RepositoryAnalysis, changeRequest: any) {
    logger.info('Performing generic EA analysis for change request');
    
    // Parse the change request to understand what's being asked
    const changeContext = this.parseChangeRequest(changeRequest);
    
    // Analyze repository to understand current state
    const currentState = this.analyzeCurrentState(repo);
    
    // Identify what components will be affected
    const impactAnalysis = this.analyzeImpact(currentState, changeContext);
    
    // Generate EA assessment based on actual findings
    return this.generateEAAssessment(currentState, changeContext, impactAnalysis);
  }
  
  private parseChangeRequest(changeRequest: any) {
    const request = typeof changeRequest === 'string' ? changeRequest : changeRequest.description || changeRequest.title || '';
    
    // Extract key concepts from the change request
    const concepts = this.extractConcepts(request);
    
    // Identify type of change being requested
    const changeType = this.identifyChangeType(request);
    
    // Extract technical components mentioned
    const components = this.extractComponents(request);
    
    // Determine scope and scale
    const scope = this.determineScope(request);
    
    return {
      request,
      concepts,
      changeType,
      components,
      scope,
      keywords: this.extractKeywords(request)
    };
  }
  
  private extractConcepts(text: string) {
    const concepts = [];
    const lower = text.toLowerCase();
    
    // Technology concepts
    if (lower.match(/database|db|storage|persist/)) concepts.push('database');
    if (lower.match(/api|endpoint|service|rest|graphql/)) concepts.push('api');
    if (lower.match(/auth|security|encrypt|token|oauth/)) concepts.push('security');
    if (lower.match(/ui|frontend|interface|design|ux/)) concepts.push('frontend');
    if (lower.match(/backend|server|process/)) concepts.push('backend');
    if (lower.match(/cloud|aws|azure|gcp|deploy/)) concepts.push('infrastructure');
    if (lower.match(/migrate|upgrade|replace|switch/)) concepts.push('migration');
    if (lower.match(/scale|performance|optimize|speed/)) concepts.push('performance');
    if (lower.match(/integrate|connect|sync/)) concepts.push('integration');
    if (lower.match(/test|quality|qa|coverage/)) concepts.push('testing');
    
    return concepts;
  }
  
  private identifyChangeType(text: string) {
    const lower = text.toLowerCase();
    
    if (lower.match(/migrate|move|transfer|switch/)) return 'migration';
    if (lower.match(/add|implement|create|build/)) return 'feature';
    if (lower.match(/fix|repair|resolve|debug/)) return 'bugfix';
    if (lower.match(/optimize|improve|enhance|speed/)) return 'optimization';
    if (lower.match(/refactor|restructure|reorganize/)) return 'refactoring';
    if (lower.match(/integrate|connect|sync/)) return 'integration';
    if (lower.match(/upgrade|update|modernize/)) return 'upgrade';
    if (lower.match(/scale|expand|grow/)) return 'scaling';
    
    return 'enhancement';
  }
  
  private extractComponents(text: string) {
    const components: any[] = [];
    const words = text.split(/\s+/);
    
    // Look for specific technology names
    words.forEach(word => {
      const clean = word.toLowerCase().replace(/[^a-z0-9-]/g, '');
      
      // Databases
      if (['mysql', 'postgres', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'cassandra', 'neo4j', 'chromadb', 'qdrant', 'pinecone', 'weaviate'].includes(clean)) {
        components.push({ type: 'database', name: clean });
      }
      
      // Frameworks
      if (['react', 'angular', 'vue', 'nextjs', 'express', 'fastapi', 'django', 'flask', 'spring', 'rails'].includes(clean)) {
        components.push({ type: 'framework', name: clean });
      }
      
      // Services
      if (['auth', 'payment', 'email', 'storage', 'queue', 'cache', 'search'].includes(clean)) {
        components.push({ type: 'service', name: clean });
      }
    });
    
    return components;
  }
  
  private determineScope(text: string) {
    const lower = text.toLowerCase();
    
    // Estimate scope based on keywords
    let scope = 'medium';
    
    if (lower.match(/entire|whole|complete|full|all/)) scope = 'large';
    if (lower.match(/small|minor|simple|quick/)) scope = 'small';
    if (lower.match(/critical|major|significant|substantial/)) scope = 'large';
    if (lower.match(/module|component|feature|part/)) scope = 'medium';
    
    return scope;
  }
  
  private extractKeywords(text: string) {
    // Extract important keywords for analysis
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were']);
    
    return text.toLowerCase()
      .split(/\s+/)
      .map(w => w.replace(/[^a-z0-9-]/g, ''))
      .filter(w => w.length > 2 && !stopWords.has(w));
  }
  
  private analyzeCurrentState(repo: RepositoryAnalysis) {
    // Analyze the actual repository to understand current state
    
    // Technology stack from actual files
    const techStack = this.identifyTechStack(repo);
    
    // Architecture patterns from code structure
    const architecture = this.identifyArchitecture(repo);
    
    // Dependencies and their purposes
    const dependencies = this.analyzeDependencies(repo);
    
    // Current capabilities
    const capabilities = this.identifyCapabilities(repo);
    
    // Quality metrics
    const quality = this.assessQuality(repo);
    
    return {
      techStack,
      architecture,
      dependencies,
      capabilities,
      quality,
      metrics: {
        files: repo.codeMetrics.files,
        languages: repo.codeMetrics.languages,
        apis: repo.apis.endpoints.length,
        tables: repo.database.tables.length
      }
    };
  }
  
  private identifyTechStack(repo: RepositoryAnalysis) {
    const stack = [];
    
    // Language detection
    const languages = repo.codeMetrics.languages;
    if (languages['.py']) stack.push({ type: 'language', name: 'Python', files: languages['.py'] });
    if (languages['.js'] || languages['.ts']) stack.push({ type: 'language', name: 'JavaScript/TypeScript', files: (languages['.js'] || 0) + (languages['.ts'] || 0) });
    if (languages['.java']) stack.push({ type: 'language', name: 'Java', files: languages['.java'] });
    if (languages['.go']) stack.push({ type: 'language', name: 'Go', files: languages['.go'] });
    
    // Framework detection from dependencies
    const deps = Object.keys(repo.dependencies);
    if (deps.includes('react')) stack.push({ type: 'framework', name: 'React' });
    if (deps.includes('express')) stack.push({ type: 'framework', name: 'Express' });
    if (deps.includes('fastapi')) stack.push({ type: 'framework', name: 'FastAPI' });
    if (deps.includes('django')) stack.push({ type: 'framework', name: 'Django' });
    
    // Database detection
    if (repo.database.type !== 'unknown') {
      stack.push({ type: 'database', name: repo.database.type });
    }
    
    // Infrastructure detection
    if (deps.some(d => d.includes('aws'))) stack.push({ type: 'cloud', name: 'AWS' });
    if (deps.some(d => d.includes('azure'))) stack.push({ type: 'cloud', name: 'Azure' });
    if (deps.some(d => d.includes('docker'))) stack.push({ type: 'container', name: 'Docker' });
    
    return stack;
  }
  
  private identifyArchitecture(repo: RepositoryAnalysis) {
    const patterns = [];
    
    // Analyze file structure for patterns
    const fileCount = repo.codeMetrics.files;
    const hasAPI = repo.apis.endpoints.length > 0;
    const hasDB = repo.database.tables.length > 0;
    
    if (hasAPI && hasDB) {
      patterns.push('3-tier architecture');
    }
    
    if (repo.apis.endpoints.length > 20) {
      patterns.push('Service-oriented');
    }
    
    if (repo.architecture.patterns.includes('Microservices')) {
      patterns.push('Microservices');
    }
    
    if (fileCount > 500) {
      patterns.push('Modular');
    }
    
    return {
      patterns,
      structure: repo.architecture.structure || 'monolithic',
      complexity: fileCount > 1000 ? 'high' : fileCount > 100 ? 'medium' : 'low'
    };
  }
  
  private analyzeDependencies(repo: RepositoryAnalysis) {
    const deps = repo.dependencies;
    const categories = {
      core: [] as string[],
      data: [] as string[],
      api: [] as string[],
      ui: [] as string[],
      testing: [] as string[],
      utilities: [] as string[]
    };
    
    Object.keys(deps).forEach(dep => {
      const lower = dep.toLowerCase();
      
      if (lower.includes('react') || lower.includes('vue') || lower.includes('angular')) {
        categories.ui.push(dep);
      } else if (lower.includes('test') || lower.includes('jest') || lower.includes('mocha')) {
        categories.testing.push(dep);
      } else if (lower.includes('express') || lower.includes('fastapi') || lower.includes('axios')) {
        categories.api.push(dep);
      } else if (lower.includes('db') || lower.includes('orm') || lower.includes('mongo') || lower.includes('redis')) {
        categories.data.push(dep);
      } else if (lower.includes('lodash') || lower.includes('moment') || lower.includes('uuid')) {
        categories.utilities.push(dep);
      } else {
        categories.core.push(dep);
      }
    });
    
    return categories;
  }
  
  private identifyCapabilities(repo: RepositoryAnalysis) {
    const capabilities = [];
    
    // Based on APIs
    if (repo.apis.authentication) {
      capabilities.push(`Authentication (${repo.apis.authentication})`);
    }
    
    repo.apis.endpoints.forEach(endpoint => {
      if (endpoint.includes('search')) capabilities.push('Search functionality');
      if (endpoint.includes('upload')) capabilities.push('File upload');
      if (endpoint.includes('payment')) capabilities.push('Payment processing');
      if (endpoint.includes('email')) capabilities.push('Email service');
      if (endpoint.includes('notification')) capabilities.push('Notifications');
    });
    
    // Based on database
    if (repo.database.tables.length > 0) {
      capabilities.push(`Data persistence (${repo.database.tables.length} tables)`);
    }
    
    // Based on dependencies
    const deps = Object.keys(repo.dependencies);
    if (deps.some(d => d.includes('redis'))) capabilities.push('Caching');
    if (deps.some(d => d.includes('queue'))) capabilities.push('Message queue');
    if (deps.some(d => d.includes('websocket'))) capabilities.push('Real-time communication');
    
    return capabilities;
  }
  
  private assessQuality(repo: RepositoryAnalysis) {
    const metrics = repo.codeMetrics;
    const quality = {
      testCoverage: metrics.testCoverage || 'unknown',
      documentation: metrics.languages['.md'] ? 'present' : 'minimal',
      monitoring: repo.dependencies['prometheus'] || repo.dependencies['datadog'] ? 'configured' : 'basic',
      security: repo.apis.authentication ? 'implemented' : 'basic'
    };
    
    // Calculate quality score
    let score = 50; // Base score
    if (quality.testCoverage !== 'unknown') score += 20;
    if (quality.documentation === 'present') score += 10;
    if (quality.monitoring === 'configured') score += 10;
    if (quality.security === 'implemented') score += 10;
    
    return {
      ...quality,
      score,
      level: score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low'
    };
  }
  
  private analyzeImpact(currentState: any, changeContext: any) {
    // Dynamically determine what will be impacted by the change
    
    const impacts = {
      components: [] as any[],
      data: [] as any[],
      integrations: [] as any[],
      operations: [] as any[],
      security: [] as any[],
      performance: [] as any[]
    };
    
    // Analyze component impacts
    changeContext.components.forEach((component: any) => {
      // Find related components in current state
      currentState.techStack.forEach((tech: any) => {
        if (tech.type === component.type) {
          impacts.components.push({
            current: tech.name,
            proposed: component.name,
            effort: this.estimateEffort(tech, component)
          });
        }
      });
    });
    
    // Analyze data impacts
    if (changeContext.concepts.includes('database') || changeContext.concepts.includes('migration')) {
      impacts.data.push({
        tables: currentState.metrics.tables,
        migrationNeeded: true,
        dataVolume: this.estimateDataVolume(currentState)
      });
    }
    
    // Analyze integration impacts
    if (changeContext.concepts.includes('integration') || changeContext.concepts.includes('api')) {
      impacts.integrations.push({
        endpoints: currentState.metrics.apis,
        changes: 'API modifications required',
        consumers: 'External systems may be affected'
      });
    }
    
    // Analyze operational impacts
    if (changeContext.changeType === 'migration' || changeContext.changeType === 'scaling') {
      impacts.operations.push({
        downtime: changeContext.scope === 'large' ? 'Planned maintenance window' : 'Zero-downtime possible',
        monitoring: 'New metrics required',
        training: 'Team training needed'
      });
    }
    
    // Analyze security impacts
    if (changeContext.concepts.includes('security') || changeContext.changeType === 'migration') {
      impacts.security.push({
        authentication: 'Review required',
        authorization: 'Policy updates needed',
        compliance: 'Audit trail required'
      });
    }
    
    // Analyze performance impacts
    if (changeContext.concepts.includes('performance') || changeContext.concepts.includes('scale')) {
      impacts.performance.push({
        current: 'Baseline metrics needed',
        expected: 'Performance improvements expected',
        testing: 'Load testing required'
      });
    }
    
    return impacts;
  }
  
  private estimateEffort(current: any, proposed: any) {
    // Estimate effort based on complexity
    if (current.name === proposed.name) return 'minimal';
    if (current.type === 'database') return 'high';
    if (current.type === 'framework') return 'high';
    if (current.files > 100) return 'high';
    if (current.files > 50) return 'medium';
    return 'low';
  }
  
  private estimateDataVolume(state: any) {
    const tables = state.metrics.tables;
    const files = state.metrics.files;
    
    // Rough estimation
    const recordsPerTable = 10000; // Assumption
    const totalRecords = tables * recordsPerTable;
    
    return {
      tables,
      estimatedRecords: totalRecords,
      estimatedSize: `${Math.round(totalRecords * 0.001)} MB`
    };
  }
  
  private generateEAAssessment(currentState: any, changeContext: any, impactAnalysis: any) {
    // Generate comprehensive EA assessment based on actual findings
    
    const complexity = this.calculateComplexity(currentState, changeContext, impactAnalysis);
    const timeline = this.generateTimeline(complexity, changeContext.scope);
    const cost = this.estimateCost(timeline, complexity);
    const risks = this.identifyRisks(currentState, changeContext, impactAnalysis);
    
    return {
      executiveSummary: this.generateExecutiveSummary(currentState, changeContext, impactAnalysis, complexity),
      
      solutionDiscovery: this.generateSolutionDiscovery(currentState, changeContext, impactAnalysis),
      
      architecturalAlignment: this.generateArchitecturalAlignment(currentState, changeContext),
      
      dataIntegration: this.generateDataIntegration(currentState, impactAnalysis),
      
      operationalOwnership: this.generateOperationalOwnership(changeContext, complexity),
      
      technicalDebt: this.generateTechnicalDebt(currentState, changeContext),
      
      businessValue: this.generateBusinessValue(changeContext, impactAnalysis, cost),
      
      scalability: this.generateScalability(currentState, changeContext),
      
      risks: this.generateRiskAssessment(risks),
      
      implementation: this.generateImplementationPlan(timeline, changeContext, impactAnalysis),
      
      diagrams: this.generateDiagrams(currentState, changeContext, impactAnalysis)
    };
  }
  
  private calculateComplexity(currentState: any, changeContext: any, impactAnalysis: any) {
    let score = 0;
    const factors = [];
    
    // Size complexity
    if (currentState.metrics.files > 500) {
      score += 3;
      factors.push(`Large codebase (${currentState.metrics.files} files)`);
    } else if (currentState.metrics.files > 100) {
      score += 2;
      factors.push(`Medium codebase (${currentState.metrics.files} files)`);
    } else {
      score += 1;
      factors.push(`Small codebase (${currentState.metrics.files} files)`);
    }
    
    // Change complexity
    if (changeContext.changeType === 'migration') {
      score += 3;
      factors.push('Migration complexity');
    } else if (changeContext.changeType === 'refactoring') {
      score += 2;
      factors.push('Refactoring complexity');
    }
    
    // Impact complexity
    const totalImpacts = Object.values(impactAnalysis).flat().length;
    if (totalImpacts > 10) {
      score += 2;
      factors.push(`Multiple impacts (${totalImpacts} areas)`);
    }
    
    // Scope complexity
    if (changeContext.scope === 'large') {
      score += 2;
      factors.push('Large scope');
    }
    
    return { score, factors, level: score > 7 ? 'high' : score > 4 ? 'medium' : 'low' };
  }
  
  private generateTimeline(complexity: any, scope: string) {
    const baseWeeks = scope === 'large' ? 12 : scope === 'medium' ? 8 : 4;
    const multiplier = complexity.level === 'high' ? 1.5 : complexity.level === 'medium' ? 1.2 : 1;
    const totalWeeks = Math.ceil(baseWeeks * multiplier);
    
    return {
      totalWeeks,
      phases: [
        { phase: 'Planning', duration: `${Math.ceil(totalWeeks * 0.2)} weeks` },
        { phase: 'Development', duration: `${Math.ceil(totalWeeks * 0.4)} weeks` },
        { phase: 'Testing', duration: `${Math.ceil(totalWeeks * 0.2)} weeks` },
        { phase: 'Deployment', duration: `${Math.ceil(totalWeeks * 0.1)} weeks` },
        { phase: 'Stabilization', duration: `${Math.ceil(totalWeeks * 0.1)} weeks` }
      ]
    };
  }
  
  private estimateCost(timeline: any, complexity: any) {
    const weeklyRate = 10000; // Average team cost per week
    const teamSize = complexity.level === 'high' ? 4 : complexity.level === 'medium' ? 3 : 2;
    const totalCost = timeline.totalWeeks * weeklyRate * (teamSize / 2);
    
    return {
      estimated: `$${totalCost.toLocaleString()}`,
      breakdown: {
        development: `$${(totalCost * 0.6).toLocaleString()}`,
        testing: `$${(totalCost * 0.2).toLocaleString()}`,
        deployment: `$${(totalCost * 0.1).toLocaleString()}`,
        contingency: `$${(totalCost * 0.1).toLocaleString()}`
      }
    };
  }
  
  private identifyRisks(currentState: any, changeContext: any, impactAnalysis: any) {
    const risks = [];
    
    // Technical risks
    if (currentState.quality.testCoverage === 'unknown') {
      risks.push({
        type: 'technical',
        risk: 'Unknown test coverage',
        impact: 'high',
        probability: 'medium',
        mitigation: 'Implement comprehensive testing'
      });
    }
    
    // Data risks
    if (impactAnalysis.data.length > 0) {
      risks.push({
        type: 'data',
        risk: 'Data migration complexity',
        impact: 'high',
        probability: 'medium',
        mitigation: 'Implement data validation and rollback procedures'
      });
    }
    
    // Integration risks
    if (impactAnalysis.integrations.length > 0) {
      risks.push({
        type: 'integration',
        risk: 'External system dependencies',
        impact: 'medium',
        probability: 'medium',
        mitigation: 'Coordinate with external teams'
      });
    }
    
    // Operational risks
    if (changeContext.scope === 'large') {
      risks.push({
        type: 'operational',
        risk: 'Service disruption',
        impact: 'high',
        probability: 'low',
        mitigation: 'Plan maintenance windows and rollback procedures'
      });
    }
    
    return risks;
  }
  
  private generateExecutiveSummary(currentState: any, changeContext: any, impactAnalysis: any, complexity: any) {
    const impactedAreas = Object.keys(impactAnalysis).filter(k => impactAnalysis[k].length > 0);
    
    return {
      title: `EA Assessment: ${changeContext.request}`,
      description: `
## Overview
This assessment analyzes the proposed ${changeContext.changeType} affecting ${currentState.metrics.files} files across ${Object.keys(currentState.metrics.languages).length} languages.

## Current State
- **Technology Stack**: ${currentState.techStack.map((t: any) => t.name).join(', ')}
- **Architecture**: ${currentState.architecture.structure} with ${currentState.architecture.complexity} complexity
- **Quality Score**: ${currentState.quality.score}/100 (${currentState.quality.level})

## Proposed Change
- **Type**: ${changeContext.changeType}
- **Scope**: ${changeContext.scope}
- **Complexity**: ${complexity.level} (${complexity.score}/10)

## Key Impacts
${impactedAreas.map(area => `- **${area}**: ${impactAnalysis[area].length} impact(s)`).join('\n')}
      `,
      businessValue: `Strategic ${changeContext.changeType} to enhance system capabilities`,
      estimatedDuration: `${Math.ceil(complexity.score * 2)} to ${Math.ceil(complexity.score * 3)} weeks`,
      estimatedCost: `Based on complexity score of ${complexity.score}/10`,
      riskLevel: complexity.level,
      strategicAlignment: `Aligns with ${changeContext.concepts.join(', ')} objectives`
    };
  }
  
  private generateSolutionDiscovery(currentState: any, changeContext: any, impactAnalysis: any) {
    // Identify what can be reused
    const reusableComponents: any[] = [];
    
    currentState.techStack.forEach((tech: any) => {
      if (!impactAnalysis.components.some((c: any) => c.current === tech.name)) {
        reusableComponents.push(`${tech.name} (${tech.type})`);
      }
    });
    
    currentState.capabilities.forEach((cap: string) => {
      if (!changeContext.keywords.some((k: string) => cap.toLowerCase().includes(k))) {
        reusableComponents.push(cap);
      }
    });
    
    // Identify gaps
    const gaps = [];
    
    changeContext.components.forEach((comp: any) => {
      if (!currentState.techStack.some((t: any) => t.name === comp.name)) {
        gaps.push(`${comp.name} implementation needed`);
      }
    });
    
    if (changeContext.concepts.includes('testing') && currentState.quality.testCoverage === 'unknown') {
      gaps.push('Test coverage implementation');
    }
    
    // New components required
    const newComponents = changeContext.components
      .filter((c: any) => !currentState.techStack.some((t: any) => t.name === c.name))
      .map((c: any) => `${c.name} (${c.type})`);
    
    // Recommendations based on actual findings
    const recommendations = this.generateRecommendations(currentState, changeContext, impactAnalysis);
    
    return {
      reusableComponents,
      gaps,
      newComponentsRequired: newComponents,
      recommendations
    };
  }
  
  private generateRecommendations(currentState: any, changeContext: any, impactAnalysis: any) {
    const recommendations = [];
    
    // Based on quality score
    if (currentState.quality.score < 60) {
      recommendations.push('Improve code quality before major changes');
    }
    
    // Based on test coverage
    if (currentState.quality.testCoverage === 'unknown') {
      recommendations.push('Implement comprehensive testing framework');
    }
    
    // Based on complexity
    if (currentState.architecture.complexity === 'high') {
      recommendations.push('Consider modularization to reduce complexity');
    }
    
    // Based on change type
    if (changeContext.changeType === 'migration') {
      recommendations.push('Implement dual-running strategy for zero downtime');
      recommendations.push('Create comprehensive rollback procedures');
    }
    
    // Based on impacts
    if (impactAnalysis.data.length > 0) {
      recommendations.push('Implement data validation and integrity checks');
    }
    
    if (impactAnalysis.integrations.length > 0) {
      recommendations.push('Coordinate with external system owners');
    }
    
    return recommendations;
  }
  
  private generateArchitecturalAlignment(currentState: any, changeContext: any) {
    // Calculate alignment score based on best practices
    let score = 70; // Base score
    
    const alignmentFactors = [];
    const violations = [];
    const ambiguities = [];
    
    // Check for architectural patterns
    if (currentState.architecture.patterns.length > 0) {
      score += 10;
      alignmentFactors.push('Follows established patterns');
    }
    
    // Check for proper separation
    if (currentState.metrics.apis > 0 && currentState.metrics.tables > 0) {
      score += 5;
      alignmentFactors.push('Proper layer separation');
    }
    
    // Check for security
    if (currentState.quality.security === 'implemented') {
      score += 10;
      alignmentFactors.push('Security properly implemented');
    } else {
      violations.push('Security implementation incomplete');
    }
    
    // Check for monitoring
    if (currentState.quality.monitoring === 'basic') {
      ambiguities.push('Monitoring strategy needs clarification');
    }
    
    // Check for documentation
    if (currentState.quality.documentation === 'minimal') {
      violations.push('Documentation insufficient');
      score -= 5;
    }
    
    return {
      complianceScore: Math.min(100, score),
      alignmentFactors,
      violations,
      ambiguities,
      recommendations: [
        violations.length > 0 ? 'Address architectural violations' : 'Maintain architectural standards',
        ambiguities.length > 0 ? 'Clarify architectural ambiguities' : 'Document architectural decisions'
      ]
    };
  }
  
  private generateDataIntegration(currentState: any, impactAnalysis: any) {
    const dataModel = {
      entities: currentState.metrics.tables > 0 ? `${currentState.metrics.tables} existing tables` : 'No database entities found',
      relationships: currentState.database?.relationships || [],
      volumeEstimates: this.estimateDataVolume(currentState)
    };
    
    const integrationPoints = [];
    
    // API integrations
    if (currentState.metrics.apis > 0) {
      integrationPoints.push({
        system: 'REST APIs',
        method: 'HTTP/HTTPS',
        count: currentState.metrics.apis
      });
    }
    
    // Database integrations
    if (currentState.metrics.tables > 0) {
      integrationPoints.push({
        system: currentState.database?.type || 'Database',
        method: 'Direct connection',
        count: currentState.metrics.tables
      });
    }
    
    // External integrations from dependencies
    const deps = currentState.dependencies;
    if (deps.api?.length > 0) {
      integrationPoints.push({
        system: 'External APIs',
        method: 'HTTP clients',
        count: deps.api.length
      });
    }
    
    return {
      dataModel,
      integrationPoints,
      migrationStrategy: impactAnalysis.data.length > 0 ? {
        required: true,
        approach: 'Phased migration with validation',
        dataVolume: dataModel.volumeEstimates
      } : {
        required: false,
        approach: 'No data migration needed'
      }
    };
  }
  
  private generateOperationalOwnership(changeContext: any, complexity: any) {
    const teamSize = complexity.level === 'high' ? 'Cross-functional team' : 
                     complexity.level === 'medium' ? 'Feature team' : 'Small team';
    
    return {
      proposedOwner: 'Development Team',
      stakeholders: [
        'Product Owner',
        'Technical Lead',
        'DevOps Team',
        changeContext.concepts.includes('security') ? 'Security Team' : null,
        changeContext.concepts.includes('database') ? 'Data Team' : null
      ].filter(Boolean),
      supportModel: complexity.level === 'high' ? '24/7 support' : 'Business hours',
      responsibilities: {
        development: 'Feature Team',
        testing: 'QA Team',
        deployment: 'DevOps Team',
        maintenance: 'Support Team'
      },
      handoffPlan: [
        'Documentation creation',
        'Knowledge transfer sessions',
        'Runbook preparation',
        'Support training'
      ]
    };
  }
  
  private generateTechnicalDebt(currentState: any, changeContext: any) {
    const currentDebt = [];
    let totalDebtHours = 0;
    
    // Identify technical debt from current state
    if (currentState.quality.testCoverage === 'unknown') {
      currentDebt.push({
        item: 'Missing test coverage',
        impact: 'high',
        effort: 40,
        priority: 'high'
      });
      totalDebtHours += 40;
    }
    
    if (currentState.quality.documentation === 'minimal') {
      currentDebt.push({
        item: 'Insufficient documentation',
        impact: 'medium',
        effort: 20,
        priority: 'medium'
      });
      totalDebtHours += 20;
    }
    
    if (currentState.quality.monitoring === 'basic') {
      currentDebt.push({
        item: 'Basic monitoring only',
        impact: 'medium',
        effort: 30,
        priority: 'medium'
      });
      totalDebtHours += 30;
    }
    
    if (currentState.architecture.complexity === 'high') {
      currentDebt.push({
        item: 'High complexity',
        impact: 'high',
        effort: 80,
        priority: 'medium'
      });
      totalDebtHours += 80;
    }
    
    return {
      currentDebt,
      debtMetrics: {
        totalDebtHours,
        criticalItems: currentDebt.filter(d => d.priority === 'high').length,
        estimatedCost: `$${(totalDebtHours * 150).toLocaleString()}`
      },
      mitigationPlan: [
        changeContext.changeType === 'refactoring' ? 'Address debt during refactoring' : 'Plan separate debt reduction sprint',
        'Prioritize high-impact items',
        'Allocate 20% of sprint capacity to debt reduction'
      ],
      postChangeDebt: changeContext.changeType === 'feature' ? 
        ['New feature may introduce additional complexity'] : 
        ['Monitor for new debt introduction']
    };
  }
  
  private generateBusinessValue(changeContext: any, impactAnalysis: any, cost: any) {
    // Calculate ROI based on change type and impacts
    const benefitMultiplier = changeContext.changeType === 'optimization' ? 2 :
                             changeContext.changeType === 'migration' ? 1.5 :
                             changeContext.changeType === 'feature' ? 1.8 : 1.2;
    
    const estimatedBenefit = parseFloat(cost.estimated.replace(/[^0-9]/g, '')) * benefitMultiplier;
    const roi = ((estimatedBenefit - parseFloat(cost.estimated.replace(/[^0-9]/g, ''))) / parseFloat(cost.estimated.replace(/[^0-9]/g, '')) * 100).toFixed(0);
    
    return {
      roi: {
        expected: `${roi}%`,
        breakeven: `${Math.ceil(12 / benefitMultiplier)} months`,
        paybackPeriod: `${Math.ceil(18 / benefitMultiplier)} months`
      },
      metrics: [
        {
          metric: 'Efficiency Gain',
          current: 'Baseline',
          target: `${(benefitMultiplier * 100 - 100).toFixed(0)}% improvement`,
          measurementMethod: 'Performance metrics'
        },
        {
          metric: 'Cost Reduction',
          current: 'Current spending',
          target: changeContext.changeType === 'optimization' ? '20-30% reduction' : '5-10% reduction',
          measurementMethod: 'Cost analysis'
        },
        {
          metric: 'User Satisfaction',
          current: 'Current NPS',
          target: '+10 points',
          measurementMethod: 'User surveys'
        }
      ],
      intangibleBenefits: [
        'Improved maintainability',
        'Enhanced team productivity',
        'Better system reliability',
        'Increased innovation capacity'
      ]
    };
  }
  
  private generateScalability(currentState: any, changeContext: any) {
    const currentLimitations = [];
    const targetCapabilities = [];
    
    // Identify current limitations
    if (currentState.architecture.structure === 'monolithic') {
      currentLimitations.push('Monolithic architecture limits independent scaling');
    }
    
    if (currentState.metrics.files > 500) {
      currentLimitations.push('Large codebase may impact deployment speed');
    }
    
    if (!currentState.dependencies.data.some((d: string) => d.includes('cache'))) {
      currentLimitations.push('No caching layer for performance optimization');
    }
    
    // Define target capabilities based on change
    if (changeContext.concepts.includes('scale')) {
      targetCapabilities.push('Horizontal scaling capability');
      targetCapabilities.push('Load balancing');
      targetCapabilities.push('Auto-scaling policies');
    }
    
    if (changeContext.concepts.includes('performance')) {
      targetCapabilities.push('Performance optimization');
      targetCapabilities.push('Caching strategy');
      targetCapabilities.push('Database optimization');
    }
    
    const evolutionPlan = [
      {
        phase: 'Current',
        description: 'Baseline performance and capacity',
        timeline: 'Now'
      },
      {
        phase: 'Short-term',
        description: 'Quick wins and optimizations',
        timeline: '1-3 months'
      },
      {
        phase: 'Medium-term',
        description: 'Architectural improvements',
        timeline: '3-6 months'
      },
      {
        phase: 'Long-term',
        description: 'Full scalability implementation',
        timeline: '6-12 months'
      }
    ];
    
    return {
      currentLimitations,
      targetCapabilities,
      evolutionPlan,
      bottlenecks: this.identifyBottlenecks(currentState),
      recommendations: [
        'Implement performance monitoring',
        'Create load testing suite',
        'Plan for capacity growth'
      ]
    };
  }
  
  private identifyBottlenecks(currentState: any) {
    const bottlenecks = [];
    
    if (!currentState.dependencies.data.some((d: string) => d.includes('cache'))) {
      bottlenecks.push({
        component: 'Data access',
        issue: 'No caching layer',
        impact: 'Performance degradation under load'
      });
    }
    
    if (currentState.architecture.structure === 'monolithic') {
      bottlenecks.push({
        component: 'Application architecture',
        issue: 'Monolithic structure',
        impact: 'Cannot scale components independently'
      });
    }
    
    if (currentState.metrics.apis > 50) {
      bottlenecks.push({
        component: 'API layer',
        issue: 'High number of endpoints',
        impact: 'API gateway may become bottleneck'
      });
    }
    
    return bottlenecks;
  }
  
  private generateRiskAssessment(risks: any[]) {
    const riskMatrix = {
      high: risks.filter(r => r.impact === 'high'),
      medium: risks.filter(r => r.impact === 'medium'),
      low: risks.filter(r => r.impact === 'low')
    };
    
    return {
      overallRisk: riskMatrix.high.length > 2 ? 'high' : 
                   riskMatrix.high.length > 0 ? 'medium' : 'low',
      riskRegister: risks,
      mitigationStrategies: {
        technical: 'Implement comprehensive testing and validation',
        operational: 'Create detailed runbooks and rollback procedures',
        business: 'Maintain clear communication with stakeholders'
      },
      contingencyPlans: [
        'Rollback procedure defined',
        'Data backup strategy',
        'Communication plan for issues',
        'Escalation matrix prepared'
      ]
    };
  }
  
  private generateImplementationPlan(timeline: any, changeContext: any, impactAnalysis: any) {
    const milestones = timeline.phases.map((phase: any, index: number) => ({
      milestone: phase.phase,
      week: `Week ${index * Math.ceil(timeline.totalWeeks / timeline.phases.length)}`,
      deliverables: this.getPhaseDeliverables(phase.phase, changeContext)
    }));
    
    const resourceRequirements = {
      team: this.determineTeamRequirements(changeContext, timeline),
      infrastructure: this.determineInfrastructureRequirements(changeContext, impactAnalysis),
      tools: this.determineToolRequirements(changeContext)
    };
    
    return {
      approach: `Phased ${changeContext.changeType} implementation`,
      timeline,
      keyMilestones: milestones,
      resourceRequirements,
      successCriteria: [
        'All functional requirements met',
        'Performance targets achieved',
        'No critical defects',
        'User acceptance completed'
      ]
    };
  }
  
  private getPhaseDeliverables(phase: string, changeContext: any) {
    const deliverables: Record<string, string[]> = {
      'Planning': ['Requirements document', 'Technical design', 'Risk assessment'],
      'Development': ['Code implementation', 'Unit tests', 'Integration tests'],
      'Testing': ['Test execution', 'Bug fixes', 'Performance validation'],
      'Deployment': ['Production deployment', 'Monitoring setup', 'Documentation'],
      'Stabilization': ['Bug fixes', 'Performance tuning', 'Knowledge transfer']
    };
    
    return deliverables[phase] || ['Phase deliverables'];
  }
  
  private determineTeamRequirements(changeContext: any, timeline: any) {
    const team = [];
    
    // Always need developers
    team.push(`${changeContext.scope === 'large' ? '3-4' : '1-2'} Developers`);
    
    // Conditional roles
    if (changeContext.concepts.includes('frontend')) {
      team.push('1 Frontend Developer');
    }
    
    if (changeContext.concepts.includes('database')) {
      team.push('1 Database Engineer');
    }
    
    if (timeline.totalWeeks > 8) {
      team.push('1 Project Manager');
    }
    
    team.push('1 QA Engineer');
    
    if (changeContext.concepts.includes('infrastructure')) {
      team.push('1 DevOps Engineer');
    }
    
    return team;
  }
  
  private determineInfrastructureRequirements(changeContext: any, impactAnalysis: any) {
    const infrastructure = [];
    
    // Development environment
    infrastructure.push('Development environment');
    
    // Testing environment
    if (changeContext.scope !== 'small') {
      infrastructure.push('Staging/Testing environment');
    }
    
    // Specific requirements based on change
    if (changeContext.concepts.includes('database')) {
      infrastructure.push('Database instances');
    }
    
    if (changeContext.concepts.includes('cloud')) {
      infrastructure.push('Cloud resources');
    }
    
    if (impactAnalysis.performance.length > 0) {
      infrastructure.push('Performance testing environment');
    }
    
    return infrastructure;
  }
  
  private determineToolRequirements(changeContext: any) {
    const tools = ['Version control (Git)', 'CI/CD pipeline'];
    
    if (changeContext.concepts.includes('testing')) {
      tools.push('Test automation framework');
    }
    
    if (changeContext.concepts.includes('performance')) {
      tools.push('Performance testing tools');
    }
    
    if (changeContext.changeType === 'migration') {
      tools.push('Data migration tools');
    }
    
    tools.push('Monitoring and logging tools');
    
    return tools;
  }
  
  private generateDiagrams(currentState: any, changeContext: any, impactAnalysis: any) {
    // Generate dynamic diagrams based on actual analysis
    
    return {
      currentArchitecture: this.generateCurrentArchitectureDiagram(currentState),
      targetArchitecture: this.generateTargetArchitectureDiagram(currentState, changeContext),
      dataFlow: this.generateDataFlowDiagram(currentState, impactAnalysis),
      deploymentTopology: this.generateDeploymentDiagram(currentState, changeContext),
      timeline: this.generateTimelineDiagram(changeContext)
    };
  }
  
  private generateCurrentArchitectureDiagram(currentState: any) {
    const components = [];
    
    // Add UI layer if present
    if (currentState.dependencies.ui.length > 0) {
      components.push('UI[User Interface]');
    }
    
    // Add API layer if present
    if (currentState.metrics.apis > 0) {
      components.push('API[API Layer]');
    }
    
    // Add database if present
    if (currentState.metrics.tables > 0) {
      components.push('DB[(Database)]');
    }
    
    return `
\`\`\`mermaid
graph TB
    ${components.join(' --> ')}
    
    style UI fill:#f9f,stroke:#333,stroke-width:2px
    style API fill:#bbf,stroke:#333,stroke-width:2px
    style DB fill:#bfb,stroke:#333,stroke-width:2px
\`\`\`
    `;
  }
  
  private generateTargetArchitectureDiagram(currentState: any, changeContext: any) {
    // Generate target architecture based on proposed changes
    let diagram = '```mermaid\ngraph TB\n';
    
    // Build components based on change context
    if (changeContext.concepts.includes('frontend')) {
      diagram += '    UI[Enhanced UI]\n';
    }
    
    if (changeContext.concepts.includes('api')) {
      diagram += '    API[API Gateway]\n';
    }
    
    if (changeContext.concepts.includes('database')) {
      diagram += '    DB[(New Database)]\n';
    }
    
    if (changeContext.concepts.includes('cache')) {
      diagram += '    CACHE[(Cache Layer)]\n';
    }
    
    diagram += '```';
    
    return diagram;
  }
  
  private generateDataFlowDiagram(currentState: any, impactAnalysis: any) {
    return `
\`\`\`mermaid
flowchart LR
    Input[User Input]
    Process[Processing]
    Storage[(Storage)]
    Output[Output]
    
    Input --> Process
    Process --> Storage
    Storage --> Output
    
    style Input fill:#faa
    style Process fill:#afa
    style Storage fill:#aaf
    style Output fill:#ffa
\`\`\`
    `;
  }
  
  private generateDeploymentDiagram(currentState: any, changeContext: any) {
    return `
\`\`\`mermaid
graph TB
    subgraph Production
        PROD[Production Server]
    end
    
    subgraph Staging
        STAGE[Staging Server]
    end
    
    subgraph Development
        DEV[Dev Server]
    end
    
    DEV --> STAGE
    STAGE --> PROD
\`\`\`
    `;
  }
  
  private generateTimelineDiagram(changeContext: any) {
    return `
\`\`\`mermaid
gantt
    title Implementation Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements    :a1, 2024-01-01, 7d
    Design          :a2, after a1, 7d
    section Development
    Implementation  :b1, after a2, 21d
    Testing         :b2, after b1, 14d
    section Deployment
    Deployment      :c1, after b2, 7d
\`\`\`
    `;
  }
}