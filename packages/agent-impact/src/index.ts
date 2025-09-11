import { 
  MCPServer, 
  MCPServerCapabilities, 
  MCPRequest, 
  MCPResponse,
  ImpactAnalysis,
  ImpactedComponent,
  Risk,
  createLogger
} from '@ea-mcp/common';
import { EffortEstimator } from '@ea-mcp/tools';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ImpactServer extends MCPServer {
  name = 'agent-impact';
  version = '1.0.0';
  
  private logger = createLogger('impact');
  private estimator = new EffortEstimator();
  private riskCatalog: any;
  
  constructor() {
    super();
    this.loadRiskCatalog();
  }
  
  private loadRiskCatalog(): void {
    try {
      const catalogPath = path.resolve(__dirname, '../../common/risk-catalog.json');
      this.riskCatalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));
    } catch (error) {
      this.logger.warn('Failed to load risk catalog, using defaults');
      this.riskCatalog = { risks: [] };
    }
  }
  
  getCapabilities(): MCPServerCapabilities {
    return {
      tools: [
        EffortEstimator.getToolDefinition(),
        {
          name: 'risk.catalog.load',
          description: 'Load risk catalog',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'analyze.impact',
          description: 'Analyze requirement impact',
          inputSchema: {
            type: 'object',
            properties: {
              requirement: { type: 'object' },
              impacted: { type: 'array' },
              context: { type: 'object' }
            },
            required: ['requirement', 'impacted']
          }
        }
      ]
    };
  }
  
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const { method, params, id } = request;
    
    try {
      switch (method) {
        case 'estimator.effort.bucket':
          const bucket = this.estimator.estimate(
            params.components,
            params.complexity_factors
          );
          const plan = this.estimator.generatePlan(bucket, params.deadline);
          return this.createResponse(id, { bucket, plan });
          
        case 'risk.catalog.load':
          return this.createResponse(id, this.riskCatalog);
          
        case 'analyze.impact':
          const impact = await this.analyzeImpact(params);
          return this.createResponse(id, impact);
          
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
  
  private async analyzeImpact(params: any): Promise<ImpactAnalysis> {
    const { requirement, impacted, context } = params;
    this.logger.info(`Analyzing impact for ${requirement.summary}`);
    
    const dependencies = this.identifyDependencies(impacted);
    const risks = this.assessRisks(requirement, impacted, context);
    
    const complexityFactors = {
      integration_points: dependencies.length,
      data_migration: impacted.some((c: ImpactedComponent) => c.type === 'database'),
      breaking_changes: requirement.constraints?.includes('No breaking API'),
      compliance_required: context?.compliance?.length > 0
    };
    
    const effortBucket = this.estimator.estimate(impacted, complexityFactors);
    const plan = this.estimator.generatePlan(effortBucket, requirement.deadline);
    
    const testAreas = this.identifyTestAreas(impacted, requirement);
    
    const impact: ImpactAnalysis = {
      dependencies,
      risks,
      effort_bucket: effortBucket,
      test_areas: testAreas,
      rollout_strategy: this.determineRolloutStrategy(effortBucket, context),
      rollback_strategy: this.determineRollbackStrategy(impacted)
    };
    
    this.logger.info(`Impact analysis complete: ${effortBucket} effort`);
    return impact;
  }
  
  private identifyDependencies(impacted: ImpactedComponent[]): string[] {
    const deps = new Set<string>();
    
    impacted.forEach(component => {
      deps.add(component.component);
      
      if (component.type === 'api') {
        deps.add('API Clients');
        deps.add('API Documentation');
      }
      if (component.type === 'database') {
        deps.add('Data Access Layer');
        deps.add('Migration Scripts');
        deps.add('Backup/Restore');
      }
      if (component.type === 'service') {
        deps.add('Service Registry');
        deps.add('Load Balancer');
      }
    });
    
    return Array.from(deps);
  }
  
  private assessRisks(requirement: any, impacted: ImpactedComponent[], context: any): Risk[] {
    const risks: Risk[] = [];
    
    if (requirement.summary.toLowerCase().includes('multi-tenant') ||
        requirement.summary.toLowerCase().includes('tenant')) {
      risks.push({
        id: 'SEC-001',
        category: 'Security',
        description: 'Data isolation breach between tenants',
        likelihood: 'medium',
        impact: 'high',
        mitigations: [
          'Implement row-level security',
          'Add tenant ID validation at all layers',
          'Comprehensive security testing',
          'Regular security audits'
        ]
      });
    }
    
    if (impacted.some(c => c.type === 'database')) {
      risks.push({
        id: 'DATA-001',
        category: 'Data',
        description: 'Data migration failures or corruption',
        likelihood: 'medium',
        impact: 'high',
        mitigations: [
          'Comprehensive backup before migration',
          'Rollback procedures',
          'Data validation scripts',
          'Staged migration approach'
        ]
      });
    }
    
    if (impacted.some(c => c.type === 'api')) {
      risks.push({
        id: 'INTEG-001',
        category: 'Integration',
        description: 'Breaking changes for API consumers',
        likelihood: 'medium',
        impact: 'high',
        mitigations: [
          'API versioning strategy',
          'Deprecation notices',
          'Contract testing',
          'Client communication plan'
        ]
      });
    }
    
    if (context?.compliance?.includes('GDPR')) {
      risks.push({
        id: 'COMP-001',
        category: 'Compliance',
        description: 'GDPR compliance violations',
        likelihood: 'low',
        impact: 'high',
        mitigations: [
          'Privacy impact assessment',
          'Data classification',
          'Encryption at rest and in transit',
          'Access control review'
        ]
      });
    }
    
    return risks;
  }
  
  private identifyTestAreas(impacted: ImpactedComponent[], requirement: any): string[] {
    const areas = new Set<string>();
    
    areas.add('Unit Tests');
    areas.add('Integration Tests');
    
    if (impacted.some(c => c.type === 'api')) {
      areas.add('API Contract Tests');
      areas.add('API Performance Tests');
    }
    
    if (impacted.some(c => c.type === 'database')) {
      areas.add('Data Migration Tests');
      areas.add('Data Integrity Tests');
    }
    
    if (requirement.non_functional?.security) {
      areas.add('Security Tests');
      areas.add('Penetration Tests');
    }
    
    if (requirement.non_functional?.performance) {
      areas.add('Load Tests');
      areas.add('Stress Tests');
    }
    
    if (requirement.summary.toLowerCase().includes('multi-tenant')) {
      areas.add('Tenant Isolation Tests');
      areas.add('Cross-tenant Security Tests');
    }
    
    areas.add('User Acceptance Tests');
    areas.add('Regression Tests');
    
    return Array.from(areas);
  }
  
  private determineRolloutStrategy(effort: string, context: any): string {
    if (effort === 'S') {
      return 'Direct deployment to all environments';
    } else if (effort === 'M') {
      return 'Staged rollout: Dev → Staging → Production';
    } else {
      const strategy = 'Phased rollout with feature flags:\n';
      const phases = [
        '1. Internal testing (1 week)',
        '2. Beta users (5% traffic, 1 week)',
        '3. Gradual rollout (25% → 50% → 100%, 2 weeks)',
        '4. Full deployment'
      ];
      return strategy + phases.join('\n');
    }
  }
  
  private determineRollbackStrategy(impacted: ImpactedComponent[]): string {
    const strategies = ['Feature flag disable (immediate)'];
    
    if (impacted.some(c => c.type === 'database')) {
      strategies.push('Database rollback scripts prepared');
    }
    
    if (impacted.some(c => c.type === 'api')) {
      strategies.push('API version fallback');
    }
    
    strategies.push('Previous version redeployment (30 minutes)');
    strategies.push('Data recovery from backups (if needed)');
    
    return strategies.join('\n');
  }
}