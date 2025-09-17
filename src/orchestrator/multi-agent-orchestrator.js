/**
 * Multi-Agent Orchestrator
 * 
 * Coordinates the execution of multiple specialized agents to generate
 * comprehensive enterprise architecture assessments.
 */

import { RepoIntelAgent } from '../agents/repo-intel-agent.js';
import { DocsIntelAgent } from '../agents/docs-intel-agent.js';
import { ImpactAgent } from '../agents/impact-agent.js';
import { ArchWriterAgent } from '../agents/arch-writer-agent.js';
import { LLMAnalyzer } from '../generators/llm-analyzer.js';
import fs from 'fs';
import path from 'path';

export class MultiAgentOrchestrator {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.outputDir = options.outputDir || './output';
    
    // Initialize LLM if API key provided
    this.llmAnalyzer = null;
    if (options.openaiApiKey) {
      this.llmAnalyzer = new LLMAnalyzer(options.openaiApiKey, {
        model: options.model,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
        verbose: this.verbose
      });
    }
    
    // Initialize agents
    this.agents = {
      repoIntel: new RepoIntelAgent({ verbose: this.verbose }),
      docsIntel: new DocsIntelAgent({ verbose: this.verbose }),
      impact: new ImpactAgent({ verbose: this.verbose }),
      archWriter: new ArchWriterAgent({ 
        verbose: this.verbose,
        llmAnalyzer: this.llmAnalyzer
      })
    };
    
    // Execution state
    this.state = {
      status: 'idle',
      currentPhase: null,
      results: {},
      errors: [],
      startTime: null,
      endTime: null
    };
  }

  /**
   * Log messages with orchestrator context
   */
  log(message, level = 'info') {
    if (this.verbose || level === 'error') {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [Orchestrator]`;
      
      switch (level) {
        case 'error':
          console.error(`${prefix} ❌ ${message}`);
          break;
        case 'success':
          console.log(`${prefix} ✅ ${message}`);
          break;
        case 'phase':
          console.log(`${prefix} 🔄 ${message}`);
          break;
        default:
          console.log(`${prefix} ℹ️ ${message}`);
      }
    }
  }

  /**
   * Initialize all agents
   */
  async initialize() {
    this.log('Initializing Multi-Agent System...');
    
    try {
      const initPromises = Object.entries(this.agents).map(async ([name, agent]) => {
        await agent.initialize();
        this.log(`${name} agent initialized`);
      });
      
      await Promise.all(initPromises);
      
      this.state.status = 'ready';
      this.log('All agents initialized successfully', 'success');
      
      return true;
    } catch (error) {
      this.handleError('Failed to initialize agents', error);
      return false;
    }
  }

  /**
   * Execute the multi-agent workflow
   */
  async execute(repoPath, changeRequest, options = {}) {
    try {
      this.state.startTime = new Date();
      this.state.status = 'executing';
      
      this.log('='.repeat(60));
      this.log('Starting Multi-Agent EA Assessment Generation');
      this.log('='.repeat(60));
      this.log(`Repository: ${repoPath}`);
      this.log(`Change Request: ${changeRequest}`);
      this.log('');
      
      // Initialize agents
      await this.initialize();
      
      // Phase 1: Repository Intelligence
      const repoIntelResults = await this.executePhase(
        'Repository Intelligence',
        async () => {
          return await this.agents.repoIntel.execute({
            repoPath,
            options
          });
        }
      );
      
      if (!repoIntelResults.success) {
        throw new Error('Repository analysis failed');
      }
      
      // Phase 2: Documentation Intelligence
      const docsIntelResults = await this.executePhase(
        'Documentation Intelligence',
        async () => {
          return await this.agents.docsIntel.execute({
            analysis: repoIntelResults.analysis,
            changeRequest,
            options
          });
        }
      );
      
      // Phase 3: Impact Analysis
      const impactResults = await this.executePhase(
        'Impact Analysis',
        async () => {
          return await this.agents.impact.execute({
            analysis: repoIntelResults.analysis,
            changeRequest,
            options
          });
        }
      );
      
      // Phase 4: Architecture Document Writing
      const projectName = path.basename(repoPath.replace('.git', ''));
      const archWriterResults = await this.executePhase(
        'Architecture Document Writing',
        async () => {
          return await this.agents.archWriter.execute({
            projectName,
            analysis: repoIntelResults.analysis,
            changeRequest,
            repoIntelResults,
            docsIntelResults,
            impactResults,
            options
          });
        }
      );
      
      // Phase 5: LLM Enhancement (if available)
      let finalDocument = archWriterResults.document;
      if (this.llmAnalyzer && options.useLLMEnhancement !== false) {
        finalDocument = await this.executePhase(
          'LLM Enhancement',
          async () => {
            return await this.enhanceWithLLM(
              finalDocument,
              repoIntelResults.analysis,
              changeRequest
            );
          }
        );
      }
      
      // Phase 6: Save Output
      const outputPath = await this.executePhase(
        'Saving Output',
        async () => {
          return await this.saveOutput(projectName, finalDocument);
        }
      );
      
      // Complete execution
      this.state.endTime = new Date();
      this.state.status = 'completed';
      
      const executionTime = (this.state.endTime - this.state.startTime) / 1000;
      
      this.log('');
      this.log('='.repeat(60));
      this.log('Multi-Agent Assessment Generation Completed!', 'success');
      this.log(`Execution Time: ${executionTime.toFixed(2)} seconds`);
      this.log(`Output: ${outputPath}`);
      this.log('='.repeat(60));
      
      // Generate summary
      const summary = this.generateExecutionSummary({
        repoIntelResults,
        docsIntelResults,
        impactResults,
        archWriterResults,
        outputPath,
        executionTime
      });
      
      return {
        success: true,
        outputPath,
        summary,
        analysis: repoIntelResults.analysis,
        metrics: this.collectMetrics({
          repoIntelResults,
          docsIntelResults,
          impactResults,
          archWriterResults
        })
      };
      
    } catch (error) {
      this.handleError('Orchestration failed', error);
      return {
        success: false,
        error: error.message,
        state: this.state
      };
    }
  }

  /**
   * Execute a phase of the workflow
   */
  async executePhase(phaseName, executor) {
    this.state.currentPhase = phaseName;
    this.log(`Starting Phase: ${phaseName}`, 'phase');
    
    try {
      const startTime = Date.now();
      const result = await executor();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      this.state.results[phaseName] = {
        success: true,
        duration,
        result
      };
      
      this.log(`Phase Completed: ${phaseName} (${duration}s)`, 'success');
      return result;
      
    } catch (error) {
      this.state.results[phaseName] = {
        success: false,
        error: error.message
      };
      
      this.handleError(`Phase Failed: ${phaseName}`, error);
      throw error;
    }
  }

  /**
   * Enhance document with LLM
   */
  async enhanceWithLLM(document, analysis, changeRequest) {
    if (!this.llmAnalyzer) {
      return document;
    }
    
    try {
      this.log('Enhancing document with AI insights...');
      
      // Generate AI-powered sections
      const aiSections = [];
      
      // Generate executive insights
      const executiveInsights = await this.llmAnalyzer.generateExecutiveInsights(
        analysis,
        changeRequest
      );
      if (executiveInsights) {
        aiSections.push(`\n# AI-Generated Executive Insights\n\n${executiveInsights}`);
      }
      
      // Generate implementation recommendations
      const implementationRec = await this.llmAnalyzer.generateImplementationRecommendations(
        analysis,
        changeRequest
      );
      if (implementationRec) {
        aiSections.push(`\n# AI-Generated Implementation Recommendations\n\n${implementationRec}`);
      }
      
      // Generate risk analysis
      const riskAnalysis = await this.llmAnalyzer.generateRiskAnalysis(
        analysis,
        changeRequest
      );
      if (riskAnalysis) {
        aiSections.push(`\n# AI-Generated Risk Analysis\n\n${riskAnalysis}`);
      }
      
      // Append AI sections to document
      if (aiSections.length > 0) {
        document += '\n\n---\n\n# AI-Enhanced Sections\n';
        document += aiSections.join('\n');
      }
      
      return document;
      
    } catch (error) {
      this.log('LLM enhancement failed, using base document', 'warning');
      return document;
    }
  }

  /**
   * Save output to file
   */
  async saveOutput(projectName, document) {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `EA_Assessment_${projectName}_${timestamp}.md`;
    const outputPath = path.join(this.outputDir, filename);
    
    // Write document
    fs.writeFileSync(outputPath, document);
    
    // Create a symlink to latest assessment
    const latestPath = path.join(this.outputDir, `EA_Assessment_${projectName}_latest.md`);
    if (fs.existsSync(latestPath)) {
      fs.unlinkSync(latestPath);
    }
    fs.symlinkSync(filename, latestPath);
    
    return outputPath;
  }

  /**
   * Generate execution summary
   */
  generateExecutionSummary(results) {
    return {
      executionTime: results.executionTime,
      outputPath: results.outputPath,
      agents: {
        repoIntel: {
          success: results.repoIntelResults.success,
          metrics: results.repoIntelResults.metrics
        },
        docsIntel: {
          success: results.docsIntelResults.success,
          metrics: results.docsIntelResults.metrics
        },
        impact: {
          success: results.impactResults.success,
          metrics: results.impactResults.metrics
        },
        archWriter: {
          success: results.archWriterResults.success,
          metrics: results.archWriterResults.metrics
        }
      },
      phases: Object.entries(this.state.results).map(([phase, result]) => ({
        phase,
        success: result.success,
        duration: result.duration || 'N/A'
      }))
    };
  }

  /**
   * Collect metrics from all agents
   */
  collectMetrics(results) {
    return {
      repository: {
        files: results.repoIntelResults.metrics?.totalFiles || 0,
        directories: results.repoIntelResults.metrics?.totalDirectories || 0,
        tables: results.repoIntelResults.metrics?.databaseTables || 0,
        apiRoutes: results.repoIntelResults.metrics?.apiRoutes || 0,
        components: results.repoIntelResults.metrics?.frontendComponents || 0
      },
      documentation: {
        generated: results.docsIntelResults.metrics?.documentsGenerated || 0,
        sections: results.docsIntelResults.metrics?.totalSections || 0
      },
      impact: {
        riskLevel: results.impactResults.metrics?.riskLevel || 'Unknown',
        affectedComponents: results.impactResults.metrics?.affectedComponents || 0,
        estimatedEffort: results.impactResults.metrics?.estimatedEffort || 0
      },
      document: {
        sections: results.archWriterResults.metrics?.sections || 0,
        wordCount: results.archWriterResults.metrics?.wordCount || 0,
        diagrams: results.archWriterResults.metrics?.diagrams || 0
      }
    };
  }

  /**
   * Get current orchestrator status
   */
  getStatus() {
    return {
      status: this.state.status,
      currentPhase: this.state.currentPhase,
      agents: Object.entries(this.agents).map(([name, agent]) => ({
        name,
        ...agent.getMetadata()
      })),
      results: this.state.results,
      errors: this.state.errors
    };
  }

  /**
   * Handle errors
   */
  handleError(context, error) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      message: error.message,
      stack: error.stack
    };
    
    this.state.errors.push(errorInfo);
    this.log(`${context}: ${error.message}`, 'error');
    
    if (this.verbose) {
      console.error(error.stack);
    }
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    this.log('Cleaning up Multi-Agent System...');
    
    try {
      const cleanupPromises = Object.entries(this.agents).map(async ([name, agent]) => {
        await agent.cleanup();
        this.log(`${name} agent cleaned up`);
      });
      
      await Promise.all(cleanupPromises);
      
      this.state = {
        status: 'idle',
        currentPhase: null,
        results: {},
        errors: [],
        startTime: null,
        endTime: null
      };
      
      this.log('Cleanup completed', 'success');
      
    } catch (error) {
      this.handleError('Cleanup failed', error);
    }
  }
}