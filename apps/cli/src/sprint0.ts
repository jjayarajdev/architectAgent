#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { createLogger } from '@ea-mcp/common';
import { Sprint0ReviewServer, Sprint0ReportGenerator } from '@ea-mcp/agent-sprint0';

const logger = createLogger('sprint0-cli');

export const sprint0Command = new Command('sprint0')
  .description('Run Sprint 0 EA Review for a change request')
  .option('-i, --input <file>', 'Sprint 0 input JSON file', 'sprint0-input.json')
  .option('-o, --output <file>', 'Output report file', 'sprint0-review.md')
  .action(async (options) => {
    const spinner = ora('Starting Sprint 0 EA Review...').start();
    
    try {
      // Load input
      spinner.text = 'Loading change request...';
      const input = JSON.parse(readFileSync(options.input, 'utf-8'));
      
      // Initialize Sprint 0 agent
      spinner.text = 'Initializing Sprint 0 analyzer...';
      const sprint0Agent = new Sprint0ReviewServer();
      const reportGenerator = new Sprint0ReportGenerator();
      
      // Run analysis
      spinner.text = 'Analyzing against EA standards...';
      const response = await sprint0Agent.handleRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'sprint0.analyze',
        params: input
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Generate report
      spinner.text = 'Generating Sprint 0 report...';
      const report = reportGenerator.generateMarkdownReport(
        response.result,
        input.changeRequest
      );
      
      // Write report
      writeFileSync(options.output, report);
      
      spinner.succeed(chalk.green(`Sprint 0 Review complete! Report saved to ${options.output}`));
      
      // Display summary
      console.log(chalk.cyan('\n📋 Sprint 0 Review Summary:'));
      console.log(chalk.gray(`  - Reusable Components: ${response.result.solutionDiscovery.reusableComponents.length}`));
      console.log(chalk.gray(`  - Architectural Issues: ${response.result.architecturalAlignment.ambiguities.length + response.result.architecturalAlignment.nonCompliance.length}`));
      console.log(chalk.gray(`  - Technical Debt Items: ${response.result.technicalDebt.currentDebt.length}`));
      console.log(chalk.gray(`  - Simplification Opportunities: ${response.result.technicalDebt.simplificationOpportunities.length}`));
      console.log(chalk.gray(`  - Scaling Bottlenecks: ${response.result.scalability.bottlenecks.length}`));
      
      console.log(chalk.yellow('\n⚠️  Team actions required:'));
      console.log(chalk.gray('  1. Review identified reusable components'));
      console.log(chalk.gray('  2. Document mitigation strategies'));
      console.log(chalk.gray('  3. Validate data model and KPIs'));
      console.log(chalk.gray('  4. Confirm operational ownership'));
      console.log(chalk.gray('  5. Approve scalability roadmap'));
      
    } catch (error) {
      spinner.fail(chalk.red(`Sprint 0 Review failed: ${error}`));
      process.exit(1);
    }
  });