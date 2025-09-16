#!/usr/bin/env node

/**
 * EA Generator - Enterprise Architecture Assessment Generator
 * 
 * This tool analyzes GitHub repositories and generates comprehensive
 * change request assessments with implementation details, ER diagrams,
 * and technical recommendations.
 */

import { EAGenerator } from './src/generators/ea-generator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    repo: null,
    changeRequest: null,
    verbose: false,
    optimized: false,
    help: false,
    generateImplementationPlan: false,
    generateTestStrategy: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-h':
      case '--help':
        options.help = true;
        break;
      case '-r':
      case '--repo':
        options.repo = args[++i];
        break;
      case '-c':
      case '--change':
        options.changeRequest = args[++i];
        break;
      case '-v':
      case '--verbose':
        options.verbose = true;
        break;
      case '-o':
      case '--optimized':
        options.optimized = true;
        break;
      case '--with-plan':
        options.generateImplementationPlan = true;
        break;
      case '--with-tests':
        options.generateTestStrategy = true;
        break;
    }
  }

  return options;
}

// Show help message
function showHelp() {
  console.log(`
EA Generator - Enterprise Architecture Assessment Generator

Usage: node index.js [options]

Options:
  -h, --help              Show this help message
  -r, --repo <url/path>   Repository URL or local path
  -c, --change <text>     Change request description
  -v, --verbose           Enable verbose logging
  -o, --optimized         Use optimized analyzer (faster but samples files)
  --with-plan             Generate implementation plan
  --with-tests            Generate test strategy

Examples:
  node index.js -r https://github.com/user/repo.git -c "Add multi-tenancy support"
  node index.js -r ./local-repo -c "Migrate to microservices" -v --with-plan

Environment Variables:
  OPENAI_API_KEY          OpenAI API key (required)
  OPENAI_MODEL            Model to use (default: gpt-4o)
  OPENAI_MAX_TOKENS       Max tokens for response (default: 16000)
  OUTPUT_DIR              Output directory (default: ./output)
  `);
}

// Main function
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Check for required arguments
  if (!options.repo || !options.changeRequest) {
    console.error('Error: Repository and change request are required.');
    console.log('Use -h or --help for usage information.');
    process.exit(1);
  }

  // Load environment variables
  loadEnv();

  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not set.');
    console.log('Please set it in .env file or as environment variable.');
    process.exit(1);
  }

  try {
    console.log('🚀 Starting EA Assessment Generation...');
    console.log(`📂 Repository: ${options.repo}`);
    console.log(`📝 Change Request: ${options.changeRequest}`);
    console.log('');

    // Create generator instance
    const generator = new EAGenerator({
      verbose: options.verbose,
      optimized: options.optimized,
      openaiApiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL,
      maxTokens: process.env.OPENAI_MAX_TOKENS ? parseInt(process.env.OPENAI_MAX_TOKENS) : undefined,
      outputDir: process.env.OUTPUT_DIR
    });

    // Generate assessment
    const result = await generator.generate(
      options.repo,
      options.changeRequest,
      {
        generateImplementationPlan: options.generateImplementationPlan,
        generateTestStrategy: options.generateTestStrategy
      }
    );

    if (result.success) {
      console.log('');
      console.log('✅ Assessment generated successfully!');
      console.log(`📄 Output saved to: ${result.outputPath}`);
      console.log('');
      console.log('Repository Analysis Summary:');
      console.log(`  - Type: ${result.analysis.structure.type}`);
      console.log(`  - Framework: ${result.analysis.structure.framework || 'Custom'}`);
      console.log(`  - Database: ${result.analysis.database.type || 'Not detected'}`);
      console.log(`  - Tables: ${result.analysis.database.tables.length}`);
      console.log(`  - API Routes: ${result.analysis.api.routes.length}`);
      console.log(`  - Frontend Components: ${result.analysis.frontend.components.length}`);
    } else {
      console.error('❌ Generation failed:', result.error);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});