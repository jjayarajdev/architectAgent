import { v4 as uuidv4 } from 'uuid';
import { 
  MCPServer, 
  MCPServerCapabilities, 
  MCPRequest, 
  MCPResponse,
  EAInput,
  AsIsArchitecture,
  ImpactedComponent,
  ImpactAnalysis,
  createLogger
} from '@ea-mcp/common';
import { FileSystemTool, GitHubTool } from '@ea-mcp/tools';

interface OrchestratorState {
  runId: string;
  input: EAInput;
  asIs?: AsIsArchitecture;
  impacted?: ImpactedComponent[];
  impact?: ImpactAnalysis;
  artifacts?: string[];
}

export class OrchestratorServer extends MCPServer {
  name = 'ea-orchestrator';
  version = '1.0.0';
  
  private state: Map<string, OrchestratorState> = new Map();
  private logger = createLogger('orchestrator');
  private fsTool: FileSystemTool;
  private githubTool: GitHubTool;
  
  constructor() {
    super();
    this.fsTool = new FileSystemTool();
    this.githubTool = new GitHubTool(process.env.GITHUB_TOKEN);
  }
  
  getCapabilities(): MCPServerCapabilities {
    return {
      tools: [
        {
          name: 'orchestrate.analyze',
          description: 'Run complete EA analysis',
          inputSchema: {
            type: 'object',
            properties: {
              input: { type: 'object' }
            },
            required: ['input']
          }
        },
        {
          name: 'orchestrate.status',
          description: 'Get analysis status',
          inputSchema: {
            type: 'object',
            properties: {
              runId: { type: 'string' }
            },
            required: ['runId']
          }
        },
        ...GitHubTool.getToolDefinitions(),
        ...FileSystemTool.getToolDefinitions()
      ]
    };
  }
  
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const { method, params, id } = request;
    
    try {
      switch (method) {
        case 'orchestrate.analyze':
          return this.createResponse(id, await this.analyze(params.input));
          
        case 'orchestrate.status':
          return this.createResponse(id, this.getStatus(params.runId));
          
        case 'github.read':
          const content = await this.githubTool.readFile(
            params.owner, 
            params.repo, 
            params.path, 
            params.ref
          );
          return this.createResponse(id, { content });
          
        case 'github.pr.create':
          const pr = await this.githubTool.createPullRequest(params);
          return this.createResponse(id, pr);
          
        case 'fs.read':
          return this.createResponse(id, { 
            content: this.fsTool.readFile(params.path) 
          });
          
        case 'fs.write':
          this.fsTool.writeFile(params.path, params.content);
          return this.createResponse(id, { success: true });
          
        case 'health':
          return this.createResponse(id, await this.health());
          
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      this.logger.error(`Request failed: ${error}`);
      return this.createResponse(id, null, error);
    }
  }
  
  private async analyze(input: EAInput): Promise<{ runId: string; status: string }> {
    const runId = uuidv4();
    this.logger.info(`Starting analysis run: ${runId}`);
    
    const state: OrchestratorState = {
      runId,
      input
    };
    
    this.state.set(runId, state);
    
    this.executeAnalysis(runId).catch(error => {
      this.logger.error(`Analysis failed for ${runId}: ${error}`);
    });
    
    return { runId, status: 'started' };
  }
  
  private async executeAnalysis(runId: string): Promise<void> {
    const state = this.state.get(runId);
    if (!state) return;
    
    this.logger.info(`Executing analysis for ${runId}`);
    
    try {
      state.asIs = await this.callAgent('docs-intel', {
        documentation: state.input.documentation,
        repo: state.input.repo
      });
      this.logger.info(`Got as-is architecture for ${runId}`);
      
      state.impacted = await this.callAgent('repo-intel', {
        repo: state.input.repo,
        requirement: state.input.requirement,
        scope: state.input.analysis_scope
      });
      this.logger.info(`Got impacted components for ${runId}`);
      
      state.impact = await this.callAgent('impact', {
        requirement: state.input.requirement,
        impacted: state.impacted,
        context: state.input.context
      });
      this.logger.info(`Got impact analysis for ${runId}`);
      
      state.artifacts = await this.callAgent('arch-writer', {
        requirement: state.input.requirement,
        asIs: state.asIs,
        impacted: state.impacted,
        impact: state.impact,
        outputs: state.input.outputs
      });
      this.logger.info(`Generated artifacts for ${runId}`);
      
      await this.writeReport(state);
      
      if (state.input.outputs.repo_write_back?.pull_request) {
        await this.createPullRequest(state);
      }
      
      this.logger.info(`Analysis complete for ${runId}`);
    } catch (error) {
      this.logger.error(`Analysis failed: ${error}`);
      throw error;
    }
  }
  
  private async callAgent(agent: string, params: any): Promise<any> {
    this.logger.info(`Calling agent: ${agent}`);
    
    const mockResponses: Record<string, any> = {
      'docs-intel': {
        c4_l2_summary: 'Modular monolith with API Gateway, Core Services, and PostgreSQL',
        c4_l3_components: [
          { name: 'API Gateway', type: 'Service', technology: 'Express.js' },
          { name: 'Auth Service', type: 'Service', technology: 'Node.js' },
          { name: 'Billing Service', type: 'Service', technology: 'Node.js' },
          { name: 'PostgreSQL', type: 'Database', technology: 'PostgreSQL 14' }
        ],
        data_flows: [
          { from: 'API Gateway', to: 'Auth Service', protocol: 'HTTP' },
          { from: 'Auth Service', to: 'PostgreSQL', protocol: 'SQL' }
        ]
      },
      'repo-intel': [
        { 
          component: 'Auth Service', 
          type: 'service', 
          file_paths: ['src/services/auth.ts'], 
          change: 'modify',
          confidence: 'high'
        },
        { 
          component: 'Database Schema', 
          type: 'database', 
          file_paths: ['db/schema.sql'], 
          change: 'modify',
          confidence: 'high'
        }
      ],
      'impact': {
        dependencies: ['Auth Service', 'Database', 'API Gateway'],
        risks: [
          {
            id: 'SEC-001',
            category: 'Security',
            description: 'Tenant data isolation',
            likelihood: 'medium',
            impact: 'high',
            mitigations: ['Row-level security', 'Tenant validation']
          }
        ],
        effort_bucket: 'L',
        test_areas: ['Auth flows', 'Data isolation', 'Performance'],
        rollout_strategy: 'Staged by tenant tier',
        rollback_strategy: 'Feature flag disable'
      },
      'arch-writer': [
        'docs/ea/report.md',
        'docs/ea/c4-l2-system.png',
        'docs/adr/ADR-001-multi-tenancy.md'
      ]
    };
    
    return mockResponses[agent] || {};
  }
  
  private async writeReport(state: OrchestratorState): Promise<void> {
    const report = this.generateReport(state);
    this.fsTool.writeFile('docs/ea/report.md', report);
    this.logger.info(`Wrote report for ${state.runId}`);
  }
  
  private generateReport(state: OrchestratorState): string {
    return `# Enterprise Architecture Analysis Report

## Run ID: ${state.runId}

## Requirement Summary
${state.input.requirement.summary}

Type: ${state.input.requirement.type}
Deadline: ${state.input.requirement.deadline || 'Not specified'}

### Acceptance Criteria
${state.input.requirement.acceptance_criteria?.map(ac => `- ${ac}`).join('\n') || 'None specified'}

## Impacted Components
${state.impacted?.map(comp => 
  `- **${comp.component}** (${comp.type}): ${comp.change} - Confidence: ${comp.confidence}`
).join('\n') || 'No components identified'}

## Impact Analysis

### Dependencies
${state.impact?.dependencies?.join(', ') || 'None identified'}

### Risks
${state.impact?.risks?.map(risk => 
  `- **${risk.id}** (${risk.category}): ${risk.description}
  - Likelihood: ${risk.likelihood}, Impact: ${risk.impact}
  - Mitigations: ${risk.mitigations.join(', ')}`
).join('\n\n') || 'No risks identified'}

### Effort Estimate
Bucket: **${state.impact?.effort_bucket || 'Unknown'}**

### Test Areas
${state.impact?.test_areas?.join(', ') || 'None identified'}

## Architecture Changes
See attached diagrams and ADRs.

## Artifacts Generated
${state.artifacts?.map(path => `- ${path}`).join('\n') || 'None'}

---
Generated on ${new Date().toISOString()}
`;
  }
  
  private async createPullRequest(state: OrchestratorState): Promise<void> {
    const repoMatch = state.input.repo.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!repoMatch) {
      this.logger.warn('Could not parse repository URL for PR creation');
      return;
    }
    
    const [, owner, repo] = repoMatch;
    const slug = state.input.requirement.summary
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50);
    
    const branch = state.input.outputs.repo_write_back?.pr_branch?.replace('{{SLUG}}', slug) 
      || `feat/ea-analysis-${slug}`;
    
    const pr = await this.githubTool.createPullRequest({
      owner,
      repo,
      title: `EA Analysis: ${state.input.requirement.summary}`,
      body: `## Enterprise Architecture Analysis

This PR contains the analysis results for: ${state.input.requirement.summary}

### Deliverables
- Impact Analysis Report
- Updated Architecture Diagrams
- Architecture Decision Records

Run ID: ${state.runId}
Generated: ${new Date().toISOString()}`,
      head: branch,
      base: state.input.repo.branch,
      files: state.artifacts?.map(path => ({
        path,
        content: this.fsTool.readFile(path)
      }))
    });
    
    this.logger.info(`Created PR #${pr.number}: ${pr.url}`);
  }
  
  private getStatus(runId: string): any {
    const state = this.state.get(runId);
    if (!state) {
      return { status: 'not_found' };
    }
    
    const phases = ['asIs', 'impacted', 'impact', 'artifacts'];
    const completed = phases.filter(phase => state[phase as keyof OrchestratorState]);
    
    return {
      status: completed.length === phases.length ? 'complete' : 'in_progress',
      progress: `${completed.length}/${phases.length}`,
      completed_phases: completed,
      artifacts: state.artifacts
    };
  }
}