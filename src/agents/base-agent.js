/**
 * Base Agent Class
 * 
 * Abstract base class for all specialized agents in the EA MCP Suite.
 * Provides common functionality for agent communication, task execution, and result handling.
 */

export class BaseAgent {
  constructor(name, options = {}) {
    this.name = name;
    this.verbose = options.verbose || false;
    this.capabilities = [];
    this.dependencies = [];
    this.status = 'idle';
    this.currentTask = null;
    this.results = [];
    this.errors = [];
  }

  /**
   * Log messages with agent context
   */
  log(message, level = 'info') {
    if (this.verbose || level === 'error') {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${this.name}]`;
      
      switch (level) {
        case 'error':
          console.error(`${prefix} ❌ ${message}`);
          break;
        case 'success':
          console.log(`${prefix} ✅ ${message}`);
          break;
        case 'warning':
          console.warn(`${prefix} ⚠️ ${message}`);
          break;
        default:
          console.log(`${prefix} ℹ️ ${message}`);
      }
    }
  }

  /**
   * Set agent status
   */
  setStatus(status) {
    this.status = status;
    this.log(`Status changed to: ${status}`);
  }

  /**
   * Execute agent's main task
   * Must be implemented by child classes
   */
  async execute(context) {
    throw new Error(`Agent ${this.name} must implement execute() method`);
  }

  /**
   * Initialize agent resources
   */
  async initialize() {
    this.log('Initializing agent...');
    this.setStatus('ready');
    return true;
  }

  /**
   * Clean up agent resources
   */
  async cleanup() {
    this.log('Cleaning up agent resources...');
    this.setStatus('idle');
    this.currentTask = null;
  }

  /**
   * Validate input context
   */
  validateContext(context) {
    if (!context) {
      throw new Error('Context is required for agent execution');
    }
    return true;
  }

  /**
   * Handle errors
   */
  handleError(error) {
    this.errors.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    });
    this.log(error.message, 'error');
    this.setStatus('error');
  }

  /**
   * Get agent metadata
   */
  getMetadata() {
    return {
      name: this.name,
      status: this.status,
      capabilities: this.capabilities,
      dependencies: this.dependencies,
      currentTask: this.currentTask,
      resultsCount: this.results.length,
      errorsCount: this.errors.length
    };
  }

  /**
   * Communication with other agents
   */
  async communicate(targetAgent, message) {
    this.log(`Sending message to ${targetAgent}: ${JSON.stringify(message)}`);
    // This would be implemented by the orchestrator
    return {
      from: this.name,
      to: targetAgent,
      message,
      timestamp: new Date().toISOString()
    };
  }
}