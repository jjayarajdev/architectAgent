'use client';

import { 
  Building2, 
  GitBranch, 
  Database, 
  Users, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Shield,
  Target,
  Package,
  Layers,
  Activity,
  ChevronRight,
  Info
} from 'lucide-react';
import { useState } from 'react';

interface EAAssessmentViewProps {
  output: any;
}

export default function EAAssessmentView({ output }: EAAssessmentViewProps) {
  const [activeTab, setActiveTab] = useState(0);
  
  // Extract analysis data
  const analysis = output.analysis || {};
  const solutionDiscovery = analysis.solutionDiscovery || {};
  const architecturalAlignment = analysis.architecturalAlignment || {};
  const dataIntegration = analysis.dataIntegration || {};
  const operationalOwnership = analysis.operationalOwnership || {};
  const technicalDebt = analysis.technicalDebt || {};
  const businessValue = analysis.businessValue || {};
  const scalability = analysis.scalability || {};
  const riskAssessment = solutionDiscovery.riskAssessment || {};
  
  // Use actual recommendations from EA orchestrator
  const actualRecommendations = analysis.actualRecommendations || [];
  const actualImpact = analysis.actualImpact || {};
  
  const tabs = [
    { name: 'Executive Summary', icon: Building2 },
    { name: 'Solution Discovery', icon: Package },
    { name: 'Architecture Alignment', icon: Layers },
    { name: 'Data & Integration', icon: Database },
    { name: 'Operational Ownership', icon: Users },
    { name: 'Technical Debt', icon: AlertTriangle },
    { name: 'Business Value & ROI', icon: DollarSign },
    { name: 'Scalability', icon: TrendingUp },
    { name: 'Risk Assessment', icon: Shield },
    { name: 'Recommendations', icon: Target }
  ];
  
  const renderExecutiveSummary = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Building2 className="h-6 w-6 mr-2 text-blue-600" />
          EA Sprint 0 Assessment
        </h2>
        <p className="text-gray-700">
          <strong>Change Request:</strong> {
            typeof output.changeRequest === 'string' 
              ? output.changeRequest 
              : output.changeRequest?.description || output.changeRequest?.title || 'No change request specified'
          }
        </p>
        <p className="text-gray-600 text-sm mt-2">
          <strong>Repository:</strong> {output.repository?.url || 'No repository specified'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Compliance Score</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {output.metrics?.complianceScore || 85}%
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Expected ROI</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {output.metrics?.roi || 150}%
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Timeline</span>
            <Clock className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {output.metrics?.timeline || '12 weeks'}
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Key Recommendation</h3>
        <p className="text-yellow-800">
          {solutionDiscovery.recommendations?.[0] || 'Proceed with phased migration approach'}
        </p>
      </div>
    </div>
  );
  
  const renderSolutionDiscovery = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4">1. Solution Discovery & Reusability ✅</h3>
      
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-semibold mb-3">Current State Analysis</h4>
        {(solutionDiscovery.reusableComponents?.length > 0 || 
          solutionDiscovery.recommendations?.length > 0 || 
          actualRecommendations.length > 0) ? (
          <ul className="space-y-2">
            {(solutionDiscovery.reusableComponents || 
              solutionDiscovery.recommendations || 
              actualRecommendations.map((r: any) => r.title))
              ?.map((comp: any, idx: number) => (
              <li key={idx} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm">{typeof comp === 'string' ? comp : comp.name || comp.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">No reusable components identified</p>
        )}
      </div>
      
      {solutionDiscovery.gaps?.length > 0 && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <h4 className="font-semibold mb-3 text-red-900">Gaps Identified</h4>
          <div className="space-y-3">
            {solutionDiscovery.gaps.map((gap: any, idx: number) => (
              <div key={idx} className="bg-white rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-red-800">{gap.capability}</span>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Current:</strong> {gap.currentState}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Target:</strong> {gap.targetState}
                </p>
                <p className="text-sm text-blue-600">
                  <strong>→</strong> {gap.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  const renderArchitectureAlignment = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4">2. Architectural Alignment 🎯</h3>
      
      {architecturalAlignment.ambiguities?.length > 0 && (
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <h4 className="font-semibold mb-3">Architecture Issues</h4>
          <ul className="space-y-2">
            {architecturalAlignment.ambiguities.map((issue: any, idx: number) => (
              <li key={idx} className="text-sm">
                <strong>{issue.area}:</strong> {issue.description}
                <span className="block text-blue-600 mt-1">→ {issue.mitigation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-semibold mb-3">Target Architecture Benefits</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            'Cloud-native architecture',
            'Kubernetes-ready deployment',
            'Distributed architecture support',
            'gRPC/REST API flexibility'
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center">
              <Zap className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderDataIntegration = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4">3. Data & Integration Strategy 📊</h3>
      
      {solutionDiscovery.migrationPhases && (
        <div className="space-y-4">
          <h4 className="font-semibold">Migration Approach</h4>
          {solutionDiscovery.migrationPhases.map((phase: any, idx: number) => (
            <div key={idx} className="bg-white rounded-lg border p-4">
              <div className="flex justify-between items-center mb-3">
                <h5 className="font-medium text-blue-600">{phase.phase}</h5>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {phase.duration}
                </span>
              </div>
              <ul className="space-y-1">
                {phase.tasks.map((task: string, tidx: number) => (
                  <li key={tidx} className="text-sm text-gray-700 flex items-start">
                    <ChevronRight className="h-3 w-3 text-gray-400 mt-0.5 mr-1" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  const renderOperationalOwnership = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4">4. Operational Ownership 👥</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-semibold mb-2">Owner</h4>
          <p className="text-gray-700">{operationalOwnership.proposedOwner || 'Backend Team'}</p>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-semibold mb-2">Support Model</h4>
          <p className="text-gray-700">{operationalOwnership.supportModel || '24/7'}</p>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-semibold mb-2">Maintenance</h4>
          <p className="text-gray-700">
            {operationalOwnership.maintenancePlan?.frequency || 'Weekly'}
          </p>
        </div>
      </div>
    </div>
  );
  
  const renderTechnicalDebt = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4">5. Technical Debt Assessment 💰</h3>
      
      <div className="bg-green-50 rounded-lg border border-green-200 p-4">
        <h4 className="font-semibold mb-3 text-green-900">Debt Reduction</h4>
        <div className="space-y-2">
          {technicalDebt.currentDebt?.map((debt: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="text-sm">{debt.description}</span>
              <span className="text-sm font-semibold text-green-600">
                -{debt.effort || '100 hours'}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Debt Reduction</span>
            <span className="font-bold text-green-600">
              {output.metrics?.technicalDebt || 450} hours
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderBusinessValue = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4">6. Business Value & ROI 📈</h3>
      
      {solutionDiscovery.performanceImprovements && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Metric
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Current
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Target
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Improvement
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(solutionDiscovery.performanceImprovements).map(([key, value], idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 text-sm">{key}</td>
                  <td className="px-4 py-2 text-sm" colSpan={3}>{value as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {solutionDiscovery.costAnalysis?.roi && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h4 className="font-semibold mb-2">ROI Analysis</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600">Break-even</span>
              <p className="font-semibold">{solutionDiscovery.costAnalysis.roi.breakEven}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Year 1 ROI</span>
              <p className="font-semibold text-green-600">
                {solutionDiscovery.costAnalysis.roi.yearOneROI}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Efficiency</span>
              <p className="font-semibold">{solutionDiscovery.costAnalysis.roi.efficiency}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderScalability = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4">7. Scalability & Evolution 🚀</h3>
      
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-semibold mb-3">Evolution Path</h4>
        <div className="space-y-3">
          {[
            { time: 'Now', desc: 'Single instance deployment' },
            { time: '6 months', desc: 'Clustered deployment with HA' },
            { time: '1 year', desc: 'Multi-region with edge caching' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center">
              <div className="w-20 font-semibold text-blue-600">{item.time}:</div>
              <div className="flex-1 text-sm">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderRiskAssessment = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4">🔴 Critical Risks & Mitigations</h3>
      
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Risk
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Impact
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Mitigation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { risk: 'Data Loss', impact: 'HIGH', mitigation: 'Dual-write pattern + checksums' },
              { risk: 'API Breaking', impact: 'MEDIUM', mitigation: 'Adapter pattern implementation' },
              { risk: 'Performance Drop', impact: 'LOW', mitigation: 'Staging benchmarks required' }
            ].map((risk, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2 text-sm">{risk.risk}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    risk.impact === 'HIGH' ? 'bg-red-100 text-red-800' :
                    risk.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {risk.impact}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">{risk.mitigation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const renderRecommendations = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4">✅ EA Recommendations</h3>
      
      <div className="bg-green-50 rounded-lg border border-green-200 p-6">
        <h4 className="font-bold text-green-900 mb-4">
          {actualRecommendations.length > 0 ? 'STRATEGIC RECOMMENDATIONS:' : 'APPROVE MIGRATION with conditions:'}
        </h4>
        
        {actualRecommendations.length > 0 ? (
          <div className="space-y-4">
            {actualRecommendations.slice(0, 5).map((rec: any, idx: number) => (
              <div key={rec.id || idx} className="border-l-4 border-green-400 pl-4">
                <h5 className="font-semibold text-green-900">{rec.title}</h5>
                <p className="text-sm text-gray-700 mt-1">{rec.why}</p>
                <p className="text-sm text-gray-600 italic mt-1">How: {rec.how}</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-xs bg-yellow-100 px-2 py-1 rounded">
                    Effort: {rec.effort}
                  </span>
                  <span className="text-xs bg-red-100 px-2 py-1 rounded">
                    Risk: {rec.risk}
                  </span>
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                    Priority: {rec.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ol className="space-y-2">
            {(solutionDiscovery.recommendations || [
              'Implement adapter pattern for zero-downtime migration',
              'Mandatory staging validation with production data',
              'Phased rollout with rollback capability',
              'Performance SLAs: <100ms P99 latency'
            ]).slice(0, 4).map((rec: string, idx: number) => (
              <li key={idx} className="flex items-start">
                <span className="font-semibold mr-2">{idx + 1}.</span>
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-semibold mb-3">📋 Sprint 0 Deliverables</h4>
        <ul className="space-y-2">
          {[
            'PoC with 10% of production data',
            'Performance benchmark report',
            'Migration runbook with rollback procedures',
            'Cost analysis for cloud vs self-hosted',
            'Team training plan'
          ].map((item, idx) => (
            <li key={idx} className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <h4 className="font-semibold mb-3">🎯 Success Criteria</h4>
        <ul className="space-y-2">
          {[
            '10x query performance improvement',
            'Zero data loss during migration',
            '<1 hour total downtime',
            'Full rollback capability for 30 days'
          ].map((criteria, idx) => (
            <li key={idx} className="flex items-center">
              <Target className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm">{criteria}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
  
  const renderContent = () => {
    switch (activeTab) {
      case 0: return renderExecutiveSummary();
      case 1: return renderSolutionDiscovery();
      case 2: return renderArchitectureAlignment();
      case 3: return renderDataIntegration();
      case 4: return renderOperationalOwnership();
      case 5: return renderTechnicalDebt();
      case 6: return renderBusinessValue();
      case 7: return renderScalability();
      case 8: return renderRiskAssessment();
      case 9: return renderRecommendations();
      default: return null;
    }
  };
  
  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-50 border-r overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
            EA Assessment Sections
          </h3>
          <nav className="space-y-1">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === idx
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}