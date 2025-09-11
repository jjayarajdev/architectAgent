#!/usr/bin/env node

import { Command } from 'commander';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import { createLogger } from '@ea-mcp/common';
import { Sprint0ReviewServer, Sprint0ReportGenerator } from '@ea-mcp/agent-sprint0';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);
const logger = createLogger('interactive-cli');

// Configuration
const OUTPUT_BASE_DIR = 'output';

interface ChangeRequestInput {
  title: string;
  description: string;
  type: string;
  functionalAreas: string[];
  businessObjectives: string[];
  constraints: string[];
  timeline: string;
  estimatedUsers: number;
  criticalIntegrations: string[];
}

export const interactiveCommand = new Command('analyze')
  .description('Interactive EA analysis - provide a Git repo and describe your change')
  .option('-r, --repo <url>', 'Git repository URL')
  .option('-b, --branch <branch>', 'Branch name', 'main')
  .option('-o, --output <dir>', 'Output directory base', OUTPUT_BASE_DIR)
  .action(async (options) => {
    console.log(chalk.cyan('\n🏗️  Enterprise Architecture Sprint 0 Analysis\n'));
    
    try {
      // Step 1: Get repository URL
      let repoUrl = options.repo;
      if (!repoUrl) {
        const repoResponse = await prompts({
          type: 'text',
          name: 'url',
          message: 'Enter Git repository URL:',
          validate: (value: string) => {
            if (!value) return 'Repository URL is required';
            if (!value.match(/^https?:\/\/.+\/.+$/)) return 'Invalid repository URL format';
            return true;
          }
        });
        
        if (!repoResponse.url) {
          console.log(chalk.red('Repository URL is required'));
          process.exit(1);
        }
        repoUrl = repoResponse.url;
      }
      
      console.log(chalk.gray(`Repository: ${repoUrl}`));
      
      // Step 2: Clone and analyze repository structure
      const spinner = ora('Analyzing repository structure...').start();
      const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'repo';
      const tempDir = `/tmp/ea-analysis-${Date.now()}`;
      
      // Create output directory structure: output/{repo-name}/ea-artifacts
      const repoOutputDir = path.join(options.output, repoName, 'ea-artifacts');
      
      try {
        await execAsync(`git clone --depth 1 -b ${options.branch} ${repoUrl} ${tempDir}`);
        
        // Analyze repository to understand current architecture
        const { languages, frameworks, structure } = await analyzeRepository(tempDir);
        spinner.succeed('Repository analyzed');
        
        console.log(chalk.gray(`\nDetected:`));
        console.log(chalk.gray(`  Languages: ${languages.join(', ')}`));
        console.log(chalk.gray(`  Frameworks: ${frameworks.join(', ')}`));
        console.log(chalk.gray(`  Structure: ${structure}`));
        
      } catch (error) {
        spinner.fail('Failed to analyze repository');
        console.log(chalk.yellow('Continuing without repository analysis...'));
      }
      
      // Step 3: Gather change request details
      console.log(chalk.cyan('\n📝 Describe Your Proposed Change\n'));
      
      const changeRequest = await gatherChangeRequest();
      
      // Step 4: Gather context about enterprise landscape
      console.log(chalk.cyan('\n🏢 Enterprise Context\n'));
      
      const context = await gatherEnterpriseContext();
      
      // Step 5: Generate Sprint 0 analysis
      spinner.text = 'Generating Sprint 0 EA Review...';
      spinner.start();
      
      const input = buildSprint0Input(repoUrl, options.branch, changeRequest, context);
      
      // Initialize Sprint 0 agent
      const sprint0Agent = new Sprint0ReviewServer();
      const reportGenerator = new Sprint0ReportGenerator();
      
      // Run analysis
      const response = await sprint0Agent.handleRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'sprint0.analyze',
        params: input
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      spinner.succeed('Analysis complete');
      
      // Step 6: Generate outputs
      console.log(chalk.cyan('\n📄 Generating Reports...\n'));
      
      // Create output directory structure
      if (!existsSync(repoOutputDir)) {
        mkdirSync(repoOutputDir, { recursive: true });
      }
      
      console.log(chalk.gray(`Output directory: ${repoOutputDir}`));
      
      // Generate main Sprint 0 report
      const report = reportGenerator.generateMarkdownReport(
        response.result,
        input.changeRequest
      );
      const reportPath = path.join(repoOutputDir, 'sprint0-review.md');
      writeFileSync(reportPath, report);
      console.log(chalk.green(`✓ Sprint 0 Review: ${reportPath}`));
      
      // Save input configuration
      const inputPath = path.join(repoOutputDir, 'mcp-input.json');
      writeFileSync(inputPath, JSON.stringify(input, null, 2));
      console.log(chalk.green(`✓ Input Configuration: ${inputPath}`));
      
      // Generate additional artifacts
      await generateArtifacts(response.result, input, repoOutputDir);
      
      // Step 7: Display summary and next steps
      displaySummary(response.result, changeRequest);
      
      // Clean up temp directory
      await execAsync(`rm -rf ${tempDir}`);
      
    } catch (error) {
      console.log(chalk.red(`\n❌ Analysis failed: ${error}`));
      process.exit(1);
    }
  });

async function gatherChangeRequest(): Promise<ChangeRequestInput> {
  const basicInfo = await prompts([
    {
      type: 'text',
      name: 'title',
      message: 'Change title (brief):',
      validate: (value: string) => value.length >= 10 || 'Title must be at least 10 characters'
    },
    {
      type: 'text',
      name: 'description',
      message: 'Detailed description:',
      validate: (value: string) => value.length >= 50 || 'Description must be at least 50 characters'
    },
    {
      type: 'select',
      name: 'type',
      message: 'Type of change:',
      choices: [
        { title: 'New Feature', value: 'feature' },
        { title: 'API Addition', value: 'api' },
        { title: 'Integration', value: 'integration' },
        { title: 'Refactoring', value: 'refactor' },
        { title: 'Performance', value: 'performance' },
        { title: 'Security', value: 'security' }
      ]
    },
    {
      type: 'multiselect',
      name: 'functionalAreas',
      message: 'Select functional areas impacted:',
      choices: [
        { title: 'Authentication & Authorization', value: 'auth' },
        { title: 'Data Processing', value: 'data' },
        { title: 'API/Services', value: 'api' },
        { title: 'User Interface', value: 'ui' },
        { title: 'Database', value: 'database' },
        { title: 'Infrastructure', value: 'infrastructure' },
        { title: 'Integrations', value: 'integrations' },
        { title: 'Analytics', value: 'analytics' },
        { title: 'Monitoring', value: 'monitoring' }
      ],
      min: 1
    }
  ]);
  
  const businessInfo = await prompts([
    {
      type: 'text',
      name: 'objectives',
      message: 'Business objectives (comma-separated):',
      initial: 'Improve efficiency, Reduce costs, Enable new capability'
    },
    {
      type: 'text',
      name: 'constraints',
      message: 'Key constraints (comma-separated):',
      initial: 'No downtime, Backward compatible, Budget limit'
    },
    {
      type: 'select',
      name: 'timeline',
      message: 'Expected timeline:',
      choices: [
        { title: '1-2 Sprints (2-4 weeks)', value: '2-4 weeks' },
        { title: '3-6 Sprints (6-12 weeks)', value: '6-12 weeks' },
        { title: 'Quarter (3 months)', value: '3 months' },
        { title: 'Half Year (6 months)', value: '6 months' }
      ]
    },
    {
      type: 'number',
      name: 'estimatedUsers',
      message: 'Estimated number of users/requests:',
      initial: 1000
    }
  ]);
  
  const technicalInfo = await prompts([
    {
      type: 'multiselect',
      name: 'integrations',
      message: 'Critical integrations required:',
      choices: [
        { title: 'SSO/Authentication Service', value: 'sso' },
        { title: 'Database', value: 'database' },
        { title: 'Message Queue', value: 'mq' },
        { title: 'External APIs', value: 'external-api' },
        { title: 'File Storage', value: 'storage' },
        { title: 'Cache', value: 'cache' },
        { title: 'Search Service', value: 'search' },
        { title: 'Analytics Platform', value: 'analytics' },
        { title: 'Payment Gateway', value: 'payment' },
        { title: 'Notification Service', value: 'notification' }
      ]
    }
  ]);
  
  return {
    title: basicInfo.title,
    description: basicInfo.description,
    type: basicInfo.type,
    functionalAreas: basicInfo.functionalAreas,
    businessObjectives: businessInfo.objectives.split(',').map((s: string) => s.trim()),
    constraints: businessInfo.constraints.split(',').map((s: string) => s.trim()),
    timeline: businessInfo.timeline,
    estimatedUsers: businessInfo.estimatedUsers,
    criticalIntegrations: technicalInfo.integrations
  };
}

async function gatherEnterpriseContext(): Promise<any> {
  const context = await prompts([
    {
      type: 'select',
      name: 'architectureStyle',
      message: 'Current architecture style:',
      choices: [
        { title: 'Microservices', value: 'microservices' },
        { title: 'Modular Monolith', value: 'modular-monolith' },
        { title: 'Monolith', value: 'monolith' },
        { title: 'Serverless', value: 'serverless' },
        { title: 'Event-Driven', value: 'event-driven' }
      ]
    },
    {
      type: 'select',
      name: 'cloud',
      message: 'Cloud platform:',
      choices: [
        { title: 'AWS', value: 'AWS' },
        { title: 'Azure', value: 'Azure' },
        { title: 'Google Cloud', value: 'GCP' },
        { title: 'On-Premise', value: 'on-premise' },
        { title: 'Hybrid', value: 'hybrid' }
      ]
    },
    {
      type: 'multiselect',
      name: 'compliance',
      message: 'Compliance requirements:',
      choices: [
        { title: 'None', value: 'none' },
        { title: 'GDPR', value: 'GDPR' },
        { title: 'SOC2', value: 'SOC2' },
        { title: 'HIPAA', value: 'HIPAA' },
        { title: 'PCI-DSS', value: 'PCI-DSS' },
        { title: 'ISO 27001', value: 'ISO27001' }
      ]
    },
    {
      type: 'select',
      name: 'supportModel',
      message: 'Expected support model:',
      choices: [
        { title: '24x7', value: '24x7' },
        { title: 'Business Hours', value: 'business-hours' },
        { title: 'On-Call', value: 'on-call' }
      ]
    },
    {
      type: 'confirm',
      name: 'hasExistingServices',
      message: 'Do you have existing services to leverage?',
      initial: true
    }
  ]);
  
  let existingServices = [];
  if (context.hasExistingServices) {
    const services = await prompts({
      type: 'multiselect',
      name: 'services',
      message: 'Select existing services available:',
      choices: [
        { title: 'Authentication Service', value: { name: 'Auth Service', type: 'auth', capabilities: ['OAuth2', 'JWT', 'SSO'] }},
        { title: 'API Gateway', value: { name: 'API Gateway', type: 'gateway', capabilities: ['Rate Limiting', 'Load Balancing'] }},
        { title: 'Message Queue', value: { name: 'Message Queue', type: 'messaging', capabilities: ['Async Processing', 'Event Streaming'] }},
        { title: 'Monitoring Platform', value: { name: 'Monitoring', type: 'observability', capabilities: ['Metrics', 'Logs', 'Traces'] }},
        { title: 'Database Cluster', value: { name: 'Database', type: 'storage', capabilities: ['SQL', 'Transactions', 'Replication'] }},
        { title: 'Cache Service', value: { name: 'Cache', type: 'cache', capabilities: ['In-Memory', 'Distributed'] }},
        { title: 'File Storage', value: { name: 'Storage', type: 'storage', capabilities: ['Object Storage', 'CDN'] }}
      ]
    });
    existingServices = services.services || [];
  }
  
  return {
    architectureStyle: context.architectureStyle,
    cloud: context.cloud,
    compliance: context.compliance.filter((c: string) => c !== 'none'),
    supportModel: context.supportModel,
    existingServices
  };
}

async function analyzeRepository(repoPath: string): Promise<any> {
  const result = {
    languages: [] as string[],
    frameworks: [] as string[],
    structure: 'unknown'
  };
  
  try {
    // Detect languages
    const { stdout: files } = await execAsync(`find ${repoPath} -type f -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.java" -o -name "*.go" | head -20`);
    
    if (files.includes('.py')) result.languages.push('Python');
    if (files.includes('.js') || files.includes('.ts')) result.languages.push('JavaScript/TypeScript');
    if (files.includes('.java')) result.languages.push('Java');
    if (files.includes('.go')) result.languages.push('Go');
    
    // Detect frameworks
    if (existsSync(`${repoPath}/package.json`)) {
      const pkg = require(`${repoPath}/package.json`);
      if (pkg.dependencies?.express) result.frameworks.push('Express');
      if (pkg.dependencies?.react) result.frameworks.push('React');
      if (pkg.dependencies?.next) result.frameworks.push('Next.js');
      if (pkg.dependencies?.nestjs) result.frameworks.push('NestJS');
    }
    
    if (existsSync(`${repoPath}/requirements.txt`)) {
      const { stdout: reqs } = await execAsync(`cat ${repoPath}/requirements.txt`);
      if (reqs.includes('django')) result.frameworks.push('Django');
      if (reqs.includes('flask')) result.frameworks.push('Flask');
      if (reqs.includes('fastapi')) result.frameworks.push('FastAPI');
      if (reqs.includes('transformers')) result.frameworks.push('Hugging Face Transformers');
    }
    
    // Detect structure
    if (existsSync(`${repoPath}/docker-compose.yml`)) {
      result.structure = 'containerized';
    } else if (existsSync(`${repoPath}/serverless.yml`)) {
      result.structure = 'serverless';
    } else if (existsSync(`${repoPath}/src`) && existsSync(`${repoPath}/tests`)) {
      result.structure = 'standard';
    } else {
      result.structure = 'simple';
    }
    
  } catch (error) {
    logger.warn('Could not fully analyze repository structure');
  }
  
  return result;
}

function buildSprint0Input(repoUrl: string, branch: string, changeRequest: ChangeRequestInput, context: any): any {
  return {
    repository: {
      url: repoUrl,
      branch: branch,
      codebasePath: '.'
    },
    changeRequest: {
      title: changeRequest.title,
      description: changeRequest.description,
      scope: {
        functionalAreas: changeRequest.functionalAreas,
        components: mapFunctionalAreasToComponents(changeRequest.functionalAreas),
        dataEntities: inferDataEntities(changeRequest),
        integrations: changeRequest.criticalIntegrations
      },
      businessObjectives: changeRequest.businessObjectives,
      constraints: changeRequest.constraints,
      timeline: changeRequest.timeline
    },
    context: {
      enterpriseLandscape: {
        existingServices: context.existingServices,
        sharedLibraries: [],
        dataStores: inferDataStores(context)
      },
      architecturalStandards: {
        patterns: getArchitecturalPatterns(context.architectureStyle),
        security: getSecurityStandards(context.compliance),
        dataGovernance: getDataGovernanceStandards(context.compliance),
        scalability: getScalabilityStandards(changeRequest.estimatedUsers)
      },
      operationalContext: {
        currentOwners: ['Platform Team'],
        supportModel: context.supportModel,
        slaRequirements: inferSLARequirements(changeRequest.estimatedUsers, context.supportModel)
      },
      businessMetrics: generateBusinessMetrics(changeRequest)
    }
  };
}

function mapFunctionalAreasToComponents(areas: string[]): string[] {
  const mapping: Record<string, string[]> = {
    'auth': ['Authentication Service', 'Session Manager', 'Token Service'],
    'data': ['Data Pipeline', 'ETL Service', 'Data Validator'],
    'api': ['API Gateway', 'Service Mesh', 'Load Balancer'],
    'ui': ['Frontend App', 'CDN', 'Static Assets'],
    'database': ['Database Cluster', 'Connection Pool', 'Migration Service'],
    'infrastructure': ['Container Orchestration', 'Service Discovery', 'Config Management'],
    'integrations': ['Integration Hub', 'API Adapters', 'Webhook Manager'],
    'analytics': ['Analytics Engine', 'Report Generator', 'Dashboard Service'],
    'monitoring': ['Metrics Collector', 'Log Aggregator', 'Alert Manager']
  };
  
  return areas.flatMap(area => mapping[area] || []);
}

function inferDataEntities(changeRequest: ChangeRequestInput): string[] {
  const entities = ['User', 'AuditLog'];
  
  if (changeRequest.functionalAreas.includes('auth')) {
    entities.push('Session', 'Role', 'Permission');
  }
  if (changeRequest.functionalAreas.includes('data')) {
    entities.push('DataRecord', 'DataSchema', 'ProcessingJob');
  }
  if (changeRequest.functionalAreas.includes('api')) {
    entities.push('APIKey', 'RateLimit', 'Request');
  }
  if (changeRequest.functionalAreas.includes('analytics')) {
    entities.push('Metric', 'Report', 'Dashboard');
  }
  
  return entities;
}

function inferDataStores(context: any): any[] {
  const stores = [];
  
  if (context.existingServices.some((s: any) => s.type === 'storage')) {
    stores.push({ name: 'Primary Database', type: 'Relational', purpose: 'Transactional data' });
  }
  if (context.existingServices.some((s: any) => s.type === 'cache')) {
    stores.push({ name: 'Cache Layer', type: 'In-Memory', purpose: 'Performance optimization' });
  }
  
  stores.push({ name: 'Object Storage', type: 'Blob', purpose: 'Files and logs' });
  
  return stores;
}

function getArchitecturalPatterns(style: string): string[] {
  const patterns: Record<string, string[]> = {
    'microservices': ['Service Mesh', 'API Gateway', 'Service Discovery', 'Circuit Breaker'],
    'modular-monolith': ['Module Boundaries', 'Dependency Injection', 'Domain-Driven Design'],
    'monolith': ['Layered Architecture', 'MVC Pattern', 'Repository Pattern'],
    'serverless': ['Function as a Service', 'Event-Driven', 'Stateless'],
    'event-driven': ['Event Sourcing', 'CQRS', 'Pub-Sub', 'Message Queue']
  };
  
  return patterns[style] || ['RESTful APIs', 'Stateless Services'];
}

function getSecurityStandards(compliance: string[]): string[] {
  const standards = ['TLS 1.3', 'OAuth 2.0', 'API Key Management'];
  
  if (compliance.includes('GDPR')) {
    standards.push('Data Encryption at Rest', 'PII Masking', 'Right to be Forgotten');
  }
  if (compliance.includes('SOC2')) {
    standards.push('Audit Logging', 'Access Control', 'Security Scanning');
  }
  if (compliance.includes('HIPAA')) {
    standards.push('PHI Encryption', 'Access Logs', 'Data Retention Policy');
  }
  
  return standards;
}

function getDataGovernanceStandards(compliance: string[]): string[] {
  const standards = ['Data Classification', 'Retention Policy'];
  
  if (compliance.length > 0) {
    standards.push('Audit Trail', 'Data Lineage', 'Access Control Matrix');
  }
  
  return standards;
}

function getScalabilityStandards(estimatedUsers: number): string[] {
  if (estimatedUsers > 10000) {
    return ['Auto-scaling', 'Load Balancing', 'Database Sharding', 'CDN', 'Caching Strategy'];
  } else if (estimatedUsers > 1000) {
    return ['Horizontal Scaling', 'Load Balancing', 'Connection Pooling', 'Caching'];
  } else {
    return ['Vertical Scaling', 'Basic Load Balancing', 'Database Optimization'];
  }
}

function inferSLARequirements(users: number, supportModel: string): any {
  const availability = supportModel === '24x7' ? '99.9%' : '99.5%';
  const responseTime = users > 10000 ? '< 500ms p95' : '< 2s p95';
  const throughput = `${Math.ceil(users / 10)} requests/second`;
  
  return { availability, responseTime, throughput };
}

function generateBusinessMetrics(changeRequest: ChangeRequestInput): any[] {
  return [
    {
      name: 'Response Time',
      currentValue: 'N/A',
      targetValue: '< 2 seconds',
      measurementMethod: 'Application monitoring'
    },
    {
      name: 'User Capacity',
      currentValue: '0',
      targetValue: `${changeRequest.estimatedUsers}+`,
      measurementMethod: 'Load testing'
    },
    {
      name: 'Error Rate',
      currentValue: 'N/A',
      targetValue: '< 1%',
      measurementMethod: 'Error tracking'
    },
    {
      name: 'Availability',
      currentValue: 'N/A',
      targetValue: '99.9%',
      measurementMethod: 'Uptime monitoring'
    }
  ];
}

async function generateArtifacts(analysis: any, input: any, outputDir: string): Promise<void> {
  // Generate data flow diagram
  const dataFlowMermaid = `graph LR
    subgraph "Data Ingestion"
        A[User Request] --> B[API Gateway]
    end
    subgraph "Processing"
        B --> C[Service Layer]
        C --> D[Business Logic]
    end
    subgraph "Storage"
        D --> E[Database]
        D --> F[Cache]
    end
    subgraph "Response"
        E --> G[Response]
        F --> G
        G --> A
    end`;
  
  const dataFlowPath = path.join(outputDir, 'data-flow.mmd');
  writeFileSync(dataFlowPath, dataFlowMermaid);
  console.log(chalk.green(`✓ Data Flow Diagram: ${dataFlowPath}`));
  
  // Generate risk matrix
  const riskMatrix = generateRiskMatrix(analysis);
  const riskPath = path.join(outputDir, 'risk-matrix.md');
  writeFileSync(riskPath, riskMatrix);
  console.log(chalk.green(`✓ Risk Matrix: ${riskPath}`));
  
  // Generate implementation checklist
  const checklist = generateImplementationChecklist(analysis);
  const checklistPath = path.join(outputDir, 'implementation-checklist.md');
  writeFileSync(checklistPath, checklist);
  console.log(chalk.green(`✓ Implementation Checklist: ${checklistPath}`));
  
  // Generate README for the artifacts directory
  const readme = generateArtifactsReadme(input.changeRequest.title, outputDir);
  const readmePath = path.join(outputDir, 'README.md');
  writeFileSync(readmePath, readme);
  console.log(chalk.green(`✓ Artifacts README: ${readmePath}`));
}

function generateRiskMatrix(analysis: any): string {
  return `# Risk Matrix

## High Priority Risks
${analysis.technicalDebt?.currentDebt?.map((d: any) => 
  `- **${d.component}**: ${d.type} - ${d.impact}`
).join('\n') || 'None identified'}

## Mitigation Strategies
${analysis.technicalDebt?.mitigationPlan?.join('\n') || 'To be defined'}

## Scaling Risks
${analysis.scalability?.bottlenecks?.map((b: any) => 
  `- **${b.component}**: ${b.limitation} (Threshold: ${b.threshold})`
).join('\n') || 'None identified'}
`;
}

function generateImplementationChecklist(analysis: any): string {
  return `# Implementation Checklist

## Sprint 0 (Planning & Design)
- [ ] Review and approve architecture design
- [ ] Identify and document all integration points
- [ ] Define data model and relationships
- [ ] Create API specifications
- [ ] Set up development environment
- [ ] Define testing strategy

## Sprint 1-2 (Foundation)
${analysis.scalability?.evolutionPlan?.[0]?.changes?.map((c: string) => `- [ ] ${c}`).join('\n') || '- [ ] Core implementation'}

## Sprint 3-4 (Integration)
${analysis.scalability?.evolutionPlan?.[1]?.changes?.map((c: string) => `- [ ] ${c}`).join('\n') || '- [ ] System integration'}

## Sprint 5-6 (Optimization)
${analysis.scalability?.evolutionPlan?.[2]?.changes?.map((c: string) => `- [ ] ${c}`).join('\n') || '- [ ] Performance optimization'}

## Pre-Production
- [ ] Security review
- [ ] Performance testing
- [ ] Documentation complete
- [ ] Operational runbook
- [ ] Monitoring setup
- [ ] Rollback plan tested
`;
}

function displaySummary(analysis: any, changeRequest: ChangeRequestInput): void {
  console.log(chalk.cyan('\n📊 Analysis Summary\n'));
  
  console.log(chalk.white('Change Request:'), changeRequest.title);
  console.log(chalk.white('Type:'), changeRequest.type);
  console.log(chalk.white('Timeline:'), changeRequest.timeline);
  
  console.log(chalk.cyan('\n🔍 Key Findings:\n'));
  
  const reusableCount = analysis.solutionDiscovery?.reusableComponents?.length || 0;
  const debtCount = analysis.technicalDebt?.currentDebt?.length || 0;
  const riskCount = (analysis.architecturalAlignment?.ambiguities?.length || 0) + 
                    (analysis.architecturalAlignment?.nonCompliance?.length || 0);
  
  console.log(chalk.green(`  ✓ ${reusableCount} reusable components identified`));
  console.log(chalk.yellow(`  ⚠ ${riskCount} architectural issues to address`));
  console.log(chalk.yellow(`  ⚠ ${debtCount} technical debt items`));
  console.log(chalk.blue(`  ℹ ${analysis.scalability?.bottlenecks?.length || 0} scaling considerations`));
  
  console.log(chalk.cyan('\n📋 Next Steps:\n'));
  console.log(chalk.gray('  1. Review the Sprint 0 report with your team'));
  console.log(chalk.gray('  2. Address identified architectural issues'));
  console.log(chalk.gray('  3. Validate the proposed data model'));
  console.log(chalk.gray('  4. Confirm operational ownership'));
  console.log(chalk.gray('  5. Create JIRA tickets for Sprint 0 tasks'));
  
  console.log(chalk.green('\n✅ Analysis complete! All reports have been generated.\n'));
}

function generateArtifactsReadme(changeTitle: string, outputDir: string): string {
  const repoName = path.basename(path.dirname(outputDir));
  return `# Enterprise Architecture Artifacts - ${repoName}

## Change Request: ${changeTitle}

### 📁 Generated Artifacts

- **sprint0-review.md** - Comprehensive Sprint 0 EA Review Report
- **mcp-input.json** - Input configuration used for analysis
- **data-flow.mmd** - Data flow diagram (Mermaid format)
- **risk-matrix.md** - Risk assessment and mitigation strategies
- **implementation-checklist.md** - Sprint-by-sprint implementation guide

### 📊 Sprint 0 Review Sections

1. Solution Discovery & Reusability
2. Architectural Alignment & Ambiguity
3. Data & Integration Strategy
4. Operational Ownership
5. Technical Debt & Simplification
6. Business Value & Key Metrics
7. Future Scalability & Evolution

### 🚀 Next Steps

1. Review the Sprint 0 report with your team
2. Address identified architectural issues
3. Validate the proposed data model
4. Confirm operational ownership
5. Create implementation tickets

---

*Generated by MCP Enterprise Architecture Suite*
*Date: ${new Date().toISOString().split('T')[0]}*
`;
}