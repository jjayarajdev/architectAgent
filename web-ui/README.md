# EA Generator Web UI

A beautiful, modern web interface for the Enterprise Architecture Generator that helps analyze codebases and generate comprehensive architectural assessments.

## Features

- **Beautiful UI**: Modern glassmorphism design with smooth animations
- **Real-time Processing**: Live progress tracking during analysis
- **Comprehensive Reports**: Detailed EA assessments with markdown formatting
- **Multiple Output Options**: ER diagrams, implementation plans, and test strategies
- **Syntax Highlighting**: Code blocks with proper highlighting in reports
- **Export Capabilities**: Download reports as markdown files

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (for cloning repositories)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Ensure the EA Generator backend is properly configured in the parent directory

## Quick Start

### Using the startup scripts (Recommended)

1. **Start all services:**
```bash
./start.sh
```
This will:
- Start the API server on port 3000
- Start the Web UI on port 3001
- Open your browser automatically

2. **Stop all services:**
```bash
./stop.sh
```

### Manual Start

1. **Start the API server:**
```bash
node api-server.js
```

2. **Start the Web UI (in a new terminal):**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to http://localhost:3001

## Usage

1. **Enter Repository URL**: 
   - Provide a GitHub URL or local path to analyze
   - Example: `https://github.com/user/repo.git`

2. **Describe Your Change Request**:
   - Be specific about what you want to implement
   - Example: "Add user authentication with JWT tokens"

3. **Select Generation Options**:
   - ER Diagram: Generate entity relationship diagrams
   - Implementation Plan: Get detailed implementation steps
   - Test Strategy: Receive comprehensive testing approaches

4. **Generate Assessment**:
   - Click "Generate Assessment" to start the analysis
   - Watch real-time progress as the system analyzes your codebase
   - View the comprehensive report with beautiful formatting

5. **Export Results**:
   - Copy the report to clipboard
   - Download as a markdown file for documentation

## Architecture

```
web-ui/
├── src/
│   ├── App.jsx              # Main application component
│   ├── components/
│   │   ├── RequestForm.jsx  # Input form for repo and change request
│   │   ├── LoadingState.jsx # Progress tracking during analysis
│   │   └── ReportViewer.jsx # Display generated reports
│   └── index.css            # Tailwind CSS and custom styles
├── api-server.js            # Express server connecting to EA Generator
├── start.sh                 # Startup script
└── stop.sh                  # Shutdown script
```

## API Endpoints

- `POST /api/generate-assessment`: Generate EA assessment
  - Body: `{ repositoryUrl, changeRequest, options }`
  - Returns: `{ document, analysis }`

## Technologies Used

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **UI Libraries**: Lucide React (icons), React Markdown, React Syntax Highlighter
- **Styling**: Tailwind CSS with glassmorphism effects

## Troubleshooting

### Port Already in Use
If you see "Port 3000/3001 is in use", run:
```bash
./stop.sh
```
Then start again with `./start.sh`

### CSS Not Loading
Ensure you're using the correct Tailwind CSS version (v3.4.x). If styles aren't loading:
```bash
npm uninstall tailwindcss
npm install tailwindcss@^3.4.0
```

### API Connection Issues
Check that:
1. The API server is running on port 3000
2. CORS is properly configured in api-server.js
3. The EA Generator backend is accessible

## Development

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run preview`: Preview production build

### Customization

1. **Styling**: Edit `src/index.css` for custom styles
2. **Components**: Modify components in `src/components/`
3. **API Integration**: Update `api-server.js` for backend changes

## License

MIT

## Support

For issues or questions, please check the main EA Generator documentation or create an issue in the repository.