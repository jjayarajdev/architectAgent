import { 
  MCPServer, 
  MCPServerCapabilities, 
  MCPRequest, 
  MCPResponse,
  createLogger
} from '@ea-mcp/common';
import { CodeIndexer, DocsIndexer, FileSystemTool } from '@ea-mcp/tools';
import { EnhancedSprint0Analyzer } from './enhanced-analyzer.js';

export { Sprint0ReportGenerator } from './report-generator.js';

interface Sprint0Analysis {
  solutionDiscovery: {
    reusableComponents: Array<{
      name: string;
      type: string;
      relevance: string;
      integrationEffort: 'low' | 'medium' | 'high';
    }>;
    recommendations: string[];
  };
  architecturalAlignment: {
    ambiguities: Array<{
      area: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      mitigation: string;
    }>;
    nonCompliance: Array<{
      standard: string;
      violation: string;
      impact: string;
      remediation: string;
    }>;
  };
  dataIntegration: {
    proposedModel: {
      entities: string[];
      relationships: string[];
    };
    dataFlow: {
      ingestion: string[];
      transformation: string[];
      consumption: string[];
    };
    integrationPoints: Array<{
      system: string;
      method: string;
      dataFormat: string;
    }>;
  };
  operationalOwnership: {
    proposedOwner: string;
    supportModel: string;
    maintenancePlan: {
      activities: string[];
      frequency: string;
      resources: string;
    };
    alignmentGaps: string[];
  };
  technicalDebt: {
    currentDebt: Array<{
      component: string;
      type: string;
      impact: string;
    }>;
    mitigationPlan: string[];
    simplificationOpportunities: Array<{
      area: string;
      current: string;
      proposed: string;
      benefit: string;
    }>;
  };
  businessValue: {
    objectives: Array<{
      objective: string;
      contribution: string;
      measurement: string;
    }>;
    kpis: Array<{
      name: string;
      baseline: string;
      target: string;
      frequency: string;
    }>;
    roi: {
      costs: string;
      benefits: string;
      paybackPeriod: string;
    };
  };
  scalability: {
    bottlenecks: Array<{
      component: string;
      limitation: string;
      impact: string;
      threshold: string;
    }>;
    evolutionPlan: Array<{
      phase: string;
      changes: string[];
      timeline: string;
    }>;
    recommendations: string[];
  };
}

export class Sprint0ReviewServer extends MCPServer {
  name = 'agent-sprint0';
  version = '1.0.0';
  
  private logger = createLogger('sprint0');
  private codeIndexer = new CodeIndexer();
  private docsIndexer = new DocsIndexer();
  private fsTool = new FileSystemTool();
  private enhancedAnalyzer = new EnhancedSprint0Analyzer();
  
  getCapabilities(): MCPServerCapabilities {
    return {
      tools: [
        {
          name: 'sprint0.analyze',
          description: 'Perform Sprint 0 EA Review analysis',
          inputSchema: {
            type: 'object',
            properties: {
              repository: { type: 'object' },
              changeRequest: { type: 'object' },
              context: { type: 'object' }
            },
            required: ['repository', 'changeRequest', 'context']
          }
        }
      ]
    };
  }
  
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const { method, params, id } = request;
    
    try {
      switch (method) {
        case 'sprint0.analyze':
          // Use enhanced analyzer for detailed analysis
          const useEnhanced = params.detailed !== false; // Default to detailed
          const analysis = useEnhanced 
            ? await this.enhancedAnalyzer.generateDetailedAnalysis(params)
            : await this.analyzeSprint0(params);
          return this.createResponse(id, analysis);
          
        case 'health':
          return this.createResponse(id, await this.health());
          
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      this.logger.error(`Request failed: ${error}`);
      return this.createResponse(id, null, error);
    }
  }
  
  private async analyzeSprint0(params: any): Promise<Sprint0Analysis> {
    const { repository, changeRequest, context } = params;
    this.logger.info(`Analyzing Sprint 0 requirements for: ${changeRequest.title}`);
    
    return {
      solutionDiscovery: await this.analyzeSolutionDiscovery(changeRequest, context),
      architecturalAlignment: await this.analyzeArchitecturalAlignment(repository, context),
      dataIntegration: await this.analyzeDataIntegration(changeRequest, context),
      operationalOwnership: await this.analyzeOperationalOwnership(changeRequest, context),
      technicalDebt: await this.analyzeTechnicalDebt(repository, changeRequest),
      businessValue: await this.analyzeBusinessValue(changeRequest, context),
      scalability: await this.analyzeScalability(repository, changeRequest)
    };
  }
  
  private async analyzeSolutionDiscovery(changeRequest: any, context: any): Promise<any> {
    const reusableComponents = [];
    
    // Analyze existing services for reusability
    if (context.enterpriseLandscape?.existingServices) {
      for (const service of context.enterpriseLandscape.existingServices) {
        const relevance = this.assessRelevance(service, changeRequest);
        if (relevance.score > 0.5) {
          reusableComponents.push({
            name: service.name,
            type: service.type,
            relevance: relevance.reason,
            integrationEffort: relevance.effort
          });
        }
      }
    }
    
    return {
      reusableComponents,
      recommendations: [
        'Leverage existing authentication service for user management',
        'Reuse data validation libraries from shared components',
        'Extend existing API gateway for new endpoints',
        'Utilize enterprise message queue for async processing'
      ]
    };
  }
  
  private async analyzeArchitecturalAlignment(repository: any, context: any): Promise<any> {
    const ambiguities = [];
    const nonCompliance = [];
    
    // Check against architectural standards
    if (context.architecturalStandards) {
      // Security compliance
      if (context.architecturalStandards.security) {
        nonCompliance.push({
          standard: 'Security Standards',
          violation: 'Missing input validation layer',
          impact: 'Potential security vulnerabilities',
          remediation: 'Implement validation middleware using enterprise security library'
        });
      }
      
      // Scalability patterns
      if (context.architecturalStandards.scalability) {
        ambiguities.push({
          area: 'Scalability',
          description: 'Unclear horizontal scaling strategy',
          severity: 'medium',
          mitigation: 'Define auto-scaling policies and load balancing configuration'
        });
      }
    }
    
    return {
      ambiguities,
      nonCompliance
    };
  }
  
  private async analyzeDataIntegration(changeRequest: any, context: any): Promise<any> {
    return {
      proposedModel: {
        entities: changeRequest.scope?.dataEntities || ['User', 'Transaction', 'Audit'],
        relationships: ['User->Transaction (1:N)', 'Transaction->Audit (1:N)']
      },
      dataFlow: {
        ingestion: ['REST API', 'Message Queue', 'Batch Import'],
        transformation: ['Validation', 'Enrichment', 'Aggregation'],
        consumption: ['REST API', 'WebSocket', 'Report Export']
      },
      integrationPoints: [
        {
          system: 'Core Database',
          method: 'Direct SQL',
          dataFormat: 'Relational'
        },
        {
          system: 'Analytics Platform',
          method: 'Event Streaming',
          dataFormat: 'JSON'
        }
      ]
    };
  }
  
  private async analyzeOperationalOwnership(changeRequest: any, context: any): Promise<any> {
    return {
      proposedOwner: context.operationalContext?.currentOwners?.[0] || 'Platform Team',
      supportModel: context.operationalContext?.supportModel || 'business-hours',
      maintenancePlan: {
        activities: [
          'Daily health checks',
          'Weekly performance review',
          'Monthly security patching',
          'Quarterly capacity planning'
        ],
        frequency: 'As per activity schedule',
        resources: '2 FTE for operations, 1 FTE for maintenance'
      },
      alignmentGaps: [
        'Need to define escalation procedures',
        'Monitoring dashboard not specified',
        'Disaster recovery plan required'
      ]
    };
  }
  
  private async analyzeTechnicalDebt(repository: any, changeRequest: any): Promise<any> {
    return {
      currentDebt: [
        {
          component: 'Legacy Integration',
          type: 'Code Debt',
          impact: 'Increased maintenance cost'
        },
        {
          component: 'Manual Deployment',
          type: 'Process Debt',
          impact: 'Slower release cycles'
        }
      ],
      mitigationPlan: [
        'Refactor legacy integration using adapter pattern',
        'Implement CI/CD pipeline in Sprint 1',
        'Add automated testing in Sprint 2'
      ],
      simplificationOpportunities: [
        {
          area: 'Data Processing',
          current: 'Complex stored procedures',
          proposed: 'Stream processing with Kafka',
          benefit: '50% reduction in processing time'
        },
        {
          area: 'Authentication',
          current: 'Custom implementation',
          proposed: 'Enterprise SSO integration',
          benefit: 'Reduced security risk and maintenance'
        }
      ]
    };
  }
  
  private async analyzeBusinessValue(changeRequest: any, context: any): Promise<any> {
    const objectives = changeRequest.businessObjectives?.map((obj: string) => ({
      objective: obj,
      contribution: 'Direct impact through automation',
      measurement: 'Quarterly business review'
    })) || [];
    
    return {
      objectives,
      kpis: context.businessMetrics || [
        {
          name: 'Processing Time',
          baseline: '5 minutes',
          target: '30 seconds',
          frequency: 'Daily'
        },
        {
          name: 'Error Rate',
          baseline: '5%',
          target: '<1%',
          frequency: 'Real-time'
        }
      ],
      roi: {
        costs: '$500K development + $100K/year operations',
        benefits: '$1M/year in efficiency gains',
        paybackPeriod: '8 months'
      }
    };
  }
  
  private async analyzeScalability(repository: any, changeRequest: any): Promise<any> {
    return {
      bottlenecks: [
        {
          component: 'Database',
          limitation: 'Single instance',
          impact: 'Max 10K transactions/second',
          threshold: '80% CPU utilization'
        },
        {
          component: 'API Gateway',
          limitation: 'Fixed thread pool',
          impact: 'Max 5K concurrent connections',
          threshold: '90% thread utilization'
        }
      ],
      evolutionPlan: [
        {
          phase: 'Sprint 1-2',
          changes: ['Implement connection pooling', 'Add caching layer'],
          timeline: '4 weeks'
        },
        {
          phase: 'Sprint 3-4',
          changes: ['Database sharding', 'Microservices extraction'],
          timeline: '6 weeks'
        },
        {
          phase: 'Sprint 5-6',
          changes: ['Auto-scaling implementation', 'Multi-region deployment'],
          timeline: '8 weeks'
        }
      ],
      recommendations: [
        'Implement database read replicas for read-heavy workloads',
        'Use CDN for static content delivery',
        'Adopt event-driven architecture for better decoupling',
        'Implement circuit breakers for resilience'
      ]
    };
  }
  
  private assessRelevance(service: any, changeRequest: any): any {
    // Simple relevance scoring logic
    let score = 0;
    let effort = 'medium';
    
    if (service.capabilities) {
      for (const capability of service.capabilities) {
        if (changeRequest.scope?.functionalAreas?.includes(capability)) {
          score += 0.3;
        }
      }
    }
    
    if (score > 0.7) effort = 'low';
    if (score < 0.3) effort = 'high';
    
    return {
      score,
      reason: `Provides ${Math.round(score * 100)}% of required capabilities`,
      effort
    };
  }
}