import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { MCPTool } from '@ea-mcp/common';
import { logger } from '@ea-mcp/common';

export class FileSystemTool {
  constructor(private rootPath: string = process.cwd()) {}

  static getToolDefinitions(): MCPTool[] {
    return [
      {
        name: 'fs.read',
        description: 'Read a file from the filesystem',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string' }
          },
          required: ['path']
        }
      },
      {
        name: 'fs.write',
        description: 'Write a file to the filesystem',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            content: { type: 'string' }
          },
          required: ['path', 'content']
        }
      }
    ];
  }

  private resolvePath(filePath: string): string {
    if (filePath.startsWith('/')) {
      return filePath;
    }
    return resolve(this.rootPath, filePath);
  }

  private validatePath(filePath: string): void {
    const resolved = this.resolvePath(filePath);
    const normalizedRoot = resolve(this.rootPath);
    
    if (!resolved.startsWith(normalizedRoot)) {
      throw new Error(`Path ${filePath} is outside of root directory`);
    }
  }

  readFile(path: string): string {
    this.validatePath(path);
    const fullPath = this.resolvePath(path);
    
    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${path}`);
    }
    
    try {
      return readFileSync(fullPath, 'utf-8');
    } catch (error) {
      logger.error(`Failed to read file ${path}: ${error}`);
      throw error;
    }
  }

  writeFile(path: string, content: string): void {
    this.validatePath(path);
    const fullPath = this.resolvePath(path);
    const dir = dirname(fullPath);
    
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    try {
      writeFileSync(fullPath, content, 'utf-8');
      logger.info(`Wrote file: ${path}`);
    } catch (error) {
      logger.error(`Failed to write file ${path}: ${error}`);
      throw error;
    }
  }

  exists(path: string): boolean {
    this.validatePath(path);
    const fullPath = this.resolvePath(path);
    return existsSync(fullPath);
  }
}