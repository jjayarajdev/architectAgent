'use client';

import { useState } from 'react';
import { GitBranch, Loader2, Send } from 'lucide-react';

interface SimpleInput {
  repository: {
    url: string;
    branch: string;
  };
  changeRequest: {
    title: string;
    description: string;
    type: string;
  };
}

interface SimpleInputFormProps {
  onSubmit: (input: SimpleInput) => void;
  isLoading: boolean;
}

export default function SimpleInputForm({ onSubmit, isLoading }: SimpleInputFormProps) {
  const [formData, setFormData] = useState<SimpleInput>({
    repository: {
      url: '',
      branch: 'main'
    },
    changeRequest: {
      title: '',
      description: '',
      type: 'feature'
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl p-6 card-shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <GitBranch className="h-5 w-5 mr-2 text-blue-500" />
          Repository Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Repository URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://github.com/username/repository"
              value={formData.repository.url}
              onChange={(e) => setFormData({
                ...formData,
                repository: { ...formData.repository, url: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <input
              type="text"
              placeholder="main"
              value={formData.repository.branch}
              onChange={(e) => setFormData({
                ...formData,
                repository: { ...formData.repository, branch: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 card-shadow">
        <h2 className="text-xl font-semibold mb-4">
          Proposed Change
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Change Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Add internal referral prioritization"
              value={formData.changeRequest.title}
              onChange={(e) => setFormData({
                ...formData,
                changeRequest: { ...formData.changeRequest, title: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the change in detail. What problem does it solve? What are the key requirements?"
              value={formData.changeRequest.description}
              onChange={(e) => setFormData({
                ...formData,
                changeRequest: { ...formData.changeRequest, description: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Be specific about the functionality, user impact, and any technical requirements.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Change Type
            </label>
            <select
              value={formData.changeRequest.type}
              onChange={(e) => setFormData({
                ...formData,
                changeRequest: { ...formData.changeRequest, type: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="feature">New Feature</option>
              <option value="enhancement">Enhancement</option>
              <option value="integration">Integration</option>
              <option value="migration">Migration</option>
              <option value="refactoring">Refactoring</option>
              <option value="security">Security Update</option>
              <option value="performance">Performance Improvement</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
        <p className="text-sm text-blue-800">
          Our EA Suite will analyze your repository's actual code, architecture, and data models to generate a comprehensive Sprint 0 review including:
        </p>
        <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
          <li>• Detailed impact analysis on existing code and architecture</li>
          <li>• Specific reusable components and integration points</li>
          <li>• Database schema changes and data flow</li>
          <li>• ROI calculations and implementation roadmap</li>
          <li>• Risk assessment and mitigation strategies</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Analyzing Repository...
          </>
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            Generate Sprint 0 EA Review
          </>
        )}
      </button>
    </form>
  );
}