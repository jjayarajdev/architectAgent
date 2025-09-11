import { createLogger } from '@ea-mcp/common';
import { RepositoryAnalysis } from './repository-analyzer.js';
import { GenericEAAnalyzer } from './generic-ea-analyzer.js';

const logger = createLogger('real-analyzer');

export class RealCodeAnalyzer {
  
  generateRealAnalysis(repoAnalysis: RepositoryAnalysis, changeRequest: any): any {
    logger.info('Using generic EA analyzer for dynamic analysis');
    
    // Use the completely generic analyzer - NO HARDCODING
    const genericAnalyzer = new GenericEAAnalyzer();
    const analysis = genericAnalyzer.analyzeChange(repoAnalysis, changeRequest);
    
    // Add project type detection for UI context
    const projectType = this.detectProjectType(repoAnalysis);
    const changeType = this.detectChangeType(changeRequest, repoAnalysis);
    
    logger.info(`Project type: ${projectType}`);
    logger.info(`Change type: ${changeType}`);
    
    // Return the complete generic analysis
    return {
      projectType,
      changeType,
      projectCharacteristics: this.analyzeProjectCharacteristics(repoAnalysis),
      ...analysis // Include all EA sections from generic analyzer
    };
  }
  
  private detectProjectType(repo: RepositoryAnalysis): string {
    const languages = repo.codeMetrics.languages;
    const deps = repo.dependencies;
    const files = repo.codeMetrics.files;
    
    // Mobile app detection
    if (deps['react-native'] || deps['expo']) return 'mobile-react-native';
    if (languages['.swift'] || languages['.m']) return 'mobile-ios';
    if (languages['.kt'] || languages['.java'] && (languages['AndroidManifest.xml'] || deps['android'])) return 'mobile-android';
    if (deps['flutter']) return 'mobile-flutter';
    
    // Machine Learning / Data Science
    if (deps['tensorflow'] || deps['pytorch'] || deps['scikit-learn'] || deps['pandas']) return 'ml-data-science';
    if (languages['.ipynb']) return 'jupyter-notebook';
    
    // IoT / Embedded
    if (languages['.ino'] || languages['.cpp'] && files < 50) return 'iot-embedded';
    
    // Game Development
    if (deps['unity'] || deps['unreal'] || deps['godot'] || deps['phaser']) return 'game-development';
    
    // Blockchain / Web3
    if (deps['web3'] || deps['ethers'] || languages['.sol']) return 'blockchain-web3';
    
    // Infrastructure as Code
    if (languages['.tf'] || languages['.yaml'] && deps['terraform']) return 'infrastructure-iac';
    if (languages['Dockerfile'] || languages['docker-compose.yml']) return 'containerized';
    
    // Backend Services
    if (deps['express'] || deps['fastapi'] || deps['django'] || deps['spring']) return 'backend-api';
    if (deps['graphql'] || deps['apollo-server']) return 'backend-graphql';
    if (languages['.go'] && !deps['react']) return 'backend-golang';
    
    // Frontend Applications
    if (deps['react'] || deps['next']) return 'frontend-react';
    if (deps['vue'] || deps['nuxt']) return 'frontend-vue';
    if (deps['@angular/core']) return 'frontend-angular';
    if (deps['svelte'] || deps['sveltekit']) return 'frontend-svelte';
    
    // Full-stack
    const hasFrontend = deps['react'] || deps['vue'] || deps['@angular/core'];
    const hasBackend = deps['express'] || deps['fastapi'] || deps['django'];
    if (hasFrontend && hasBackend) return 'fullstack';
    
    // Static sites
    if (deps['gatsby'] || deps['jekyll'] || deps['hugo']) return 'static-site';
    
    // Desktop apps
    if (deps['electron'] || deps['tauri']) return 'desktop-app';
    
    // CLI tools
    if (deps['commander'] || deps['yargs'] || deps['chalk']) return 'cli-tool';
    
    // Libraries/Packages
    if (files < 20 && (languages['.ts'] || languages['.js'])) return 'library';
    
    return 'general';
  }
  
  private detectChangeType(changeRequest: any, repo: RepositoryAnalysis): string {
    const title = (changeRequest.title || '').toLowerCase();
    const desc = (changeRequest.description || '').toLowerCase();
    
    // Design/UI changes
    if (title.includes('design') || desc.includes('design system') || desc.includes('ui') || desc.includes('theme')) {
      return 'design-system';
    }
    
    // Performance optimization
    if (title.includes('performance') || desc.includes('optimize') || desc.includes('speed')) {
      return 'performance';
    }
    
    // Security updates
    if (title.includes('security') || desc.includes('vulnerability') || desc.includes('authentication')) {
      return 'security';
    }
    
    // Data/Database changes
    if (title.includes('database') || desc.includes('migration') || desc.includes('schema')) {
      return 'data-migration';
    }
    
    // API changes
    if (title.includes('api') || desc.includes('endpoint') || desc.includes('integration')) {
      return 'api-integration';
    }
    
    // Infrastructure/DevOps
    if (title.includes('deploy') || desc.includes('ci/cd') || desc.includes('infrastructure')) {
      return 'infrastructure';
    }
    
    // Testing
    if (title.includes('test') || desc.includes('coverage') || desc.includes('quality')) {
      return 'testing';
    }
    
    // Analytics/Monitoring
    if (title.includes('analytics') || desc.includes('monitoring') || desc.includes('metrics')) {
      return 'analytics';
    }
    
    return 'feature';
  }
  
  private analyzeProjectCharacteristics(repo: RepositoryAnalysis): any {
    const languages = Object.keys(repo.codeMetrics.languages);
    const primaryLanguage = languages.reduce((max, lang) => 
      (repo.codeMetrics.languages[lang] > (repo.codeMetrics.languages[max] || 0)) ? lang : max
    , languages[0]);
    
    return {
      primaryLanguage,
      allLanguages: languages,
      totalFiles: repo.codeMetrics.files,
      dependencies: Object.keys(repo.dependencies).length,
      hasTests: repo.codeMetrics.testCoverage !== 'unknown' || 
                languages.some(l => l.includes('test') || l.includes('spec')),
      hasCI: languages.includes('.github') || languages.includes('.gitlab-ci.yml'),
      hasDocker: languages.includes('Dockerfile'),
      hasDatabase: repo.database.type !== 'unknown',
      apiCount: repo.apis.endpoints.length,
      architecture: repo.architecture
    };
  }
  
  private analyzeIntegrationStrategy(repo: RepositoryAnalysis, change: any, projectType: string): any {
    // Adapt integration analysis based on project type
    if (projectType.startsWith('frontend-')) {
      return this.analyzeFrontendIntegration(repo, change);
    } else if (projectType.startsWith('backend-')) {
      return this.analyzeBackendIntegration(repo, change);
    } else if (projectType.startsWith('mobile-')) {
      return this.analyzeMobileIntegration(repo, change);
    } else if (projectType === 'ml-data-science') {
      return this.analyzeMLIntegration(repo, change);
    } else if (projectType === 'blockchain-web3') {
      return this.analyzeBlockchainIntegration(repo, change);
    } else if (projectType === 'infrastructure-iac') {
      return this.analyzeInfrastructureIntegration(repo, change);
    } else {
      return this.analyzeDataIntegration(repo, change);
    }
  }
  
  private analyzeBackendIntegration(repo: RepositoryAnalysis, change: any) {
    return {
      apiArchitecture: {
        style: repo.dependencies['graphql'] ? 'GraphQL' : 'REST',
        authentication: repo.apis.authentication || 'None detected',
        endpoints: repo.apis.endpoints.length,
        middleware: this.detectMiddleware(repo.dependencies)
      },
      database: {
        type: repo.database.type,
        orm: this.detectORM(repo.dependencies),
        migrations: repo.database.tables.length > 0,
        caching: repo.dependencies['redis'] || repo.dependencies['memcached'] ? 'Yes' : 'No'
      },
      messaging: {
        queue: repo.dependencies['amqplib'] || repo.dependencies['bull'] ? 'Yes' : 'No',
        pubsub: repo.dependencies['kafka-node'] || repo.dependencies['@google-cloud/pubsub'] ? 'Yes' : 'No'
      },
      proposedChanges: this.inferBackendChanges(change, repo)
    };
  }
  
  private analyzeMobileIntegration(repo: RepositoryAnalysis, change: any) {
    return {
      platform: this.detectMobilePlatform(repo),
      architecture: {
        pattern: 'MVVM/MVC',
        stateManagement: this.detectMobileStateManagement(repo.dependencies),
        navigation: this.detectMobileNavigation(repo.dependencies)
      },
      apis: {
        networking: this.detectNetworkingLib(repo.dependencies),
        authentication: repo.dependencies['firebase'] ? 'Firebase Auth' : 'Custom',
        pushNotifications: repo.dependencies['react-native-push-notification'] ? 'Yes' : 'No'
      },
      nativeFeatures: {
        camera: this.hasNativeFeature(repo, 'camera'),
        location: this.hasNativeFeature(repo, 'location'),
        storage: this.hasNativeFeature(repo, 'storage')
      },
      proposedChanges: this.inferMobileChanges(change, repo)
    };
  }
  
  private analyzeMLIntegration(repo: RepositoryAnalysis, change: any) {
    return {
      framework: this.detectMLFramework(repo.dependencies),
      dataProcessing: {
        pipeline: repo.dependencies['pandas'] || repo.dependencies['numpy'] ? 'Yes' : 'No',
        visualization: repo.dependencies['matplotlib'] || repo.dependencies['seaborn'] ? 'Yes' : 'No',
        preprocessing: repo.dependencies['scikit-learn'] ? 'Sklearn' : 'Custom'
      },
      modelManagement: {
        training: this.detectTrainingFramework(repo.dependencies),
        serving: repo.dependencies['tensorflow-serving'] || repo.dependencies['torchserve'] ? 'Yes' : 'No',
        versioning: repo.dependencies['mlflow'] || repo.dependencies['dvc'] ? 'Yes' : 'No'
      },
      infrastructure: {
        gpu: this.detectGPUSupport(repo),
        distributed: repo.dependencies['horovod'] || repo.dependencies['ray'] ? 'Yes' : 'No'
      },
      proposedChanges: this.inferMLChanges(change, repo)
    };
  }
  
  private analyzeBlockchainIntegration(repo: RepositoryAnalysis, change: any) {
    return {
      blockchain: {
        platform: this.detectBlockchainPlatform(repo),
        smartContracts: repo.codeMetrics.languages['.sol'] ? 'Solidity' : 'None',
        web3Library: repo.dependencies['web3'] || repo.dependencies['ethers'] || 'None'
      },
      dapp: {
        frontend: this.detectDappFrontend(repo),
        wallet: repo.dependencies['metamask'] || repo.dependencies['walletconnect'] ? 'Yes' : 'No',
        ipfs: repo.dependencies['ipfs'] ? 'Yes' : 'No'
      },
      testing: {
        framework: repo.dependencies['truffle'] || repo.dependencies['hardhat'] || 'None',
        coverage: repo.dependencies['solidity-coverage'] ? 'Yes' : 'No'
      },
      proposedChanges: this.inferBlockchainChanges(change, repo)
    };
  }
  
  private analyzeInfrastructureIntegration(repo: RepositoryAnalysis, change: any) {
    return {
      iac: {
        tool: this.detectIaCTool(repo),
        cloudProvider: this.detectCloudProvider(repo),
        modules: repo.codeMetrics.files
      },
      orchestration: {
        kubernetes: repo.codeMetrics.languages['.yaml'] && repo.dependencies['kubernetes'] ? 'Yes' : 'No',
        docker: repo.codeMetrics.languages['Dockerfile'] ? 'Yes' : 'No',
        helm: repo.dependencies['helm'] ? 'Yes' : 'No'
      },
      cicd: {
        pipeline: this.detectCICDPipeline(repo),
        testing: 'Infrastructure tests',
        deployment: 'Automated'
      },
      proposedChanges: this.inferInfrastructureChanges(change, repo)
    };
  }
  
  // Helper methods for detection
  private detectMiddleware(deps: any): string[] {
    const middleware = [];
    if (deps['cors']) middleware.push('CORS');
    if (deps['helmet']) middleware.push('Security');
    if (deps['compression']) middleware.push('Compression');
    if (deps['morgan']) middleware.push('Logging');
    return middleware;
  }
  
  private detectORM(deps: any): string {
    if (deps['sequelize']) return 'Sequelize';
    if (deps['typeorm']) return 'TypeORM';
    if (deps['prisma']) return 'Prisma';
    if (deps['mongoose']) return 'Mongoose';
    return 'None';
  }
  
  private detectMobilePlatform(repo: RepositoryAnalysis): string {
    if (repo.dependencies['react-native']) return 'React Native';
    if (repo.dependencies['flutter']) return 'Flutter';
    if (repo.codeMetrics.languages['.swift']) return 'iOS Native';
    if (repo.codeMetrics.languages['.kt']) return 'Android Native';
    return 'Unknown';
  }
  
  private detectMobileStateManagement(deps: any): string {
    if (deps['redux']) return 'Redux';
    if (deps['mobx']) return 'MobX';
    if (deps['zustand']) return 'Zustand';
    if (deps['provider']) return 'Provider';
    return 'Built-in';
  }
  
  private detectMobileNavigation(deps: any): string {
    if (deps['@react-navigation/native']) return 'React Navigation';
    if (deps['react-native-navigation']) return 'Wix Navigation';
    return 'Default';
  }
  
  private detectNetworkingLib(deps: any): string {
    if (deps['axios']) return 'Axios';
    if (deps['fetch']) return 'Fetch';
    if (deps['alamofire']) return 'Alamofire';
    return 'Native';
  }
  
  private hasNativeFeature(repo: RepositoryAnalysis, feature: string): boolean {
    const deps = Object.keys(repo.dependencies);
    return deps.some(d => d.toLowerCase().includes(feature));
  }
  
  private detectMLFramework(deps: any): string {
    if (deps['tensorflow']) return 'TensorFlow';
    if (deps['pytorch'] || deps['torch']) return 'PyTorch';
    if (deps['scikit-learn']) return 'Scikit-learn';
    if (deps['keras']) return 'Keras';
    return 'None';
  }
  
  private detectTrainingFramework(deps: any): string {
    if (deps['tensorflow']) return 'TensorFlow';
    if (deps['pytorch']) return 'PyTorch';
    return 'Custom';
  }
  
  private detectGPUSupport(repo: RepositoryAnalysis): boolean {
    return !!(repo.dependencies['cuda'] || repo.dependencies['cudnn']);
  }
  
  private detectBlockchainPlatform(repo: RepositoryAnalysis): string {
    if (repo.dependencies['web3'] || repo.codeMetrics.languages['.sol']) return 'Ethereum';
    if (repo.dependencies['@solana/web3.js']) return 'Solana';
    if (repo.dependencies['near-api-js']) return 'NEAR';
    return 'Unknown';
  }
  
  private detectDappFrontend(repo: RepositoryAnalysis): string {
    if (repo.dependencies['react']) return 'React';
    if (repo.dependencies['vue']) return 'Vue';
    return 'None';
  }
  
  private detectIaCTool(repo: RepositoryAnalysis): string {
    if (repo.codeMetrics.languages['.tf']) return 'Terraform';
    if (repo.dependencies['@aws-cdk']) return 'AWS CDK';
    if (repo.dependencies['pulumi']) return 'Pulumi';
    if (repo.codeMetrics.languages['.yaml'] && repo.dependencies['ansible']) return 'Ansible';
    return 'None';
  }
  
  private detectCloudProvider(repo: RepositoryAnalysis): string {
    if (repo.dependencies['aws-sdk'] || repo.dependencies['@aws-sdk']) return 'AWS';
    if (repo.dependencies['@azure']) return 'Azure';
    if (repo.dependencies['@google-cloud']) return 'GCP';
    return 'Multi-cloud';
  }
  
  private detectCICDPipeline(repo: RepositoryAnalysis): string {
    if (repo.codeMetrics.languages['.github']) return 'GitHub Actions';
    if (repo.codeMetrics.languages['.gitlab-ci.yml']) return 'GitLab CI';
    if (repo.codeMetrics.languages['Jenkinsfile']) return 'Jenkins';
    return 'None';
  }
  
  // Inference methods for changes
  private inferBackendChanges(change: any, repo: RepositoryAnalysis): any {
    return {
      api: ['Update API endpoints', 'Add versioning', 'Implement rate limiting'],
      database: ['Optimize queries', 'Add indexes', 'Implement caching'],
      security: ['Update authentication', 'Add encryption', 'Implement audit logging']
    };
  }
  
  private inferMobileChanges(change: any, repo: RepositoryAnalysis): any {
    return {
      ui: ['Update UI components', 'Improve responsiveness', 'Add animations'],
      performance: ['Optimize bundle size', 'Implement lazy loading', 'Cache data'],
      features: ['Add offline support', 'Implement push notifications', 'Add biometric auth']
    };
  }
  
  private inferMLChanges(change: any, repo: RepositoryAnalysis): any {
    return {
      model: ['Improve accuracy', 'Reduce training time', 'Add new features'],
      deployment: ['Containerize model', 'Add API endpoint', 'Implement monitoring'],
      data: ['Expand dataset', 'Improve preprocessing', 'Add validation']
    };
  }
  
  private inferBlockchainChanges(change: any, repo: RepositoryAnalysis): any {
    return {
      contracts: ['Optimize gas usage', 'Add new functions', 'Improve security'],
      frontend: ['Update Web3 integration', 'Improve wallet connection', 'Add transaction history'],
      testing: ['Add unit tests', 'Implement integration tests', 'Add security audits']
    };
  }
  
  private inferInfrastructureChanges(change: any, repo: RepositoryAnalysis): any {
    return {
      scaling: ['Add auto-scaling', 'Implement load balancing', 'Optimize resources'],
      security: ['Update security groups', 'Implement encryption', 'Add monitoring'],
      deployment: ['Improve CI/CD pipeline', 'Add staging environment', 'Implement rollback']
    };
  }
  
  private analyzeSolutionDiscovery(repo: RepositoryAnalysis, change: any) {
    const changeDescription = change.description?.toLowerCase() || '';
    const changeTitle = change.title?.toLowerCase() || '';
    
    // Special handling for vector database migration
    if ((changeDescription.includes('chromadb') || changeDescription.includes('chroma')) && 
        (changeDescription.includes('qdrant') || changeDescription.includes('migrate'))) {
      return this.analyzeVectorDBMigration(repo, change);
    }
    
    const reusableComponents = [];
    
    // Analyze actual dependencies for reusability
    if (repo.dependencies) {
      // Check for auth libraries
      if (repo.dependencies['next-auth'] || repo.dependencies['@supabase/supabase-js'] || repo.apis.authentication === 'JWT') {
        reusableComponents.push({
          name: 'Authentication System',
          type: 'Authentication',
          location: repo.apis.authentication || 'Custom implementation',
          reusability: '85%',
          effort: 'LOW'
        });
      }
      
      // Check for UI component libraries
      const uiLibs = ['@radix-ui', '@mui', 'antd', 'chakra-ui'];
      const hasUILib = Object.keys(repo.dependencies).some(dep => 
        uiLibs.some(lib => dep.includes(lib))
      );
      if (hasUILib) {
        reusableComponents.push({
          name: 'UI Component Library',
          type: 'Frontend',
          location: 'Radix UI / Component System',
          reusability: '95%',
          effort: 'LOW'
        });
      }
      
      // Check for data fetching
      if (repo.dependencies['axios'] || repo.dependencies['swr'] || repo.dependencies['react-query']) {
        reusableComponents.push({
          name: 'Data Fetching Layer',
          type: 'API Client',
          location: Object.keys(repo.dependencies).find(d => ['axios', 'swr', 'react-query'].includes(d)),
          reusability: '90%',
          effort: 'LOW'
        });
      }
      
      // Check for state management
      if (repo.dependencies['zustand'] || repo.dependencies['redux'] || repo.dependencies['mobx']) {
        reusableComponents.push({
          name: 'State Management',
          type: 'Frontend State',
          location: Object.keys(repo.dependencies).find(d => ['zustand', 'redux', 'mobx'].includes(d)),
          reusability: '80%',
          effort: 'MEDIUM'
        });
      }
    }
    
    // Analyze what's missing for the change request
    const gaps = [];
    const title = (typeof change === 'string' ? change : change.title || '').toLowerCase();
    const desc = (typeof change === 'string' ? change : change.description || '').toLowerCase();
    
    // Check for specific feature gaps based on change request
    if (title.includes('referral') || desc.includes('referral')) {
      if (!repo.database.tables.some((t: string) => t.toLowerCase().includes('referral'))) {
        gaps.push({
          capability: 'Referral Management System',
          currentState: 'Not found in database schema',
          targetState: 'Referral tracking tables and APIs',
          recommendation: 'Build new module'
        });
      }
    }
    
    if (title.includes('priorit') || desc.includes('priorit')) {
      if (!repo.database.tables.some((t: string) => t.toLowerCase().includes('priority') || t.toLowerCase().includes('score'))) {
        gaps.push({
          capability: 'Prioritization Engine',
          currentState: 'No prioritization logic found',
          targetState: 'Scoring and ranking system',
          recommendation: 'Implement new service'
        });
      }
    }
    
    if (desc.includes('work history') || desc.includes('employment')) {
      if (!repo.database.tables.some((t: string) => t.toLowerCase().includes('employment') || t.toLowerCase().includes('work'))) {
        gaps.push({
          capability: 'Work History Tracking',
          currentState: 'No employment history tables',
          targetState: 'Employment history and relationships',
          recommendation: 'Create new schema'
        });
      }
    }
    
    return {
      reusableComponents,
      gaps,
      newComponentsRequired: gaps.map(g => g.capability),
      recommendations: [
        `Leverage existing ${repo.architecture.stack.join(', ')} stack`,
        `Reuse ${Object.keys(repo.dependencies).length} existing dependencies`,
        `Extend current ${repo.architecture.structure} architecture`,
        `Build on ${repo.database.type} database infrastructure`,
        gaps.length > 0 ? `Implement ${gaps.length} new components for missing capabilities` : 'Most required components already exist'
      ]
    };
  }
  
  private analyzeArchitecturalAlignment(repo: RepositoryAnalysis, change: any) {
    const ambiguities = [];
    const nonCompliance = [];
    
    // Check for security issues
    if (!repo.apis.authentication || repo.apis.authentication === 'unknown') {
      nonCompliance.push({
        standard: 'Security Standards',
        violation: 'No clear authentication mechanism detected',
        impact: 'Security vulnerability',
        remediation: 'Implement proper authentication'
      });
    }
    
    // Check for testing
    if (repo.codeMetrics.testCoverage === 'unknown' || repo.codeMetrics.testCoverage === '0%') {
      nonCompliance.push({
        standard: 'Quality Standards',
        violation: 'No test coverage detected',
        impact: 'Code quality risk',
        remediation: 'Add unit and integration tests'
      });
    }
    
    // Check for scalability patterns
    if (!repo.architecture.patterns.includes('Containerized')) {
      ambiguities.push({
        area: 'Deployment',
        description: 'No containerization detected',
        severity: 'medium',
        mitigation: 'Add Docker support for consistent deployments'
      });
    }
    
    // Check database structure
    if (repo.database.type === 'unknown') {
      ambiguities.push({
        area: 'Data Storage',
        description: 'Database type not clearly identified',
        severity: 'high',
        mitigation: 'Define clear data storage strategy'
      });
    }
    
    return {
      ambiguities,
      nonCompliance,
      architectureStyle: repo.architecture.structure,
      currentStack: repo.architecture.stack,
      patterns: repo.architecture.patterns,
      recommendations: [
        ...nonCompliance.map(nc => nc.remediation),
        ...ambiguities.map(a => a.mitigation)
      ]
    };
  }
  
  private analyzeDataIntegration(repo: RepositoryAnalysis, change: any) {
    return {
      currentDatabase: {
        type: repo.database.type,
        tables: repo.database.tables,
        relationships: repo.database.relationships
      },
      proposedChanges: {
        newTables: this.inferNewTables(change),
        newRelationships: this.inferNewRelationships(change),
        modifications: this.inferModifications(repo, change)
      },
      apis: {
        existing: repo.apis.endpoints,
        authentication: repo.apis.authentication,
        newRequired: this.inferNewAPIs(change)
      },
      integrationPoints: this.identifyIntegrationPoints(repo, change)
    };
  }
  
  private analyzeFrontendIntegration(repo: RepositoryAnalysis, change: any) {
    const changeType = this.detectChangeType(change, repo);
    const isDesignSystem = changeType === 'design-system';
    
    return {
      currentStack: {
        framework: repo.architecture.stack.find(s => ['React', 'Vue', 'Angular', 'Next.js'].includes(s)) || 'Unknown',
        uiLibrary: Object.keys(repo.dependencies).find(d => d.includes('@radix-ui') || d.includes('@mui') || d.includes('antd')) || 'None',
        styling: Object.keys(repo.dependencies).find(d => d.includes('tailwind') || d.includes('styled-components') || d.includes('emotion')) || 'CSS',
        stateManagement: Object.keys(repo.dependencies).find(d => ['zustand', 'redux', 'mobx', 'recoil'].some(lib => d.includes(lib))) || 'React State'
      },
      proposedChanges: isDesignSystem ? {
        components: ['Migrate all UI components to HPE design system', 'Implement HPE color palette', 'Apply HPE typography standards', 'Update spacing to HPE grid system'],
        styling: ['Replace current theme with HPE theme variables', 'Implement HPE design tokens', 'Update CSS variables to HPE standards'],
        assets: ['Add HPE brand assets', 'Update icons to HPE icon set', 'Apply HPE logo and branding']
      } : {
        components: [],
        styling: [],
        assets: []
      },
      apis: {
        dataFetching: Object.keys(repo.dependencies).find(d => ['axios', 'swr', 'react-query', '@tanstack/react-query'].some(lib => d.includes(lib))) || 'fetch',
        endpoints: repo.apis.endpoints.length > 0 ? 'External APIs detected' : 'No backend APIs',
        authentication: repo.dependencies['next-auth'] ? 'NextAuth' : 'None'
      },
      buildTools: {
        bundler: repo.dependencies['vite'] ? 'Vite' : repo.dependencies['next'] ? 'Next.js/Webpack' : 'Webpack',
        cssProcessor: repo.dependencies['tailwindcss'] ? 'Tailwind CSS' : 'PostCSS',
        typescript: repo.dependencies['typescript'] ? 'Yes' : 'No'
      }
    };
  }
  
  private analyzeOperationalOwnership(repo: RepositoryAnalysis, change: any) {
    // Infer from repository structure
    const isMonorepo = repo.architecture.structure.includes('monorepo');
    const hasMultipleServices = repo.architecture.stack.length > 3;
    
    return {
      proposedOwner: hasMultipleServices ? 'Platform Team' : 'Product Team',
      supportModel: repo.architecture.patterns.includes('Containerized') ? '24x7' : 'business-hours',
      maintenancePlan: {
        activities: [
          'Dependency updates',
          repo.database.type !== 'unknown' ? 'Database maintenance' : null,
          repo.apis.endpoints.length > 0 ? 'API monitoring' : null,
          'Security patching'
        ].filter(Boolean),
        frequency: 'Weekly for patches, monthly for updates',
        resources: `${Math.ceil(repo.codeMetrics.files / 100)} developers needed`
      },
      currentComplexity: {
        files: repo.codeMetrics.files,
        languages: Object.keys(repo.codeMetrics.languages).length,
        dependencies: Object.keys(repo.dependencies).length,
        apis: repo.apis.endpoints.length
      }
    };
  }
  
  private analyzeTechnicalDebt(repo: RepositoryAnalysis, change: any) {
    const debt = [];
    
    // Check for outdated patterns
    if (repo.codeMetrics.languages['.js'] > repo.codeMetrics.languages['.ts']) {
      debt.push({
        component: 'Type Safety',
        type: 'Code Quality',
        description: 'More JavaScript than TypeScript files',
        impact: 'Type safety issues',
        effort: '2 sprints'
      });
    }
    
    // Check for missing tests
    if (repo.codeMetrics.testCoverage === 'unknown' || parseInt(repo.codeMetrics.testCoverage) < 50) {
      debt.push({
        component: 'Test Coverage',
        type: 'Quality',
        description: 'Low or unknown test coverage',
        impact: 'Regression risk',
        effort: '3 sprints'
      });
    }
    
    // Check for monolithic structure
    if (repo.codeMetrics.files > 100 && repo.architecture.structure !== 'Microservices') {
      debt.push({
        component: 'Architecture',
        type: 'Structural',
        description: 'Large monolithic codebase',
        impact: 'Scalability limitations',
        effort: '5 sprints'
      });
    }
    
    return {
      currentDebt: debt,
      debtMetrics: {
        totalItems: debt.length,
        estimatedEffort: debt.reduce((sum, d) => sum + parseInt(d.effort), 0) + ' sprints',
        priority: debt.filter(d => d.impact.includes('risk')).length > 0 ? 'HIGH' : 'MEDIUM'
      },
      mitigationPlan: debt.map(d => `Address ${d.component}: ${d.description}`),
      modernizationOpportunities: this.identifyModernizationOpportunities(repo)
    };
  }
  
  private analyzeBusinessValue(repo: RepositoryAnalysis, change: any) {
    const complexity = this.calculateComplexity(repo);
    const effort = this.estimateEffort(repo, change);
    
    return {
      estimatedEffort: effort,
      complexity: complexity,
      reusability: `${Math.round((repo.architecture.stack.length / 10) * 100)}%`,
      roi: {
        development: effort.weeks * 10000, // $10k per week
        maintenance: effort.weeks * 1000, // $1k per week ongoing
        benefits: 'Based on change impact and reusability',
        paybackPeriod: `${Math.ceil(effort.weeks / 2)} months`
      },
      metrics: {
        currentCodebase: repo.codeMetrics.files + ' files',
        currentComplexity: Object.keys(repo.codeMetrics.languages).length + ' languages',
        currentDependencies: Object.keys(repo.dependencies).length + ' packages',
        impactedComponents: this.calculateImpactedComponents(repo, change)
      }
    };
  }
  
  private analyzeScalability(repo: RepositoryAnalysis, change: any) {
    const bottlenecks = [];
    
    // Database bottlenecks
    if (repo.database.type === 'PostgreSQL' || repo.database.type === 'MySQL') {
      if (repo.database.tables.length > 20) {
        bottlenecks.push({
          component: 'Database',
          issue: `${repo.database.tables.length} tables in single database`,
          impact: 'Query performance at scale',
          mitigation: 'Consider sharding or read replicas'
        });
      }
    }
    
    // API bottlenecks
    if (repo.apis.endpoints.length > 50) {
      bottlenecks.push({
        component: 'API Layer',
        issue: `${repo.apis.endpoints.length} endpoints in single service`,
        impact: 'API gateway overload',
        mitigation: 'Split into microservices'
      });
    }
    
    // Frontend bottlenecks
    if (repo.dependencies['react'] && Object.keys(repo.dependencies).length > 50) {
      bottlenecks.push({
        component: 'Frontend',
        issue: 'Large bundle size from dependencies',
        impact: 'Slow initial load',
        mitigation: 'Code splitting and lazy loading'
      });
    }
    
    return {
      currentArchitecture: repo.architecture,
      bottlenecks,
      scalabilityScore: 10 - bottlenecks.length,
      recommendations: bottlenecks.map(b => b.mitigation),
      evolutionPath: this.suggestEvolutionPath(repo)
    };
  }
  
  private analyzeVectorDBMigration(repo: RepositoryAnalysis, change: any) {
    // Now using generic analyzer - no special cases
    const genericAnalyzer = new GenericEAAnalyzer();
    return genericAnalyzer.analyzeChange(repo, change);
  }
  
  private analyzeVectorDBMigration_old(repo: RepositoryAnalysis, change: any) {
    // Dynamic EA analysis for vector database migration based on actual codebase
    const pythonFileCount = repo.codeMetrics.languages['.py'] || 0;
    const jsFileCount = repo.codeMetrics.languages['.js'] || repo.codeMetrics.languages['.ts'] || 0;
    const totalFiles = repo.codeMetrics.files;
    
    // Detect current vector DB and embedding strategy
    const hasOpenAI = Object.keys(repo.dependencies).some(d => d.includes('openai'));
    const hasLangchain = Object.keys(repo.dependencies).some(d => d.includes('langchain'));
    const currentEmbedding = hasOpenAI ? 'OpenAI embeddings' : 'Sentence transformers';
    
    // Analyze current architecture patterns
    const hasMicroservices = repo.architecture.patterns.includes('Microservices');
    const hasContainers = repo.architecture.patterns.includes('Containerized');
    const hasKubernetes = Object.keys(repo.dependencies).some(d => d.includes('kubernetes'));
    
    // Calculate migration complexity based on codebase
    const complexity = this.calculateMigrationComplexity(repo);
    const duration = this.estimateMigrationDuration(complexity, totalFiles);
    
    // Identify reusable components dynamically
    const reusableComponents = [];
    if (hasOpenAI) reusableComponents.push('OpenAI embedding functions');
    if (hasLangchain) reusableComponents.push('LangChain document processing pipeline');
    if (repo.apis.authentication) reusableComponents.push(`${repo.apis.authentication} authentication layer`);
    if (pythonFileCount > 50) reusableComponents.push('Python service layer architecture');
    if (jsFileCount > 50) reusableComponents.push('JavaScript/TypeScript API layer');
    
    // Identify gaps based on current state
    const gaps = [];
    
    // Production readiness gaps
    if (!hasContainers) {
      gaps.push({
        capability: 'Container Orchestration',
        currentState: 'Non-containerized deployment',
        targetState: 'Kubernetes-ready deployment',
        recommendation: 'Containerize services before migration'
      });
    }
    
    gaps.push({
      capability: 'Vector Database Scale',
      currentState: `ChromaDB handling ${this.estimateVectorCount(repo)} vectors`,
      targetState: 'Qdrant with unlimited scale',
      recommendation: 'Deploy Qdrant with appropriate sizing'
    });
    
    if (!hasMicroservices && totalFiles > 100) {
      gaps.push({
        capability: 'Service Architecture',
        currentState: 'Monolithic vector service',
        targetState: 'Distributed vector processing',
        recommendation: 'Consider service decomposition'
      });
    }
    
    // Generate migration phases based on complexity
    const migrationPhases = this.generateMigrationPhases(complexity, repo);
    
    // Calculate performance improvements based on current metrics
    const currentQueryTime = pythonFileCount > 100 ? 500 : 200; // Estimate based on codebase size
    const targetQueryTime = Math.floor(currentQueryTime / 10);
    
    const performanceImprovements = {
      querySpeed: `${Math.round(currentQueryTime/targetQueryTime)}x faster (${currentQueryTime}ms → ${targetQueryTime}ms)`,
      indexingSpeed: hasOpenAI ? '5x faster with async operations' : '3x faster with batch processing',
      concurrentQueries: `${hasMicroservices ? '50x' : '100x'} improvement`,
      vectorCapacity: `${complexity.high ? '1000x' : '100x'} scale increase`,
      memoryEfficiency: 'HNSW algorithm provides 3-5x better memory usage'
    };
    
    // Calculate costs based on current infrastructure
    const currentInfraCost = this.estimateCurrentCosts(repo);
    const qdrantCost = this.estimateQdrantCosts(repo);
    
    const costAnalysis = {
      currentCosts: currentInfraCost,
      qdrantCosts: qdrantCost,
      roi: {
        breakEven: `${Math.ceil(qdrantCost.setup / (currentInfraCost.monthly - qdrantCost.monthly))} months`,
        yearOneROI: `${Math.round(((currentInfraCost.monthly * 12) - (qdrantCost.monthly * 12 + qdrantCost.setup)) / qdrantCost.setup * 100)}%`,
        efficiency: `${Math.round((1 - qdrantCost.maintenance/currentInfraCost.maintenance) * 100)}% reduction in operational overhead`
      }
    };
    
    // Generate contextual recommendations
    const recommendations = this.generateMigrationRecommendations(repo, complexity);
    
    return {
      reusableComponents,
      gaps,
      migrationPhases,
      performanceImprovements,
      costAnalysis,
      recommendations,
      migrationComplexity: complexity,
      estimatedDuration: duration
    };
  }
  
  private calculateMigrationComplexity(repo: RepositoryAnalysis) {
    let score = 0;
    
    // Size factors
    if (repo.codeMetrics.files > 500) score += 3;
    else if (repo.codeMetrics.files > 100) score += 2;
    else score += 1;
    
    // Architecture factors
    if (repo.architecture.patterns.includes('Microservices')) score += 2;
    if (repo.architecture.patterns.includes('Event-driven')) score += 2;
    
    // Integration factors
    if (repo.apis.endpoints.length > 20) score += 2;
    if (repo.database.tables.length > 10) score += 1;
    
    return {
      score,
      level: score > 6 ? 'high' : score > 3 ? 'medium' : 'low',
      high: score > 6,
      medium: score > 3 && score <= 6,
      low: score <= 3
    };
  }
  
  private estimateMigrationDuration(complexity: any, fileCount: number) {
    const baseWeeks = complexity.high ? 6 : complexity.medium ? 4 : 2;
    const sizeMultiplier = fileCount > 500 ? 1.5 : fileCount > 200 ? 1.2 : 1;
    return `${Math.ceil(baseWeeks * sizeMultiplier)} weeks`;
  }
  
  private estimateVectorCount(repo: RepositoryAnalysis) {
    const fileCount = repo.codeMetrics.files;
    if (fileCount > 500) return '10M+';
    if (fileCount > 200) return '1M+';
    if (fileCount > 50) return '100K+';
    return '10K+';
  }
  
  private generateMigrationPhases(complexity: any, repo: RepositoryAnalysis) {
    const phases = [];
    
    // Phase 1: Always needed
    phases.push({
      phase: 'Phase 1: Infrastructure Setup',
      duration: complexity.high ? '2 weeks' : '1 week',
      tasks: [
        'Deploy Qdrant infrastructure',
        'Setup monitoring and alerting',
        'Configure backup strategy',
        'Implement service wrapper with fallback',
        'Create performance benchmarks'
      ]
    });
    
    // Phase 2: Data migration
    phases.push({
      phase: 'Phase 2: Data Migration',
      duration: complexity.high ? '3 weeks' : '2 weeks',
      tasks: [
        `Export ${this.estimateVectorCount(repo)} vectors from ChromaDB`,
        'Implement data validation checksums',
        'Batch import with progress tracking',
        'Create optimized indexes',
        'Verify data integrity'
      ]
    });
    
    // Phase 3: Service cutover
    phases.push({
      phase: 'Phase 3: Production Cutover',
      duration: '1 week',
      tasks: [
        'Implement blue-green deployment',
        'Switch traffic gradually (canary deployment)',
        'Monitor performance metrics',
        'Keep rollback ready for 30 days',
        'Update documentation and runbooks'
      ]
    });
    
    // Add optimization phase for complex systems
    if (complexity.high) {
      phases.push({
        phase: 'Phase 4: Optimization',
        duration: '2 weeks',
        tasks: [
          'Fine-tune HNSW parameters',
          'Implement caching layer',
          'Optimize query patterns',
          'Setup auto-scaling',
          'Performance testing at scale'
        ]
      });
    }
    
    return phases;
  }
  
  private estimateCurrentCosts(repo: RepositoryAnalysis) {
    const fileCount = repo.codeMetrics.files;
    const baseInfra = fileCount > 500 ? 500 : fileCount > 200 ? 200 : 100;
    const maintenance = fileCount > 500 ? 80 : fileCount > 200 ? 40 : 20;
    
    return {
      monthly: baseInfra,
      maintenance: maintenance,
      downtime: Math.ceil(maintenance / 8),
      total: baseInfra + (maintenance * 50) // Assuming $50/hour
    };
  }
  
  private estimateQdrantCosts(repo: RepositoryAnalysis) {
    const fileCount = repo.codeMetrics.files;
    const monthly = fileCount > 500 ? 800 : fileCount > 200 ? 400 : 200;
    const maintenance = Math.floor(this.estimateCurrentCosts(repo).maintenance * 0.3);
    
    return {
      monthly,
      maintenance,
      setup: fileCount > 500 ? 50000 : fileCount > 200 ? 30000 : 15000,
      downtime: 1 // 99.9% SLA
    };
  }
  
  private generateMigrationRecommendations(repo: RepositoryAnalysis, complexity: any) {
    const recommendations = [];
    
    // Infrastructure recommendations
    if (complexity.high) {
      recommendations.push('Start with Qdrant Cloud Enterprise for production support');
      recommendations.push('Implement multi-region deployment for HA');
    } else {
      recommendations.push('Begin with Qdrant Cloud standard tier');
    }
    
    // Architecture recommendations
    if (!repo.architecture.patterns.includes('Containerized')) {
      recommendations.push('Containerize services before migration for easier deployment');
    }
    
    if (repo.apis.endpoints.length > 50) {
      recommendations.push('Implement API gateway for vector search endpoints');
    }
    
    // Migration strategy
    recommendations.push('Use adapter pattern for zero-downtime migration');
    recommendations.push('Implement comprehensive monitoring from day 1');
    
    // Testing recommendations
    if (repo.codeMetrics.testCoverage === 'unknown' || parseInt(repo.codeMetrics.testCoverage) < 70) {
      recommendations.push('Add integration tests for vector operations before migration');
    }
    
    recommendations.push('Create automated migration validation scripts');
    recommendations.push('Plan for 30-day rollback capability');
    
    return recommendations;
  }
  
  // Helper methods
  private inferNewTables(change: any): string[] {
    const tables = [];
    const desc = (typeof change === 'string' ? change : change.description || '').toLowerCase();
    
    if (desc.includes('referral')) tables.push('referrals', 'referral_scores');
    if (desc.includes('priorit')) tables.push('priority_rules', 'priority_scores');
    if (desc.includes('work') || desc.includes('employment')) {
      tables.push('employment_history', 'work_relationships');
    }
    if (desc.includes('track') || desc.includes('audit')) tables.push('audit_logs');
    
    return tables;
  }
  
  private inferNewRelationships(change: any): string[] {
    const relationships = [];
    const desc = (typeof change === 'string' ? change : change.description || '').toLowerCase();
    
    if (desc.includes('user') && desc.includes('referral')) {
      relationships.push('users -> referrals (1:N)');
    }
    if (desc.includes('work') && desc.includes('history')) {
      relationships.push('users -> employment_history (1:N)');
      relationships.push('users -> work_relationships (N:N)');
    }
    
    return relationships;
  }
  
  private inferModifications(repo: RepositoryAnalysis, change: any): string[] {
    const mods = [];
    
    if (repo.database.tables.includes('users')) {
      mods.push('Add work_history_id to users table');
    }
    if (repo.database.tables.includes('referrals')) {
      mods.push('Add priority_score to referrals table');
    }
    
    return mods;
  }
  
  private inferNewAPIs(change: any): string[] {
    const apis = [];
    const desc = (typeof change === 'string' ? change : change.description || '').toLowerCase();
    
    if (desc.includes('referral')) {
      apis.push('/api/referrals/submit', '/api/referrals/prioritize', '/api/referrals/status');
    }
    if (desc.includes('work') || desc.includes('employment')) {
      apis.push('/api/users/work-history', '/api/users/relationships');
    }
    if (desc.includes('priorit')) {
      apis.push('/api/priority/calculate', '/api/priority/rules');
    }
    
    return apis;
  }
  
  private identifyIntegrationPoints(repo: RepositoryAnalysis, change: any): any[] {
    const points = [];
    
    if (repo.apis.authentication) {
      points.push({
        system: 'Authentication Service',
        method: repo.apis.authentication,
        dataFormat: 'JWT/OAuth'
      });
    }
    
    if (repo.database.type !== 'unknown') {
      points.push({
        system: repo.database.type,
        method: 'Direct SQL/ORM',
        dataFormat: 'Relational'
      });
    }
    
    if (repo.dependencies['axios'] || repo.dependencies['fetch']) {
      points.push({
        system: 'External APIs',
        method: 'REST',
        dataFormat: 'JSON'
      });
    }
    
    return points;
  }
  
  private identifyModernizationOpportunities(repo: RepositoryAnalysis): string[] {
    const opportunities = [];
    
    if (!repo.architecture.patterns.includes('Containerized')) {
      opportunities.push('Add Docker containerization');
    }
    
    if (!repo.dependencies['typescript'] && repo.codeMetrics.languages['.js'] > 0) {
      opportunities.push('Migrate to TypeScript');
    }
    
    if (repo.architecture.stack.includes('React') && !repo.dependencies['next']) {
      opportunities.push('Consider Next.js for SSR/SSG');
    }
    
    if (Object.keys(repo.dependencies).length > 100) {
      opportunities.push('Reduce dependency bloat');
    }
    
    return opportunities;
  }
  
  private calculateComplexity(repo: RepositoryAnalysis): string {
    const score = 
      (repo.codeMetrics.files / 10) +
      (Object.keys(repo.codeMetrics.languages).length * 2) +
      (Object.keys(repo.dependencies).length / 5) +
      (repo.apis.endpoints.length / 3);
    
    if (score < 10) return 'LOW';
    if (score < 30) return 'MEDIUM';
    return 'HIGH';
  }
  
  private estimateEffort(repo: RepositoryAnalysis, change: any): any {
    const baseWeeks = 4; // Base effort
    const complexityMultiplier = this.calculateComplexity(repo) === 'HIGH' ? 2 : 1;
    const integrationMultiplier = repo.apis.endpoints.length > 20 ? 1.5 : 1;
    
    const totalWeeks = Math.ceil(baseWeeks * complexityMultiplier * integrationMultiplier);
    
    return {
      weeks: totalWeeks,
      developers: Math.ceil(totalWeeks / 4),
      cost: totalWeeks * 10000
    };
  }
  
  private calculateImpactedComponents(repo: RepositoryAnalysis, change: any): number {
    let impacted = 0;
    const desc = (typeof change === 'string' ? change : change.description || '').toLowerCase();
    
    if (desc.includes('api')) impacted += repo.apis.endpoints.length / 2;
    if (desc.includes('database') || desc.includes('data')) impacted += repo.database.tables.length / 3;
    if (desc.includes('ui') || desc.includes('frontend')) impacted += 10;
    
    return Math.ceil(impacted);
  }
  
  private suggestEvolutionPath(repo: RepositoryAnalysis): string[] {
    const path = [];
    
    if (repo.architecture.structure === 'Monolithic' || repo.architecture.structure.includes('monolith')) {
      path.push('Phase 1: Extract shared services');
      path.push('Phase 2: Implement API gateway');
      path.push('Phase 3: Migrate to microservices');
    } else if (repo.architecture.structure.includes('Single-page')) {
      path.push('Phase 1: Add server-side rendering');
      path.push('Phase 2: Implement edge caching');
      path.push('Phase 3: Add progressive enhancement');
    } else {
      path.push('Phase 1: Optimize current architecture');
      path.push('Phase 2: Add horizontal scaling');
      path.push('Phase 3: Implement multi-region support');
    }
    
    return path;
  }
}