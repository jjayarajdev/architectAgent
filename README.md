# EA MCP Suite v3.0 - Enhanced Enterprise Architecture Analysis Agent System

Production-grade MCP (Model Context Protocol) multi-agent system for comprehensive Enterprise Architecture Sprint 0 assessments with business-focused impact analysis, ROI calculations, and implementation roadmaps.

```
┌─────────────────────────────────────────────────────────────┐
│                         EA-MCP-SUITE                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐     ┌─────────────────┐     ┌──────────┐     │
│  │  Input   │────▶│   Orchestrator   │────▶│  Output  │     │
│  │   JSON   │     └────────┬─────────┘     │   PR/MD  │     │
│  └──────────┘              │                └──────────┘     │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐             │
│         ▼                  ▼                  ▼             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Repo Intel  │  │  Docs Intel  │  │    Impact    │     │
│  │    Agent     │  │    Agent     │  │    Agent     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                               │             │
│                                       ┌──────────────┐     │
│                                       │ Arch Writer  │     │
│                                       │    Agent     │     │
│                                       └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 What This Is

An enhanced MCP-based Enterprise Architecture agent suite that:
- **Analyzes GitHub repositories** with deep code introspection
- **Generates comprehensive Sprint 0 assessments** with business-focused analysis
- **Calculates ROI and financial models** with payback periods and cost savings
- **Identifies reusable components** with integration effort estimates
- **Detects architectural gaps** and compliance issues (GDPR, security, audit)
- **Provides implementation roadmaps** with phased migration strategies
- **Produces detailed recommendations** with SQL schemas and code examples
- **Assesses system bottlenecks** with scaling strategies
- **Creates risk matrices** with mitigation plans
- **Outputs to organized folder structure** (`/output/<git-repo-name>/`)

## 📦 Architecture

**Monorepo Structure:**
```
packages/
├── agent-sprint0/                       # Sprint 0 EA Assessment Agent
│   ├── src/
│   │   ├── api-server.ts               # REST API endpoint
│   │   ├── enterprise-architect-orchestrator.ts  # Main orchestrator
│   │   ├── enterprise-architect-orchestrator-enhanced.ts  # Enhanced v3.0
│   │   └── repository-analyzer.ts      # Repository analysis
├── orchestrator/                        # Executive coordinator
├── agent-repo-intel/                    # Code & dependency analysis
├── agent-docs-intel/                    # Documentation RAG
├── agent-impact/                        # Risk & effort assessment
├── agent-arch-writer/                   # Diagram & ADR generation
├── tools/                               # MCP tool implementations
└── common/                              # Shared types & utilities

output/                                  # Generated assessments
├── vialtokms/                          # Per-repository outputs
├── tr-kms-prod-app/
└── bristlecone-frontend/

apps/
├── cli/                                 # Command-line interface
└── web-ui/                              # Web dashboard
```

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Git

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd ea-mcp-suite

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Run Demo
```bash
# Quick demo with sample multi-tenancy requirement
pnpm demo

# Or from CLI directory
cd apps/cli
pnpm demo
```

### Run Your Own Analysis
```bash
# Validate your input
pnpm cli validate -i your-input.json

# Run analysis
pnpm cli run -i your-input.json
```

## 📝 Input Schema

Create an input JSON following the schema in `schemas/input.schema.json`. Key sections:

- **repo**: GitHub repository details
- **requirement**: What needs to be built
- **context**: Architecture style, compliance, cloud
- **documentation**: Where to find docs
- **analysis_scope**: How deep to analyze
- **outputs**: What to generate

See `examples/input.multitenancy.json` for a complete example.

## 🛠️ Configuration

Create `.env` file:
```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
REPO_URL=https://github.com/your/repo
DEFAULT_BRANCH=main
DIAGRAM_RENDERER=mock  # or mermaid-cli if installed
LOG_LEVEL=info
```

## 📊 Outputs

The suite generates:
- **Impact Analysis Report** (`docs/ea/report.md`)
- **C4 Diagrams** (L2 System, L3 Components)
- **Architecture Decision Records** (`docs/adr/`)
- **Risk Assessment** with mitigations
- **Effort Estimates** (S/M/L/XL buckets)
- **Test Strategy**
- **GitHub Pull Request** (optional)

## 🔧 Extending the System

### Add a New Agent

1. Create package in `packages/agent-{name}/`
2. Extend `MCPServer` base class
3. Implement `getCapabilities()` and `handleRequest()`
4. Register in orchestrator

### Add Security Agent Example
```typescript
// packages/agent-security/src/index.ts
export class SecurityAgent extends MCPServer {
  name = 'agent-security';
  
  async analyzeThreatModel(requirement) {
    // STRIDE analysis
    // OWASP checks
    // Compliance mapping
    return threats;
  }
}
```

### Add Cost Agent Example
```typescript
// packages/agent-cost/src/index.ts  
export class CostAgent extends MCPServer {
  name = 'agent-cost';
  
  async estimateCosts(infrastructure, effort) {
    // Cloud resource costs
    // Development costs
    // Operational costs
    return costBreakdown;
  }
}
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @ea-mcp/orchestrator test

# Lint
pnpm lint

# Type check
pnpm typecheck
```

## 🔍 Commands

### CLI Commands
- `ea-analyze run -i input.json` - Run full analysis
- `ea-analyze validate -i input.json` - Validate input
- `ea-analyze demo` - Run with sample data

### NPM Scripts
- `pnpm setup` - Install dependencies
- `pnpm build` - Build all packages
- `pnpm test` - Run tests
- `pnpm demo` - Run demo analysis
- `pnpm clean` - Clean build artifacts

## 🏗️ Development

### Local Development
```bash
# Watch mode for package development
cd packages/orchestrator
pnpm build --watch

# Link CLI globally
cd apps/cli
pnpm link --global
ea-analyze --help
```

### Adding Dependencies
```bash
# Add to specific package
pnpm --filter @ea-mcp/tools add lodash

# Add to root
pnpm add -D -w eslint
```

## 🚢 Deployment

The system can be deployed as:
- **CLI Tool**: Package and distribute via npm
- **API Service**: Wrap in Express/Fastify server
- **GitHub Action**: Automated PR analysis
- **Container**: Dockerize for cloud deployment

## 📚 References

- [Model Context Protocol](https://modelcontextprotocol.io)
- [C4 Model](https://c4model.com)
- [ADR Format](https://adr.github.io)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit PR with description

## 📄 License

MIT

---

Built with MCP for Enterprise Architecture teams.