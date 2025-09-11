import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: path.resolve(__dirname, '../../../.env') });

const ConfigSchema = z.object({
  GITHUB_TOKEN: z.string().optional(),
  REPO_URL: z.string().url().optional(),
  DEFAULT_BRANCH: z.string().default('main'),
  DIAGRAM_RENDERER: z.enum(['mermaid-cli', 'puppeteer', 'mock']).default('mock'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  CACHE_DIR: z.string().default('.cache'),
  OUTPUT_DIR: z.string().default('out'),
  MAX_FILE_SIZE_MB: z.number().default(10),
  VECTOR_STORE_SIZE: z.number().default(1000),
  CHUNK_SIZE: z.number().default(500),
  CHUNK_OVERLAP: z.number().default(50)
});

export type Config = z.infer<typeof ConfigSchema>;

export const loadConfig = (): Config => {
  const rawConfig = {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    REPO_URL: process.env.REPO_URL,
    DEFAULT_BRANCH: process.env.DEFAULT_BRANCH,
    DIAGRAM_RENDERER: process.env.DIAGRAM_RENDERER,
    LOG_LEVEL: process.env.LOG_LEVEL,
    CACHE_DIR: process.env.CACHE_DIR,
    OUTPUT_DIR: process.env.OUTPUT_DIR,
    MAX_FILE_SIZE_MB: process.env.MAX_FILE_SIZE_MB ? 
      parseInt(process.env.MAX_FILE_SIZE_MB) : undefined,
    VECTOR_STORE_SIZE: process.env.VECTOR_STORE_SIZE ? 
      parseInt(process.env.VECTOR_STORE_SIZE) : undefined,
    CHUNK_SIZE: process.env.CHUNK_SIZE ? 
      parseInt(process.env.CHUNK_SIZE) : undefined,
    CHUNK_OVERLAP: process.env.CHUNK_OVERLAP ? 
      parseInt(process.env.CHUNK_OVERLAP) : undefined
  };

  const result = ConfigSchema.safeParse(rawConfig);
  
  if (!result.success) {
    throw new Error(`Config validation failed: ${result.error.message}`);
  }
  
  return result.data;
};

export const config = loadConfig();