# EA Generator - Enterprise Architecture Assessment Tool

AI-powered repository analysis tool that generates comprehensive Enterprise Architecture assessments with implementation details, ER diagrams, and technical recommendations. Features both CLI and beautiful Web UI interfaces.

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

## 🚀 Features

### Core Capabilities
- **Repository Analysis**: Deep code introspection of GitHub repositories and local codebases
- **AI-Powered Assessment**: Generates comprehensive architecture assessments using OpenAI GPT-4
- **ER Diagram Generation**: Automatic database schema visualization with Mermaid diagrams
- **Implementation Plans**: Detailed technical roadmaps with effort estimates
- **Test Strategies**: Comprehensive testing approaches for change implementations
- **Beautiful Web UI**: Modern React interface for easy assessment generation and viewing
- **CLI Tool**: Command-line interface for automation and scripting
- **Markdown Reports**: Well-formatted assessment documents with syntax highlighting

## 🖥️ Web UI

The EA Generator now includes a beautiful web interface:

### Features
- **Modern Design**: Clean, responsive interface with gradient backgrounds
- **Easy Input**: Simple form for repository URL and change request
- **Live Progress**: Real-time progress tracking during generation
- **Report Viewer**: Beautiful markdown rendering with syntax highlighting
- **Mermaid Diagrams**: Automatic rendering of ER and architecture diagrams
- **Download & Export**: Download assessments as markdown files
- **Analysis Stats**: Quick overview of repository structure and components

### Starting the Web UI
```bash
# Start both API server and Web UI
./start-web-ui.sh

# Access the UI
open http://localhost:3001

# Stop all services
./stop-web-ui.sh
```

The Web UI runs on port 3001 and the API server on port 3000.

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git
- OpenAI API key

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd architectAgent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### Using Web UI (Recommended)
```bash
# Start the Web UI and API server
./start-web-ui.sh

# Open browser
open http://localhost:3001

# When done, stop all services
./stop-web-ui.sh
```

### Using CLI
```bash
# Basic usage
node index.js -r https://github.com/user/repo -c "Add authentication feature"

# With options
node index.js -r https://github.com/user/repo -c "Migrate to microservices" --with-plan --with-tests

# Using shell script
./generate-assessment.sh https://github.com/user/repo "Your change request"
```

## 📦 Project Structure

```
architectAgent/
├── web-ui/                    # Web UI application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── RequestForm.jsx
│   │   │   ├── ReportViewer.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   └── MermaidDiagram.jsx
│   │   └── App.jsx
│   ├── api-server.js        # Express API server
│   └── package.json
├── src/
│   ├── analyzers/           # Repository analyzers
│   ├── generators/          # Report generators
│   └── utils/               # Utility functions
├── output/                  # Generated assessments
├── index.js                 # CLI entry point
├── generate-assessment.sh   # Shell script wrapper
├── start-web-ui.sh         # Start Web UI services
├── stop-web-ui.sh          # Stop Web UI services
└── .env                    # Configuration

## 🛠️ Configuration

Create `.env` file:
```env
# Required
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Optional
GITHUB_TOKEN=ghp_xxxxxxxxxxxx  # For private repos
DIAGRAM_RENDERER=mermaid-cli    # or mock
LOG_LEVEL=info                  # error, warn, info, debug
OUTPUT_DIR=output               # Output directory
CACHE_DIR=.cache                # Cache directory
```

## 📊 Generated Outputs

Each assessment creates:
```
output/
└── <repository-name>/
    └── <timestamp>_assessment.md
```

### Report Contents
- **Executive Summary**: High-level overview and recommendations
- **Current State Analysis**: Repository structure, tech stack, database schema
- **Implementation Plan**: Step-by-step approach with effort estimates
- **ER Diagrams**: Visual database schema using Mermaid
- **Test Strategy**: Comprehensive testing approach
- **Risk Assessment**: Potential issues and mitigation strategies
- **Code Examples**: Sample implementations and SQL schemas

## 🎨 Web UI Components

### RequestForm
- Repository URL input with validation
- Change request text area
- Optional feature toggles (ER Diagram, Implementation Plan, Test Strategy)
- Form validation and error handling

### ReportViewer
- Markdown rendering with syntax highlighting
- Mermaid diagram rendering
- Copy to clipboard functionality
- Download as markdown file
- Analysis statistics display

### MermaidDiagram
- Automatic diagram rendering
- Error handling with fallback display
- Themed styling for consistency

## 🔌 API Endpoints

### POST `/api/generate-assessment`
Generates an EA assessment for a repository.

**Request Body:**
```json
{
  "repositoryUrl": "https://github.com/user/repo",
  "changeRequest": "Description of the change",
  "options": {
    "erDiagram": true,
    "implementationPlan": true,
    "testStrategy": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "document": "# Assessment Report\n...",
  "analysis": { ... },
  "filename": "repo-name/2024-01-01_assessment.md"
}
```

### GET `/health`
Health check endpoint.

## 🔍 CLI Options

```bash
Usage: node index.js [options]

Options:
  -h, --help              Show help message
  -r, --repo <url/path>   Repository URL or local path
  -c, --change <text>     Change request description
  -v, --verbose           Enable verbose logging
  -o, --optimized         Use optimized analyzer
  --with-plan             Generate implementation plan
  --with-tests            Generate test strategy
  --er-diagram            Include ER diagram (default)

Examples:
  node index.js -r https://github.com/user/repo -c "Add multi-tenancy"
  node index.js -r ./local-repo -c "Migrate to microservices" --with-plan
```

## 🚀 Advanced Features

### Repository Types Supported
- GitHub repositories (public and private with token)
- GitLab repositories
- Local file paths
- Monorepo structures
- Microservices architectures

### Analysis Capabilities
- **Code Structure**: Identifies patterns, frameworks, and architecture
- **Database Schema**: Extracts and visualizes database relationships
- **API Endpoints**: Maps REST/GraphQL endpoints and their relationships
- **Dependencies**: Analyzes package dependencies and versions
- **Security**: Identifies potential security concerns
- **Performance**: Highlights bottlenecks and optimization opportunities

## 🔧 Troubleshooting

### Common Issues

**Issue**: "Failed to generate assessment"
- Check your OpenAI API key is valid
- Ensure the repository URL is accessible
- Verify network connectivity

**Issue**: "Mermaid diagrams not rendering"
- Refresh the page
- Check browser console for errors
- Ensure JavaScript is enabled

**Issue**: "API server not responding"
- Run `./stop-web-ui.sh` then `./start-web-ui.sh`
- Check port 3000 is not in use
- Verify Node.js version is 18+

## 📚 Examples

### Sample Change Requests
- "Add multi-tenant support with database isolation"
- "Migrate from monolith to microservices architecture"
- "Implement OAuth2 authentication with social providers"
- "Add real-time messaging with WebSocket support"
- "Optimize database queries and add caching layer"
- "Implement GDPR compliance features"

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit PR with description

## 📄 License

MIT

---

Built with ❤️ using React, Node.js, and OpenAI GPT-4.