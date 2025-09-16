#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { EAGenerator } from './src/generators/ea-generator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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

loadEnv();

// API endpoint for generating assessments
app.post('/api/generate', async (req, res) => {
  try {
    console.log('📥 Received generate request:', req.body);
    
    const { 
      repositoryUrl, 
      changeRequest, 
      generateImplementationPlan = false,
      generateTestStrategy = false,
      generateERDiagram = true
    } = req.body;

    // Validate required fields
    if (!repositoryUrl || !changeRequest) {
      return res.status(400).json({
        success: false,
        error: 'Repository URL and change request are required'
      });
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.'
      });
    }

    console.log('🚀 Starting EA generation...');
    
    // Create generator instance
    const generator = new EAGenerator({
      verbose: true,
      openaiApiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL,
      maxTokens: process.env.OPENAI_MAX_TOKENS ? parseInt(process.env.OPENAI_MAX_TOKENS) : undefined,
      outputDir: process.env.OUTPUT_DIR
    });

    // Generate assessment
    const result = await generator.generate(
      repositoryUrl,
      changeRequest,
      {
        generateImplementationPlan,
        generateTestStrategy,
        generateERDiagram
      }
    );

    console.log('✅ Generation result:', { 
      success: result.success, 
      hasDocument: !!result.document,
      hasAnalysis: !!result.analysis 
    });

    if (result.success) {
      res.json({
        success: true,
        document: result.document,
        analysis: result.analysis,
        outputPath: result.outputPath
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Serve static files from web-ui/dist in production
if (process.env.NODE_ENV === 'production') {
  const webUIPath = path.join(__dirname, 'web-ui', 'dist');
  if (fs.existsSync(webUIPath)) {
    app.use(express.static(webUIPath));
    
    // Catch all handler: send back React's index.html file for client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(webUIPath, 'index.html'));
    });
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🌟 EA Generator API Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🔑 OpenAI API Key configured: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🎨 Start the web UI with: cd web-ui && npm run dev`);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

export default app;