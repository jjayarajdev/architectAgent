import { 
  MCPServer, 
  MCPServerCapabilities, 
  MCPRequest, 
  MCPResponse,
  AsIsArchitecture,
  ImpactedComponent,
  ImpactAnalysis,
  createLogger
} from '@ea-mcp/common';
import { DiagramRenderer, FileSystemTool } from '@ea-mcp/tools';

export class ArchWriterServer extends MCPServer {
  name = 'agent-arch-writer';
  version = '1.0.0';
  
  private logger = createLogger('arch-writer');
  private diagramRenderer = new DiagramRenderer();
  private fsTool = new FileSystemTool();
  private adrCounter = 1;
  
  getCapabilities(): MCPServerCapabilities {
    return {
      tools: [
        DiagramRenderer.getToolDefinition(),
        {
          name: 'generate.artifacts',
          description: 'Generate architecture artifacts',
          inputSchema: {
            type: 'object',
            properties: {
              requirement: { type: 'object' },
              asIs: { type: 'object' },
              impacted: { type: 'array' },
              impact: { type: 'object' },
              outputs: { type: 'object' }
            },
            required: ['requirement', 'outputs']
          }
        }
      ]
    };
  }
  
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const { method, params, id } = request;
    
    try {
      switch (method) {
        case 'diagram.mermaid.render':
          await this.diagramRenderer.render(params.content, params.outputPath);
          return this.createResponse(id, { success: true });
          
        case 'generate.artifacts':
          const artifacts = await this.generateArtifacts(params);
          return this.createResponse(id, { artifacts });
          
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
  
  private async generateArtifacts(params: any): Promise<string[]> {
    const { requirement, asIs, impacted, impact, outputs } = params;
    const artifacts: string[] = [];
    
    this.logger.info('Generating architecture artifacts');
    
    if (outputs.deliverables?.includes('Updated Architecture (C4 L2/L3)')) {
      const l2Path = await this.generateC4L2(asIs, impacted);
      const l3Path = await this.generateC4L3(asIs, impacted);
      artifacts.push(l2Path, l3Path);
    }
    
    if (outputs.deliverables?.includes('ADRs')) {
      const adrPath = await this.generateADR(requirement, impact);
      artifacts.push(adrPath);
    }
    
    if (outputs.deliverables?.includes('Test Strategy')) {
      const testPath = await this.generateTestStrategy(impact, impacted);
      artifacts.push(testPath);
    }
    
    this.logger.info(`Generated ${artifacts.length} artifacts`);
    return artifacts;
  }
  
  private async generateC4L2(asIs: AsIsArchitecture, impacted: ImpactedComponent[]): Promise<string> {
    const components = asIs?.c4_l3_components || [];
    
    impacted.forEach(imp => {
      if (imp.change === 'create' && !components.find(c => c.name === imp.component)) {
        components.push({
          name: imp.component,
          type: imp.type,
          description: imp.description || '',
          technology: 'TBD'
        });
      }
    });
    
    const mermaid = this.diagramRenderer.generateC4Container(components);
    const mmdPath = 'docs/ea/c4-l2-system.mmd';
    const pngPath = 'docs/ea/c4-l2-system.png';
    
    this.fsTool.writeFile(mmdPath, mermaid);
    await this.diagramRenderer.render(mermaid, pngPath);
    
    return pngPath;
  }
  
  private async generateC4L3(asIs: AsIsArchitecture, impacted: ImpactedComponent[]): Promise<string> {
    const components = asIs?.c4_l3_components || [];
    
    const updatedComponents = components.map(comp => {
      const impact = impacted.find(i => i.component === comp.name);
      if (impact) {
        return { ...comp, status: impact.change };
      }
      return comp;
    });
    
    const mermaid = this.diagramRenderer.generateC4Component(updatedComponents);
    const mmdPath = 'docs/ea/c4-l3-components.mmd';
    const pngPath = 'docs/ea/c4-l3-components.png';
    
    this.fsTool.writeFile(mmdPath, mermaid);
    await this.diagramRenderer.render(mermaid, pngPath);
    
    return pngPath;
  }
  
  private async generateADR(requirement: any, impact: ImpactAnalysis): Promise<string> {
    const adrNumber = String(this.adrCounter++).padStart(3, '0');
    const slug = requirement.summary
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 30);
    
    const adrPath = `docs/adr/ADR-${adrNumber}-${slug}.md`;
    
    const content = `# ADR-${adrNumber}: ${requirement.summary}

## Status
Proposed

## Context
${requirement.summary}

### Drivers
${requirement.drivers?.map((d: string) => `- ${d}`).join('\n') || '- Business requirement'}

### Constraints
${requirement.constraints?.map((c: string) => `- ${c}`).join('\n') || '- None identified'}

## Decision
We will implement ${requirement.summary} with the following approach:

### Impacted Components
${impact.dependencies.slice(0, 5).map(d => `- ${d}`).join('\n')}

### Implementation Strategy
- Effort: ${impact.effort_bucket}
- Rollout: ${impact.rollout_strategy}
- Rollback: ${impact.rollback_strategy}

## Consequences

### Positive
- Addresses the business requirement
- Enables new capabilities
- Improves system architecture

### Negative
- Requires significant development effort (${impact.effort_bucket})
- Introduces complexity
- Requires careful testing

### Risks
${impact.risks.slice(0, 3).map(r => 
  `- **${r.category}**: ${r.description} (${r.likelihood}/${r.impact})`
).join('\n')}

## Alternatives Considered
1. **Do Nothing**: Not viable due to business requirements
2. **Partial Implementation**: Would not fully address the need
3. **Third-party Solution**: Would require significant integration effort

## References
- Original requirement documentation
- Architecture diagrams (C4 L2/L3)
- Risk assessment

---
*Date: ${new Date().toISOString().split('T')[0]}*
*Author: EA Team*
`;
    
    this.fsTool.writeFile(adrPath, content);
    return adrPath;
  }
  
  private async generateTestStrategy(impact: ImpactAnalysis, impacted: ImpactedComponent[]): Promise<string> {
    const path = 'docs/ea/test-strategy.md';
    
    const content = `# Test Strategy

## Overview
Comprehensive testing approach for the implementation.

## Test Areas
${impact.test_areas.map(area => `- ${area}`).join('\n')}

## Test Phases

### Phase 1: Unit Testing
- All new code must have >80% coverage
- Focus on business logic validation

### Phase 2: Integration Testing
${impacted.filter(c => c.type === 'service').map(c => 
  `- ${c.component}: Verify integration points`
).join('\n')}

### Phase 3: System Testing
- End-to-end scenarios
- Performance benchmarks
- Security validation

### Phase 4: User Acceptance Testing
- Business stakeholder validation
- Production-like environment testing

## Success Criteria
- All tests passing
- Performance within SLOs
- No critical security issues
- Business acceptance

## Risk Mitigation
${impact.risks.map(r => 
  `- ${r.category}: ${r.mitigations[0]}`
).join('\n')}

---
*Generated: ${new Date().toISOString()}*
`;
    
    this.fsTool.writeFile(path, content);
    return path;
  }
}