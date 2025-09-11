# MCP EA Suite - Web UI

## 🚀 Quick Start

```bash
# Start the web UI
./start-web-ui.sh

# Or manually:
cd apps/web-ui
npm run dev
```

Open http://localhost:3001 in your browser.

## 🎯 Features

### Input Form
- **Repository Information**
  - GitHub URL input
  - Branch selection
  
- **Change Request Details**
  - Title and description
  - Change type (feature, API, integration, etc.)
  - Functional areas selection
  - Business objectives (dynamic list)
  - Constraints (dynamic list)
  - Timeline selection

- **Enterprise Context**
  - Architecture style (microservices, monolith, etc.)
  - Cloud platform (AWS, Azure, GCP, etc.)
  - Support model (24x7, business hours, etc.)
  - Compliance requirements (GDPR, SOC2, HIPAA, etc.)

### Output Viewer
- **Overview Tab**: Executive summary and key recommendations
- **Sprint 0 Review Tab**: Complete 7-point EA analysis
- **Architecture Tab**: System design and technology stack
- **Data & Integration Tab**: Data model and integration points
- **Diagrams Tab**: Interactive Mermaid diagrams
- **Risks Tab**: Risk register with mitigation strategies
- **Business Value Tab**: ROI analysis and metrics
- **Roadmap Tab**: Implementation timeline and phases

### Key Metrics Dashboard
- Compliance Score
- Expected ROI
- Risk Count
- Timeline

## 📊 Sample Analysis

### Input Example
```json
{
  "repository": {
    "url": "https://github.com/jjayarajdev/Refermate-0.0.7.git",
    "branch": "main"
  },
  "changeRequest": {
    "title": "Add Internal Referral Prioritization",
    "description": "Implement prioritization based on work history",
    "functionalAreas": ["Authentication", "Data Processing", "Workflow"]
  }
}
```

### Output Includes
- Sprint 0 EA Review Document
- Executive Summary
- Technical Architecture Document
- Risk Assessment Matrix
- Implementation Roadmap
- Architecture Diagrams (System, Data Flow, Deployment)
- Business Value Analysis
- Compliance Assessment

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Diagrams**: Mermaid.js
- **Icons**: Lucide React
- **Markdown**: React Markdown with GitHub Flavored Markdown

## 📁 Project Structure

```
apps/web-ui/
├── app/
│   ├── api/
│   │   └── analyze/       # Backend API endpoint
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/
│   ├── InputForm.tsx      # Input form component
│   └── OutputViewer.tsx   # Output display with tabs
├── types/
│   └── index.ts           # TypeScript definitions
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 🔧 API Integration

The web UI communicates with the MCP EA Suite backend through the `/api/analyze` endpoint:

1. **Request**: Sends repository URL, change request details, and context
2. **Processing**: Backend runs Sprint 0 analysis using MCP agents
3. **Response**: Returns comprehensive EA artifacts and metrics
4. **Display**: UI renders results in organized tabs with visualizations

## 🎨 UI Components

### InputForm Component
- Multi-section form with validation
- Dynamic list management for objectives and constraints
- Checkbox groups for functional areas and compliance
- Real-time form state management

### OutputViewer Component
- Tabbed interface for different artifact types
- Mermaid diagram rendering
- Markdown content display
- Export functionality
- Responsive design

## 🚦 Status Indicators

- **Loading State**: Animated spinner with progress steps
- **Error Handling**: Clear error messages with recovery options
- **Success State**: Comprehensive results display

## 📦 Export Options

- Download all artifacts as JSON
- Copy individual sections
- Print-friendly views

## 🔐 Security

- Input validation and sanitization
- Secure API communication
- No sensitive data stored client-side

## 🐛 Troubleshooting

### Common Issues

1. **Port 3001 already in use**
   ```bash
   # Change port in package.json or use:
   PORT=3002 npm run dev
   ```

2. **Build errors**
   ```bash
   # Rebuild packages
   cd packages/common && npm run build
   cd ../agent-sprint0 && npm run build
   ```

3. **Module not found errors**
   ```bash
   # Install dependencies
   npm install
   ```

## 📝 Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## 🎯 Next Steps

1. Add authentication for enterprise use
2. Implement real-time collaboration features
3. Add more diagram types
4. Enhanced export formats (PDF, Word)
5. Integration with JIRA/Confluence
6. Custom template support

---

*MCP EA Suite Web UI v1.0 - Enterprise Architecture Analysis Made Simple*