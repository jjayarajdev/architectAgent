import fs from 'fs';
import path from 'path';
import { RepositoryAnalyzer } from '../analyzers/repository-analyzer.js';
import { LLMAnalyzer } from './llm-analyzer.js';

export class EAGenerator {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.outputDir = options.outputDir || './output';
    this.llmAnalyzer = null;
    
    // Initialize LLM if API key provided
    if (options.openaiApiKey) {
      this.llmAnalyzer = new LLMAnalyzer(options.openaiApiKey, {
        model: options.model,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
        verbose: this.verbose
      });
    }
  }

  log(message, data = null) {
    if (this.verbose) {
      console.log(`[EAGenerator] ${message}`);
      if (data) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  async generate(repoPath, changeRequest, options = {}) {
    try {
      this.log(`Starting EA generation for ${repoPath}`);
      this.log(`Change request: ${changeRequest}`);

      // Step 1: Analyze repository
      const analyzer = new RepositoryAnalyzer(repoPath, { verbose: this.verbose });
      const analysis = await analyzer.analyze();
      
      const projectName = path.basename(repoPath.replace('.git', ''));
      
      // Step 2: Generate assessment using LLM
      if (!this.llmAnalyzer) {
        throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
      }

      const assessment = await this.llmAnalyzer.generateChangeRequest(
        analysis,
        changeRequest,
        projectName
      );

      // Step 3: Generate ER diagram if tables exist
      let erDiagram = null;
      if (analysis.database.tables.length > 0) {
        this.log('Generating ER diagram...');
        erDiagram = await this.llmAnalyzer.generateERDiagram(
          changeRequest,
          analysis.database.tables
        );
      }

      // Step 4: Generate additional artifacts if requested
      const artifacts = {};
      
      if (options.generateImplementationPlan) {
        this.log('Generating implementation plan...');
        artifacts.implementationPlan = await this.llmAnalyzer.generateImplementationPlan(
          analysis,
          changeRequest
        );
      }

      if (options.generateTestStrategy) {
        this.log('Generating test strategy...');
        artifacts.testStrategy = await this.llmAnalyzer.generateTestStrategy(
          analysis,
          changeRequest
        );
      }

      // Step 5: Compose final document
      const finalDocument = this.composeDocument({
        projectName,
        changeRequest,
        analysis,
        assessment,
        erDiagram,
        artifacts
      });

      // Step 6: Save output
      const outputPath = await this.saveOutput(projectName, finalDocument);
      
      this.log(`Assessment generated successfully: ${outputPath}`);
      
      return {
        success: true,
        outputPath,
        analysis,
        document: finalDocument
      };

    } catch (error) {
      console.error('Error generating EA assessment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  composeDocument({ projectName, changeRequest, analysis, assessment, erDiagram, artifacts }) {
    let document = `# Enterprise Architecture Assessment: ${projectName}\n\n`;
    document += `**Generated:** ${new Date().toISOString()}\n`;
    document += `**Change Request:** ${changeRequest}\n\n`;
    
    // Add table of contents
    document += `## Table of Contents\n\n`;
    document += `1. [Repository Analysis](#repository-analysis)\n`;
    document += `2. [Change Request Assessment](#change-request-assessment)\n`;
    if (erDiagram) {
      document += `3. [Database Schema & ER Diagram](#database-schema--er-diagram)\n`;
    }
    if (artifacts.implementationPlan) {
      document += `4. [Implementation Plan](#implementation-plan)\n`;
    }
    if (artifacts.testStrategy) {
      document += `5. [Test Strategy](#test-strategy)\n`;
    }
    document += `\n---\n\n`;
    
    // Add repository analysis summary
    document += `## Repository Analysis\n\n`;
    document += `### Structure\n`;
    document += `- **Type:** ${analysis.structure.type}\n`;
    document += `- **Framework:** ${analysis.structure.framework || 'Custom'}\n`;
    document += `- **Languages:** ${analysis.structure.languages.join(', ')}\n\n`;
    
    document += `### Database\n`;
    document += `- **Type:** ${analysis.database.type || 'Not detected'}\n`;
    document += `- **Tables:** ${analysis.database.tables.length} tables\n`;
    if (analysis.database.tables.length > 0) {
      document += `- **Existing Tables:** ${analysis.database.tables.slice(0, 10).join(', ')}`;
      if (analysis.database.tables.length > 10) {
        document += ` (and ${analysis.database.tables.length - 10} more)`;
      }
      document += `\n`;
    }
    document += `\n`;
    
    document += `### API\n`;
    document += `- **Type:** ${analysis.api.type}\n`;
    document += `- **Endpoints:** ${analysis.api.routes.length} routes\n`;
    document += `- **Controllers:** ${analysis.api.controllers.length}\n`;
    document += `- **Services:** ${analysis.api.services.length}\n\n`;
    
    document += `### Frontend\n`;
    document += `- **Framework:** ${analysis.frontend.framework || 'Not detected'}\n`;
    document += `- **Components:** ${analysis.frontend.components.length}\n`;
    document += `- **Pages:** ${analysis.frontend.pages.length}\n`;
    document += `- **State Management:** ${analysis.frontend.state || 'None'}\n`;
    document += `- **Styling:** ${analysis.frontend.styling || 'Default'}\n\n`;
    
    document += `### Architecture Patterns\n`;
    document += `- **Architecture:** ${analysis.patterns.architecture}\n`;
    document += `- **Testing:** ${analysis.patterns.testing || 'Not detected'}\n`;
    document += `- **CI/CD:** ${analysis.patterns.ci || 'Not configured'}\n`;
    document += `- **Containerization:** ${analysis.patterns.containerization ? 'Yes' : 'No'}\n`;
    document += `- **Authentication:** ${analysis.patterns.authentication || 'Not detected'}\n\n`;
    
    document += `---\n\n`;
    
    // Add the main assessment
    document += `## Change Request Assessment\n\n`;
    document += assessment;
    document += `\n\n`;
    
    // Add ER diagram if generated
    if (erDiagram) {
      document += `---\n\n`;
      document += `## Database Schema & ER Diagram\n\n`;
      document += erDiagram;
      document += `\n\n`;
    }
    
    // Add implementation plan if generated
    if (artifacts.implementationPlan) {
      document += `---\n\n`;
      document += `## Implementation Plan\n\n`;
      document += artifacts.implementationPlan;
      document += `\n\n`;
    }
    
    // Add test strategy if generated
    if (artifacts.testStrategy) {
      document += `---\n\n`;
      document += `## Test Strategy\n\n`;
      document += artifacts.testStrategy;
      document += `\n\n`;
    }
    
    return document;
  }

  async saveOutput(projectName, document) {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Create project-specific directory
    const projectDir = path.join(this.outputDir, projectName);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `assessment-${timestamp}.md`;
    const filepath = path.join(projectDir, filename);
    
    // Save the document
    fs.writeFileSync(filepath, document);
    
    // Also save as latest.md for easy access
    const latestPath = path.join(projectDir, 'latest.md');
    fs.writeFileSync(latestPath, document);
    
    return filepath;
  }
}