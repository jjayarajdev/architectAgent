const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Generate assessment endpoint
app.post('/api/generate-assessment', async (req, res) => {
  const { repositoryUrl, changeRequest, options = {} } = req.body;

  if (!repositoryUrl || !changeRequest) {
    return res.status(400).json({ 
      error: 'Repository URL and change request are required' 
    });
  }

  // Build command based on options
  const scriptPath = path.join(__dirname, '..', 'index.js');
  
  // Build args array for proper argument parsing
  const args = ['-r', repositoryUrl, '-c', changeRequest];
  
  // Add options flags
  if (options.erDiagram) args.push('--er-diagram');
  if (options.implementationPlan) args.push('--with-plan');
  if (options.testStrategy) args.push('--with-tests');
  
  const command = `node "${scriptPath}" ${args.map(arg => `"${arg}"`).join(' ')}`;
  console.log('Executing command:', command);

  exec(command, { 
    maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  }, async (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing command:', error);
      console.error('stderr:', stderr);
      return res.status(500).json({ 
        error: 'Failed to generate assessment', 
        details: stderr || error.message 
      });
    }

    try {
      // Store current time to filter files created after this request
      const requestStartTime = Date.now();
      
      // Wait for the file to be created
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Read the generated markdown file
      const outputDir = path.join(__dirname, '..', 'output');
      
      // Function to find all markdown files recursively
      const findMdFiles = async (dir) => {
        const files = await fs.readdir(dir);
        const mdFiles = [];
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.isDirectory()) {
            mdFiles.push(...await findMdFiles(filePath));
          } else if (file.endsWith('.md')) {
            mdFiles.push({ 
              path: filePath, 
              mtime: stats.mtime,
              mtimeMs: stats.mtimeMs 
            });
          }
        }
        
        return mdFiles;
      };
      
      // Find all markdown files
      const allMdFiles = await findMdFiles(outputDir);
      
      // Filter for files created after this request started
      const newFiles = allMdFiles.filter(file => {
        // Give a small buffer for file system timing
        return file.mtimeMs > (requestStartTime - 1000);
      });
      
      let documentPath = null;
      let latestFile = null;
      
      if (newFiles.length > 0) {
        // Use the newest file from those created after the request
        newFiles.sort((a, b) => b.mtimeMs - a.mtimeMs);
        documentPath = newFiles[0].path;
        latestFile = path.relative(outputDir, documentPath);
        console.log('Found newly generated file:', latestFile);
      } else if (allMdFiles.length > 0) {
        // Fallback: use the newest file overall
        console.log('Warning: No new files found, using most recent file');
        allMdFiles.sort((a, b) => b.mtimeMs - a.mtimeMs);
        documentPath = allMdFiles[0].path;
        latestFile = path.relative(outputDir, documentPath);
      } else {
        throw new Error('No assessment file generated');
      }
      
      const document = await fs.readFile(documentPath, 'utf-8');

      // Parse the analysis from stdout if available
      let analysis = {};
      try {
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log('Could not parse analysis from stdout');
      }

      res.json({
        success: true,
        document,
        analysis,
        filename: latestFile
      });

    } catch (readError) {
      console.error('Error reading output file:', readError);
      res.status(500).json({ 
        error: 'Generated assessment but could not read the output file',
        details: readError.message
      });
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EA Generator API Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});