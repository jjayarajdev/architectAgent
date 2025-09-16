import { useState } from 'react'
import { Send, GitBranch, MessageSquare, Settings } from 'lucide-react'

const RequestForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    repositoryUrl: '',
    changeRequest: '',
    generateImplementationPlan: false,
    generateTestStrategy: false,
    generateERDiagram: true
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.repositoryUrl.trim() || !formData.changeRequest.trim()) {
      alert('Please fill in both repository URL and change request')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 animate-slide-up">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Repository URL */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <GitBranch className="w-4 h-4 mr-2" />
              Repository URL
            </label>
            <input
              type="url"
              value={formData.repositoryUrl}
              onChange={(e) => handleInputChange('repositoryUrl', e.target.value)}
              placeholder="https://github.com/user/repository.git"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Enter a GitHub repository URL or local path to analyze
            </p>
          </div>

          {/* Change Request */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              Change Request Description
            </label>
            <textarea
              value={formData.changeRequest}
              onChange={(e) => handleInputChange('changeRequest', e.target.value)}
              placeholder="Describe the change you want to implement (e.g., 'Add user authentication system with JWT tokens')"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Be specific about the functionality you want to add or modify
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Settings className="w-4 h-4 mr-2" />
              Generation Options
            </label>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="erDiagram"
                  checked={formData.generateERDiagram}
                  onChange={(e) => handleInputChange('generateERDiagram', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="erDiagram" className="ml-2 text-sm text-gray-700">
                  ER Diagram
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="implementationPlan"
                  checked={formData.generateImplementationPlan}
                  onChange={(e) => handleInputChange('generateImplementationPlan', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="implementationPlan" className="ml-2 text-sm text-gray-700">
                  Implementation Plan
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="testStrategy"
                  checked={formData.generateTestStrategy}
                  onChange={(e) => handleInputChange('generateTestStrategy', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="testStrategy" className="ml-2 text-sm text-gray-700">
                  Test Strategy
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting || !formData.repositoryUrl.trim() || !formData.changeRequest.trim()}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Generating Assessment...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Generate Assessment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Example URLs */}
      <div className="mt-8 bg-white/40 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Example Repositories</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleInputChange('repositoryUrl', 'https://github.com/jjayarajdev/Refermate.git')}
            className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
          >
            <div className="font-medium text-blue-600">ReferMate</div>
            <div className="text-sm text-gray-500">Professional referral management system</div>
          </button>
          
          <button
            type="button"
            onClick={() => handleInputChange('repositoryUrl', 'https://github.com/facebook/react.git')}
            className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
          >
            <div className="font-medium text-blue-600">React.js</div>
            <div className="text-sm text-gray-500">A JavaScript library for building user interfaces</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default RequestForm