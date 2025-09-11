export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPServerCapabilities {
  tools?: MCPTool[];
  resources?: MCPResource[];
}

export abstract class MCPServer {
  abstract name: string;
  abstract version: string;
  
  abstract getCapabilities(): MCPServerCapabilities;
  abstract handleRequest(request: MCPRequest): Promise<MCPResponse>;
  
  protected createResponse(id: string | number, result?: any, error?: any): MCPResponse {
    const response: MCPResponse = {
      jsonrpc: '2.0',
      id
    };
    
    if (error) {
      response.error = {
        code: error.code || -32603,
        message: error.message || 'Internal error',
        data: error.data
      };
    } else {
      response.result = result;
    }
    
    return response;
  }
  
  async health(): Promise<{ status: 'ok' | 'error'; message?: string }> {
    return { status: 'ok' };
  }
}