/**
 * Default configuration for EA Generator
 */

export const config = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 16000,
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
    retryAttempts: parseInt(process.env.OPENAI_RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.OPENAI_RETRY_DELAY) || 1000
  },

  // Repository Analysis Configuration
  analysis: {
    useOptimized: process.env.USE_OPTIMIZED_ANALYZER === 'true',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 1024 * 1024, // 1MB
    maxFilesToAnalyze: parseInt(process.env.MAX_FILES_TO_ANALYZE) || 100,
    sampleRate: parseFloat(process.env.SAMPLE_RATE) || 0.3,
    cacheTTL: parseInt(process.env.CACHE_TTL) || 3600000 // 1 hour
  },

  // Output Configuration
  output: {
    directory: process.env.OUTPUT_DIR || './output',
    generateImplementationPlan: process.env.GENERATE_IMPLEMENTATION_PLAN === 'true',
    generateTestStrategy: process.env.GENERATE_TEST_STRATEGY === 'true',
    generateERDiagram: process.env.GENERATE_ER_DIAGRAM !== 'false' // Default true
  },

  // Logging Configuration
  logging: {
    verbose: process.env.VERBOSE === 'true',
    logLevel: process.env.LOG_LEVEL || 'info'
  }
};

/**
 * Load configuration from environment or use defaults
 */
export function loadConfig() {
  // Check for .env file
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch (error) {
    // dotenv not available, continue with environment variables
  }

  // Validate required configuration
  if (!config.openai.apiKey) {
    console.warn('Warning: OPENAI_API_KEY not set. LLM features will be disabled.');
  }

  return config;
}