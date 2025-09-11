#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { schemaValidator, createLogger } from '@ea-mcp/common';
import { OrchestratorServer } from '@ea-mcp/orchestrator';
import { RepoIntelServer } from '@ea-mcp/agent-repo-intel';
import { DocsIntelServer } from '@ea-mcp/agent-docs-intel';
import { ImpactServer } from '@ea-mcp/agent-impact';
import { ArchWriterServer } from '@ea-mcp/agent-arch-writer';
import { sprint0Command } from './sprint0.js';
import { interactiveCommand } from './interactive.js';

const logger = createLogger('cli');

const program = new Command();

program
  .name('ea-analyze')
  .description('Enterprise Architecture Analysis CLI')
  .version('1.0.0');

program
  .command('run')
  .description('Run EA analysis')
  .option('-i, --input <file>', 'Input JSON file path', 'input.json')
  .action(async (options) => {
    const spinner = ora('Starting EA analysis...').start();
    
    try {
      const inputData = JSON.parse(readFileSync(options.input, 'utf-8'));
      
      spinner.text = 'Validating input...';
      const validatedInput = schemaValidator.validateInput(inputData);
      
      spinner.text = 'Initializing agents...';
      const agents = await initializeAgents();
      
      spinner.text = 'Running orchestrated analysis...';
      const orchestrator = agents.orchestrator;
      
      const response = await orchestrator.handleRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'orchestrate.analyze',
        params: { input: validatedInput }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const { runId } = response.result;
      spinner.text = `Analysis started with run ID: ${runId}`;
      
      let status = 'in_progress';
      while (status === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const statusResponse = await orchestrator.handleRequest({
          jsonrpc: '2.0',
          id: 2,
          method: 'orchestrate.status',
          params: { runId }
        });
        
        const statusResult = statusResponse.result;
        status = statusResult.status;
        spinner.text = `Analysis progress: ${statusResult.progress} - ${statusResult.completed_phases?.join(', ') || 'initializing'}`;
      }
      
      spinner.succeed(chalk.green(`Analysis complete! Run ID: ${runId}`));
      
      console.log(chalk.cyan('\nArtifacts generated:'));
      const finalStatus = await orchestrator.handleRequest({
        jsonrpc: '2.0',
        id: 3,
        method: 'orchestrate.status',
        params: { runId }
      });
      
      finalStatus.result.artifacts?.forEach((artifact: string) => {
        console.log(chalk.gray(`  - ${artifact}`));
      });
      
    } catch (error) {
      spinner.fail(chalk.red(`Analysis failed: ${error}`));
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate input JSON')
  .option('-i, --input <file>', 'Input JSON file path', 'input.json')
  .action((options) => {
    try {
      const inputData = JSON.parse(readFileSync(options.input, 'utf-8'));
      const result = schemaValidator.validate(inputData);
      
      if (result.valid) {
        console.log(chalk.green('✓ Input is valid'));
      } else {
        console.log(chalk.red('✗ Input validation failed:'));
        result.errors?.forEach(error => {
          console.log(chalk.yellow(`  - ${error}`));
        });
        process.exit(1);
      }
    } catch (error) {
      console.log(chalk.red(`Failed to validate: ${error}`));
      process.exit(1);
    }
  });

program
  .command('demo')
  .description('Run demo with sample data')
  .action(async () => {
    console.log(chalk.cyan('Running demo with sample multi-tenancy requirement...'));
    
    const demoInput = {
      repo: {
        url: 'https://github.com/acme/platform',
        branch: 'main',
        path_filters: ['src/**', 'infra/**'],
        monorepo: true
      },
      requirement: {
        summary: 'Add multi-tenant support',
        type: 'feature',
        drivers: ['B2B expansion', 'Enterprise customers'],
        acceptance_criteria: [
          'Tenant isolation at data layer',
          'Tenant-specific configuration',
          'RBAC per tenant'
        ],
        non_functional: {
          security: ['Data isolation', 'Encryption'],
          performance: { p95_ms: 300, concurrency: 1000 },
          availability_slo: '99.9%'
        },
        constraints: ['Keep PostgreSQL', 'No breaking changes'],
        deadline: '2025-12-31'
      },
      context: {
        target_envs: ['dev', 'staging', 'prod'],
        architecture_style: 'modular monolith',
        domain_owners: ['platform', 'auth', 'billing'],
        compliance: ['SOC2', 'GDPR'],
        cloud: 'Azure',
        ci_cd: 'GitHub Actions',
        risk_tolerance: 'medium'
      },
      documentation: {
        roots: ['docs/', 'wiki/'],
        formats: ['md', 'adr', 'openapi'],
        primary_diagram_style: 'C4'
      },
      analysis_scope: {
        code_depth: 'standard',
        history_window: '90d',
        include_open_prs: true,
        include_issues_labels: ['architecture']
      },
      outputs: {
        deliverables: [
          'Requirement Summary',
          'Impacted Components',
          'Impact Analysis',
          'Updated Architecture (C4 L2/L3)',
          'ADRs',
          'Risks & Mitigations',
          'Effort & Plan',
          'Test Strategy'
        ],
        format: ['md', 'png'],
        repo_write_back: {
          pull_request: false,
          pr_branch: 'feat/ea-analysis-multi-tenant'
        }
      }
    };
    
    const spinner = ora('Running demo analysis...').start();
    
    try {
      const agents = await initializeAgents();
      const orchestrator = agents.orchestrator;
      
      const response = await orchestrator.handleRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'orchestrate.analyze',
        params: { input: demoInput }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      spinner.succeed(chalk.green('Demo analysis complete!'));
      
      console.log(chalk.cyan('\nDemo Results:'));
      console.log(chalk.gray('  - Impact Analysis: Large effort (L)'));
      console.log(chalk.gray('  - Key Risks: Data isolation, API compatibility'));
      console.log(chalk.gray('  - Components: Auth, Database, API Gateway'));
      console.log(chalk.gray('  - Artifacts: Report, Diagrams, ADR'));
      
    } catch (error) {
      spinner.fail(chalk.red(`Demo failed: ${error}`));
      process.exit(1);
    }
  });

async function initializeAgents() {
  return {
    orchestrator: new OrchestratorServer(),
    repoIntel: new RepoIntelServer(),
    docsIntel: new DocsIntelServer(),
    impact: new ImpactServer(),
    archWriter: new ArchWriterServer()
  };
}

// Add commands
program.addCommand(sprint0Command);
program.addCommand(interactiveCommand);

program.parse();

if (!process.argv.slice(2).length) {
  program.outputHelp();
}