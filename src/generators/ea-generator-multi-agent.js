/**
 * EA Generator with Multi-Agent Support
 * 
 * Enhanced version that uses the multi-agent orchestrator for
 * comprehensive enterprise architecture assessments.
 */

import { MultiAgentOrchestrator } from '../orchestrator/multi-agent-orchestrator.js';
import { EAGenerator as BaseEAGenerator } from './ea-generator.js';

export class EAGeneratorMultiAgent extends BaseEAGenerator {
  constructor(options = {}) {
    super(options);
    
    // Initialize multi-agent orchestrator
    this.orchestrator = new MultiAgentOrchestrator({
      verbose: this.verbose,
      outputDir: this.outputDir,
      openaiApiKey: options.openaiApiKey,
      model: options.model,
      maxTokens: options.maxTokens,
      temperature: options.temperature
    });
    
    this.useMultiAgent = options.useMultiAgent !== false; // Default to true
  }

  /**
   * Generate assessment using multi-agent system
   */
  async generate(repoPath, changeRequest, options = {}) {
    try {
      // Use multi-agent system if enabled
      if (this.useMultiAgent) {
        this.log('Using Multi-Agent System for assessment generation');
        
        const result = await this.orchestrator.execute(
          repoPath,
          changeRequest,
          {
            ...options,
            useLLMEnhancement: !!this.llmAnalyzer
          }
        );
        
        if (result.success) {
          return {
            success: true,
            outputPath: result.outputPath,
            analysis: result.analysis,
            summary: result.summary,
            metrics: result.metrics,
            multiAgent: true
          };
        } else {
          // Fallback to single agent on failure
          this.log('Multi-agent execution failed, falling back to single agent', 'warning');
          return await super.generate(repoPath, changeRequest, options);
        }
      } else {
        // Use original single-agent approach
        this.log('Using single-agent system (multi-agent disabled)');
        return await super.generate(repoPath, changeRequest, options);
      }
      
    } catch (error) {
      this.log(`Generation failed: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message,
        multiAgent: this.useMultiAgent
      };
    }
  }

  /**
   * Get orchestrator status
   */
  getOrchestratorStatus() {
    if (this.orchestrator) {
      return this.orchestrator.getStatus();
    }
    return null;
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.orchestrator) {
      await this.orchestrator.cleanup();
    }
  }

  /**
   * Log messages
   */
  log(message, level = 'info') {
    if (this.verbose || level === 'error' || level === 'warning') {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [EAGenerator-MA]`;
      
      switch (level) {
        case 'error':
          console.error(`${prefix} ❌ ${message}`);
          break;
        case 'warning':
          console.warn(`${prefix} ⚠️ ${message}`);
          break;
        default:
          console.log(`${prefix} ℹ️ ${message}`);
      }
    }
  }
}