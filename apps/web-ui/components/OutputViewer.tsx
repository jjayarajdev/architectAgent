'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileText,
  GitBranch,
  Shield,
  Database,
  Users,
  DollarSign,
  Zap,
  AlertTriangle,
  Download,
  Eye,
  Code,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  FileDown,
  FileType,
  FileJson
} from 'lucide-react';
import { AnalysisOutput } from '@/types';
import mermaid from 'mermaid';
import { ExportUtils } from '@/utils/export-utils';

interface OutputViewerProps {
  output: AnalysisOutput;
}

export default function OutputViewer({ output }: OutputViewerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [diagramsRendered, setDiagramsRendered] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    // Initialize mermaid
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'default',
      themeVariables: {
        primaryColor: '#3B82F6',
        primaryTextColor: '#1F2937',
        primaryBorderColor: '#93C5FD',
        lineColor: '#6B7280',
        secondaryColor: '#EFF6FF',
        tertiaryColor: '#FEF3C7'
      }
    });

    // Render mermaid diagrams
    if (!diagramsRendered && activeTab === 'diagrams') {
      mermaid.contentLoaded();
      setDiagramsRendered(true);
    }
  }, [activeTab, diagramsRendered]);
  
  // Click outside handler for export menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showExportMenu && !target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'sprint0', label: 'Sprint 0 Review', icon: GitBranch },
    { id: 'architecture', label: 'Architecture', icon: Shield },
    { id: 'data', label: 'Data & Integration', icon: Database },
    { id: 'diagrams', label: 'Diagrams', icon: Code },
    { id: 'risks', label: 'Risks', icon: AlertTriangle },
    { id: 'roi', label: 'Business Value', icon: DollarSign },
    { id: 'roadmap', label: 'Roadmap', icon: Zap }
  ];

  const downloadArtifacts = () => {
    // Create a blob with all artifacts
    const content = JSON.stringify(output, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ea-artifacts-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab output={output} />;
      case 'sprint0':
        return <Sprint0Tab output={output} />;
      case 'architecture':
        return <ArchitectureTab output={output} />;
      case 'data':
        return <DataTab output={output} />;
      case 'diagrams':
        return <DiagramsTab output={output} />;
      case 'risks':
        return <RisksTab output={output} />;
      case 'roi':
        return <ROITab output={output} />;
      case 'roadmap':
        return <RoadmapTab output={output} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{output.changeRequest.title}</h2>
            <p className="text-gray-600 mt-1">{output.repository.url}</p>
          </div>
          <div className="relative export-menu-container">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      const markdown = ExportUtils.generateMarkdown(output);
                      ExportUtils.downloadMarkdown(markdown, `ea-review-${Date.now()}.md`);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <FileDown className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm text-gray-700">Download as Markdown</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const markdown = ExportUtils.generateMarkdown(output);
                      ExportUtils.downloadPDF(markdown, `ea-review-${Date.now()}.pdf`);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <FileType className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm text-gray-700">Download as PDF</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      ExportUtils.downloadDOCX(output, `ea-review-${Date.now()}`);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm text-gray-700">Download as Word</span>
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={() => {
                      downloadArtifacts();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <FileJson className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm text-gray-700">Download Raw JSON</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600 font-medium">Compliance Score</span>
              <Shield className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {output.metrics?.complianceScore || '85'}%
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600 font-medium">Expected ROI</span>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {output.metrics?.roi || '157'}%
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-600 font-medium">Risk Items</span>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-900 mt-1">
              {output.metrics?.riskCount || '5'}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-600 font-medium">Timeline</span>
              <Clock className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {output.changeRequest.timeline}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab({ output }: { output: AnalysisOutput }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Executive Summary</h3>
        <div className="prose prose-gray max-w-none">
          <p>{output.changeRequest.description}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Key Recommendations</h3>
        <div className="space-y-2">
          {output.analysis?.solutionDiscovery?.recommendations?.map((rec: string, index: number) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{rec}</span>
            </div>
          )) || (
            <>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Leverage existing authentication service for user management</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Implement microservices architecture for scalability</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Use event-driven architecture for loose coupling</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Business Objectives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {output.changeRequest.businessObjectives.map((obj, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-start">
              <ChevronRight className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{obj}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sprint0Tab({ output }: { output: AnalysisOutput }) {
  return (
    <div className="space-y-6">
      <div className="prose prose-gray max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {output.artifacts?.sprint0Review || `
# Sprint 0 EA Review

## 1. Solution Discovery & Reusability
- Identified ${output.analysis?.solutionDiscovery?.reusableComponents?.length || 5} reusable components
- Recommended leveraging existing services

## 2. Architectural Alignment
- Compliance Score: ${output.metrics?.complianceScore || 85}%
- ${output.analysis?.architecturalAlignment?.violations?.length || 2} violations found
- ${output.analysis?.architecturalAlignment?.ambiguities?.length || 3} ambiguities identified

## 3. Data & Integration Strategy
- Proposed data model with ${output.changeRequest.functionalAreas.length} entities
- Integration points defined

## 4. Operational Ownership
- Primary Owner: Product Engineering Team
- Support Model: ${output.context.supportModel}

## 5. Technical Debt
- ${output.analysis?.technicalDebt?.debtInventory?.length || 3} debt items identified
- Mitigation strategy defined

## 6. Business Value
- Expected ROI: ${output.metrics?.roi || 157}%
- Payback Period: 8 months

## 7. Scalability & Evolution
- 3-year scaling roadmap defined
- Performance targets established
          `}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function ArchitectureTab({ output }: { output: AnalysisOutput }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Architecture Style</h3>
        <p className="text-gray-700">{output.context.architectureStyle}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Key Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['Referral Service', 'Classification Engine', 'Priority Queue', 'Workflow Engine', 'Notification Service', 'Analytics Dashboard'].map((component, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="font-medium text-gray-900">{component}</div>
              <div className="text-sm text-gray-600 mt-1">Microservice implementation</div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Technology Stack</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="font-medium text-gray-700 w-32">Frontend:</span>
            <span className="text-gray-600">React, TypeScript, Tailwind CSS</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 w-32">Backend:</span>
            <span className="text-gray-600">Node.js, Express, PostgreSQL</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 w-32">Infrastructure:</span>
            <span className="text-gray-600">{output.context.cloudPlatform}, Kubernetes, Docker</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataTab({ output }: { output: AnalysisOutput }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Data Entities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['Referral', 'WorkHistory', 'PriorityScore', 'User', 'Notification', 'Analytics'].map((entity, index) => (
            <div key={index} className="bg-gray-50 px-3 py-2 rounded text-sm font-medium text-gray-700">
              {entity}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Integration Points</h3>
        <div className="space-y-3">
          {[
            { name: 'HR System', method: 'REST API', purpose: 'Work history verification' },
            { name: 'Email Service', method: 'SMTP/API', purpose: 'Notifications' },
            { name: 'Analytics Platform', method: 'Event Stream', purpose: 'Metrics tracking' }
          ].map((integration, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="font-medium text-gray-900">{integration.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Method:</span> {integration.method} | 
                <span className="font-medium ml-2">Purpose:</span> {integration.purpose}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiagramsTab({ output }: { output: AnalysisOutput }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">System Architecture</h3>
        <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
          <div className="mermaid">
            {output.diagrams?.systemArchitecture || `
graph TB
    subgraph "Presentation"
        WEB[Web App]
        MOB[Mobile]
    end
    subgraph "Services"
        API[API Gateway]
        SVC[Services]
    end
    subgraph "Data"
        DB[(Database)]
        CACHE[(Cache)]
    end
    WEB --> API
    MOB --> API
    API --> SVC
    SVC --> DB
    SVC --> CACHE
            `}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Data Flow</h3>
        <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
          <div className="mermaid">
            {output.diagrams?.dataFlow || `
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Service
    participant Database
    
    User->>Frontend: Submit Request
    Frontend->>API: API Call
    API->>Service: Process
    Service->>Database: Query
    Database-->>Service: Data
    Service-->>API: Response
    API-->>Frontend: Result
    Frontend-->>User: Display
            `}
          </div>
        </div>
      </div>
    </div>
  );
}

function RisksTab({ output }: { output: AnalysisOutput }) {
  const risks = output.analysis?.risks?.riskRegister || [
    { id: 'R001', risk: 'Integration failure', probability: 'Medium', impact: 'High', mitigation: 'Circuit breakers' },
    { id: 'R002', risk: 'Data breach', probability: 'Low', impact: 'Critical', mitigation: 'Encryption, audits' },
    { id: 'R003', risk: 'User adoption', probability: 'Medium', impact: 'High', mitigation: 'Training, phased rollout' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Risk Register</h3>
        <div className="space-y-3">
          {risks.map((risk: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{risk.id}: {risk.risk}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                      P: {risk.probability}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      I: {risk.impact}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">Mitigation:</span> {risk.mitigation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ROITab({ output }: { output: AnalysisOutput }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Financial Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Expected ROI</div>
            <div className="text-3xl font-bold text-green-900 mt-1">{output.metrics?.roi || 157}%</div>
            <div className="text-sm text-green-600 mt-1">Payback in 8 months</div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Annual Savings</div>
            <div className="text-3xl font-bold text-blue-900 mt-1">$750K</div>
            <div className="text-sm text-blue-600 mt-1">Through efficiency gains</div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Key Metrics</h3>
        <div className="space-y-2">
          {[
            { metric: 'Referral Quality', current: '65%', target: '85%' },
            { metric: 'Time to Hire', current: '45 days', target: '21 days' },
            { metric: 'Participation Rate', current: '25%', target: '45%' },
            { metric: 'Cost per Hire', current: '$4,500', target: '$2,500' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="font-medium text-gray-700">{item.metric}</span>
              <div className="text-sm">
                <span className="text-gray-500">{item.current}</span>
                <ChevronRight className="h-3 w-3 inline mx-1 text-gray-400" />
                <span className="text-green-600 font-medium">{item.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoadmapTab({ output }: { output: AnalysisOutput }) {
  const phases = output.analysis?.implementation?.phases || [
    { name: 'Sprint 0 - Planning', duration: '2 weeks', status: 'current' },
    { name: 'Sprint 1-2 - Foundation', duration: '4 weeks', status: 'upcoming' },
    { name: 'Sprint 3-4 - Development', duration: '4 weeks', status: 'upcoming' },
    { name: 'Sprint 5-6 - Testing', duration: '4 weeks', status: 'upcoming' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Implementation Timeline</h3>
        <div className="space-y-3">
          {phases.map((phase: any, index: number) => (
            <div key={index} className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                phase.status === 'current' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{phase.name}</div>
                <div className="text-sm text-gray-600">{phase.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
        <div className="space-y-2">
          {[
            'Review and approve architecture',
            'Allocate development resources',
            'Set up development environment',
            'Create Sprint 1 tickets',
            'Schedule stakeholder kickoff'
          ].map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="w-5 h-5 rounded border-2 border-gray-300 mr-3"></div>
              <span className="text-gray-700">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}