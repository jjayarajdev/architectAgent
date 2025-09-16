import { useState } from 'react'
import { GitBranch, Zap, FileText, Settings } from 'lucide-react'
import RequestForm from './components/RequestForm'
import ReportViewer from './components/ReportViewer'
import LoadingState from './components/LoadingState'

function App() {
  const [currentView, setCurrentView] = useState('form') // 'form', 'loading', 'report'
  const [reportData, setReportData] = useState(null)
  const [progress, setProgress] = useState(0)

  const handleFormSubmit = async (formData) => {
    setCurrentView('loading')
    setProgress(10)

    try {
      setProgress(30)
      const response = await fetch('/api/generate-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      setProgress(60)
      
      if (!response.ok) {
        throw new Error('Failed to generate assessment')
      }

      const result = await response.json()
      setProgress(100)
      
      setTimeout(() => {
        setReportData(result)
        setCurrentView('report')
      }, 500)

    } catch (error) {
      console.error('Error generating assessment:', error)
      alert('Failed to generate assessment: ' + error.message)
      setCurrentView('form')
    }
  }

  const handleBackToForm = () => {
    setCurrentView('form')
    setReportData(null)
    setProgress(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EA Generator
              </h1>
            </div>
            
            {currentView === 'report' && (
              <button
                onClick={handleBackToForm}
                className="btn-secondary flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>New Assessment</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'form' && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Generate Enterprise Architecture Assessment
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Analyze your repository and get comprehensive change request assessments 
                with implementation details, ER diagrams, and technical recommendations.
              </p>
            </div>
            
            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 card-hover">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <GitBranch className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Repository Analysis</h3>
                <p className="text-gray-600">
                  Deep analysis of code structure, database schema, and architecture patterns
                </p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 card-hover">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-gray-600">
                  LLM-generated assessments with implementation strategies and recommendations
                </p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 card-hover">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Comprehensive Reports</h3>
                <p className="text-gray-600">
                  Detailed markdown reports with ER diagrams, test strategies, and more
                </p>
              </div>
            </div>

            <RequestForm onSubmit={handleFormSubmit} />
          </div>
        )}

        {currentView === 'loading' && (
          <LoadingState progress={progress} />
        )}

        {currentView === 'report' && reportData && (
          <ReportViewer 
            data={reportData} 
            onBack={handleBackToForm}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 EA Generator. Built with Claude Code.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App