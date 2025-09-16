import OpenAI from 'openai';
import { SYSTEM_PROMPTS, USER_PROMPT_TEMPLATES } from '../prompts/system-prompts.js';

export class LLMAnalyzer {
  constructor(apiKey, options = {}) {
    this.openai = new OpenAI({ apiKey });
    this.model = options.model || 'gpt-4o';
    this.maxTokens = options.maxTokens || 16000;
    this.temperature = options.temperature || 0.7;
    this.verbose = options.verbose || false;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  log(message, data = null) {
    if (this.verbose) {
      console.log(`[LLMAnalyzer] ${message}`);
      if (data) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  async generateChangeRequest(analysis, changeRequest, projectName) {
    const userPrompt = USER_PROMPT_TEMPLATES.changeRequestAnalysis(
      analysis, 
      changeRequest, 
      projectName
    );

    return await this.callLLMWithRetry(
      SYSTEM_PROMPTS.changeRequestGenerator,
      userPrompt,
      'change request'
    );
  }

  async generateERDiagram(changeRequest, existingTables) {
    const userPrompt = USER_PROMPT_TEMPLATES.erDiagramRequest(
      changeRequest,
      existingTables
    );

    return await this.callLLMWithRetry(
      SYSTEM_PROMPTS.erDiagramGenerator,
      userPrompt,
      'ER diagram'
    );
  }

  async callLLMWithRetry(systemPrompt, userPrompt, taskName) {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.log(`Attempt ${attempt}: Generating ${taskName}...`);
        
        const response = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature
        });

        const content = response.choices[0].message.content;
        this.log(`Successfully generated ${taskName} (${content.length} characters)`);
        return content;
        
      } catch (error) {
        this.log(`Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt === this.retryAttempts) {
          throw new Error(`Failed to generate ${taskName} after ${this.retryAttempts} attempts: ${error.message}`);
        }
        
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        this.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async analyzeCodeQuality(codeSnippet, language = 'javascript') {
    const systemPrompt = `You are a code quality analyst. Analyze the provided ${language} code for:
    - Security vulnerabilities
    - Performance issues
    - Best practice violations
    - Potential bugs
    Provide specific, actionable recommendations.`;

    const userPrompt = `Analyze this ${language} code:\n\n\`\`\`${language}\n${codeSnippet}\n\`\`\``;

    return await this.callLLMWithRetry(systemPrompt, userPrompt, 'code quality analysis');
  }

  async generateImplementationPlan(analysis, requirement) {
    const systemPrompt = `You are a technical architect creating an implementation plan. Based on the repository analysis and requirement, create a detailed plan including:
    1. Development phases with clear milestones
    2. Technical tasks breakdown
    3. Dependencies and prerequisites
    4. Risk mitigation strategies
    5. Testing approach
    6. Rollout strategy`;

    const userPrompt = `Repository: ${analysis.structure.framework || 'Custom'} ${analysis.structure.type} application
    Database: ${analysis.database.type} with ${analysis.database.tables.length} tables
    API: ${analysis.api.type} with ${analysis.api.routes.length} endpoints
    
    Requirement: ${requirement}
    
    Create a detailed implementation plan.`;

    return await this.callLLMWithRetry(systemPrompt, userPrompt, 'implementation plan');
  }

  async generateTestStrategy(analysis, changeRequest) {
    const systemPrompt = `You are a QA architect. Create a comprehensive test strategy including:
    - Unit test requirements
    - Integration test scenarios
    - E2E test cases
    - Performance test criteria
    - Security test requirements
    Format as actionable test cases with clear acceptance criteria.`;

    const userPrompt = `Application Type: ${analysis.structure.framework || analysis.structure.type}
    Testing Framework: ${analysis.patterns.testing || 'None detected'}
    Change Request: ${changeRequest}
    
    Generate a complete test strategy.`;

    return await this.callLLMWithRetry(systemPrompt, userPrompt, 'test strategy');
  }
}