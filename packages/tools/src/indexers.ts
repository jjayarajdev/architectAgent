import { glob } from 'glob';
import { readFileSync } from 'fs';
import { MCPTool } from '@ea-mcp/common';
import { logger } from '@ea-mcp/common';

// Simple cosine similarity implementation
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

interface CodeSymbol {
  name: string;
  type: 'class' | 'function' | 'interface' | 'type' | 'const' | 'variable';
  file: string;
  line: number;
  references?: string[];
}

interface DocChunk {
  id: string;
  content: string;
  file: string;
  start_line: number;
  end_line: number;
  embedding?: number[];
}

export class CodeIndexer {
  private symbols: CodeSymbol[] = [];
  
  static getToolDefinition(): MCPTool {
    return {
      name: 'index.code',
      description: 'Index code files and extract symbols',
      inputSchema: {
        type: 'object',
        properties: {
          patterns: {
            type: 'array',
            items: { type: 'string' }
          },
          root: { type: 'string' }
        },
        required: ['patterns']
      }
    };
  }

  async index(patterns: string[], root: string = process.cwd()): Promise<void> {
    this.symbols = [];
    
    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: root });
      
      for (const file of files) {
        try {
          const content = readFileSync(`${root}/${file}`, 'utf-8');
          const extracted = this.extractSymbols(content, file);
          this.symbols.push(...extracted);
        } catch (error) {
          logger.warn(`Failed to index ${file}: ${error}`);
        }
      }
    }
    
    logger.info(`Indexed ${this.symbols.length} symbols from ${patterns.length} patterns`);
  }

  private extractSymbols(content: string, file: string): CodeSymbol[] {
    const symbols: CodeSymbol[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const classMatch = line.match(/(?:export\s+)?class\s+(\w+)/);
      if (classMatch) {
        symbols.push({
          name: classMatch[1],
          type: 'class',
          file,
          line: index + 1
        });
      }
      
      const functionMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
      if (functionMatch) {
        symbols.push({
          name: functionMatch[1],
          type: 'function',
          file,
          line: index + 1
        });
      }
      
      const interfaceMatch = line.match(/(?:export\s+)?interface\s+(\w+)/);
      if (interfaceMatch) {
        symbols.push({
          name: interfaceMatch[1],
          type: 'interface',
          file,
          line: index + 1
        });
      }
      
      const typeMatch = line.match(/(?:export\s+)?type\s+(\w+)/);
      if (typeMatch) {
        symbols.push({
          name: typeMatch[1],
          type: 'type',
          file,
          line: index + 1
        });
      }
      
      const constMatch = line.match(/(?:export\s+)?const\s+(\w+)/);
      if (constMatch) {
        symbols.push({
          name: constMatch[1],
          type: 'const',
          file,
          line: index + 1
        });
      }
    });
    
    return symbols;
  }

  search(query: string): CodeSymbol[] {
    const queryLower = query.toLowerCase();
    return this.symbols.filter(symbol => 
      symbol.name.toLowerCase().includes(queryLower) ||
      symbol.type === query
    );
  }

  getDependencyGraph(): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();
    
    for (const symbol of this.symbols) {
      if (!graph.has(symbol.file)) {
        graph.set(symbol.file, new Set());
      }
      
      const content = readFileSync(symbol.file, 'utf-8');
      const importMatches = content.matchAll(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g);
      
      for (const match of importMatches) {
        const importPath = match[1];
        graph.get(symbol.file)!.add(importPath);
      }
    }
    
    return graph;
  }
}

export class DocsIndexer {
  private chunks: DocChunk[] = [];
  private chunkSize: number = 500;
  private chunkOverlap: number = 50;
  
  static getToolDefinition(): MCPTool {
    return {
      name: 'index.docs',
      description: 'Index documentation files for RAG',
      inputSchema: {
        type: 'object',
        properties: {
          patterns: {
            type: 'array',
            items: { type: 'string' }
          },
          root: { type: 'string' }
        },
        required: ['patterns']
      }
    };
  }

  async index(patterns: string[], root: string = process.cwd()): Promise<void> {
    this.chunks = [];
    
    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: root });
      
      for (const file of files) {
        if (file.endsWith('.md') || file.endsWith('.adr')) {
          try {
            const content = readFileSync(`${root}/${file}`, 'utf-8');
            const chunks = this.chunkDocument(content, file);
            this.chunks.push(...chunks);
          } catch (error) {
            logger.warn(`Failed to index ${file}: ${error}`);
          }
        }
      }
    }
    
    logger.info(`Created ${this.chunks.length} document chunks`);
  }

  private chunkDocument(content: string, file: string): DocChunk[] {
    const chunks: DocChunk[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i += this.chunkSize - this.chunkOverlap) {
      const chunkLines = lines.slice(i, i + this.chunkSize);
      const chunkContent = chunkLines.join('\n');
      
      chunks.push({
        id: `${file}:${i}`,
        content: chunkContent,
        file,
        start_line: i + 1,
        end_line: Math.min(i + this.chunkSize, lines.length),
        embedding: this.createMockEmbedding(chunkContent)
      });
    }
    
    return chunks;
  }

  private createMockEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(100).fill(0);
    
    words.forEach(word => {
      const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      embedding[hash % 100] += 1;
    });
    
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / (magnitude || 1));
  }

  search(query: string, topK: number = 5): DocChunk[] {
    const queryEmbedding = this.createMockEmbedding(query);
    
    const scored = this.chunks.map(chunk => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding || [])
    }));
    
    scored.sort((a, b) => b.score - a.score);
    
    return scored.slice(0, topK).map(item => item.chunk);
  }
}