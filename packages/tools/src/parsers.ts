import { MCPTool } from '@ea-mcp/common';
import { logger } from '@ea-mcp/common';

interface SQLTable {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    constraints?: string[];
  }>;
}

interface OpenAPIPath {
  path: string;
  method: string;
  operationId?: string;
  parameters?: any[];
  requestBody?: any;
  responses?: any;
}

interface TerraformResource {
  type: string;
  name: string;
  provider?: string;
  properties?: Record<string, any>;
}

export class SQLParser {
  static getToolDefinition(): MCPTool {
    return {
      name: 'parser.sql',
      description: 'Parse SQL DDL statements',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string' }
        },
        required: ['content']
      }
    };
  }

  parse(content: string): SQLTable[] {
    const tables: SQLTable[] = [];
    
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]*?)\);/gi;
    let match;
    
    while ((match = createTableRegex.exec(content)) !== null) {
      const tableName = match[1];
      const columnDefs = match[2];
      
      const columns = this.parseColumns(columnDefs);
      
      tables.push({
        name: tableName,
        columns
      });
    }
    
    const alterTableRegex = /ALTER\s+TABLE\s+(\w+)\s+ADD\s+(?:COLUMN\s+)?(\w+)\s+(\w+)/gi;
    while ((match = alterTableRegex.exec(content)) !== null) {
      const tableName = match[1];
      const columnName = match[2];
      const columnType = match[3];
      
      let table = tables.find(t => t.name === tableName);
      if (!table) {
        table = { name: tableName, columns: [] };
        tables.push(table);
      }
      
      table.columns.push({
        name: columnName,
        type: columnType
      });
    }
    
    logger.info(`Parsed ${tables.length} SQL tables`);
    return tables;
  }

  private parseColumns(columnDefs: string): SQLTable['columns'] {
    const columns: SQLTable['columns'] = [];
    const lines = columnDefs.split(',').map(line => line.trim());
    
    for (const line of lines) {
      if (line.toUpperCase().startsWith('PRIMARY KEY') || 
          line.toUpperCase().startsWith('FOREIGN KEY') ||
          line.toUpperCase().startsWith('UNIQUE') ||
          line.toUpperCase().startsWith('INDEX')) {
        continue;
      }
      
      const columnMatch = line.match(/^(\w+)\s+(\w+(?:\([^)]+\))?)/);
      if (columnMatch) {
        const constraints: string[] = [];
        if (line.includes('NOT NULL')) constraints.push('NOT NULL');
        if (line.includes('PRIMARY KEY')) constraints.push('PRIMARY KEY');
        if (line.includes('UNIQUE')) constraints.push('UNIQUE');
        if (line.includes('DEFAULT')) constraints.push('DEFAULT');
        
        columns.push({
          name: columnMatch[1],
          type: columnMatch[2],
          constraints: constraints.length > 0 ? constraints : undefined
        });
      }
    }
    
    return columns;
  }
}

export class OpenAPIParser {
  static getToolDefinition(): MCPTool {
    return {
      name: 'parser.openapi',
      description: 'Parse OpenAPI specification',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string' }
        },
        required: ['content']
      }
    };
  }

  parse(content: string): { paths: OpenAPIPath[]; schemas: string[] } {
    try {
      const spec = JSON.parse(content);
      
      const paths: OpenAPIPath[] = [];
      const schemas: string[] = [];
      
      if (spec.paths) {
        for (const [path, pathItem] of Object.entries(spec.paths as any)) {
          for (const [method, operation] of Object.entries(pathItem as any)) {
            if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
              paths.push({
                path,
                method: method.toUpperCase(),
                operationId: (operation as any).operationId,
                parameters: (operation as any).parameters,
                requestBody: (operation as any).requestBody,
                responses: (operation as any).responses
              });
            }
          }
        }
      }
      
      if (spec.components?.schemas) {
        schemas.push(...Object.keys(spec.components.schemas));
      }
      
      logger.info(`Parsed ${paths.length} API paths and ${schemas.length} schemas`);
      return { paths, schemas };
    } catch (error) {
      logger.error(`Failed to parse OpenAPI spec: ${error}`);
      return { paths: [], schemas: [] };
    }
  }
}

export class TerraformParser {
  static getToolDefinition(): MCPTool {
    return {
      name: 'parser.terraform',
      description: 'Parse Terraform configuration',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string' }
        },
        required: ['content']
      }
    };
  }

  parse(content: string): TerraformResource[] {
    const resources: TerraformResource[] = [];
    
    const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*{/g;
    let match;
    
    while ((match = resourceRegex.exec(content)) !== null) {
      const type = match[1];
      const name = match[2];
      
      const provider = type.split('_')[0];
      
      resources.push({
        type,
        name,
        provider,
        properties: {}
      });
    }
    
    const moduleRegex = /module\s+"([^"]+)"\s*{/g;
    while ((match = moduleRegex.exec(content)) !== null) {
      resources.push({
        type: 'module',
        name: match[1]
      });
    }
    
    logger.info(`Parsed ${resources.length} Terraform resources`);
    return resources;
  }
}