import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { Sprint0ReviewServer } from './index.js';
import { createLogger } from '@ea-mcp/common';
import { RepositoryAnalyzer } from './repository-analyzer.js';
import { RealCodeAnalyzer } from './real-analyzer.js';
import { EnterpriseArchitectOrchestrator } from './enterprise-architect-orchestrator.js';

const app: Express = express();
const port = process.env.PORT || 3000;
const logger = createLogger('api-server');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    service: 'MCP EA Suite API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Main analysis endpoint
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    logger.info('Received analysis request');
    const rawInput = req.body;
    
    // Normalize input format - support both old and new formats
    const input = {
      repository: {
        url: rawInput.repoUrl || rawInput.repository?.url || rawInput.repository,
        branch: rawInput.branch || rawInput.repository?.branch || 'main'
      },
      changeRequest: rawInput.changeRequest || {
        title: rawInput.changeRequest,
        description: rawInput.changeRequest,
        functionalAreas: []
      },
      context: rawInput.context || {}
    };
    
    // Clone and analyze the actual repository
    logger.info(`Cloning repository: ${input.repository.url}`);
    const analyzer = new RepositoryAnalyzer();
    const repoAnalysis = await analyzer.analyzeRepository(
      input.repository.url,
      input.repository.branch
    );
    logger.info('Repository analysis complete');
    
    // Use Enterprise Architect Orchestrator for comprehensive analysis
    logger.info('Using Enterprise Architect Orchestrator for analysis');
    const orchestrator = new EnterpriseArchitectOrchestrator();
    const eaAnalysis = await orchestrator.analyzeRepository(repoAnalysis, input.changeRequest);
    
    // Transform input to MCP format with actual repo data
    const mcpInput = transformToMCPFormat(input, repoAnalysis);
    
    // Format output for UI with EA analysis
    const output = formatOutputForEA(eaAnalysis, input, mcpInput, repoAnalysis);
    
    logger.info('Analysis completed successfully');
    res.json(output);
    
  } catch (error) {
    logger.error('Analysis failed:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Analysis failed',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

// Get analysis status
app.get('/api/status/:id', (req, res) => {
  res.json({
    id: req.params.id,
    status: 'completed',
    progress: 100
  });
});

// List available templates
app.get('/api/templates', (req, res) => {
  res.json({
    templates: [
      {
        id: 'microservices',
        name: 'Microservices Architecture',
        description: 'Best for scalable, distributed systems'
      },
      {
        id: 'monolith',
        name: 'Monolithic Architecture',
        description: 'Best for smaller, simpler applications'
      },
      {
        id: 'serverless',
        name: 'Serverless Architecture',
        description: 'Best for event-driven, pay-per-use scenarios'
      }
    ]
  });
});

function transformToMCPFormat(input: any, repoAnalysis?: any) {
  // Use actual repository data if available
  const actualStack = repoAnalysis?.architecture?.stack || [];
  const actualDependencies = repoAnalysis?.dependencies || {};
  const actualDatabase = repoAnalysis?.database || {};
  const actualAPIs = repoAnalysis?.apis || {};
  
  return {
    repository: input.repository,
    changeRequest: {
      ...input.changeRequest,
      scope: {
        functionalAreas: input.changeRequest.functionalAreas || [],
        components: mapFunctionalAreasToComponents(input.changeRequest.functionalAreas || []),
        dataEntities: inferDataEntities(input.changeRequest),
        integrations: inferIntegrations(input.changeRequest.functionalAreas || [])
      }
    },
    context: {
      enterpriseLandscape: {
        existingServices: getDefaultServices(input.context?.cloudPlatform),
        sharedLibraries: ['react', 'typescript', 'tailwindcss', 'express', 'postgresql'],
        dataStores: getDefaultDataStores()
      },
      architecturalStandards: {
        patterns: getArchitecturalPatterns(input.context?.architectureStyle),
        security: getSecurityStandards(input.context?.compliance || []),
        dataGovernance: getDataGovernanceStandards(input.context?.compliance || []),
        scalability: ['Database indexing', 'Caching', 'Load balancing', 'Auto-scaling']
      },
      operationalContext: {
        currentOwners: ['Product Team', 'Engineering Team'],
        supportModel: input.context?.supportModel || 'business-hours',
        slaRequirements: {
          availability: '99.5%',
          responseTime: '< 1 second p95',
          throughput: '1000 requests/second'
        }
      },
      businessMetrics: generateDefaultMetrics()
    }
  };
}

function formatOutputForUI(result: any, input: any, mcpInput: any, repoAnalysis?: any) {
  return {
    repository: input.repository,
    changeRequest: input.changeRequest,
    context: input.context,
    repoAnalysis: repoAnalysis, // Include actual repo analysis
    metrics: {
      complianceScore: result.architecturalAlignment?.complianceScore || 85,
      roi: 157,
      riskCount: result.risks?.riskRegister?.length || 5,
      technicalDebt: result.technicalDebt?.debtMetrics?.totalDebtHours || 480,
      reusableComponents: repoAnalysis?.architecture?.stack?.length || 0,
      paybackPeriod: '4.4 months',
      timeline: '12 weeks'
    },
    analysis: {
      ...result,
      // Add actual repository data to analysis
      actualArchitecture: repoAnalysis?.architecture,
      actualDatabase: repoAnalysis?.database,
      actualDependencies: repoAnalysis?.dependencies,
      actualAPIs: repoAnalysis?.apis,
      actualCodeMetrics: repoAnalysis?.codeMetrics
    },
    artifacts: {
      sprint0Review: generateSprint0Markdown(result, mcpInput, repoAnalysis),
      executiveSummary: generateExecutiveSummary(result, mcpInput, repoAnalysis),
      technicalArchitecture: generateTechnicalArchitecture(result, mcpInput, repoAnalysis),
      riskMatrix: generateRiskMatrix(result),
      implementationRoadmap: generateRoadmap(result, mcpInput)
    },
    diagrams: result.diagrams || generateDefaultDiagrams()
  };
}

function formatOutputForEA(eaAnalysis: any, input: any, mcpInput: any, repoAnalysis: any) {
  // Extract key components from EA analysis - new structure includes report at top level
  const { asIsArchitecture, impactMatrix, recommendations, artifacts, report, businessMetrics, roadmap, successMetrics, riskAssessment, resourcePlan } = eaAnalysis;
  
  return {
    repository: input.repository,
    changeRequest: input.changeRequest,
    context: input.context,
    repoAnalysis: repoAnalysis,
    
    // Metrics derived from EA analysis
    metrics: {
      complianceScore: Math.round(100 - (impactMatrix.summary?.highestRisk || 1) * 20),
      roi: recommendations.length * 35, // ROI based on recommendations
      riskCount: impactMatrix.direct?.length || 0,
      technicalDebt: impactMatrix.summary?.totalEffort === 'XL' ? 800 : 
                     impactMatrix.summary?.totalEffort === 'L' ? 400 :
                     impactMatrix.summary?.totalEffort === 'M' ? 200 : 100,
      reusableComponents: asIsArchitecture.stack?.frameworks?.length || 0,
      paybackPeriod: '3-6 months',
      timeline: impactMatrix.summary?.totalEffort === 'XL' ? '16 weeks' : 
                impactMatrix.summary?.totalEffort === 'L' ? '12 weeks' :
                impactMatrix.summary?.totalEffort === 'M' ? '8 weeks' : '4 weeks'
    },
    
    // Comprehensive analysis from EA orchestrator
    analysis: {
      // Solution Discovery & Reusability
      solutionDiscovery: {
        reusableComponents: asIsArchitecture.stack?.frameworks || [],
        recommendations: recommendations.filter((r: any) => r.category === 'Architecture & Modularity')
          .map((r: any) => `${r.title}: ${r.why}`)
      },
      
      // Architectural Alignment
      architecturalAlignment: {
        complianceScore: Math.round(100 - (impactMatrix.summary?.highestRisk || 1) * 20),
        violations: impactMatrix.direct?.filter((i: any) => i.risk === 'high')
          .map((i: any) => `${i.component}: ${i.changeType} change with ${i.risk} risk`),
        ambiguities: impactMatrix.direct?.filter((i: any) => i.evidence.length === 0)
          .map((i: any) => `${i.component}: Needs further investigation`)
      },
      
      // Data & Integration Strategy
      dataIntegration: {
        integrationPoints: asIsArchitecture.topology?.serviceBoundaries?.map((s: string) => ({
          system: s,
          method: 'REST API'
        })) || [],
        dataFlows: asIsArchitecture.stack?.dataStores?.map((ds: string) => ({
          source: 'Application',
          destination: ds,
          type: 'Database'
        })) || []
      },
      
      // Operational Ownership
      operationalOwnership: {
        proposedOwner: 'Platform Team',
        supportModel: asIsArchitecture.quality?.cicd?.present ? 'DevOps' : 'Traditional Ops',
        slaTargets: {
          availability: '99.9%',
          responseTime: '<200ms',
          errorRate: '<1%'
        }
      },
      
      // Technical Debt Management
      technicalDebt: {
        currentDebt: recommendations.filter((r: any) => r.category === 'Technical Debt')
          .map((r: any) => ({
            item: r.title,
            effort: r.effort,
            priority: r.priority
          })),
        debtMetrics: {
          totalDebtHours: impactMatrix.summary?.totalEffort === 'XL' ? 800 : 
                         impactMatrix.summary?.totalEffort === 'L' ? 400 :
                         impactMatrix.summary?.totalEffort === 'M' ? 200 : 100,
          debtRatio: 0.15
        }
      },
      
      // Business Value & ROI
      businessValue: {
        roi: {
          expected: `${recommendations.length * 35}%`,
          paybackPeriod: '3-6 months'
        },
        benefits: recommendations.slice(0, 5).map((r: any) => r.why)
      },
      
      // Scalability & Evolution
      scalability: {
        bottlenecks: impactMatrix.direct?.filter((i: any) => i.effort === 'L')
          .map((i: any) => i.component),
        evolutionPlan: recommendations.slice(0, 3).map((r: any, idx: number) => ({
          phase: idx + 1,
          description: r.title,
          effort: r.effort
        }))
      },
      
      // Include actual repository analysis
      actualArchitecture: asIsArchitecture,
      actualImpact: impactMatrix,
      actualRecommendations: recommendations
    },
    
    // Artifacts from EA orchestrator
    artifacts: {
      sprint0Review: report || artifacts?.report || '',
      executiveSummary: (report || artifacts?.report || '').split('## Executive Summary')[1]?.split('##')[0] || '',
      technicalArchitecture: artifacts?.diagrams?.systemContext || '',
      riskMatrix: generateRiskMatrixFromImpact(impactMatrix),
      implementationRoadmap: roadmap || generateRoadmapFromRecommendations(recommendations),
      adr: artifacts?.adr || ''
    },
    
    // Diagrams from EA orchestrator
    diagrams: {
      systemContext: artifacts?.diagrams?.systemContext || '',
      components: artifacts?.diagrams?.components || '',
      ...generateDefaultDiagrams()
    }
  };
}

function generateRiskMatrixFromImpact(impactMatrix: any): string {
  const risks = impactMatrix.direct || [];
  return `# Risk Matrix

| Component | Risk Level | Impact | Mitigation |
|-----------|------------|---------|------------|
${risks.map((r: any) => `| ${r.component} | ${r.risk} | ${r.changeType} | Monitor and test thoroughly |`).join('\n')}

**Summary**: ${impactMatrix.summary?.componentsAffected || 0} components affected with ${
  impactMatrix.summary?.highestRisk === 3 ? 'high' : 
  impactMatrix.summary?.highestRisk === 2 ? 'medium' : 'low'
} overall risk.`;
}

function generateRoadmapFromRecommendations(recommendations: any[]): string {
  const phases = [
    { name: 'Phase 1: Foundation', items: recommendations.slice(0, 3) },
    { name: 'Phase 2: Core Implementation', items: recommendations.slice(3, 6) },
    { name: 'Phase 3: Optimization', items: recommendations.slice(6, 9) }
  ];
  
  return `# Implementation Roadmap

${phases.map(phase => `
## ${phase.name}
${phase.items.map((item: any) => `- **${item.title}** (${item.effort} effort, ${item.risk} risk)
  - ${item.why}
  - Priority Score: ${item.priority}`).join('\n')}
`).join('\n')}
`;
}

// Helper functions
function mapFunctionalAreasToComponents(areas: string[]): string[] {
  const mapping: Record<string, string[]> = {
    'Authentication & Authorization': ['Auth Service', 'Session Manager', 'Token Service'],
    'Data Processing': ['Data Pipeline', 'ETL Service', 'Data Validator'],
    'API/Services': ['API Gateway', 'Service Mesh', 'Load Balancer'],
    'User Interface': ['Frontend App', 'CDN', 'Static Assets'],
    'Database': ['Database Cluster', 'Connection Pool', 'Migration Service'],
    'Infrastructure': ['Container Orchestration', 'Service Discovery', 'Config Management'],
    'Integrations': ['Integration Hub', 'API Adapters', 'Webhook Manager'],
    'Analytics': ['Analytics Engine', 'Report Generator', 'Dashboard Service'],
    'Monitoring': ['Metrics Collector', 'Log Aggregator', 'Alert Manager'],
    'Security': ['Security Gateway', 'Encryption Service', 'Audit Logger'],
    'Workflow Management': ['Workflow Engine', 'State Manager', 'Process Orchestrator'],
    'Notification System': ['Notification Service', 'Email Sender', 'Push Service']
  };
  
  return areas.flatMap(area => mapping[area] || [area]);
}

function inferDataEntities(changeRequest: any): string[] {
  const entities = ['User', 'AuditLog'];
  
  if (changeRequest.functionalAreas?.includes('Authentication & Authorization')) {
    entities.push('Session', 'Role', 'Permission');
  }
  if (changeRequest.functionalAreas?.includes('Data Processing')) {
    entities.push('DataRecord', 'DataSchema', 'ProcessingJob');
  }
  if (changeRequest.functionalAreas?.includes('Workflow Management')) {
    entities.push('Workflow', 'WorkflowState', 'Task');
  }
  
  return entities;
}

function inferIntegrations(functionalAreas: string[]): string[] {
  const integrations = [];
  
  if (functionalAreas.includes('Authentication & Authorization')) {
    integrations.push('SSO Provider', 'LDAP/AD');
  }
  if (functionalAreas.includes('Notification System')) {
    integrations.push('Email Service', 'SMS Gateway');
  }
  if (functionalAreas.includes('Analytics')) {
    integrations.push('Analytics Platform', 'Data Warehouse');
  }
  
  return integrations;
}

function getDefaultServices(cloudPlatform: string): any[] {
  const baseServices = [
    {
      name: 'Authentication Service',
      type: 'Authentication',
      capabilities: ['JWT', 'OAuth2', 'SSO', 'MFA']
    },
    {
      name: 'Database Service',
      type: 'Database',
      capabilities: ['ACID', 'Replication', 'Backup', 'Sharding']
    },
    {
      name: 'Cache Service',
      type: 'Cache',
      capabilities: ['In-memory', 'Distributed', 'TTL', 'Eviction']
    }
  ];
  
  if (cloudPlatform === 'AWS') {
    baseServices.push(
      {
        name: 'AWS Lambda',
        type: 'Compute',
        capabilities: ['Serverless', 'Auto-scaling', 'Event-driven']
      },
      {
        name: 'AWS S3',
        type: 'Storage',
        capabilities: ['Object storage', 'CDN', 'Versioning']
      }
    );
  } else if (cloudPlatform === 'Azure') {
    baseServices.push({
      name: 'Azure Functions',
      type: 'Compute',
      capabilities: ['Serverless', 'Auto-scaling', 'Event-driven']
    });
  }
  
  return baseServices;
}

function getDefaultDataStores(): any[] {
  return [
    {
      name: 'Primary Database',
      type: 'Relational',
      purpose: 'Transactional data'
    },
    {
      name: 'Cache',
      type: 'In-Memory',
      purpose: 'Performance optimization'
    },
    {
      name: 'Object Storage',
      type: 'Blob',
      purpose: 'Files and media'
    },
    {
      name: 'Search Index',
      type: 'Full-text',
      purpose: 'Search functionality'
    }
  ];
}

function getArchitecturalPatterns(style: string): string[] {
  const patterns: Record<string, string[]> = {
    'microservices': ['Service Mesh', 'API Gateway', 'Service Discovery', 'Circuit Breaker', 'Saga Pattern'],
    'modular-monolith': ['Module Boundaries', 'Dependency Injection', 'Domain-Driven Design', 'CQRS'],
    'monolith': ['Layered Architecture', 'MVC Pattern', 'Repository Pattern', 'Service Layer'],
    'serverless': ['Function as a Service', 'Event-Driven', 'Stateless', 'API Gateway'],
    'event-driven': ['Event Sourcing', 'CQRS', 'Pub-Sub', 'Message Queue', 'Event Store']
  };
  
  return patterns[style] || ['RESTful APIs', 'Stateless Services', 'Load Balancing'];
}

function getSecurityStandards(compliance: string[]): string[] {
  const standards = ['TLS 1.3', 'OAuth 2.0', 'API Key Management', 'Rate Limiting'];
  
  if (compliance.includes('GDPR')) {
    standards.push('Data Encryption at Rest', 'PII Masking', 'Right to be Forgotten', 'Data Portability');
  }
  if (compliance.includes('SOC2')) {
    standards.push('Audit Logging', 'Access Control', 'Security Scanning', 'Incident Response');
  }
  if (compliance.includes('HIPAA')) {
    standards.push('PHI Encryption', 'Access Logs', 'Data Retention Policy', 'BAA Agreements');
  }
  if (compliance.includes('PCI-DSS')) {
    standards.push('Credit Card Tokenization', 'Network Segmentation', 'Vulnerability Scanning');
  }
  
  return standards;
}

function getDataGovernanceStandards(compliance: string[]): string[] {
  const standards = ['Data Classification', 'Retention Policy', 'Data Quality Monitoring'];
  
  if (compliance.length > 0) {
    standards.push('Audit Trail', 'Data Lineage', 'Access Control Matrix', 'Data Catalog');
  }
  
  return standards;
}

function generateDefaultMetrics(): any[] {
  return [
    {
      name: 'Response Time',
      currentValue: 'N/A',
      targetValue: '< 1 second',
      measurementMethod: 'APM monitoring'
    },
    {
      name: 'Availability',
      currentValue: 'N/A',
      targetValue: '99.9%',
      measurementMethod: 'Uptime monitoring'
    },
    {
      name: 'Error Rate',
      currentValue: 'N/A',
      targetValue: '< 1%',
      measurementMethod: 'Error tracking'
    },
    {
      name: 'Throughput',
      currentValue: 'N/A',
      targetValue: '1000 req/s',
      measurementMethod: 'Load testing'
    }
  ];
}

function generateSprint0Markdown(analysis: any, input: any, repoAnalysis?: any): string {
  return `# Sprint 0 EA Review

## Change Request: ${input.changeRequest.title}

### 1. Solution Discovery & Reusability
- Identified ${analysis.solutionDiscovery?.reusableComponents?.length || 0} reusable components
- ${analysis.solutionDiscovery?.recommendations?.join('\n- ') || 'Analysis complete'}

### 2. Architectural Alignment
- Compliance Score: ${analysis.architecturalAlignment?.complianceScore || 85}%
- Violations: ${analysis.architecturalAlignment?.violations?.length || 0}
- Ambiguities: ${analysis.architecturalAlignment?.ambiguities?.length || 0}

### 3. Data & Integration Strategy
- Entities: ${analysis.dataIntegration?.proposedModel?.entities?.join(', ') || 'Defined'}
- Integration Points: ${analysis.dataIntegration?.integrationPoints?.length || 0}

### 4. Operational Ownership
- Owner: ${analysis.operationalOwnership?.proposedOwner || 'Product Team'}
- Support Model: ${analysis.operationalOwnership?.supportModel || 'Business Hours'}

### 5. Technical Debt
- Current Debt Items: ${analysis.technicalDebt?.currentDebt?.length || 0}
- Total Debt Hours: ${analysis.technicalDebt?.debtMetrics?.totalDebtHours || 0}

### 6. Business Value
- Expected ROI: ${analysis.businessValue?.roi?.expected || '150%'}
- Payback Period: ${analysis.businessValue?.roi?.paybackPeriod || '8 months'}

### 7. Scalability
- Bottlenecks Identified: ${analysis.scalability?.bottlenecks?.length || 0}
- Evolution Phases: ${analysis.scalability?.evolutionPlan?.length || 0}
`;
}

function generateExecutiveSummary(analysis: any, input: any, repoAnalysis?: any): string {
  return `# Executive Summary

## ${input.changeRequest.title}

${input.changeRequest.description}

### Key Findings
- Compliance Score: ${analysis.architecturalAlignment?.complianceScore || 85}%
- Technical Debt: ${analysis.technicalDebt?.debtMetrics?.totalDebtHours || 480} hours
- Expected ROI: ${analysis.businessValue?.roi?.expected || '150%'}
- Timeline: ${input.changeRequest.timeline}

### Top Recommendations
${analysis.solutionDiscovery?.recommendations?.slice(0, 3).map((r: string) => `1. ${r}`).join('\n') || '1. See detailed report for recommendations'}

### Next Steps
1. Review and approve architecture
2. Allocate resources
3. Begin Sprint 1 implementation
`;
}

function generateTechnicalArchitecture(analysis: any, input: any, repoAnalysis?: any): string {
  const actualStack = repoAnalysis?.architecture?.stack || [];
  const actualDatabase = repoAnalysis?.database || {};
  const actualAPIs = repoAnalysis?.apis || {};
  const actualFiles = repoAnalysis?.codeMetrics?.files || 0;
  const actualLanguages = Object.keys(repoAnalysis?.codeMetrics?.languages || {});
  
  return `# Technical Architecture

## Detected Technology Stack
${actualStack.length > 0 ? actualStack.map((tech: string) => `- ${tech}`).join('\n') : '- Analysis in progress'}

## Database
- Type: ${actualDatabase.type || 'Unknown'}
- Tables: ${actualDatabase.tables?.length || 0} detected
${actualDatabase.tables?.slice(0, 5).map((t: string) => `  - ${t}`).join('\n') || ''}

## Code Metrics
- Total Files: ${actualFiles}
- Languages: ${actualLanguages.join(', ')}
- Test Coverage: ${repoAnalysis?.codeMetrics?.testCoverage || 'Unknown'}

## API Endpoints Detected
${actualAPIs.endpoints?.slice(0, 10).map((e: string) => `- ${e}`).join('\n') || '- No endpoints detected'}
- Authentication: ${actualAPIs.authentication || 'Unknown'}

## Architecture Style
${repoAnalysis?.architecture?.structure || input.context?.architectureStyle || 'Microservices'}

## Integration Points
${analysis.dataIntegration?.integrationPoints?.map((i: any) => `- ${i.system}: ${i.method}`).join('\n') || '- See integration specifications'}
`;
}

function generateRiskMatrix(analysis: any): string {
  return `# Risk Matrix

## Risk Summary
Total Risks: ${analysis.risks?.riskRegister?.length || 5}

## Top Risks
${analysis.risks?.riskRegister?.slice(0, 5).map((r: any) => 
  `### ${r.id || 'R00X'}: ${r.risk || 'Risk Item'}
- Probability: ${r.probability || 'Medium'}
- Impact: ${r.impact || 'High'}
- Mitigation: ${r.mitigation || 'To be defined'}
`).join('\n') || 'No critical risks identified'}

## Mitigation Strategy
${analysis.technicalDebt?.mitigationPlan?.slice(0, 3).join('\n') || 'To be developed'}
`;
}

function generateRoadmap(analysis: any, input: any): string {
  return `# Implementation Roadmap

## Timeline: ${input.changeRequest.timeline}

## Implementation Phases
${analysis.scalability?.evolutionPlan?.map((p: any) => 
  `### ${p.phase}
- Duration: ${p.timeline}
- Changes: ${p.changes?.join(', ')}
`).join('\n') || `### Sprint 0: Planning (2 weeks)
### Sprint 1-2: Foundation (4 weeks)
### Sprint 3-4: Development (4 weeks)
### Sprint 5-6: Testing & Deployment (4 weeks)`}

## Resource Requirements
- Development Team: 5-7 engineers
- DevOps: 1-2 engineers
- QA: 2 engineers
- Product Manager: 1
- Technical Lead: 1

## Success Criteria
- All functional requirements met
- Performance targets achieved
- Security audit passed
- User acceptance completed
`;
}

function generateDefaultDiagrams(): any {
  return {
    systemArchitecture: `
graph TB
    subgraph "Presentation Layer"
        WEB[Web Application]
        MOB[Mobile Apps]
        API[REST APIs]
    end
    subgraph "Application Layer"
        GW[API Gateway]
        AUTH[Auth Service]
        BUS[Business Logic]
    end
    subgraph "Data Layer"
        DB[(Primary Database)]
        CACHE[(Redis Cache)]
        QUEUE[(Message Queue)]
    end
    WEB --> GW
    MOB --> GW
    API --> GW
    GW --> AUTH
    GW --> BUS
    BUS --> DB
    BUS --> CACHE
    BUS --> QUEUE`,
    
    dataFlow: `
sequenceDiagram
    participant User
    participant Frontend
    participant Gateway
    participant Service
    participant Database
    
    User->>Frontend: Submit Request
    Frontend->>Gateway: API Call
    Gateway->>Service: Process Request
    Service->>Database: Query Data
    Database-->>Service: Return Data
    Service-->>Gateway: Process Response
    Gateway-->>Frontend: JSON Response
    Frontend-->>User: Display Result`,
    
    deploymentTopology: `
graph TB
    subgraph "Production Environment"
        subgraph "Web Tier"
            LB[Load Balancer]
            WEB1[Web Server 1]
            WEB2[Web Server 2]
        end
        subgraph "App Tier"
            APP1[App Server 1]
            APP2[App Server 2]
        end
        subgraph "Data Tier"
            DB_MASTER[(Master DB)]
            DB_SLAVE[(Replica DB)]
        end
    end
    LB --> WEB1
    LB --> WEB2
    WEB1 --> APP1
    WEB2 --> APP2
    APP1 --> DB_MASTER
    APP2 --> DB_SLAVE`,
    
    componentDiagram: `
graph LR
    subgraph "Frontend"
        UI[UI Components]
        STATE[State Management]
        API_CLIENT[API Client]
    end
    subgraph "Backend"
        CONTROLLER[Controllers]
        SERVICE[Services]
        REPO[Repositories]
    end
    subgraph "Infrastructure"
        DB[(Database)]
        CACHE[(Cache)]
        QUEUE[(Queue)]
    end
    UI --> STATE
    STATE --> API_CLIENT
    API_CLIENT --> CONTROLLER
    CONTROLLER --> SERVICE
    SERVICE --> REPO
    REPO --> DB
    SERVICE --> CACHE
    SERVICE --> QUEUE`
  };
}

// Start the server
app.listen(port, () => {
  logger.info(`🚀 MCP EA Suite API Server running on http://localhost:${port}`);
  logger.info(`📊 Health check available at http://localhost:${port}/health`);
  logger.info(`🔧 API endpoint at http://localhost:${port}/api/analyze`);
});

export default app;