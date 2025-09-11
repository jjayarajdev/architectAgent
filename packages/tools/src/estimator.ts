import { MCPTool } from '@ea-mcp/common';
import { ImpactedComponent } from '@ea-mcp/common';

export class EffortEstimator {
  static getToolDefinition(): MCPTool {
    return {
      name: 'estimator.effort.bucket',
      description: 'Estimate effort bucket for changes',
      inputSchema: {
        type: 'object',
        properties: {
          components: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                change: { type: 'string' },
                confidence: { type: 'string' }
              }
            }
          },
          complexity_factors: {
            type: 'object',
            properties: {
              integration_points: { type: 'number' },
              data_migration: { type: 'boolean' },
              breaking_changes: { type: 'boolean' },
              compliance_required: { type: 'boolean' }
            }
          }
        },
        required: ['components']
      }
    };
  }

  estimate(
    components: ImpactedComponent[],
    complexityFactors?: {
      integration_points?: number;
      data_migration?: boolean;
      breaking_changes?: boolean;
      compliance_required?: boolean;
    }
  ): 'S' | 'M' | 'L' | 'XL' {
    let score = 0;
    
    components.forEach(comp => {
      const changeScore = this.getChangeScore(comp.change);
      const typeScore = this.getTypeScore(comp.type);
      const confidenceMultiplier = comp.confidence === 'low' ? 1.5 : 
                                   comp.confidence === 'medium' ? 1.2 : 1;
      
      score += changeScore * typeScore * confidenceMultiplier;
    });
    
    if (complexityFactors) {
      if (complexityFactors.integration_points) {
        score += complexityFactors.integration_points * 2;
      }
      if (complexityFactors.data_migration) {
        score += 10;
      }
      if (complexityFactors.breaking_changes) {
        score += 8;
      }
      if (complexityFactors.compliance_required) {
        score += 5;
      }
    }
    
    if (score < 10) return 'S';
    if (score < 25) return 'M';
    if (score < 50) return 'L';
    return 'XL';
  }

  private getChangeScore(change: string): number {
    switch (change) {
      case 'create': return 3;
      case 'modify': return 2;
      case 'refactor': return 4;
      case 'delete': return 1;
      default: return 2;
    }
  }

  private getTypeScore(type: string): number {
    switch (type) {
      case 'database': return 3;
      case 'infrastructure': return 3;
      case 'api': return 2;
      case 'service': return 2;
      case 'library': return 1;
      case 'config': return 1;
      default: return 2;
    }
  }

  generatePlan(
    effortBucket: 'S' | 'M' | 'L' | 'XL',
    deadline?: string
  ): { phases: string[]; duration: string; resources: string } {
    const plans = {
      'S': {
        phases: ['Design', 'Implementation', 'Testing', 'Deployment'],
        duration: '1-2 weeks',
        resources: '1-2 developers'
      },
      'M': {
        phases: ['Design', 'Proof of Concept', 'Implementation', 'Integration Testing', 'UAT', 'Deployment'],
        duration: '3-6 weeks',
        resources: '2-3 developers'
      },
      'L': {
        phases: ['Architecture Review', 'Design', 'Spike/PoC', 'Phased Implementation', 'Integration', 'Performance Testing', 'Security Review', 'UAT', 'Staged Rollout'],
        duration: '2-3 months',
        resources: '3-5 developers, 1 architect'
      },
      'XL': {
        phases: ['Architecture Board Review', 'Detailed Design', 'Multiple PoCs', 'Phased Implementation', 'Integration', 'Load Testing', 'Security Audit', 'Compliance Review', 'UAT', 'Canary Deployment', 'Full Rollout'],
        duration: '4-6 months',
        resources: '5-8 developers, 2 architects, 1 PM'
      }
    };
    
    return plans[effortBucket];
  }
}