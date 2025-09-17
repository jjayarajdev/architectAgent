/**
 * Documentation Intelligence Agent
 * 
 * Specializes in analyzing, generating, and enhancing documentation
 * for enterprise architecture assessments.
 */

import { BaseAgent } from './base-agent.js';
import fs from 'fs';
import path from 'path';

export class DocsIntelAgent extends BaseAgent {
  constructor(options = {}) {
    super('DocsIntelAgent', options);
    
    this.capabilities = [
      'documentation_analysis',
      'readme_generation',
      'api_documentation',
      'architecture_diagrams',
      'deployment_guides',
      'changelog_generation'
    ];
    
    this.templates = this.loadTemplates();
  }

  async initialize() {
    await super.initialize();
    this.log('Documentation Intelligence Agent ready');
    return true;
  }

  async execute(context) {
    this.validateContext(context);
    this.setStatus('documenting');
    
    const { analysis, changeRequest, options = {} } = context;
    
    try {
      this.currentTask = 'documentation_generation';
      this.log('Starting documentation generation');
      
      // Generate various documentation artifacts
      const documentation = {
        executiveSummary: await this.generateExecutiveSummary(analysis, changeRequest),
        technicalOverview: await this.generateTechnicalOverview(analysis),
        architectureDiagrams: await this.generateArchitectureDiagrams(analysis),
        apiDocumentation: await this.generateAPIDocumentation(analysis),
        deploymentGuide: await this.generateDeploymentGuide(analysis),
        changeRequestDoc: await this.generateChangeRequestDocumentation(changeRequest, analysis)
      };
      
      // Store results
      this.results.push({
        timestamp: new Date().toISOString(),
        task: 'documentation_generation',
        data: documentation
      });
      
      this.log('Documentation generation completed', 'success');
      this.setStatus('completed');
      
      return {
        success: true,
        agent: this.name,
        documentation,
        metrics: {
          documentsGenerated: Object.keys(documentation).length,
          totalSections: this.countSections(documentation)
        }
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
   * Load documentation templates
   */
  loadTemplates() {
    return {
      executiveSummary: `
## Executive Summary

### Project Overview
{projectOverview}

### Current State
{currentState}

### Proposed Changes
{proposedChanges}

### Business Impact
{businessImpact}

### Key Recommendations
{recommendations}
`,
      technicalOverview: `
## Technical Overview

### Architecture
{architecture}

### Technology Stack
{techStack}

### System Components
{components}

### Integration Points
{integrations}

### Security Considerations
{security}
`,
      deploymentGuide: `
## Deployment Guide

### Prerequisites
{prerequisites}

### Environment Setup
{environmentSetup}

### Deployment Steps
{deploymentSteps}

### Configuration
{configuration}

### Monitoring and Maintenance
{monitoring}
`
    };
  }

  /**
   * Generate executive summary
   */
  async generateExecutiveSummary(analysis, changeRequest) {
    const summary = {
      title: 'Executive Summary',
      sections: {
        projectOverview: this.summarizeProject(analysis),
        currentState: this.assessCurrentState(analysis),
        proposedChanges: changeRequest,
        businessImpact: this.assessBusinessImpact(changeRequest, analysis),
        recommendations: this.generateRecommendations(analysis, changeRequest)
      }
    };
    
    return this.formatDocument(summary, this.templates.executiveSummary);
  }

  /**
   * Generate technical overview
   */
  async generateTechnicalOverview(analysis) {
    return {
      title: 'Technical Overview',
      sections: {
        architecture: this.describeArchitecture(analysis),
        techStack: this.describeTechStack(analysis),
        components: this.listComponents(analysis),
        integrations: this.identifyIntegrations(analysis),
        security: this.assessSecurity(analysis)
      }
    };
  }

  /**
   * Generate architecture diagrams
   */
  async generateArchitectureDiagrams(analysis) {
    const diagrams = [];
    
    // Component diagram
    if (analysis.frontend.components.length > 0) {
      diagrams.push(this.generateComponentDiagram(analysis));
    }
    
    // Database ER diagram
    if (analysis.database.tables.length > 0) {
      diagrams.push(this.generateERDiagram(analysis.database.tables));
    }
    
    // API flow diagram
    if (analysis.api.routes.length > 0) {
      diagrams.push(this.generateAPIFlowDiagram(analysis.api.routes));
    }
    
    return diagrams;
  }

  /**
   * Generate API documentation
   */
  async generateAPIDocumentation(analysis) {
    if (!analysis.api.routes || analysis.api.routes.length === 0) {
      return 'No API routes detected';
    }
    
    const sections = analysis.api.routes.map(route => ({
      endpoint: route.path,
      method: route.method,
      description: route.description || 'No description available',
      parameters: route.parameters || [],
      responses: route.responses || []
    }));
    
    return {
      title: 'API Documentation',
      totalEndpoints: analysis.api.routes.length,
      sections
    };
  }

  /**
   * Generate deployment guide
   */
  async generateDeploymentGuide(analysis) {
    return {
      title: 'Deployment Guide',
      prerequisites: this.identifyPrerequisites(analysis),
      environmentSetup: this.generateEnvironmentSetup(analysis),
      deploymentSteps: this.generateDeploymentSteps(analysis),
      configuration: this.generateConfiguration(analysis),
      monitoring: this.generateMonitoringGuide(analysis)
    };
  }

  /**
   * Generate change request documentation
   */
  async generateChangeRequestDocumentation(changeRequest, analysis) {
    return {
      title: 'Change Request Assessment',
      request: changeRequest,
      impact: this.assessChangeImpact(changeRequest, analysis),
      implementation: this.planImplementation(changeRequest, analysis),
      risks: this.identifyRisks(changeRequest, analysis),
      timeline: this.estimateTimeline(changeRequest, analysis)
    };
  }

  /**
   * Helper methods for documentation generation
   */
  
  summarizeProject(analysis) {
    return `Project type: ${analysis.structure.type}, Framework: ${analysis.structure.framework || 'Custom'}`;
  }

  assessCurrentState(analysis) {
    const quality = analysis.quality || {};
    return `Tests: ${quality.hasTests ? 'Present' : 'Missing'}, Documentation: ${quality.hasDocumentation ? 'Present' : 'Missing'}`;
  }

  assessBusinessImpact(changeRequest, analysis) {
    return 'Business impact assessment based on proposed changes';
  }

  generateRecommendations(analysis, changeRequest) {
    const recommendations = [];
    
    if (!analysis.quality?.hasTests) {
      recommendations.push('Implement comprehensive testing strategy');
    }
    
    if (!analysis.quality?.hasDocumentation) {
      recommendations.push('Improve documentation coverage');
    }
    
    if (!analysis.quality?.hasCICD) {
      recommendations.push('Set up CI/CD pipeline');
    }
    
    return recommendations;
  }

  describeArchitecture(analysis) {
    const patterns = analysis.patterns || {};
    if (patterns.isMicroservices) return 'Microservices Architecture';
    if (patterns.isServerless) return 'Serverless Architecture';
    if (patterns.isEventDriven) return 'Event-Driven Architecture';
    return 'Monolithic Architecture';
  }

  describeTechStack(analysis) {
    return analysis.techStack || {};
  }

  listComponents(analysis) {
    return [
      ...analysis.frontend.components.map(c => ({ type: 'Frontend', name: c })),
      ...analysis.api.routes.map(r => ({ type: 'API', name: r.path }))
    ];
  }

  identifyIntegrations(analysis) {
    return analysis.dependencies?.prod?.filter(dep => 
      ['axios', 'fetch', 'graphql', 'rest'].some(pattern => 
        dep.toLowerCase().includes(pattern)
      )
    ) || [];
  }

  assessSecurity(analysis) {
    const securityChecks = {
      hasAuthentication: analysis.dependencies?.prod?.some(dep => 
        ['auth', 'jwt', 'passport'].some(p => dep.toLowerCase().includes(p))
      ),
      hasEncryption: analysis.dependencies?.prod?.some(dep => 
        ['bcrypt', 'crypto'].some(p => dep.toLowerCase().includes(p))
      )
    };
    
    return securityChecks;
  }

  generateComponentDiagram(analysis) {
    return {
      type: 'component',
      format: 'mermaid',
      content: this.createMermaidComponentDiagram(analysis)
    };
  }

  generateERDiagram(tables) {
    return {
      type: 'er',
      format: 'mermaid',
      content: this.createMermaidERDiagram(tables)
    };
  }

  generateAPIFlowDiagram(routes) {
    return {
      type: 'api-flow',
      format: 'mermaid',
      content: this.createMermaidAPIFlow(routes)
    };
  }

  createMermaidComponentDiagram(analysis) {
    return `graph TD
    A[Frontend] --> B[API Gateway]
    B --> C[Business Logic]
    C --> D[Database]`;
  }

  createMermaidERDiagram(tables) {
    let diagram = 'erDiagram\n';
    tables.forEach(table => {
      diagram += `    ${table.name} {\n`;
      table.columns?.forEach(col => {
        diagram += `        ${col.type} ${col.name}\n`;
      });
      diagram += '    }\n';
    });
    return diagram;
  }

  createMermaidAPIFlow(routes) {
    let diagram = 'sequenceDiagram\n';
    routes.slice(0, 5).forEach(route => {
      diagram += `    Client->>API: ${route.method} ${route.path}\n`;
      diagram += `    API-->>Client: Response\n`;
    });
    return diagram;
  }

  identifyPrerequisites(analysis) {
    return ['Node.js', 'npm/yarn', 'Git'];
  }

  generateEnvironmentSetup(analysis) {
    return ['Install dependencies', 'Configure environment variables', 'Setup database'];
  }

  generateDeploymentSteps(analysis) {
    return ['Build application', 'Run tests', 'Deploy to server', 'Verify deployment'];
  }

  generateConfiguration(analysis) {
    return { environment: 'production', port: 3000, database: analysis.database.type };
  }

  generateMonitoringGuide(analysis) {
    return ['Setup logging', 'Configure alerts', 'Monitor performance'];
  }

  assessChangeImpact(changeRequest, analysis) {
    return 'Medium to High impact on existing architecture';
  }

  planImplementation(changeRequest, analysis) {
    return ['Phase 1: Analysis', 'Phase 2: Development', 'Phase 3: Testing', 'Phase 4: Deployment'];
  }

  identifyRisks(changeRequest, analysis) {
    return ['Compatibility issues', 'Performance impact', 'Security considerations'];
  }

  estimateTimeline(changeRequest, analysis) {
    return '4-6 weeks for complete implementation';
  }

  formatDocument(data, template) {
    let formatted = template;
    Object.keys(data.sections).forEach(key => {
      formatted = formatted.replace(`{${key}}`, data.sections[key]);
    });
    return formatted;
  }

  countSections(documentation) {
    return Object.values(documentation).reduce((count, doc) => {
      if (typeof doc === 'object' && doc.sections) {
        return count + Object.keys(doc.sections).length;
      }
      return count + 1;
    }, 0);
  }
}