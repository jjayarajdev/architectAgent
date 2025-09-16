import { Zap, Database, Code, FileText } from 'lucide-react'

const LoadingState = ({ progress = 0 }) => {
  const getProgressText = () => {
    if (progress < 20) return 'Initializing analysis...'
    if (progress < 40) return 'Cloning repository...'
    if (progress < 60) return 'Analyzing code structure...'
    if (progress < 80) return 'Generating assessment...'
    return 'Finalizing report...'
  }

  const steps = [
    {
      icon: Code,
      title: 'Repository Analysis',
      description: 'Analyzing code structure, dependencies, and patterns',
      active: progress >= 10
    },
    {
      icon: Database,
      title: 'Database Schema',
      description: 'Extracting database models and relationships',
      active: progress >= 30
    },
    {
      icon: Zap,
      title: 'AI Assessment',
      description: 'Generating intelligent recommendations',
      active: progress >= 60
    },
    {
      icon: FileText,
      title: 'Report Generation',
      description: 'Compiling comprehensive documentation',
      active: progress >= 90
    }
  ]

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center animate-fade-in">
        {/* Main Loading Animation */}
        <div className="mb-8">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
              style={{ 
                animationDuration: '1s',
              }}
            ></div>
            <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-white animate-bounce-gentle" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Generating Your Assessment
          </h2>
          <p className="text-gray-600 mb-6">
            {getProgressText()}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-500">
            {progress}% complete
          </div>
        </div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-500
                  ${step.active 
                    ? 'bg-blue-50 border-blue-200 shadow-md' 
                    : 'bg-white/50 border-gray-200'
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className={`
                    p-2 rounded-lg transition-all duration-300
                    ${step.active 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-400'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className={`
                      font-semibold transition-colors duration-300
                      ${step.active ? 'text-blue-900' : 'text-gray-500'}
                    `}>
                      {step.title}
                    </h3>
                    <p className={`
                      text-sm transition-colors duration-300
                      ${step.active ? 'text-blue-700' : 'text-gray-400'}
                    `}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Fun Fact */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-blue-600">Did you know?</span> Our AI analyzes 
            thousands of lines of code in seconds to provide you with actionable insights and 
            implementation strategies tailored to your project.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingState