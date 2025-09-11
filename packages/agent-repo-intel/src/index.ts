import { 
  MCPServer, 
  MCPServerCapabilities, 
  MCPRequest, 
  MCPResponse,
  ImpactedComponent,
  createLogger
} from '@ea-mcp/common';
import { CodeIndexer, SQLParser, OpenAPIParser, TerraformParser } from '@ea-mcp/tools';

export class RepoIntelServer extends MCPServer {
  name = 'agent-repo-intel';
  version = '1.0.0';
  
  private logger = createLogger('repo-intel');
  private codeIndexer = new CodeIndexer();
  private sqlParser = new SQLParser();
  private openApiParser = new OpenAPIParser();
  private terraformParser = new TerraformParser();
  
  getCapabilities(): MCPServerCapabilities {
    return {
      tools: [
        CodeIndexer.getToolDefinition(),
        SQLParser.getToolDefinition(),
        OpenAPIParser.getToolDefinition(),
        TerraformParser.getToolDefinition(),
        {
          name: 'analyze.impacted',
          description: 'Analyze impacted components',
          inputSchema: {
            type: 'object',
            properties: {
              repo: { type: 'object' },
              requirement: { type: 'object' },
              scope: { type: 'object' }
            },
            required: ['repo', 'requirement']
          }
        }
      ]
    };
  }
  
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const { method, params, id } = request;
    
    try {
      switch (method) {
        case 'index.code':
          await this.codeIndexer.index(params.patterns, params.root);
          return this.createResponse(id, { success: true });
          
        case 'parser.sql':
          const tables = this.sqlParser.parse(params.content);
          return this.createResponse(id, { tables });
          
        case 'parser.openapi':
          const api = this.openApiParser.parse(params.content);
          return this.createResponse(id, api);
          
        case 'parser.terraform':
          const resources = this.terraformParser.parse(params.content);
          return this.createResponse(id, { resources });
          
        case 'analyze.impacted':
          const impacted = await this.analyzeImpacted(params);
          return this.createResponse(id, { impacted });
          
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
  
  private async analyzeImpacted(params: any): Promise<ImpactedComponent[]> {
    const { repo, requirement } = params;
    this.logger.info(`Analyzing impact for: ${requirement.summary}`);
    
    await this.codeIndexer.index(repo.path_filters || ['src/**'], '.');
    
    const impacted: ImpactedComponent[] = [];
    
    if (requirement.summary.toLowerCase().includes('multi-tenant') ||
        requirement.summary.toLowerCase().includes('tenant')) {
      impacted.push(
        {
          component: 'Authentication Service',
          type: 'service',
          file_paths: ['src/services/auth.ts', 'src/middleware/auth.ts'],
          change: 'modify',
          confidence: 'high',
          description: 'Add tenant context to auth tokens'
        },
        {
          component: 'Database Schema',
          type: 'database',
          file_paths: ['db/migrations/001_initial.sql', 'db/schema.sql'],
          change: 'modify',
          confidence: 'high',
          description: 'Add tenant_id column to all tables'
        },
        {
          component: 'API Gateway',
          type: 'api',
          file_paths: ['src/api/routes.ts', 'src/api/middleware.ts'],
          change: 'modify',
          confidence: 'medium',
          description: 'Route requests based on tenant'
        },
        {
          component: 'Configuration Service',
          type: 'service',
          file_paths: ['src/services/config.ts'],
          change: 'create',
          confidence: 'high',
          description: 'New service for tenant-specific configuration'
        }
      );
    }
    
    const symbols = this.codeIndexer.search(requirement.summary.split(' ')[0]);
    symbols.forEach(symbol => {
      if (!impacted.find(c => c.file_paths.includes(symbol.file))) {
        impacted.push({
          component: symbol.name,
          type: 'library',
          file_paths: [symbol.file],
          change: 'modify',
          confidence: 'low',
          description: `Potential impact on ${symbol.type} ${symbol.name}`
        });
      }
    });
    
    this.logger.info(`Identified ${impacted.length} impacted components`);
    return impacted;
  }
}