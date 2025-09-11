'use client';

import { useState } from 'react';
import { 
  GitBranch, 
  FileText, 
  Building2, 
  Users, 
  Clock, 
  DollarSign, 
  Shield,
  Zap,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';
import SimpleInputForm from '@/components/SimpleInputForm';
import DetailedOutputViewer from '@/components/DetailedOutputViewer';
import { AnalysisInput, AnalysisOutput } from '@/types';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisOutput, setAnalysisOutput] = useState<AnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'input' | 'output'>('input');

  const handleAnalysis = async (input: any) => {
    setIsAnalyzing(true);
    setError(null);
    
    // Add default context if not provided
    const analysisInput: AnalysisInput = {
      ...input,
      context: input.context || {}
    };
    
    try {
      // Call the backend API
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisInput),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisOutput(data);
      setActiveView('output');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">MCP EA Suite</h1>
                <p className="text-sm text-gray-600">Enterprise Architecture Sprint 0 Analysis</p>
              </div>
            </div>
            
            {analysisOutput && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveView('input')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeView === 'input' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  Input
                </button>
                <button
                  onClick={() => setActiveView('output')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeView === 'output' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-2" />
                  Output
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Only show when no analysis */}
      {!analysisOutput && activeView === 'input' && (
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Sprint 0 Enterprise Architecture Review
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Analyze your repository and get comprehensive EA artifacts in minutes
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
                <div className="bg-white p-6 rounded-xl card-shadow">
                  <GitBranch className="h-10 w-10 text-blue-500 mb-3 mx-auto" />
                  <h3 className="font-semibold text-gray-900">Repository Analysis</h3>
                  <p className="text-sm text-gray-600 mt-2">Analyze any GitHub repository</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl card-shadow">
                  <Shield className="h-10 w-10 text-green-500 mb-3 mx-auto" />
                  <h3 className="font-semibold text-gray-900">Compliance Check</h3>
                  <p className="text-sm text-gray-600 mt-2">Architecture standards validation</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl card-shadow">
                  <Zap className="h-10 w-10 text-yellow-500 mb-3 mx-auto" />
                  <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
                  <p className="text-sm text-gray-600 mt-2">Identify and mitigate risks</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl card-shadow">
                  <DollarSign className="h-10 w-10 text-purple-500 mb-3 mx-auto" />
                  <h3 className="font-semibold text-gray-900">ROI Analysis</h3>
                  <p className="text-sm text-gray-600 mt-2">Business value & metrics</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {activeView === 'input' && (
          <SimpleInputForm 
            onSubmit={handleAnalysis} 
            isLoading={isAnalyzing}
          />
        )}

        {activeView === 'output' && analysisOutput && (
          <DetailedOutputViewer output={analysisOutput} />
        )}

        {isAnalyzing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Repository</h3>
                <p className="text-gray-600 text-center">
                  This may take a few moments while we analyze your repository and generate comprehensive EA artifacts...
                </p>
                <div className="mt-6 space-y-2 w-full">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Cloning repository
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 text-blue-500 mr-2 animate-spin" />
                    Analyzing architecture
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    Generating artifacts
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>MCP Enterprise Architecture Suite v2.0</p>
            <p className="mt-1">© 2025 - Powered by AI-driven architectural analysis</p>
          </div>
        </div>
      </footer>
    </div>
  );
}