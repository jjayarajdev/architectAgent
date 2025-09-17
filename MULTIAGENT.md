# Multi-Agent Architecture - EA Generator

## 🚀 Overview

The `multiAgent` branch introduces a sophisticated multi-agent system for generating comprehensive Enterprise Architecture assessments. This system leverages specialized agents that work collaboratively to analyze repositories, assess impacts, generate documentation, and produce detailed architecture recommendations.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Multi-Agent Orchestrator                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Repo Intel  │  │  Docs Intel  │  │   Impact     │      │
│  │    Agent     │  │    Agent     │  │    Agent     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┼──────────────────┘               │
│                            ▼                                  │
│                   ┌──────────────┐                           │
│                   │ Arch Writer  │                           │
│                   │    Agent     │                           │
│                   └──────────────┘                           │
│                            │                                  │
│                            ▼                                  │
│                   ┌──────────────┐                           │
│                   │ LLM Enhancer │                           │
│                   │  (Optional)  │                           │
│                   └──────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## 🤖 Specialized Agents

### 1. Repository Intelligence Agent (`RepoIntelAgent`)
**Capabilities:**
- Deep repository structure analysis
- Framework and technology detection
- Dependency mapping
- Database schema extraction
- API route discovery
- Code quality assessment

**Key Features:**
- Detects architecture patterns (monolith, microservices, serverless)
- Identifies testing and CI/CD configurations
- Analyzes code metrics and quality indicators

### 2. Documentation Intelligence Agent (`DocsIntelAgent`)
**Capabilities:**
- Documentation generation and analysis
- Executive summary creation
- Technical overview composition
- Architecture diagram generation (Mermaid)
- API documentation
- Deployment guide creation

**Key Features:**
- Generates multiple documentation formats
- Creates visual diagrams for better understanding
- Produces deployment and configuration guides

### 3. Impact Analysis Agent (`ImpactAgent`)
**Capabilities:**
- Change impact assessment
- Risk evaluation
- Dependency analysis
- Performance impact prediction
- Security impact assessment
- Cost and timeline estimation

**Key Features:**
- Comprehensive risk matrix
- Component dependency mapping
- Resource estimation
- Timeline planning with phases

### 4. Architecture Writer Agent (`ArchWriterAgent`)
**Capabilities:**
- Document composition
- Technical specification writing
- Implementation plan generation
- Report formatting
- Diagram integration

**Key Features:**
- Produces comprehensive EA assessments
- Integrates outputs from all other agents
- Generates implementation strategies
- Creates success metrics and KPIs

## 📋 Usage

### Command Line Interface

```bash
# Default multi-agent mode
node index.js -r https://github.com/user/repo.git -c "Add microservices architecture"

# With verbose logging
node index.js -r ./local-repo -c "Implement OAuth 2.0" -v

# Force single-agent mode (fallback)
node index.js -r https://github.com/user/repo.git -c "Update database schema" --single-agent

# With additional artifacts
node index.js -r ./repo -c "Add caching layer" --with-plan --with-tests
```

### Programmatic Usage

```javascript
import { EAGeneratorMultiAgent } from './src/generators/ea-generator-multi-agent.js';

const generator = new EAGeneratorMultiAgent({
  verbose: true,
  openaiApiKey: 'your-api-key',
  useMultiAgent: true // Explicitly enable multi-agent
});

const result = await generator.generate(
  'https://github.com/user/repo.git',
  'Implement multi-tenancy support',
  {
    generateImplementationPlan: true,
    generateTestStrategy: true
  }
);

if (result.success) {
  console.log('Assessment generated:', result.outputPath);
  console.log('Summary:', result.summary);
  console.log('Metrics:', result.metrics);
}
```

## 🔄 Workflow Phases

### Phase 1: Repository Intelligence
- Analyzes repository structure
- Detects technologies and frameworks
- Extracts database schemas
- Maps API endpoints
- Assesses code quality

### Phase 2: Documentation Intelligence
- Generates technical documentation
- Creates architecture diagrams
- Produces API documentation
- Develops deployment guides

### Phase 3: Impact Analysis
- Assesses change impact
- Identifies affected components
- Evaluates risks
- Estimates costs and timeline
- Analyzes performance implications

### Phase 4: Architecture Writing
- Composes comprehensive assessment
- Integrates all agent outputs
- Generates implementation strategy
- Creates success metrics

### Phase 5: LLM Enhancement (Optional)
- Enhances content with AI insights
- Generates executive recommendations
- Provides risk analysis
- Adds implementation suggestions

### Phase 6: Output Generation
- Saves formatted markdown document
- Creates timestamped assessment
- Generates summary report

## 📊 Output Structure

The multi-agent system generates a comprehensive markdown document containing:

1. **Executive Summary**
   - Project overview
   - Key findings
   - Strategic recommendations

2. **Current State Analysis**
   - System overview
   - Architecture patterns
   - Technology stack
   - Code metrics

3. **Change Request Assessment**
   - Scope analysis
   - Affected components
   - Technical requirements

4. **Impact Analysis**
   - Risk assessment
   - Performance impact
   - Security considerations
   - Cost estimation

5. **Architecture Recommendations**
   - Design principles
   - Pattern suggestions
   - Technology choices

6. **Implementation Strategy**
   - Phased approach
   - Resource requirements
   - Critical path activities

7. **Risk Mitigation**
   - Risk matrix
   - Mitigation plans
   - Contingency planning

8. **Success Metrics**
   - KPIs
   - Technical metrics
   - Business metrics

9. **Architecture Diagrams**
   - ER diagrams
   - System architecture
   - API flow diagrams

## 🎯 Benefits of Multi-Agent System

1. **Specialization**: Each agent focuses on its domain expertise
2. **Parallelization**: Agents can work concurrently where possible
3. **Comprehensive Analysis**: Multiple perspectives ensure thorough assessment
4. **Modularity**: Easy to add or modify individual agents
5. **Fault Tolerance**: System can fallback to single-agent mode if needed
6. **Scalability**: Can handle complex repositories and change requests

## 🔧 Configuration

### Environment Variables
```bash
OPENAI_API_KEY=your-api-key        # Required for LLM enhancement
OPENAI_MODEL=gpt-4                 # Model for AI generation
OPENAI_MAX_TOKENS=16000            # Max tokens for responses
OUTPUT_DIR=./output                # Output directory for assessments
```

### Options
- `--multi-agent`: Use multi-agent system (default)
- `--single-agent`: Use single-agent system
- `-v, --verbose`: Enable verbose logging
- `--with-plan`: Generate implementation plan
- `--with-tests`: Generate test strategy

## 📈 Performance

The multi-agent system provides:
- **Faster Analysis**: Parallel processing where possible
- **Better Quality**: Specialized agents produce higher quality outputs
- **More Comprehensive**: Multiple perspectives and deeper analysis
- **Extensible**: Easy to add new agents for additional capabilities

## 🔍 Monitoring

During execution, the orchestrator provides:
- Real-time phase progress
- Agent status updates
- Execution metrics
- Error handling and recovery

## 🚦 Status Codes

- `idle`: System ready but not executing
- `executing`: Assessment generation in progress
- `completed`: Successfully generated assessment
- `error`: Execution failed (check logs)

## 🛠️ Development

### Adding New Agents

1. Extend the `BaseAgent` class:
```javascript
import { BaseAgent } from './base-agent.js';

export class CustomAgent extends BaseAgent {
  constructor(options = {}) {
    super('CustomAgent', options);
    this.capabilities = ['custom_analysis'];
  }
  
  async execute(context) {
    // Implementation
  }
}
```

2. Register in orchestrator
3. Update workflow phases

### Testing

```bash
# Run with test repository
node index.js -r ./test-repo -c "Test change" -v

# Check orchestrator status
const status = generator.getOrchestratorStatus();
console.log(status);
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Agents follow the base agent pattern
- Include comprehensive error handling
- Add appropriate logging
- Update documentation

## 📞 Support

For issues or questions about the multi-agent system:
- Open an issue on GitHub
- Check existing documentation
- Review agent logs with `-v` flag