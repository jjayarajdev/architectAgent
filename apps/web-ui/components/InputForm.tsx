'use client';

import { useState } from 'react';
import {
  GitBranch,
  FileText,
  Users,
  Clock,
  Shield,
  Cloud,
  Database,
  Zap,
  ChevronRight,
  Plus,
  X,
  Info
} from 'lucide-react';
import { AnalysisInput } from '@/types';

interface InputFormProps {
  onSubmit: (input: AnalysisInput) => void;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [formData, setFormData] = useState<AnalysisInput>({
    repository: {
      url: '',
      branch: 'main'
    },
    changeRequest: {
      title: '',
      description: '',
      type: 'feature',
      functionalAreas: [],
      businessObjectives: [],
      constraints: [],
      timeline: '6-12 weeks'
    },
    context: {
      architectureStyle: 'microservices',
      cloudPlatform: 'AWS',
      supportModel: 'business-hours',
      compliance: []
    }
  });

  const [newObjective, setNewObjective] = useState('');
  const [newConstraint, setNewConstraint] = useState('');

  const functionalAreaOptions = [
    'Authentication & Authorization',
    'Data Processing',
    'API/Services',
    'User Interface',
    'Database',
    'Infrastructure',
    'Integrations',
    'Analytics',
    'Monitoring',
    'Security',
    'Workflow Management',
    'Notification System'
  ];

  const complianceOptions = [
    'GDPR',
    'SOC2',
    'HIPAA',
    'PCI-DSS',
    'ISO 27001',
    'CCPA',
    'FedRAMP',
    'NIST'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData({
        ...formData,
        changeRequest: {
          ...formData.changeRequest,
          businessObjectives: [...formData.changeRequest.businessObjectives, newObjective.trim()]
        }
      });
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setFormData({
      ...formData,
      changeRequest: {
        ...formData.changeRequest,
        businessObjectives: formData.changeRequest.businessObjectives.filter((_, i) => i !== index)
      }
    });
  };

  const addConstraint = () => {
    if (newConstraint.trim()) {
      setFormData({
        ...formData,
        changeRequest: {
          ...formData.changeRequest,
          constraints: [...formData.changeRequest.constraints, newConstraint.trim()]
        }
      });
      setNewConstraint('');
    }
  };

  const removeConstraint = (index: number) => {
    setFormData({
      ...formData,
      changeRequest: {
        ...formData.changeRequest,
        constraints: formData.changeRequest.constraints.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Repository Section */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex items-center mb-4">
          <GitBranch className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold">Repository Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Repository URL *
            </label>
            <input
              type="url"
              required
              placeholder="https://github.com/username/repository.git"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.repository.url}
              onChange={(e) => setFormData({
                ...formData,
                repository: { ...formData.repository, url: e.target.value }
              })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <input
              type="text"
              placeholder="main"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.repository.branch}
              onChange={(e) => setFormData({
                ...formData,
                repository: { ...formData.repository, branch: e.target.value }
              })}
            />
          </div>
        </div>
      </div>

      {/* Change Request Section */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-green-500 mr-2" />
          <h2 className="text-xl font-semibold">Change Request Details</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Change Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Add Internal Referral Prioritization System"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.changeRequest.title}
              onChange={(e) => setFormData({
                ...formData,
                changeRequest: { ...formData.changeRequest, title: e.target.value }
              })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the change request in detail..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.changeRequest.description}
              onChange={(e) => setFormData({
                ...formData,
                changeRequest: { ...formData.changeRequest, description: e.target.value }
              })}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Change Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.changeRequest.type}
                onChange={(e) => setFormData({
                  ...formData,
                  changeRequest: { ...formData.changeRequest, type: e.target.value }
                })}
              >
                <option value="feature">New Feature</option>
                <option value="api">API Addition</option>
                <option value="integration">Integration</option>
                <option value="refactor">Refactoring</option>
                <option value="performance">Performance</option>
                <option value="security">Security</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeline
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.changeRequest.timeline}
                onChange={(e) => setFormData({
                  ...formData,
                  changeRequest: { ...formData.changeRequest, timeline: e.target.value }
                })}
              >
                <option value="2-4 weeks">2-4 weeks</option>
                <option value="6-12 weeks">6-12 weeks</option>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Functional Areas
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {functionalAreaOptions.map((area) => (
                <label key={area} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 rounded"
                    checked={formData.changeRequest.functionalAreas.includes(area)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          changeRequest: {
                            ...formData.changeRequest,
                            functionalAreas: [...formData.changeRequest.functionalAreas, area]
                          }
                        });
                      } else {
                        setFormData({
                          ...formData,
                          changeRequest: {
                            ...formData.changeRequest,
                            functionalAreas: formData.changeRequest.functionalAreas.filter(a => a !== area)
                          }
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Objectives
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a business objective..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
              />
              <button
                type="button"
                onClick={addObjective}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {formData.changeRequest.businessObjectives.map((obj, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm">{obj}</span>
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Constraints
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a constraint..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newConstraint}
                onChange={(e) => setNewConstraint(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConstraint())}
              />
              <button
                type="button"
                onClick={addConstraint}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {formData.changeRequest.constraints.map((constraint, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm">{constraint}</span>
                  <button
                    type="button"
                    onClick={() => removeConstraint(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Context Section */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex items-center mb-4">
          <Cloud className="h-5 w-5 text-purple-500 mr-2" />
          <h2 className="text-xl font-semibold">Enterprise Context</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Architecture Style
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.context.architectureStyle}
              onChange={(e) => setFormData({
                ...formData,
                context: { ...formData.context, architectureStyle: e.target.value }
              })}
            >
              <option value="microservices">Microservices</option>
              <option value="modular-monolith">Modular Monolith</option>
              <option value="monolith">Monolith</option>
              <option value="serverless">Serverless</option>
              <option value="event-driven">Event-Driven</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cloud Platform
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.context.cloudPlatform}
              onChange={(e) => setFormData({
                ...formData,
                context: { ...formData.context, cloudPlatform: e.target.value }
              })}
            >
              <option value="AWS">AWS</option>
              <option value="Azure">Azure</option>
              <option value="GCP">Google Cloud</option>
              <option value="on-premise">On-Premise</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Support Model
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.context.supportModel}
              onChange={(e) => setFormData({
                ...formData,
                context: { ...formData.context, supportModel: e.target.value }
              })}
            >
              <option value="24x7">24x7</option>
              <option value="business-hours">Business Hours</option>
              <option value="on-call">On-Call</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compliance Requirements
            </label>
            <div className="space-y-1 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {complianceOptions.map((compliance) => (
                <label key={compliance} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 rounded"
                    checked={formData.context.compliance.includes(compliance)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          context: {
                            ...formData.context,
                            compliance: [...formData.context.compliance, compliance]
                          }
                        });
                      } else {
                        setFormData({
                          ...formData,
                          context: {
                            ...formData.context,
                            compliance: formData.context.compliance.filter(c => c !== compliance)
                          }
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{compliance}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">What happens next?</p>
          <p>Once you submit, our MCP EA Suite will:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Clone and analyze your repository structure</li>
            <li>Generate comprehensive Sprint 0 EA review</li>
            <li>Create architecture diagrams and documentation</li>
            <li>Provide risk assessment and implementation roadmap</li>
            <li>Calculate ROI and business metrics</li>
          </ul>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>
              Start Analysis
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}