/**
 * System prompts for EA Assessment Generator
 */

export const SYSTEM_PROMPTS = {
  changeRequestGenerator: `You are a Senior Enterprise Architect creating a comprehensive Change Request document. Generate a production-ready document that includes:

1. Executive Summary with clear business objectives
2. Detailed functional requirements (FR) with specific acceptance criteria
3. Non-functional requirements (NFR) covering security, performance, privacy
4. Complete data model changes with SQL migrations and ER diagrams (using Mermaid)
5. API modifications with request/response schemas
6. Frontend changes with component specifications
7. Implementation steps with clear phases
8. Technical considerations (performance, security, scalability)
9. Observability requirements with metrics and SLAs
10. Rollout plan with feature flags
11. Risk assessment and mitigations
12. Actual code examples that work with the existing codebase

IMPORTANT: Generate COMPLETE Mermaid ER diagrams showing:
- ALL existing tables found in the analysis
- New tables required for the change
- Relationships between all tables
- Primary and foreign keys

The document must be specific to the repository analyzed, using actual table names, API patterns, and architectural decisions found in the codebase.
Format everything in proper Markdown with complete Mermaid diagrams.
Be extremely detailed and technical - this is for implementation teams.`,

  erDiagramGenerator: `Generate only Mermaid ER diagram syntax. No explanations.`,
};

export const USER_PROMPT_TEMPLATES = {
  changeRequestAnalysis: (analysis, changeRequest, projectName) => {
    const existingTables = analysis.database.tables.length > 0 
      ? analysis.database.tables.join(', ') 
      : 'No existing tables found';
    
    const existingAPIs = analysis.api.routes.length > 0
      ? analysis.api.routes.slice(0, 5).join(', ') + (analysis.api.routes.length > 5 ? '...' : '')
      : 'No existing endpoints found';

    return `Analyze this repository and provide a detailed technical assessment for implementing the requested change.

PROJECT: ${projectName}
CHANGE REQUEST: ${changeRequest}

REPOSITORY ANALYSIS:

## Structure
- Type: ${analysis.structure.type}
- Framework: ${analysis.structure.framework || 'Custom'}
- Languages: ${analysis.structure.languages.join(', ') || 'Not detected'}
- Main directories: ${analysis.structure.directories.join(', ')}

## Database
- Type: ${analysis.database.type || 'SQL'}
- Existing Tables: ${existingTables}
- Total Tables Found: ${analysis.database.tables.length}

## APIs
- Type: ${analysis.api.type || 'REST'}
- Sample Endpoints: ${existingAPIs}
- Total Endpoints: ${analysis.api.routes.length}
- Controllers: ${analysis.api.controllers.length} found
- Services: ${analysis.api.services.length} found

## Frontend
- Framework: ${analysis.frontend.framework || 'None detected'}
- Components: ${analysis.frontend.components.length} components
- Pages: ${analysis.frontend.pages.length} pages
- State Management: ${analysis.frontend.state || 'None'}
- Styling: ${analysis.frontend.styling || 'Default'}

## Architecture & Patterns
- Architecture: ${analysis.patterns.architecture}
- Testing: ${analysis.patterns.testing || 'None detected'}
- CI/CD: ${analysis.patterns.ci || 'None detected'}
- Containerized: ${analysis.patterns.containerization ? 'Yes (Docker)' : 'No'}
- Authentication: ${analysis.patterns.authentication}

## Dependencies
- Total packages: ${analysis.dependencies.total}
- Key dependencies: ${Object.keys(analysis.dependencies.production).slice(0, 10).join(', ')}

Based on this repository analysis, generate a COMPLETE change request document.

CRITICAL: For the ER diagram, include ALL these existing tables and show how new tables relate to them:
${analysis.database.tables.map(t => `- ${t}`).join('\n')}

Ensure all code examples match the detected framework (${analysis.structure.framework}) and language patterns.`;
  },

  erDiagramRequest: (changeRequest, existingTables) => `Based on this change request: "${changeRequest}"
And these existing database tables: ${existingTables.join(', ')}

Generate a Mermaid ER diagram showing:
1. The existing tables (simplified with key fields only)
2. New tables needed for this change
3. Relationships between existing and new tables

Return ONLY the Mermaid diagram syntax, nothing else.`
};