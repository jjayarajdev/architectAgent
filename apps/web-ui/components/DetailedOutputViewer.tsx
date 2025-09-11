'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import EAAssessmentView from './EAAssessmentView';
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
  Code,
  TrendingUp,
  Target,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  FileDown,
  FileType,
  FileJson
} from 'lucide-react';
import mermaid from 'mermaid';
import { ExportUtils } from '@/utils/export-utils';

interface DetailedOutputViewerProps {
  output: any;
}

export default function DetailedOutputViewer({ output }: DetailedOutputViewerProps) {
  const [activeTab, setActiveTab] = useState('executive');
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
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
    
    if (activeTab === 'architecture' || activeTab === 'data') {
      mermaid.contentLoaded();
    }
  }, [activeTab]);

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
    { id: 'executive', label: 'Executive Summary', icon: FileText },
    { id: 'discovery', label: '1. Solution Discovery', icon: Target },
    { id: 'alignment', label: '2. Architecture', icon: GitBranch },
    { id: 'data', label: '3. Data & Integration', icon: Database },
    { id: 'ownership', label: '4. Ownership', icon: Users },
    { id: 'debt', label: '5. Tech Debt', icon: Code },
    { id: 'value', label: '6. Business Value', icon: DollarSign },
    { id: 'scalability', label: '7. Scalability', icon: Zap },
    { id: 'risks', label: 'Risk Assessment', icon: AlertTriangle },
    { id: 'roadmap', label: 'Roadmap', icon: TrendingUp }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'executive':
        return <ExecutiveSummaryTab output={output} />;
      case 'discovery':
        return <SolutionDiscoveryTab output={output} />;
      case 'alignment':
        return <ArchitectureAlignmentTab output={output} />;
      case 'data':
        return <DataIntegrationTab output={output} />;
      case 'ownership':
        return <OperationalOwnershipTab output={output} />;
      case 'debt':
        return <TechnicalDebtTab output={output} />;
      case 'value':
        return <BusinessValueTab output={output} />;
      case 'scalability':
        return <ScalabilityTab output={output} />;
      case 'risks':
        return <RiskAssessmentTab output={output} />;
      case 'roadmap':
        return <RoadmapTab output={output} />;
      default:
        return null;
    }
  };

  // Check if this is a vector DB migration or other infrastructure change
  const isInfrastructureChange = output.changeRequest?.type === 'infrastructure-change' ||
    output.changeRequest?.description?.toLowerCase().includes('migrate') ||
    output.changeRequest?.description?.toLowerCase().includes('qdrant');
  
  // Use the new EA Assessment view for infrastructure changes
  if (isInfrastructureChange) {
    return <EAAssessmentView output={output} />;
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Metrics */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{output.changeRequest?.title || 'Sprint 0 EA Review'}</h2>
            <p className="text-gray-600 mt-1">{output.repository?.url}</p>
            {output.analysis?.projectType && (
              <div className="flex items-center space-x-3 mt-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                  {output.analysis.projectType.replace(/-/g, ' ').toUpperCase()}
                </span>
                {output.analysis?.changeType && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                    {output.analysis.changeType.replace(/-/g, ' ').toUpperCase()}
                  </span>
                )}
              </div>
            )}
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
                      ExportUtils.downloadMarkdown(markdown, `sprint0-review-${Date.now()}.md`);
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
                      ExportUtils.downloadPDF(markdown, `sprint0-review-${Date.now()}.pdf`);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <FileType className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm text-gray-700">Download as PDF</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      ExportUtils.downloadDOCX(output, `sprint0-review-${Date.now()}`);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm text-gray-700">Download as Word</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard label="Reusable Components" value={String(output.metrics?.reusableComponents || output.repoAnalysis?.architecture?.stack?.length || 0)} color="blue" />
          <MetricCard label="ROI" value={output.metrics?.roi ? `${output.metrics.roi}%` : '157%'} color="green" />
          <MetricCard label="Payback Period" value={output.metrics?.paybackPeriod || '4.4 months'} color="purple" />
          <MetricCard label="Risk Items" value={output.metrics?.riskCount || '5'} color="yellow" />
          <MetricCard label="Timeline" value={output.metrics?.timeline || '12 weeks'} color="indigo" />
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
                  <span className="font-medium text-sm">{tab.label}</span>
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

// Metric Card Component
function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 text-blue-600',
    green: 'from-green-50 to-green-100 text-green-600',
    purple: 'from-purple-50 to-purple-100 text-purple-600',
    yellow: 'from-yellow-50 to-yellow-100 text-yellow-600',
    indigo: 'from-indigo-50 to-indigo-100 text-indigo-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} p-4 rounded-lg`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

// Tab Components
function ExecutiveSummaryTab({ output }: { output: any }) {
  return (
    <div className="prose max-w-none">
      <h3 className="text-xl font-bold mb-4">Executive Summary</h3>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {output.artifacts?.executiveSummary || output.executiveSummary || 'Loading executive summary...'}
      </ReactMarkdown>
    </div>
  );
}

function SolutionDiscoveryTab({ output }: { output: any }) {
  // Use actual data from backend analysis
  const actualStack = output.analysis?.actualArchitecture?.stack || output.repoAnalysis?.architecture?.stack || [];
  const actualDependencies = output.analysis?.actualDependencies || output.repoAnalysis?.dependencies || {};
  const actualFiles = output.analysis?.actualCodeMetrics?.files || output.repoAnalysis?.codeMetrics?.files || 0;
  
  const reusableComponents = output.analysis?.solutionDiscovery?.reusableComponents || 
    (actualStack.length > 0 ? actualStack.map((tech: string) => ({
      name: tech,
      location: 'Detected in repository',
      reusability: '100%',
      effort: 'LOW'
    })) : []);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Solution Discovery & Reusability Assessment</h3>
      
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Reusable Components</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reusability</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Integration Effort</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reusableComponents.map((comp: any, index: number) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{comp.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 font-mono">{comp.location}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className="text-green-600 font-semibold">{comp.reusability}</span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      comp.effort === 'LOW' ? 'bg-green-100 text-green-800' :
                      comp.effort === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {comp.effort}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">New Components Required</h4>
        <ul className="space-y-2">
          {output.analysis?.solutionDiscovery?.newComponents?.map((comp: any, index: number) => (
            <li key={index} className="flex items-start">
              <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
              <span className="text-sm"><strong>{comp.name || comp}</strong> - {comp.description || 'Implementation required'}</span>
            </li>
          )) || (
            <li className="text-sm text-gray-600">Analyzing required components based on change request...</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function ArchitectureAlignmentTab({ output }: { output: any }) {
  const projectType = output.analysis?.projectType || 'general';
  const changeType = output.analysis?.changeType || 'feature';
  const currentStack = output.analysis?.actualArchitecture?.stack || output.repoAnalysis?.architecture?.stack || [];
  const ambiguities = output.analysis?.architecturalAlignment?.ambiguities || [];
  const nonCompliance = output.analysis?.architecturalAlignment?.nonCompliance || [];
  
  // Adapt content based on project type
  const getArchitectureEnhancements = () => {
    if (projectType.startsWith('frontend-') && changeType === 'design-system') {
      return `const designSystemMigration = {
  themeLayer: {
    colorPalette: 'HPE brand colors',
    typography: 'HPE font system',
    spacing: 'HPE grid (8px base)',
    components: 'HPE component specifications'
  },
  componentLayer: {
    migration: [
      'Wrap Radix UI components with HPE theme',
      'Create HPE-compliant variants',
      'Update component props to match HPE API'
    ],
    newComponents: ['HPEButton', 'HPECard', 'HPEDataTable', 'HPENavigation']
  },
  buildConfiguration: {
    tailwind: 'Extend with HPE design tokens',
    cssVariables: 'HPE custom properties',
    assets: 'HPE icons and logos'
  }
};`;
    } else if (projectType.startsWith('backend-')) {
      return `const backendEnhancements = {
  apiLayer: {
    versioning: 'Implement API v2',
    authentication: 'Add OAuth 2.0',
    rateLimit: 'Add rate limiting middleware'
  },
  dataLayer: {
    optimization: 'Add database indexes',
    caching: 'Implement Redis cache',
    migration: 'Add migration scripts'
  },
  monitoring: {
    logging: 'Structured logging',
    metrics: 'Prometheus metrics',
    tracing: 'Distributed tracing'
  }
};`;
    } else if (projectType.startsWith('mobile-')) {
      return `const mobileEnhancements = {
  uiLayer: {
    responsive: 'Adaptive layouts',
    gestures: 'Touch optimizations',
    animations: 'Native transitions'
  },
  performance: {
    bundleSize: 'Code splitting',
    caching: 'Offline support',
    images: 'Lazy loading'
  },
  nativeFeatures: {
    notifications: 'Push notifications',
    storage: 'Secure storage',
    biometrics: 'Face/Touch ID'
  }
};`;
    }
    // Default/general enhancements
    return `const architectureEnhancements = {
  optimization: 'Performance improvements',
  security: 'Security hardening',
  scalability: 'Horizontal scaling'
};`;
  };
  
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Architectural Alignment & Gaps</h3>
      
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Current Architecture</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <ul className="space-y-2">
            {currentStack.length > 0 ? (
              currentStack.map((tech: string, index: number) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">{tech}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-600">No technology stack detected</li>
            )}
            {output.analysis?.actualDatabase?.type && output.analysis.actualDatabase.type !== 'unknown' && (
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Database: {output.analysis.actualDatabase.type}</span>
              </li>
            )}
            {output.analysis?.actualAPIs?.authentication && output.analysis.actualAPIs.authentication !== 'unknown' && (
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Authentication: {output.analysis.actualAPIs.authentication}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {ambiguities.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Architecture Ambiguities</h4>
          <div className="space-y-3">
            {ambiguities.map((item: any, index: number) => (
              <div key={index} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{item.area}</h5>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <p className="text-sm text-blue-600 mt-2">
                      <strong>Mitigation:</strong> {item.mitigation}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.severity === 'high' ? 'bg-red-100 text-red-800' :
                    item.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.severity?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nonCompliance.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Compliance Issues</h4>
          <div className="space-y-3">
            {nonCompliance.map((item: any, index: number) => (
              <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900">{item.standard}</h5>
                <p className="text-sm text-gray-600 mt-1">{item.violation}</p>
                <p className="text-sm text-red-600 mt-1">
                  <strong>Impact:</strong> {item.impact}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  <strong>Remediation:</strong> {item.remediation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-semibold mb-3">Proposed Architecture Enhancement</h4>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{getArchitectureEnhancements()}
        </pre>
      </div>
    </div>
  );
}

function DataIntegrationTab({ output }: { output: any }) {
  const projectType = output.analysis?.projectType || 'general';
  const changeType = output.analysis?.changeType || 'feature';
  const integrationData = output.analysis?.dataIntegration || {};
  
  // Render based on project type
  if (projectType.startsWith('frontend-')) {
    // Frontend-specific integration view
    const frontendData = output.analysis?.dataIntegration || {};
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">Frontend Architecture & Integration</h3>
        
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Current Technology Stack</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">Framework</h5>
              <p className="text-lg font-semibold">{frontendData.currentStack?.framework || 'Unknown'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">UI Library</h5>
              <p className="text-lg font-semibold">{frontendData.currentStack?.uiLibrary || 'None'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">Styling</h5>
              <p className="text-lg font-semibold">{frontendData.currentStack?.styling || 'CSS'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">State Management</h5>
              <p className="text-lg font-semibold">{frontendData.currentStack?.stateManagement || 'React State'}</p>
            </div>
          </div>
        </div>
        
        {changeType === 'design-system' && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3">HPE Design System Migration</h4>
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Component Updates</h5>
                <ul className="space-y-1">
                  {(frontendData.proposedChanges?.components || []).map((comp: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                      <span className="text-sm">{comp}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Styling Changes</h5>
                <ul className="space-y-1">
                  {(frontendData.proposedChanges?.styling || []).map((style: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span className="text-sm">{style}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Build & Development Tools</h4>
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">Bundler</td>
                <td className="px-4 py-2 text-sm">{frontendData.buildTools?.bundler || 'Unknown'}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">CSS Processor</td>
                <td className="px-4 py-2 text-sm">{frontendData.buildTools?.cssProcessor || 'Unknown'}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">TypeScript</td>
                <td className="px-4 py-2 text-sm">{frontendData.buildTools?.typescript || 'No'}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-700">Data Fetching</td>
                <td className="px-4 py-2 text-sm">{frontendData.apis?.dataFetching || 'fetch'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  // Mobile app projects
  if (projectType.startsWith('mobile-')) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">Mobile App Architecture & Integration</h3>
        
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Platform & Architecture</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">Platform</h5>
              <p className="text-lg font-semibold">{integrationData.platform || projectType}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">State Management</h5>
              <p className="text-lg font-semibold">{integrationData.architecture?.stateManagement || 'Default'}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Native Features</h4>
          <div className="space-y-2">
            {integrationData.nativeFeatures && Object.entries(integrationData.nativeFeatures).map(([feature, enabled]: [string, any]) => (
              <div key={feature} className="flex items-center">
                {enabled ? <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : <XCircle className="h-4 w-4 text-gray-400 mr-2" />}
                <span className="text-sm capitalize">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Machine Learning projects
  if (projectType === 'ml-data-science') {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">ML/Data Science Architecture</h3>
        
        <div className="mb-6">
          <h4 className="font-semibold mb-3">ML Framework & Tools</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">Framework</h5>
              <p className="text-lg font-semibold">{integrationData.framework || 'Custom'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">Model Serving</h5>
              <p className="text-lg font-semibold">{integrationData.modelManagement?.serving || 'Not configured'}</p>
            </div>
          </div>
        </div>
        
        {integrationData.infrastructure && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Infrastructure</h4>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="font-medium mr-2">GPU Support:</span> {integrationData.infrastructure.gpu ? 'Yes' : 'No'}
              </li>
              <li className="flex items-center">
                <span className="font-medium mr-2">Distributed:</span> {integrationData.infrastructure.distributed || 'No'}
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  }
  
  // Blockchain/Web3 projects
  if (projectType === 'blockchain-web3') {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">Blockchain/Web3 Architecture</h3>
        
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Blockchain Platform</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">Platform</h5>
              <p className="text-lg font-semibold">{integrationData.blockchain?.platform || 'Unknown'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">Smart Contracts</h5>
              <p className="text-lg font-semibold">{integrationData.blockchain?.smartContracts || 'None'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Backend API projects
  if (projectType.startsWith('backend-')) {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">Backend API Architecture</h3>
        
        <div className="mb-6">
          <h4 className="font-semibold mb-3">API Architecture</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">API Style</h5>
              <p className="text-lg font-semibold">{integrationData.apiArchitecture?.style || 'REST'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">Authentication</h5>
              <p className="text-lg font-semibold">{integrationData.apiArchitecture?.authentication || 'None'}</p>
            </div>
          </div>
        </div>
        
        {integrationData.database && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Database</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-2">Type</h5>
                <p className="text-lg font-semibold">{integrationData.database.type || 'Unknown'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-2">ORM</h5>
                <p className="text-lg font-semibold">{integrationData.database.orm || 'None'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Infrastructure as Code projects
  if (projectType === 'infrastructure-iac') {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">Infrastructure as Code</h3>
        
        <div className="mb-6">
          <h4 className="font-semibold mb-3">IaC Configuration</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">Tool</h5>
              <p className="text-lg font-semibold">{integrationData.iac?.tool || 'Unknown'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">Cloud Provider</h5>
              <p className="text-lg font-semibold">{integrationData.iac?.cloudProvider || 'Multi-cloud'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Default/General projects or fullstack
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Data & Integration Strategy</h3>
      
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Proposed Data Model</h4>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{output.analysis?.dataIntegration?.proposedChanges?.newTables?.length > 0 
  ? `-- New tables for ${output.changeRequest?.title}\n${output.analysis.dataIntegration.proposedChanges.newTables.map((t: string) => `CREATE TABLE ${t} (...);`).join('\n')}`
  : 'No database changes required'}
        </pre>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-3">Data Flow Architecture</h4>
        <div className="mermaid bg-gray-50 p-4 rounded-lg">
{`graph LR
    A[User Profile] -->|Updates| B[Employment History]
    B -->|Triggers| C[Relationship Discovery]
    C -->|Generates| D[Work Relationships]
    E[Referral Submission] -->|Queries| D
    D -->|Calculates| F[Priority Score]
    F -->|Updates| G[Referral Queue]
    G -->|Ordered by Score| H[HR Dashboard]`}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Integration Points</h4>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">System</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-2 text-sm">LinkedIn Import</td>
              <td className="px-4 py-2 text-sm">OAuth 2.0 API</td>
              <td className="px-4 py-2 text-sm">JSON</td>
              <td className="px-4 py-2 text-sm">On-demand</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm">HRIS Systems</td>
              <td className="px-4 py-2 text-sm">REST API</td>
              <td className="px-4 py-2 text-sm">JSON/XML</td>
              <td className="px-4 py-2 text-sm">Daily sync</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm">Background Check</td>
              <td className="px-4 py-2 text-sm">REST API</td>
              <td className="px-4 py-2 text-sm">JSON</td>
              <td className="px-4 py-2 text-sm">On-demand</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OperationalOwnershipTab({ output }: { output: any }) {
  const projectType = output.analysis?.projectType || 'general';
  const changeType = output.analysis?.changeType || 'feature';
  const ownership = output.analysis?.operationalOwnership || {};
  
  // Generate ownership model based on project type
  const getOwnershipModel = () => {
    if (projectType.startsWith('frontend-')) {
      return [
        { component: 'UI Components', owner: 'Frontend Team', backup: 'Design Team' },
        { component: 'Design System', owner: 'Design Team', backup: 'Frontend Team' },
        { component: 'Build Pipeline', owner: 'DevOps Team', backup: 'Frontend Team' },
        { component: 'CDN & Assets', owner: 'Infrastructure Team', backup: 'DevOps Team' }
      ];
    } else if (projectType.startsWith('backend-')) {
      return [
        { component: 'API Services', owner: 'Backend Team', backup: 'Platform Team' },
        { component: 'Database', owner: 'Data Team', backup: 'Backend Team' },
        { component: 'Infrastructure', owner: 'DevOps Team', backup: 'Platform Team' },
        { component: 'Monitoring', owner: 'SRE Team', backup: 'DevOps Team' }
      ];
    } else if (projectType.startsWith('mobile-')) {
      return [
        { component: 'iOS App', owner: 'Mobile Team', backup: 'Frontend Team' },
        { component: 'Android App', owner: 'Mobile Team', backup: 'Frontend Team' },
        { component: 'App Store', owner: 'Product Team', backup: 'Mobile Team' },
        { component: 'Push Services', owner: 'Backend Team', backup: 'Mobile Team' }
      ];
    }
    // Default ownership
    return [
      { component: 'Application', owner: ownership.proposedOwner || 'Product Team', backup: 'Engineering Team' },
      { component: 'Infrastructure', owner: 'DevOps Team', backup: 'SRE Team' },
      { component: 'Data', owner: 'Data Team', backup: 'Engineering Team' }
    ];
  };
  
  // Generate maintenance plan based on project type and change type
  const getMaintenancePlan = () => {
    if (projectType.startsWith('frontend-') && changeType === 'design-system') {
      return {
        daily: [
          'Review component usage metrics',
          'Monitor design system adoption',
          'Check accessibility compliance'
        ],
        weekly: [
          'Update component documentation',
          'Review design system feedback',
          'Publish component updates'
        ],
        monthly: [
          'Design system version release',
          'Component library audit',
          'Performance benchmarking'
        ]
      };
    } else if (projectType.startsWith('backend-')) {
      return {
        daily: [
          'Monitor API performance',
          'Check error rates',
          'Review system logs'
        ],
        weekly: [
          'Database optimization',
          'API usage analysis',
          'Security scan results'
        ],
        monthly: [
          'Capacity planning',
          'Dependency updates',
          'Architecture review'
        ]
      };
    } else if (projectType.startsWith('mobile-')) {
      return {
        daily: [
          'Crash report monitoring',
          'App store reviews',
          'Performance metrics'
        ],
        weekly: [
          'User analytics review',
          'A/B test results',
          'Feature flag updates'
        ],
        monthly: [
          'App store optimization',
          'Release planning',
          'User feedback analysis'
        ]
      };
    }
    // Default maintenance
    return {
      daily: ownership.maintenancePlan?.activities || ['System monitoring', 'Health checks'],
      weekly: ['Performance review', 'Security updates'],
      monthly: ['System updates', 'Compliance review']
    };
  };
  
  const ownershipModel = getOwnershipModel();
  const maintenancePlan = getMaintenancePlan();
  
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Operational Ownership & Support</h3>
      
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Project Characteristics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Files</p>
            <p className="text-lg font-semibold">{ownership.currentComplexity?.files || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Languages</p>
            <p className="text-lg font-semibold">{ownership.currentComplexity?.languages || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Dependencies</p>
            <p className="text-lg font-semibold">{ownership.currentComplexity?.dependencies || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Support Model</p>
            <p className="text-lg font-semibold">{ownership.supportModel || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Ownership Model</h4>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Backup</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ownershipModel.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2 text-sm font-medium">{item.component}</td>
                <td className="px-4 py-2 text-sm">{item.owner}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{item.backup}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Maintenance Plan</h4>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-4">
            <h5 className="font-medium">Daily Operations</h5>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              {(Array.isArray(maintenancePlan.daily) ? maintenancePlan.daily : [maintenancePlan.daily]).map((task, i) => (
                <li key={i}>• {task}</li>
              ))}
            </ul>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <h5 className="font-medium">Weekly Tasks</h5>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              {(Array.isArray(maintenancePlan.weekly) ? maintenancePlan.weekly : [maintenancePlan.weekly]).map((task, i) => (
                <li key={i}>• {task}</li>
              ))}
            </ul>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h5 className="font-medium">Monthly Activities</h5>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              {(Array.isArray(maintenancePlan.monthly) ? maintenancePlan.monthly : [maintenancePlan.monthly]).map((task, i) => (
                <li key={i}>• {task}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechnicalDebtTab({ output }: { output: any }) {
  // Use actual technical debt data from analysis
  const debtItems = output.analysis?.technicalDebt?.debtRegister || 
    (output.analysis?.actualCodeMetrics ? [
      { item: `Code files: ${output.analysis.actualCodeMetrics.files || 0}`, location: 'Repository', impact: 'INFO', priority: 'P3' },
      { item: `Test coverage: ${output.analysis.actualCodeMetrics.testCoverage || 'Unknown'}`, location: 'Tests', impact: 'MEDIUM', priority: 'P2' }
    ] : [
      { item: 'Analyzing technical debt...', location: 'In progress', impact: 'INFO', priority: 'P3' }
    ]);
  
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Technical Debt & Modernization</h3>
      
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Current Technical Debt</h4>
        <div className="space-y-3">
          {debtItems.map((debt: any, index: number) => (
            <div key={index} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
              <div>
                <h5 className="font-medium text-gray-900">{debt.item}</h5>
                <p className="text-sm text-gray-600">{debt.location}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  debt.impact === 'HIGH' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {debt.impact}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                  {debt.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Simplification Opportunities</h4>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Simplified</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Benefit</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-2 text-sm">Manual SQL queries</td>
              <td className="px-4 py-2 text-sm">Prisma ORM</td>
              <td className="px-4 py-2 text-sm text-green-600">50% less code</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm">Individual API calls</td>
              <td className="px-4 py-2 text-sm">GraphQL</td>
              <td className="px-4 py-2 text-sm text-green-600">30% fewer requests</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm">Synchronous processing</td>
              <td className="px-4 py-2 text-sm">Queue-based</td>
              <td className="px-4 py-2 text-sm text-green-600">Better scalability</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BusinessValueTab({ output }: { output: any }) {
  const projectType = output.analysis?.projectType || 'general';
  const changeType = output.analysis?.changeType || 'general';
  
  // Adaptive value drivers based on project type
  const getValueDrivers = () => {
    if (projectType.startsWith('frontend-')) {
      if (changeType === 'design-system') {
        return [
          { metric: 'UI Consistency', current: '45%', target: '95%', improvement: '+111%' },
          { metric: 'Development Speed', current: '3 days/feature', target: '1 day/feature', improvement: '-67%' },
          { metric: 'Component Reuse', current: '20%', target: '80%', improvement: '+300%' },
          { metric: 'Maintenance Cost', current: '$8K/month', target: '$3K/month', improvement: '-63%' }
        ];
      }
      return [
        { metric: 'Page Load Time', current: '3.2s', target: '1.5s', improvement: '-53%' },
        { metric: 'User Engagement', current: '45%', target: '70%', improvement: '+56%' },
        { metric: 'Conversion Rate', current: '2.1%', target: '3.8%', improvement: '+81%' },
        { metric: 'Bounce Rate', current: '58%', target: '35%', improvement: '-40%' }
      ];
    } else if (projectType.startsWith('backend-')) {
      return [
        { metric: 'API Response Time', current: '450ms', target: '150ms', improvement: '-67%' },
        { metric: 'System Throughput', current: '500 req/s', target: '2000 req/s', improvement: '+300%' },
        { metric: 'Error Rate', current: '0.5%', target: '0.01%', improvement: '-98%' },
        { metric: 'Infrastructure Cost', current: '$12K/mo', target: '$7K/mo', improvement: '-42%' }
      ];
    } else if (projectType.startsWith('mobile-')) {
      return [
        { metric: 'App Launch Time', current: '4.5s', target: '1.2s', improvement: '-73%' },
        { metric: 'Crash Rate', current: '2.3%', target: '0.1%', improvement: '-96%' },
        { metric: 'App Store Rating', current: '3.2★', target: '4.5★', improvement: '+41%' },
        { metric: 'User Retention', current: '25%', target: '60%', improvement: '+140%' }
      ];
    } else if (projectType.includes('ml-') || projectType.includes('ai-')) {
      return [
        { metric: 'Model Accuracy', current: '78%', target: '95%', improvement: '+22%' },
        { metric: 'Training Time', current: '48 hours', target: '6 hours', improvement: '-88%' },
        { metric: 'Inference Speed', current: '200ms', target: '20ms', improvement: '-90%' },
        { metric: 'Data Processing', current: '10GB/hour', target: '100GB/hour', improvement: '+900%' }
      ];
    }
    // Default business metrics
    return [
      { metric: 'Process Efficiency', current: '60%', target: '85%', improvement: '+42%' },
      { metric: 'Time to Market', current: '6 months', target: '3 months', improvement: '-50%' },
      { metric: 'Operational Cost', current: '$50K/mo', target: '$30K/mo', improvement: '-40%' },
      { metric: 'Customer Satisfaction', current: '72%', target: '90%', improvement: '+25%' }
    ];
  };

  // Adaptive ROI calculation based on project type
  const getROIModel = () => {
    if (projectType.startsWith('frontend-')) {
      return `const roiCalculation = {
  costs: {
    uiRedesign: 80000,          // Design system implementation
    componentDevelopment: 60000, // Component library creation
    testing: 20000,             // Cross-browser testing
    training: 10000,            // Team training
    total: 170000
  },
  benefits: {
    reducedDevTime: 150000,     // 50% faster feature development
    improvedConversion: 200000,  // 81% better conversion rate
    reducedMaintenance: 100000,  // Less technical debt
    annualBenefit: 450000
  },
  metrics: {
    paybackPeriod: '4.5 months',
    threeYearROI: '694%',
    breakEvenPoint: 'Month 5'
  }
};`;
    } else if (projectType.startsWith('backend-')) {
      return `const roiCalculation = {
  costs: {
    apiRefactoring: 100000,     // API architecture improvement
    infrastructure: 40000,      // Cloud infrastructure upgrade
    monitoring: 15000,          // APM and logging setup
    migration: 25000,           // Data migration
    total: 180000
  },
  benefits: {
    reducedInfrastructure: 60000,  // 42% cost reduction
    improvedPerformance: 180000,   // 4x throughput improvement
    reducedIncidents: 120000,      // 98% fewer errors
    annualBenefit: 360000
  },
  metrics: {
    paybackPeriod: '6 months',
    threeYearROI: '500%',
    breakEvenPoint: 'Month 6'
  }
};`;
    }
    // Default ROI model
    return `const roiCalculation = {
  costs: {
    development: 150000,
    infrastructure: 30000,
    training: 15000,
    maintenance: 35000,
    total: 230000
  },
  benefits: {
    efficiencyGains: 200000,
    costReduction: 150000,
    revenueIncrease: 180000,
    annualBenefit: 530000
  },
  metrics: {
    paybackPeriod: '5.2 months',
    threeYearROI: '591%',
    breakEvenPoint: 'Month 6'
  }
};`;
  };

  // Adaptive success metrics
  const getSuccessMetrics = () => {
    if (projectType.startsWith('frontend-')) {
      return [
        { kpi: 'Core Web Vitals Score', target: '>90', timeline: '3 months' },
        { kpi: 'Component Coverage', target: '95%', timeline: '2 months' },
        { kpi: 'Accessibility Score', target: 'WCAG AAA', timeline: '4 months' },
        { kpi: 'Bundle Size Reduction', target: '-40%', timeline: 'Immediate' }
      ];
    } else if (projectType.startsWith('backend-')) {
      return [
        { kpi: 'API Response Time (P95)', target: '<200ms', timeline: 'Immediate' },
        { kpi: 'System Uptime', target: '99.99%', timeline: '3 months' },
        { kpi: 'Database Query Performance', target: '<50ms', timeline: '2 months' },
        { kpi: 'API Test Coverage', target: '>90%', timeline: '1 month' }
      ];
    } else if (projectType.startsWith('mobile-')) {
      return [
        { kpi: 'App Startup Time', target: '<2s', timeline: 'Immediate' },
        { kpi: 'Memory Usage', target: '<150MB', timeline: '2 months' },
        { kpi: 'Battery Impact', target: 'Low', timeline: '3 months' },
        { kpi: 'Offline Capability', target: '100%', timeline: '4 months' }
      ];
    }
    return [
      { kpi: 'System Performance', target: 'Optimized', timeline: 'Immediate' },
      { kpi: 'Code Quality Score', target: '>85', timeline: '2 months' },
      { kpi: 'Security Compliance', target: '100%', timeline: '3 months' },
      { kpi: 'User Satisfaction', target: '>90%', timeline: '6 months' }
    ];
  };

  const getTitle = () => {
    if (projectType.startsWith('frontend-')) return 'Frontend Business Value & ROI';
    if (projectType.startsWith('backend-')) return 'Backend Service Value & ROI';
    if (projectType.startsWith('mobile-')) return 'Mobile App Business Impact';
    if (projectType.includes('ml-')) return 'ML/AI Business Value & ROI';
    return 'Business Value & ROI Analysis';
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">{getTitle()}</h3>
      
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Value Drivers</h4>
        <div className="grid grid-cols-2 gap-4">
          {getValueDrivers().map((item, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-900">{item.metric}</h5>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-sm text-gray-600">{item.current}</span>
                <ChevronRight className="h-3 w-3 text-gray-400" />
                <span className="text-sm font-semibold text-blue-600">{item.target}</span>
                <span className="text-xs text-green-600 font-bold">{item.improvement}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-3">Financial Model</h4>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
          <pre className="text-sm overflow-x-auto">
{getROIModel()}
          </pre>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Success Metrics</h4>
        <div className="space-y-2">
          {getSuccessMetrics().map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">{metric.kpi}</span>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-blue-600 font-semibold">{metric.target}</span>
                <span className="text-xs text-gray-500">{metric.timeline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScalabilityTab({ output }: { output: any }) {
  const projectType = output.analysis?.projectType || 'general';
  const changeType = output.analysis?.changeType || 'general';
  
  // Adaptive bottlenecks based on project type
  const getBottlenecks = () => {
    if (projectType.startsWith('frontend-')) {
      return [
        { component: 'Bundle Size', current: '2.5MB', projected: '5MB with features', strategy: 'Code splitting, tree shaking' },
        { component: 'Initial Load', current: '3.2s', projected: '5s at scale', strategy: 'CDN, lazy loading, caching' },
        { component: 'Component Render', current: '50ms', projected: '200ms complex UI', strategy: 'React.memo, virtualization' },
        { component: 'State Management', current: 'Redux store', projected: '10MB state', strategy: 'State normalization, selectors' }
      ];
    } else if (projectType.startsWith('backend-')) {
      return [
        { component: 'Database Pool', current: '100 connections', projected: '5000 concurrent', strategy: 'Connection pooling, read replicas' },
        { component: 'API Gateway', current: '1000 req/s', projected: '10K req/s', strategy: 'Load balancing, rate limiting' },
        { component: 'Queue Processing', current: 'Single worker', projected: '1M jobs/day', strategy: 'Distributed workers, Redis queue' },
        { component: 'Cache Layer', current: 'In-memory', projected: 'TB-scale data', strategy: 'Redis cluster, multi-tier cache' }
      ];
    } else if (projectType.startsWith('mobile-')) {
      return [
        { component: 'App Size', current: '45MB', projected: '100MB with features', strategy: 'App thinning, on-demand resources' },
        { component: 'Memory Usage', current: '150MB', projected: '300MB peak', strategy: 'Memory optimization, lazy loading' },
        { component: 'Offline Storage', current: '100MB', projected: '1GB user data', strategy: 'SQLite optimization, data sync' },
        { component: 'Network Requests', current: 'HTTP/1.1', projected: '1000 req/min', strategy: 'HTTP/2, request batching' }
      ];
    } else if (projectType.includes('ml-')) {
      return [
        { component: 'Model Size', current: '500MB', projected: '5GB complex models', strategy: 'Model quantization, pruning' },
        { component: 'Inference Time', current: '200ms', projected: '10ms realtime', strategy: 'GPU acceleration, batching' },
        { component: 'Training Pipeline', current: 'Single GPU', projected: '100TB dataset', strategy: 'Distributed training, data sharding' },
        { component: 'Feature Store', current: 'Files', projected: '1M features/sec', strategy: 'Stream processing, feature cache' }
      ];
    }
    // Default bottlenecks
    return [
      { component: 'Processing', current: 'Single thread', projected: 'High concurrency', strategy: 'Multi-threading, async processing' },
      { component: 'Storage', current: '100GB', projected: '10TB', strategy: 'Distributed storage, archiving' },
      { component: 'Network', current: '100Mbps', projected: '10Gbps', strategy: 'CDN, edge computing' },
      { component: 'Memory', current: '8GB', projected: '128GB', strategy: 'Memory optimization, caching' }
    ];
  };

  // Adaptive evolution roadmap
  const getEvolutionRoadmap = () => {
    if (projectType.startsWith('frontend-')) {
      return [
        { phase: 'Sprint 1-2', title: 'Performance Foundation', items: ['Implement code splitting', 'Add lazy loading', 'Setup CDN'] },
        { phase: 'Sprint 3-4', title: 'Optimization Phase', items: ['Component memoization', 'Virtual scrolling', 'Service workers'] },
        { phase: '6-12 months', title: 'Scale Architecture', items: ['Micro-frontends', 'Edge rendering', 'Progressive enhancement'] }
      ];
    } else if (projectType.startsWith('backend-')) {
      return [
        { phase: 'Sprint 1-2', title: 'Infrastructure Setup', items: ['Database optimization', 'API rate limiting', 'Monitoring setup'] },
        { phase: 'Sprint 3-4', title: 'Scaling Components', items: ['Implement caching layer', 'Add message queue', 'Setup load balancer'] },
        { phase: '6-12 months', title: 'Enterprise Scale', items: ['Microservices migration', 'Event sourcing', 'Multi-region deployment'] }
      ];
    } else if (projectType.startsWith('mobile-')) {
      return [
        { phase: 'Sprint 1-2', title: 'App Optimization', items: ['Reduce app size', 'Memory profiling', 'Network optimization'] },
        { phase: 'Sprint 3-4', title: 'Performance Tuning', items: ['Implement caching', 'Background sync', 'Image optimization'] },
        { phase: '6-12 months', title: 'Scale Features', items: ['Offline-first architecture', 'Dynamic modules', 'A/B testing framework'] }
      ];
    }
    return [
      { phase: 'Sprint 1-2', title: 'Foundation', items: ['Performance baseline', 'Monitoring setup', 'Quick wins'] },
      { phase: 'Sprint 3-4', title: 'Optimization', items: ['Architecture improvements', 'Caching strategy', 'Load testing'] },
      { phase: '6-12 months', title: 'Scale', items: ['Distributed architecture', 'Auto-scaling', 'Global deployment'] }
    ];
  };

  // Adaptive performance targets
  const getPerformanceTargets = () => {
    if (projectType.startsWith('frontend-')) {
      return [
        { period: 'Immediate', metric: 'FCP < 1.5s', capacity: '1K users' },
        { period: '6 Months', metric: 'TTI < 3s', capacity: '10K users' },
        { period: '1 Year', metric: 'LCP < 2.5s', capacity: '100K users' }
      ];
    } else if (projectType.startsWith('backend-')) {
      return [
        { period: 'Immediate', metric: 'P95 < 200ms', capacity: '100 req/s' },
        { period: '6 Months', metric: 'P99 < 500ms', capacity: '1K req/s' },
        { period: '1 Year', metric: 'P99.9 < 1s', capacity: '10K req/s' }
      ];
    } else if (projectType.startsWith('mobile-')) {
      return [
        { period: 'Immediate', metric: 'Launch < 2s', capacity: '10K DAU' },
        { period: '6 Months', metric: 'Frame rate 60fps', capacity: '100K DAU' },
        { period: '1 Year', metric: 'Crash < 0.1%', capacity: '1M DAU' }
      ];
    }
    return [
      { period: 'Immediate', metric: 'Response < 500ms', capacity: '100 users' },
      { period: '6 Months', metric: 'Response < 200ms', capacity: '1K users' },
      { period: '1 Year', metric: 'Response < 100ms', capacity: '10K users' }
    ];
  };

  const getTitle = () => {
    if (projectType.startsWith('frontend-')) return 'Frontend Scalability & Performance';
    if (projectType.startsWith('backend-')) return 'Backend Scalability & Infrastructure';
    if (projectType.startsWith('mobile-')) return 'Mobile App Scalability';
    if (projectType.includes('ml-')) return 'ML/AI Scalability & Compute';
    return 'Scalability Planning & Evolution';
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">{getTitle()}</h3>
      
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Current Bottlenecks</h4>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current Limit</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Projected Load</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Strategy</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getBottlenecks().map((bottleneck, index) => (
              <tr key={index}>
                <td className="px-4 py-2 text-sm">{bottleneck.component}</td>
                <td className="px-4 py-2 text-sm">{bottleneck.current}</td>
                <td className="px-4 py-2 text-sm">{bottleneck.projected}</td>
                <td className="px-4 py-2 text-sm">{bottleneck.strategy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-3">Evolution Roadmap</h4>
        <div className="space-y-3">
          {getEvolutionRoadmap().map((phase, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{phase.title}</h5>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{phase.phase}</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {phase.items.map((item, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Performance Targets</h4>
        <div className="grid grid-cols-3 gap-4">
          {getPerformanceTargets().map((target, index) => (
            <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg text-center">
              <h5 className="font-semibold text-indigo-900">{target.period}</h5>
              <p className="text-lg font-bold text-indigo-600 mt-2">{target.metric}</p>
              <p className="text-sm text-gray-600 mt-1">{target.capacity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RiskAssessmentTab({ output }: { output: any }) {
  const projectType = output.analysis?.projectType || 'general';
  const changeType = output.analysis?.changeType || 'general';
  
  // Adaptive risks based on project type
  const getRisks = () => {
    if (projectType.startsWith('frontend-')) {
      if (changeType === 'design-system') {
        return [
          { risk: 'Component Breaking Changes', probability: 'High', impact: 'HIGH', mitigation: 'Phased migration, backward compatibility layer' },
          { risk: 'Browser Compatibility Issues', probability: 'Medium', impact: 'MEDIUM', mitigation: 'Cross-browser testing, polyfills, progressive enhancement' },
          { risk: 'Design System Adoption', probability: 'Medium', impact: 'HIGH', mitigation: 'Training sessions, documentation, gradual rollout' },
          { risk: 'Performance Regression', probability: 'Low', impact: 'MEDIUM', mitigation: 'Performance monitoring, bundle analysis' }
        ];
      }
      return [
        { risk: 'Performance Degradation', probability: 'Medium', impact: 'HIGH', mitigation: 'Performance monitoring, code splitting, lazy loading' },
        { risk: 'SEO Impact', probability: 'Medium', impact: 'HIGH', mitigation: 'SSR/SSG implementation, meta tags, structured data' },
        { risk: 'Accessibility Violations', probability: 'High', impact: 'MEDIUM', mitigation: 'Automated testing, WCAG compliance, screen reader testing' },
        { risk: 'Bundle Size Growth', probability: 'High', impact: 'MEDIUM', mitigation: 'Tree shaking, dynamic imports, CDN usage' }
      ];
    } else if (projectType.startsWith('backend-')) {
      return [
        { risk: 'Data Loss/Corruption', probability: 'Low', impact: 'CRITICAL', mitigation: 'Backup strategy, transaction logs, data validation' },
        { risk: 'Security Vulnerabilities', probability: 'Medium', impact: 'HIGH', mitigation: 'Security audits, penetration testing, OWASP compliance' },
        { risk: 'API Breaking Changes', probability: 'Medium', impact: 'HIGH', mitigation: 'API versioning, deprecation notices, backward compatibility' },
        { risk: 'Scalability Bottlenecks', probability: 'High', impact: 'HIGH', mitigation: 'Load testing, horizontal scaling, caching layer' }
      ];
    } else if (projectType.startsWith('mobile-')) {
      return [
        { risk: 'App Store Rejection', probability: 'Medium', impact: 'CRITICAL', mitigation: 'Guidelines compliance, pre-review testing, fallback plans' },
        { risk: 'Device Fragmentation', probability: 'High', impact: 'MEDIUM', mitigation: 'Device testing lab, responsive design, feature detection' },
        { risk: 'Battery/Memory Issues', probability: 'Medium', impact: 'HIGH', mitigation: 'Profiling tools, background task optimization, memory management' },
        { risk: 'Network Connectivity', probability: 'High', impact: 'MEDIUM', mitigation: 'Offline mode, retry logic, data synchronization' }
      ];
    } else if (projectType.includes('ml-')) {
      return [
        { risk: 'Model Bias/Fairness', probability: 'High', impact: 'CRITICAL', mitigation: 'Bias detection tools, diverse training data, regular audits' },
        { risk: 'Data Privacy Violations', probability: 'Medium', impact: 'CRITICAL', mitigation: 'Data anonymization, GDPR compliance, consent management' },
        { risk: 'Model Drift', probability: 'High', impact: 'HIGH', mitigation: 'Continuous monitoring, A/B testing, regular retraining' },
        { risk: 'Infrastructure Costs', probability: 'High', impact: 'MEDIUM', mitigation: 'Resource optimization, spot instances, model compression' }
      ];
    } else if (projectType.includes('blockchain')) {
      return [
        { risk: 'Smart Contract Vulnerabilities', probability: 'Medium', impact: 'CRITICAL', mitigation: 'Security audits, formal verification, bug bounties' },
        { risk: 'Gas Fee Volatility', probability: 'High', impact: 'HIGH', mitigation: 'Gas optimization, Layer 2 solutions, fee estimation' },
        { risk: 'Regulatory Compliance', probability: 'High', impact: 'CRITICAL', mitigation: 'Legal review, KYC/AML implementation, jurisdiction analysis' },
        { risk: 'Network Congestion', probability: 'Medium', impact: 'MEDIUM', mitigation: 'Off-chain processing, sidechains, queue management' }
      ];
    }
    // Default risks
    return [
      { risk: 'Technical Debt Accumulation', probability: 'High', impact: 'MEDIUM', mitigation: 'Code reviews, refactoring sprints, documentation' },
      { risk: 'Knowledge Transfer', probability: 'Medium', impact: 'HIGH', mitigation: 'Documentation, pair programming, training sessions' },
      { risk: 'Integration Failures', probability: 'Medium', impact: 'HIGH', mitigation: 'Integration testing, contract testing, monitoring' },
      { risk: 'Budget Overrun', probability: 'Medium', impact: 'MEDIUM', mitigation: 'Agile approach, regular reviews, contingency planning' }
    ];
  };

  const getTitle = () => {
    if (projectType.startsWith('frontend-')) return 'Frontend Risk Assessment & Mitigation';
    if (projectType.startsWith('backend-')) return 'Backend Risk Assessment & Security';
    if (projectType.startsWith('mobile-')) return 'Mobile App Risk Analysis';
    if (projectType.includes('ml-')) return 'ML/AI Risk Assessment & Ethics';
    if (projectType.includes('blockchain')) return 'Blockchain Risk & Security Assessment';
    return 'Risk Assessment & Mitigation';
  };

  const risks = getRisks();

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">{getTitle()}</h3>
      
      <div className="space-y-4">
        {risks.map((risk, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900">{risk.risk}</h4>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  risk.probability === 'High' ? 'bg-yellow-100 text-yellow-800' :
                  risk.probability === 'Low' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {risk.probability}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  risk.impact === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                  risk.impact === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {risk.impact}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              <strong>Mitigation:</strong> {risk.mitigation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadmapTab({ output }: { output: any }) {
  const projectType = output.analysis?.projectType || 'general';
  const changeType = output.analysis?.changeType || 'general';
  
  // Adaptive roadmap phases based on project type
  const getRoadmapPhases = () => {
    if (projectType.startsWith('frontend-')) {
      if (changeType === 'design-system') {
        return [
          {
            sprint: 'Sprint 0',
            status: 'completed',
            title: 'Design System Planning',
            tasks: ['Component audit', 'Design token definition', 'Migration strategy', 'Stakeholder alignment']
          },
          {
            sprint: 'Sprint 1-2',
            status: 'upcoming',
            title: 'Core Components',
            tasks: ['Setup component library', 'Implement base components', 'Create Storybook documentation', 'Setup design tokens']
          },
          {
            sprint: 'Sprint 3-4',
            status: 'upcoming',
            title: 'Complex Components',
            tasks: ['Build composite components', 'Implement theming system', 'Add accessibility features', 'Create migration guides']
          },
          {
            sprint: 'Sprint 5-6',
            status: 'upcoming',
            title: 'Migration & Testing',
            tasks: ['Migrate critical pages', 'Visual regression testing', 'Performance optimization', 'Team training']
          }
        ];
      }
      return [
        {
          sprint: 'Sprint 0',
          status: 'completed',
          title: 'Frontend Architecture Planning',
          tasks: ['Performance audit', 'Tech stack evaluation', 'Component structure design', 'Build optimization strategy']
        },
        {
          sprint: 'Sprint 1-2',
          status: 'upcoming',
          title: 'Foundation Setup',
          tasks: ['Setup build pipeline', 'Implement routing', 'State management setup', 'Component architecture']
        },
        {
          sprint: 'Sprint 3-4',
          status: 'upcoming',
          title: 'Core Features',
          tasks: ['Build main UI components', 'Implement data fetching', 'Add authentication flow', 'Setup error handling']
        },
        {
          sprint: 'Sprint 5-6',
          status: 'upcoming',
          title: 'Polish & Optimization',
          tasks: ['Performance optimization', 'Accessibility improvements', 'Cross-browser testing', 'Documentation']
        }
      ];
    } else if (projectType.startsWith('backend-')) {
      return [
        {
          sprint: 'Sprint 0',
          status: 'completed',
          title: 'Backend Architecture Design',
          tasks: ['API design review', 'Database schema planning', 'Security assessment', 'Infrastructure planning']
        },
        {
          sprint: 'Sprint 1-2',
          status: 'upcoming',
          title: 'Core Infrastructure',
          tasks: ['Setup database layer', 'Implement core APIs', 'Authentication system', 'Logging & monitoring']
        },
        {
          sprint: 'Sprint 3-4',
          status: 'upcoming',
          title: 'Service Implementation',
          tasks: ['Business logic implementation', 'Integration points', 'Queue processing setup', 'Caching layer']
        },
        {
          sprint: 'Sprint 5-6',
          status: 'upcoming',
          title: 'Reliability & Scale',
          tasks: ['Load testing', 'Security hardening', 'Backup & recovery', 'API documentation']
        }
      ];
    } else if (projectType.startsWith('mobile-')) {
      return [
        {
          sprint: 'Sprint 0',
          status: 'completed',
          title: 'Mobile App Planning',
          tasks: ['Platform assessment', 'UI/UX design review', 'Device compatibility matrix', 'App store requirements']
        },
        {
          sprint: 'Sprint 1-2',
          status: 'upcoming',
          title: 'Core App Structure',
          tasks: ['Setup project structure', 'Navigation implementation', 'Core screens development', 'Local storage setup']
        },
        {
          sprint: 'Sprint 3-4',
          status: 'upcoming',
          title: 'Feature Development',
          tasks: ['Main features implementation', 'Push notifications', 'Offline mode', 'In-app purchases setup']
        },
        {
          sprint: 'Sprint 5-6',
          status: 'upcoming',
          title: 'Polish & Release',
          tasks: ['Performance optimization', 'Device testing', 'App store optimization', 'Beta testing program']
        }
      ];
    } else if (projectType.includes('ml-')) {
      return [
        {
          sprint: 'Sprint 0',
          status: 'completed',
          title: 'ML Pipeline Planning',
          tasks: ['Data assessment', 'Model architecture design', 'Infrastructure requirements', 'Performance benchmarks']
        },
        {
          sprint: 'Sprint 1-2',
          status: 'upcoming',
          title: 'Data Pipeline',
          tasks: ['Data ingestion setup', 'Feature engineering', 'Data validation', 'Storage optimization']
        },
        {
          sprint: 'Sprint 3-4',
          status: 'upcoming',
          title: 'Model Development',
          tasks: ['Model training pipeline', 'Hyperparameter tuning', 'Model validation', 'A/B testing framework']
        },
        {
          sprint: 'Sprint 5-6',
          status: 'upcoming',
          title: 'Production Deployment',
          tasks: ['Model serving setup', 'Monitoring & alerting', 'Performance optimization', 'Documentation & training']
        }
      ];
    } else if (projectType.includes('blockchain')) {
      return [
        {
          sprint: 'Sprint 0',
          status: 'completed',
          title: 'Blockchain Architecture',
          tasks: ['Smart contract design', 'Security audit planning', 'Network selection', 'Tokenomics design']
        },
        {
          sprint: 'Sprint 1-2',
          status: 'upcoming',
          title: 'Smart Contract Development',
          tasks: ['Core contract implementation', 'Unit testing', 'Gas optimization', 'Access control setup']
        },
        {
          sprint: 'Sprint 3-4',
          status: 'upcoming',
          title: 'Integration Layer',
          tasks: ['Web3 integration', 'Wallet connection', 'Transaction handling', 'Event monitoring']
        },
        {
          sprint: 'Sprint 5-6',
          status: 'upcoming',
          title: 'Security & Deployment',
          tasks: ['Security audit', 'Testnet deployment', 'Mainnet preparation', 'Documentation']
        }
      ];
    }
    // Default roadmap
    return [
      {
        sprint: 'Sprint 0',
        status: 'completed',
        title: 'Planning & Analysis',
        tasks: ['Requirements gathering', 'Architecture design', 'Risk assessment', 'Resource planning']
      },
      {
        sprint: 'Sprint 1-2',
        status: 'upcoming',
        title: 'Foundation Development',
        tasks: ['Core infrastructure setup', 'Basic functionality', 'Initial integrations', 'Development environment']
      },
      {
        sprint: 'Sprint 3-4',
        status: 'upcoming',
        title: 'Feature Implementation',
        tasks: ['Main features development', 'Integration points', 'User interface', 'Testing framework']
      },
      {
        sprint: 'Sprint 5-6',
        status: 'upcoming',
        title: 'Quality & Deployment',
        tasks: ['Testing & QA', 'Performance optimization', 'Documentation', 'Production deployment']
      }
    ];
  };

  const getTitle = () => {
    if (projectType.startsWith('frontend-')) {
      if (changeType === 'design-system') return 'Design System Implementation Roadmap';
      return 'Frontend Implementation Roadmap';
    }
    if (projectType.startsWith('backend-')) return 'Backend Development Roadmap';
    if (projectType.startsWith('mobile-')) return 'Mobile App Development Roadmap';
    if (projectType.includes('ml-')) return 'ML/AI Implementation Roadmap';
    if (projectType.includes('blockchain')) return 'Blockchain Development Roadmap';
    return 'Implementation Roadmap';
  };

  const phases = getRoadmapPhases();

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">{getTitle()}</h3>
      
      <div className="space-y-4">
        {phases.map((phase, index) => (
          <div key={index} className="relative">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  phase.status === 'completed' ? 'bg-green-500' :
                  phase.status === 'in-progress' ? 'bg-blue-500' :
                  'bg-gray-300'
                }`}>
                  {phase.status === 'completed' ? (
                    <CheckCircle className="h-6 w-6 text-white" />
                  ) : (
                    <span className="text-white font-semibold">{index + 1}</span>
                  )}
                </div>
                {index < phases.length - 1 && (
                  <div className="w-0.5 h-20 bg-gray-300 mx-auto mt-2"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{phase.title}</h4>
                    <span className="text-sm text-gray-500">{phase.sprint}</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {phase.tasks.map((task, i) => (
                      <li key={i} className="flex items-start">
                        <ChevronRight className="h-3 w-3 text-gray-400 mt-0.5 mr-1" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}