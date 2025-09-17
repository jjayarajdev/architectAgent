/**
 * Architecture Writer Agent
 * 
 * Specializes in composing comprehensive architecture documents,
 * creating technical specifications, and generating implementation plans.
 */

import { BaseAgent } from './base-agent.js';

export class ArchWriterAgent extends BaseAgent {
  constructor(options = {}) {
    super('ArchWriterAgent', options);
    
    this.capabilities = [
      'document_composition',
      'technical_writing',
      'diagram_generation',
      'implementation_planning',
      'specification_creation',
      'report_formatting'
    ];
    
    this.llmAnalyzer = options.llmAnalyzer || null;
  }

  async initialize() {
    await super.initialize();
    this.log('Architecture Writer Agent ready');
    return true;
  }

  async execute(context) {
    this.validateContext(context);
    this.setStatus('writing');
    
    const { 
      analysis, 
      changeRequest, 
      repoIntelResults,
      docsIntelResults,
      impactResults,
      options = {} 
    } = context;
    
    try {
      this.currentTask = 'document_composition';
      this.log('Starting architecture document composition');
      
      // Compose comprehensive architecture assessment
      const assessment = await this.composeAssessment({
        projectName: context.projectName || 'Project',
        changeRequest,
        analysis,
        repoIntel: repoIntelResults,
        docsIntel: docsIntelResults,
        impact: impactResults
      });
      
      // Generate additional artifacts
      const artifacts = await this.generateArtifacts({
        assessment,
        analysis,
        changeRequest,
        options
      });
      
      // Format final document
      const finalDocument = await this.formatFinalDocument({
        assessment,
        artifacts,
        metadata: this.generateMetadata(context)
      });
      
      // Store results
      this.results.push({
        timestamp: new Date().toISOString(),
        task: 'architecture_document',
        data: finalDocument
      });
      
      this.log('Architecture document completed', 'success');
      this.setStatus('completed');
      
      return {
        success: true,
        agent: this.name,
        document: finalDocument,
        metrics: {
          sections: this.countSections(finalDocument),
          wordCount: this.estimateWordCount(finalDocument),
          diagrams: artifacts.diagrams?.length || 0
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
   * Compose comprehensive assessment
   */
  async composeAssessment(data) {
    const assessment = {
      title: `Enterprise Architecture Assessment: ${data.projectName}`,
      executiveSummary: await this.writeExecutiveSummary(data),
      currentStateAnalysis: await this.writeCurrentStateAnalysis(data),
      changeRequestAssessment: await this.writeChangeRequestAssessment(data),
      impactAnalysis: await this.writeImpactAnalysis(data),
      architectureRecommendations: await this.writeArchitectureRecommendations(data),
      implementationStrategy: await this.writeImplementationStrategy(data),
      riskMitigation: await this.writeRiskMitigation(data),
      successMetrics: await this.writeSuccessMetrics(data)
    };
    
    // Use LLM for enhanced content if available
    if (this.llmAnalyzer) {
      assessment.aiEnhanced = await this.enhanceWithLLM(assessment, data);
    }
    
    return assessment;
  }

  /**
   * Write executive summary
   */
  async writeExecutiveSummary(data) {
    const { changeRequest, analysis, impact } = data;
    
    return `
# Executive Summary

## Project Overview
This assessment evaluates the proposed change request for implementing ${changeRequest} within the existing system architecture.

## Key Findings
- **Current Architecture**: ${this.describeArchitecture(analysis)}
- **Change Complexity**: ${impact?.impact?.summary?.complexity || 'Medium'}
- **Risk Level**: ${impact?.impact?.overallScore?.riskLevel || 'Medium'}
- **Estimated Timeline**: ${impact?.impact?.timeline?.totalDays || 30} days

## Strategic Recommendations
${this.formatRecommendations(impact?.impact?.recommendations || [])}

## Business Impact
The proposed changes will ${this.assessBusinessImpact(changeRequest, analysis)}.
`;
  }

  /**
   * Write current state analysis
   */
  async writeCurrentStateAnalysis(data) {
    const { analysis, repoIntel } = data;
    const metrics = repoIntel?.metrics || {};
    
    return `
# Current State Analysis

## System Overview
- **Type**: ${analysis.structure.type}
- **Framework**: ${analysis.structure.framework || 'Custom'}
- **Language**: ${analysis.structure.language}

## Architecture Patterns
${this.describePatterns(analysis.patterns)}

## Technology Stack
${this.describeTechStack(analysis.techStack)}

## Code Metrics
- **Total Files**: ${metrics.totalFiles || 0}
- **Total Directories**: ${metrics.totalDirectories || 0}
- **Database Tables**: ${metrics.databaseTables || 0}
- **API Routes**: ${metrics.apiRoutes || 0}
- **Frontend Components**: ${metrics.frontendComponents || 0}

## Quality Indicators
- **Test Coverage**: ${analysis.quality?.hasTests ? '✅ Present' : '❌ Missing'}
- **Documentation**: ${analysis.quality?.hasDocumentation ? '✅ Present' : '❌ Missing'}
- **CI/CD Pipeline**: ${analysis.quality?.hasCICD ? '✅ Configured' : '❌ Not configured'}
- **Linting**: ${analysis.quality?.hasLinting ? '✅ Configured' : '❌ Not configured'}
`;
  }

  /**
   * Write change request assessment
   */
  async writeChangeRequestAssessment(data) {
    const { changeRequest, impact } = data;
    const affectedComponents = impact?.impact?.affectedComponents || [];
    
    return `
# Change Request Assessment

## Requested Change
${changeRequest}

## Scope Analysis
- **Impact Scope**: ${impact?.impact?.summary?.scope || 'Component-level'}
- **Priority**: ${impact?.impact?.summary?.priority || 'Medium'}
- **Complexity**: ${impact?.impact?.summary?.complexity || 'Medium'}

## Affected Components
${this.formatAffectedComponents(affectedComponents)}

## Technical Requirements
${this.generateTechnicalRequirements(changeRequest)}

## Success Criteria
${this.generateSuccessCriteria(changeRequest)}
`;
  }

  /**
   * Write impact analysis
   */
  async writeImpactAnalysis(data) {
    const { impact } = data;
    const impactData = impact?.impact || {};
    
    return `
# Impact Analysis

## Overall Impact Score
- **Score**: ${impactData.overallScore?.score || 0}
- **Risk Level**: ${impactData.overallScore?.riskLevel || 'Unknown'}
- **Recommendation**: ${impactData.overallScore?.recommendation || 'Proceed with standard process'}

## Performance Impact
${this.formatPerformanceImpact(impactData.performance)}

## Security Impact
${this.formatSecurityImpact(impactData.security)}

## Dependencies
${this.formatDependencies(impactData.dependencies)}

## Identified Risks
${this.formatRisks(impactData.risks || [])}

## Cost Estimation
${this.formatCostEstimation(impactData.cost)}

## Timeline
${this.formatTimeline(impactData.timeline)}
`;
  }

  /**
   * Write architecture recommendations
   */
  async writeArchitectureRecommendations(data) {
    const recommendations = this.generateArchitectureRecommendations(data);
    
    return `
# Architecture Recommendations

## Design Principles
${recommendations.principles.map(p => `- ${p}`).join('\n')}

## Architectural Patterns
${recommendations.patterns.map(p => `- **${p.pattern}**: ${p.description}`).join('\n')}

## Technology Choices
${recommendations.technology.map(t => `- **${t.category}**: ${t.recommendation}`).join('\n')}

## Scalability Considerations
${recommendations.scalability.map(s => `- ${s}`).join('\n')}

## Security Enhancements
${recommendations.security.map(s => `- ${s}`).join('\n')}
`;
  }

  /**
   * Write implementation strategy
   */
  async writeImplementationStrategy(data) {
    const strategy = this.generateImplementationStrategy(data);
    
    return `
# Implementation Strategy

## Phased Approach

### Phase 1: Foundation (Week 1-2)
${strategy.phase1.map(task => `- ${task}`).join('\n')}

### Phase 2: Core Development (Week 3-6)
${strategy.phase2.map(task => `- ${task}`).join('\n')}

### Phase 3: Integration & Testing (Week 7-8)
${strategy.phase3.map(task => `- ${task}`).join('\n')}

### Phase 4: Deployment & Stabilization (Week 9-10)
${strategy.phase4.map(task => `- ${task}`).join('\n')}

## Resource Requirements
${strategy.resources.map(r => `- **${r.role}**: ${r.allocation}`).join('\n')}

## Critical Path Activities
${strategy.criticalPath.map(activity => `1. ${activity}`).join('\n')}
`;
  }

  /**
   * Write risk mitigation
   */
  async writeRiskMitigation(data) {
    const risks = data.impact?.impact?.risks || [];
    
    return `
# Risk Mitigation Strategy

## Risk Matrix
${this.createRiskMatrix(risks)}

## Mitigation Plans
${risks.map(risk => `
### ${risk.category.charAt(0).toUpperCase() + risk.category.slice(1)} Risk
- **Description**: ${risk.description}
- **Severity**: ${risk.severity}
- **Mitigation**: ${risk.mitigation}
`).join('\n')}

## Contingency Planning
${this.generateContingencyPlans(risks)}

## Monitoring Strategy
${this.generateMonitoringStrategy(risks)}
`;
  }

  /**
   * Write success metrics
   */
  async writeSuccessMetrics(data) {
    return `
# Success Metrics

## Key Performance Indicators (KPIs)
${this.generateKPIs(data)}

## Technical Metrics
${this.generateTechnicalMetrics(data)}

## Business Metrics
${this.generateBusinessMetrics(data)}

## Quality Metrics
${this.generateQualityMetrics(data)}

## Monitoring Dashboard
${this.generateMonitoringDashboard(data)}
`;
  }

  /**
   * Generate additional artifacts
   */
  async generateArtifacts(data) {
    const artifacts = {
      diagrams: [],
      specifications: [],
      testPlans: []
    };
    
    // Generate architecture diagrams
    if (data.analysis.database.tables.length > 0) {
      artifacts.diagrams.push(this.generateERDiagram(data.analysis.database.tables));
    }
    
    if (data.analysis.api.routes.length > 0) {
      artifacts.diagrams.push(this.generateAPIArchitectureDiagram(data.analysis.api.routes));
    }
    
    artifacts.diagrams.push(this.generateSystemArchitectureDiagram(data.analysis));
    
    // Generate specifications
    if (data.options.generateSpecifications) {
      artifacts.specifications.push(await this.generateTechnicalSpecification(data));
      artifacts.specifications.push(await this.generateAPISpecification(data));
    }
    
    // Generate test plans
    if (data.options.generateTestPlans) {
      artifacts.testPlans.push(await this.generateTestPlan(data));
    }
    
    return artifacts;
  }

  /**
   * Format final document
   */
  async formatFinalDocument(data) {
    const { assessment, artifacts, metadata } = data;
    
    let document = `---
${this.formatMetadata(metadata)}
---

${assessment.title}
${'='.repeat(assessment.title.length)}

${assessment.executiveSummary}

${assessment.currentStateAnalysis}

${assessment.changeRequestAssessment}

${assessment.impactAnalysis}

${assessment.architectureRecommendations}

${assessment.implementationStrategy}

${assessment.riskMitigation}

${assessment.successMetrics}
`;

    // Add diagrams
    if (artifacts.diagrams.length > 0) {
      document += '\n# Architecture Diagrams\n\n';
      artifacts.diagrams.forEach(diagram => {
        document += `## ${diagram.title}\n\n\`\`\`mermaid\n${diagram.content}\n\`\`\`\n\n`;
      });
    }
    
    // Add specifications
    if (artifacts.specifications.length > 0) {
      document += '\n# Technical Specifications\n\n';
      artifacts.specifications.forEach(spec => {
        document += `${spec}\n\n`;
      });
    }
    
    // Add test plans
    if (artifacts.testPlans.length > 0) {
      document += '\n# Test Plans\n\n';
      artifacts.testPlans.forEach(plan => {
        document += `${plan}\n\n`;
      });
    }
    
    // Add footer
    document += this.generateFooter(metadata);
    
    return document;
  }

  /**
   * Helper methods
   */
  
  describeArchitecture(analysis) {
    const patterns = analysis.patterns || {};
    if (patterns.isMicroservices) return 'Microservices Architecture';
    if (patterns.isServerless) return 'Serverless Architecture';
    if (patterns.isEventDriven) return 'Event-Driven Architecture';
    return 'Monolithic Architecture';
  }

  assessBusinessImpact(changeRequest, analysis) {
    return 'significantly improve system scalability, maintainability, and performance';
  }

  formatRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return '- Continue with standard implementation process';
    }
    return recommendations.map(r => 
      `- **${r.priority || 'Medium'}**: ${r.recommendation}`
    ).join('\n');
  }

  describePatterns(patterns) {
    if (!patterns) return 'No specific patterns detected';
    
    const detected = [];
    if (patterns.isMonolith) detected.push('- Monolithic Architecture');
    if (patterns.isMicroservices) detected.push('- Microservices Architecture');
    if (patterns.isServerless) detected.push('- Serverless Functions');
    if (patterns.isEventDriven) detected.push('- Event-Driven Design');
    
    return detected.length > 0 ? detected.join('\n') : 'No specific patterns detected';
  }

  describeTechStack(techStack) {
    if (!techStack) return 'Not available';
    
    return Object.entries(techStack).map(([key, value]) => 
      `- **${key.charAt(0).toUpperCase() + key.slice(1)}**: ${value}`
    ).join('\n');
  }

  formatAffectedComponents(components) {
    if (!components || components.length === 0) {
      return 'No components directly affected';
    }
    
    return components.map(c => 
      `- **${c.type}**: ${c.name} (Impact: ${c.impact})`
    ).join('\n');
  }

  generateTechnicalRequirements(changeRequest) {
    return `- Maintain backward compatibility
- Ensure zero downtime deployment
- Implement comprehensive logging
- Add performance monitoring
- Create rollback procedures`;
  }

  generateSuccessCriteria(changeRequest) {
    return `- All tests passing with >80% coverage
- No degradation in performance metrics
- Successful user acceptance testing
- Documentation complete and approved
- Security audit passed`;
  }

  formatPerformanceImpact(performance) {
    if (!performance) return 'Not assessed';
    
    return `- **CPU Impact**: ${performance.cpu || 'Unknown'}
- **Memory Impact**: ${performance.memory || 'Unknown'}
- **Network Impact**: ${performance.network || 'Unknown'}
- **Database Impact**: ${performance.database || 'Unknown'}
- **Overall**: ${performance.overall || 'Unknown'}`;
  }

  formatSecurityImpact(security) {
    if (!security) return 'Not assessed';
    
    return `- **Authentication**: ${security.authentication || 'No impact'}
- **Authorization**: ${security.authorization || 'No impact'}
- **Data Protection**: ${security.dataProtection || 'No impact'}
- **Compliance**: ${security.compliance || 'No impact'}
- **Vulnerabilities**: ${security.vulnerabilities?.length > 0 ? security.vulnerabilities.join(', ') : 'None identified'}`;
  }

  formatDependencies(dependencies) {
    if (!dependencies) return 'Not analyzed';
    
    return `### Internal Dependencies
${dependencies.internal?.length > 0 ? dependencies.internal.join(', ') : 'None identified'}

### External Dependencies
${dependencies.external?.length > 0 ? dependencies.external.join(', ') : 'None identified'}

### Breaking Changes
${dependencies.breaking?.length > 0 ? dependencies.breaking.join(', ') : 'None identified'}`;
  }

  formatRisks(risks) {
    if (!risks || risks.length === 0) return 'No significant risks identified';
    
    return risks.map(risk => 
      `- **${risk.category}** (${risk.severity}): ${risk.description}`
    ).join('\n');
  }

  formatCostEstimation(cost) {
    if (!cost) return 'Not estimated';
    
    return `- **Development**: ${cost.breakdown?.development || 0} hours
- **Testing**: ${cost.breakdown?.testing || 0} hours
- **Deployment**: ${cost.breakdown?.deployment || 0} hours
- **Documentation**: ${cost.breakdown?.documentation || 0} hours
- **Total**: ${cost.totalHours || 0} hours
- **Estimated Cost**: ${cost.currency || 'USD'} ${cost.estimatedCost || 0}`;
  }

  formatTimeline(timeline) {
    if (!timeline) return 'Not estimated';
    
    return `- **Planning**: ${timeline.phases?.planning || 0} days
- **Development**: ${timeline.phases?.development || 0} days
- **Testing**: ${timeline.phases?.testing || 0} days
- **Deployment**: ${timeline.phases?.deployment || 0} days
- **Stabilization**: ${timeline.phases?.stabilization || 0} days
- **Total Duration**: ${timeline.totalDays || 0} days
- **Estimated Completion**: ${timeline.estimatedEndDate || 'TBD'}`;
  }

  generateArchitectureRecommendations(data) {
    return {
      principles: [
        'Follow SOLID principles',
        'Implement separation of concerns',
        'Use dependency injection',
        'Apply defensive programming',
        'Ensure high cohesion, low coupling'
      ],
      patterns: [
        { pattern: 'Repository Pattern', description: 'For data access abstraction' },
        { pattern: 'Service Layer', description: 'For business logic encapsulation' },
        { pattern: 'Factory Pattern', description: 'For object creation' },
        { pattern: 'Observer Pattern', description: 'For event handling' }
      ],
      technology: [
        { category: 'Caching', recommendation: 'Implement Redis for performance' },
        { category: 'Monitoring', recommendation: 'Use APM tools like DataDog or New Relic' },
        { category: 'Logging', recommendation: 'Centralized logging with ELK stack' }
      ],
      scalability: [
        'Implement horizontal scaling capabilities',
        'Use load balancing for traffic distribution',
        'Design for stateless operations',
        'Implement database connection pooling'
      ],
      security: [
        'Implement OAuth 2.0 for authentication',
        'Use JWT for session management',
        'Apply rate limiting on APIs',
        'Implement input validation and sanitization'
      ]
    };
  }

  generateImplementationStrategy(data) {
    return {
      phase1: [
        'Set up development environment',
        'Configure CI/CD pipeline',
        'Create project structure',
        'Set up monitoring and logging'
      ],
      phase2: [
        'Implement core business logic',
        'Develop API endpoints',
        'Create database migrations',
        'Build frontend components'
      ],
      phase3: [
        'Write unit tests',
        'Perform integration testing',
        'Conduct security testing',
        'Execute performance testing'
      ],
      phase4: [
        'Deploy to staging environment',
        'Perform UAT',
        'Deploy to production',
        'Monitor and optimize'
      ],
      resources: [
        { role: 'Senior Developer', allocation: '100%' },
        { role: 'Backend Developer', allocation: '100%' },
        { role: 'Frontend Developer', allocation: '75%' },
        { role: 'DevOps Engineer', allocation: '50%' },
        { role: 'QA Engineer', allocation: '75%' }
      ],
      criticalPath: [
        'Database schema design and migration',
        'Core API development',
        'Authentication implementation',
        'Integration testing',
        'Production deployment'
      ]
    };
  }

  createRiskMatrix(risks) {
    const matrix = {
      critical: risks.filter(r => r.severity === 'critical').length,
      high: risks.filter(r => r.severity === 'high').length,
      medium: risks.filter(r => r.severity === 'medium').length,
      low: risks.filter(r => r.severity === 'low').length
    };
    
    return `| Severity | Count |
|----------|-------|
| Critical | ${matrix.critical} |
| High     | ${matrix.high} |
| Medium   | ${matrix.medium} |
| Low      | ${matrix.low} |`;
  }

  generateContingencyPlans(risks) {
    return `- Rollback procedures for each deployment phase
- Backup and restore strategies for data migration
- Fallback to previous version if critical issues arise
- Emergency hotfix process for production issues
- Communication plan for stakeholders`;
  }

  generateMonitoringStrategy(risks) {
    return `- Real-time performance monitoring
- Error rate tracking and alerting
- Security event logging
- Business metric dashboards
- Automated health checks`;
  }

  generateKPIs(data) {
    return `- System availability: >99.9%
- Response time: <200ms for 95% of requests
- Error rate: <0.1%
- Deployment frequency: Weekly releases
- Mean time to recovery: <1 hour`;
  }

  generateTechnicalMetrics(data) {
    return `- Code coverage: >80%
- Technical debt ratio: <5%
- Build time: <10 minutes
- Deployment time: <30 minutes
- Database query performance: <100ms`;
  }

  generateBusinessMetrics(data) {
    return `- User satisfaction score: >4.5/5
- Feature adoption rate: >60%
- Time to market: Reduced by 30%
- Operational cost: Reduced by 20%
- Revenue impact: Increase by 15%`;
  }

  generateQualityMetrics(data) {
    return `- Defect density: <1 per KLOC
- Code review coverage: 100%
- Documentation completeness: >90%
- Test automation: >75%
- Security vulnerabilities: 0 critical, <3 high`;
  }

  generateMonitoringDashboard(data) {
    return `\`\`\`
┌─────────────────────────────────────┐
│     System Health Dashboard         │
├─────────────────────────────────────┤
│ Availability: ████████░░ 99.9%      │
│ Performance:  ████████░░ Good       │
│ Error Rate:   ██████████ 0.05%      │
│ Active Users: 1,234                 │
│ API Calls:    45.6K/min             │
└─────────────────────────────────────┘
\`\`\``;
  }

  generateERDiagram(tables) {
    let diagram = 'erDiagram\n';
    tables.forEach(table => {
      diagram += `    ${table.name} {\n`;
      (table.columns || []).forEach(col => {
        diagram += `        ${col.type || 'string'} ${col.name}\n`;
      });
      diagram += '    }\n';
    });
    
    return {
      title: 'Database Entity Relationship Diagram',
      content: diagram
    };
  }

  generateAPIArchitectureDiagram(routes) {
    return {
      title: 'API Architecture',
      content: `graph TD
    Client[Client Application]
    Gateway[API Gateway]
    Auth[Auth Service]
    Business[Business Logic]
    Data[Data Layer]
    
    Client --> Gateway
    Gateway --> Auth
    Gateway --> Business
    Business --> Data`
    };
  }

  generateSystemArchitectureDiagram(analysis) {
    return {
      title: 'System Architecture',
      content: `graph TB
    subgraph "Presentation Layer"
        UI[User Interface]
        Mobile[Mobile App]
    end
    
    subgraph "Application Layer"
        API[API Services]
        BL[Business Logic]
    end
    
    subgraph "Data Layer"
        DB[(Database)]
        Cache[(Cache)]
    end
    
    UI --> API
    Mobile --> API
    API --> BL
    BL --> DB
    BL --> Cache`
    };
  }

  async generateTechnicalSpecification(data) {
    return `## Technical Specification

### API Endpoints
${data.analysis.api.routes.map(r => `- ${r.method} ${r.path}`).join('\n')}

### Data Models
${data.analysis.database.tables.map(t => `- ${t.name}`).join('\n')}

### Security Requirements
- Authentication: JWT Bearer tokens
- Authorization: Role-based access control
- Encryption: TLS 1.3 for transit, AES-256 for storage`;
  }

  async generateAPISpecification(data) {
    return `## API Specification

### Base URL
\`https://api.example.com/v1\`

### Authentication
All API requests require a valid JWT token in the Authorization header.

### Rate Limiting
- 1000 requests per hour per user
- 100 requests per minute per IP`;
  }

  async generateTestPlan(data) {
    return `## Test Plan

### Unit Testing
- Target: >80% code coverage
- Framework: Jest/Mocha
- Frequency: On every commit

### Integration Testing
- Scope: API endpoints, database operations
- Tools: Postman, Newman
- Frequency: Daily

### Performance Testing
- Load: 1000 concurrent users
- Response time: <200ms p95
- Tools: JMeter, K6`;
  }

  enhanceWithLLM(assessment, data) {
    // This would call the LLM to enhance the content
    // For now, return the assessment as is
    return assessment;
  }

  generateMetadata(context) {
    return {
      title: 'Enterprise Architecture Assessment',
      author: 'EA MCP Suite - Multi-Agent System',
      date: new Date().toISOString(),
      version: '2.0',
      agents: ['RepoIntelAgent', 'DocsIntelAgent', 'ImpactAgent', 'ArchWriterAgent'],
      project: context.projectName || 'Unknown',
      changeRequest: context.changeRequest || 'Not specified'
    };
  }

  formatMetadata(metadata) {
    return Object.entries(metadata)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join('\n');
  }

  generateFooter(metadata) {
    return `

---

*Generated by EA MCP Suite Multi-Agent System*  
*Date: ${metadata.date}*  
*Version: ${metadata.version}*  
*Agents: ${metadata.agents.join(', ')}*
`;
  }

  countSections(document) {
    return (document.match(/^#{1,3} /gm) || []).length;
  }

  estimateWordCount(document) {
    return document.split(/\s+/).length;
  }
}