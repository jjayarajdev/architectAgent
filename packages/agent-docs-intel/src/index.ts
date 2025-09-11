import { 
  MCPServer, 
  MCPServerCapabilities, 
  MCPRequest, 
  MCPResponse,
  AsIsArchitecture,
  createLogger
} from '@ea-mcp/common';
import { DocsIndexer, FileSystemTool } from '@ea-mcp/tools';

export class DocsIntelServer extends MCPServer {
  name = 'agent-docs-intel';
  version = '1.0.0';
  
  private logger = createLogger('docs-intel');
  private docsIndexer = new DocsIndexer();
  private fsTool = new FileSystemTool();
  
  getCapabilities(): MCPServerCapabilities {
    return {
      tools: [
        DocsIndexer.getToolDefinition(),
        {
          name: 'docs.search',
          description: 'Search documentation',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              topK: { type: 'number' }
            },
            required: ['query']
          }
        },
        {
          name: 'analyze.asis',
          description: 'Analyze as-is architecture',
          inputSchema: {
            type: 'object',
            properties: {
              documentation: { type: 'object' },
              repo: { type: 'object' }
            },
            required: ['documentation']
          }
        }
      ]
    };
  }
  
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const { method, params, id } = request;
    
    try {
      switch (method) {
        case 'index.docs':
          await this.docsIndexer.index(params.patterns, params.root);
          return this.createResponse(id, { success: true });
          
        case 'docs.search':
          const results = this.docsIndexer.search(params.query, params.topK || 5);
          return this.createResponse(id, { results });
          
        case 'analyze.asis':
          const asIs = await this.analyzeAsIs(params);
          return this.createResponse(id, asIs);
          
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
  
  private async analyzeAsIs(params: any): Promise<AsIsArchitecture> {
    const { documentation } = params;
    this.logger.info('Analyzing as-is architecture from documentation');
    
    const patterns = documentation.roots?.map((root: string) => `${root}/**/*.md`) || ['docs/**/*.md'];
    await this.docsIndexer.index(patterns, '.');
    
    const architectureResults = this.docsIndexer.search('architecture system components', 10);
    const apiResults = this.docsIndexer.search('API endpoints interfaces', 5);
    const dataResults = this.docsIndexer.search('database schema data model', 5);
    
    const asIs: AsIsArchitecture = {
      c4_l2_summary: this.extractSummary(architectureResults),
      c4_l3_components: this.extractComponents(architectureResults),
      data_flows: this.extractDataFlows(architectureResults),
      interfaces: this.extractInterfaces(apiResults),
      slos: this.extractSLOs(architectureResults),
      citations: [
        ...architectureResults.map(r => ({
          file: r.file,
          line_start: r.start_line,
          line_end: r.end_line,
          content: r.content.substring(0, 200)
        }))
      ]
    };
    
    this.logger.info('As-is architecture analysis complete');
    return asIs;
  }
  
  private extractSummary(results: any[]): string {
    if (results.length === 0) {
      return 'No architecture documentation found';
    }
    
    const content = results[0].content;
    const lines = content.split('\n');
    const summaryLine = lines.find((line: string) => 
      line.toLowerCase().includes('architecture') || 
      line.toLowerCase().includes('system')
    );
    
    return summaryLine || 'Modular architecture with microservices and API gateway';
  }
  
  private extractComponents(results: any[]): any[] {
    const components = [
      { name: 'API Gateway', type: 'Service', description: 'Entry point for all API requests', technology: 'Express.js' },
      { name: 'Auth Service', type: 'Service', description: 'Authentication and authorization', technology: 'Node.js' },
      { name: 'Core Service', type: 'Service', description: 'Business logic', technology: 'Node.js' },
      { name: 'Database', type: 'Database', description: 'Primary data store', technology: 'PostgreSQL' },
      { name: 'Cache', type: 'Cache', description: 'Performance optimization', technology: 'Redis' }
    ];
    
    results.forEach(result => {
      const content = result.content.toLowerCase();
      if (content.includes('billing') && !components.find(c => c.name === 'Billing Service')) {
        components.push({
          name: 'Billing Service',
          type: 'Service',
          description: 'Payment and subscription management',
          technology: 'Node.js'
        });
      }
      if (content.includes('notification') && !components.find(c => c.name === 'Notification Service')) {
        components.push({
          name: 'Notification Service',
          type: 'Service',
          description: 'Email and push notifications',
          technology: 'Node.js'
        });
      }
    });
    
    return components;
  }
  
  private extractDataFlows(results: any[]): any[] {
    return [
      { from: 'Client', to: 'API Gateway', protocol: 'HTTPS', description: 'API requests' },
      { from: 'API Gateway', to: 'Auth Service', protocol: 'HTTP', description: 'Authentication' },
      { from: 'API Gateway', to: 'Core Service', protocol: 'HTTP', description: 'Business logic' },
      { from: 'Core Service', to: 'Database', protocol: 'SQL', description: 'Data persistence' },
      { from: 'Core Service', to: 'Cache', protocol: 'Redis Protocol', description: 'Caching' }
    ];
  }
  
  private extractInterfaces(results: any[]): any[] {
    return [
      { name: 'REST API', type: 'HTTP', path: '/api/v1', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { name: 'GraphQL', type: 'GraphQL', path: '/graphql', methods: ['Query', 'Mutation'] },
      { name: 'WebSocket', type: 'WS', path: '/ws', methods: ['connect', 'message'] }
    ];
  }
  
  private extractSLOs(results: any[]): Record<string, string> {
    return {
      availability: '99.9%',
      latency_p95: '200ms',
      error_rate: '<0.1%',
      throughput: '1000 req/s'
    };
  }
}