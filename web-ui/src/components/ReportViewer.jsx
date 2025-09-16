import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import MermaidDiagram from './MermaidDiagram'
import { 
  Download, 
  Share2, 
  Copy, 
  CheckCircle, 
  FileText, 
  Calendar,
  GitBranch,
  Database,
  Layers,
  Code2
} from 'lucide-react'

const ReportViewer = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState('report')
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const downloadReport = () => {
    const blob = new Blob([data.document || 'No content available'], { 
      type: 'text/markdown' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ea-assessment-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const analysisStats = data?.analysis ? [
    {
      icon: Code2,
      label: 'Project Type',
      value: data.analysis.structure?.type || 'Unknown',
      color: 'blue'
    },
    {
      icon: Layers,
      label: 'Framework',
      value: data.analysis.structure?.framework || 'Custom',
      color: 'purple'
    },
    {
      icon: Database,
      label: 'Database Tables',
      value: data.analysis.database?.tables?.length || 0,
      color: 'green'
    },
    {
      icon: GitBranch,
      label: 'API Routes',
      value: data.analysis.api?.routes?.length || 0,
      color: 'orange'
    },
  ] : []

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Enterprise Architecture Assessment
            </h1>
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              Generated on {new Date().toLocaleDateString()}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyToClipboard(data.document || '')}
              className="btn-secondary flex items-center space-x-2"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            
            <button
              onClick={downloadReport}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Stats */}
      {analysisStats.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {analysisStats.map((stat, index) => {
            const Icon = stat.icon
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600 border-blue-200',
              purple: 'bg-purple-50 text-purple-600 border-purple-200',
              green: 'bg-green-50 text-green-600 border-green-200',
              orange: 'bg-orange-50 text-orange-600 border-orange-200'
            }
            
            return (
              <div
                key={index}
                className={`
                  p-4 rounded-lg border-2 ${colorClasses[stat.color]}
                  card-hover
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-75">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className="w-8 h-8 opacity-50" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('report')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'report' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              Assessment Report
            </button>
            {data?.analysis && (
              <button
                onClick={() => setActiveTab('analysis')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'analysis' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                Raw Analysis
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'report' && (
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const codeString = String(children).replace(/\n$/, '')
                    
                    // Check if it's a mermaid diagram
                    if (!inline && match && match[1] === 'mermaid') {
                      return <MermaidDiagram chart={codeString} />
                    }
                    
                    // Regular code highlighting
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg"
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-100 rounded px-1" {...props}>
                        {children}
                      </code>
                    )
                  },
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t border-gray-200">
                      {children}
                    </td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                      {children}
                    </blockquote>
                  )
                }}
              >
                {data?.document || '# No content available\n\nThe assessment document could not be loaded.'}
              </ReactMarkdown>
            </div>
          )}

          {activeTab === 'analysis' && data?.analysis && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Raw Analysis Data</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(data.analysis, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-8 text-center">
        <button
          onClick={onBack}
          className="btn-secondary"
        >
          Generate New Assessment
        </button>
      </div>
    </div>
  )
}

export default ReportViewer