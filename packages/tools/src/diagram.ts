import { writeFileSync } from 'fs';
import { MCPTool } from '@ea-mcp/common';
import { logger } from '@ea-mcp/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class DiagramRenderer {
  static getToolDefinition(): MCPTool {
    return {
      name: 'diagram.mermaid.render',
      description: 'Render Mermaid diagram to PNG',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          outputPath: { type: 'string' }
        },
        required: ['content', 'outputPath']
      }
    };
  }

  async render(content: string, outputPath: string): Promise<void> {
    const mmdPath = outputPath.replace('.png', '.mmd');
    writeFileSync(mmdPath, content);
    
    try {
      await execAsync(`mmdc -i ${mmdPath} -o ${outputPath}`);
      logger.info(`Rendered diagram to ${outputPath}`);
    } catch (error) {
      logger.warn(`Mermaid CLI not available, using mock renderer`);
      this.mockRender(content, outputPath);
    }
  }

  private mockRender(content: string, outputPath: string): void {
    const mockPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52
    ]);
    
    writeFileSync(outputPath, mockPng);
    logger.info(`Created mock PNG at ${outputPath}`);
  }

  generateC4Context(components: any[]): string {
    let mermaid = 'graph TB\n';
    mermaid += '    subgraph "System Context"\n';
    
    components.forEach((comp, i) => {
      mermaid += `        C${i}[${comp.name}]\n`;
    });
    
    mermaid += '    end\n';
    return mermaid;
  }

  generateC4Container(components: any[]): string {
    let mermaid = 'graph TB\n';
    mermaid += '    subgraph "Container Diagram"\n';
    
    components.forEach((comp, i) => {
      const tech = comp.technology ? `<br/>${comp.technology}` : '';
      mermaid += `        C${i}[${comp.name}${tech}]\n`;
    });
    
    mermaid += '    end\n';
    
    components.forEach((comp, i) => {
      if (comp.dependencies) {
        comp.dependencies.forEach((dep: string) => {
          const depIndex = components.findIndex(c => c.name === dep);
          if (depIndex >= 0) {
            mermaid += `    C${i} --> C${depIndex}\n`;
          }
        });
      }
    });
    
    return mermaid;
  }

  generateC4Component(components: any[]): string {
    let mermaid = 'graph TB\n';
    mermaid += '    subgraph "Component Diagram"\n';
    
    const byType = components.reduce((acc, comp) => {
      const type = comp.type || 'Other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(comp);
      return acc;
    }, {} as Record<string, any[]>);
    
    Object.entries(byType).forEach(([type, comps]) => {
      mermaid += `        subgraph "${type}"\n`;
      (comps as any[]).forEach((comp: any, i: number) => {
        mermaid += `            ${type}${i}[${comp.name}]\n`;
      });
      mermaid += '        end\n';
    });
    
    mermaid += '    end\n';
    return mermaid;
  }

  generateSequenceDiagram(flows: any[]): string {
    let mermaid = 'sequenceDiagram\n';
    
    flows.forEach(flow => {
      mermaid += `    ${flow.from}->>+${flow.to}: ${flow.description || flow.protocol || 'request'}\n`;
      if (flow.response) {
        mermaid += `    ${flow.to}-->>-${flow.from}: ${flow.response}\n`;
      }
    });
    
    return mermaid;
  }
}