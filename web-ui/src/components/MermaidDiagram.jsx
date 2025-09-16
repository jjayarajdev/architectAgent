import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

const MermaidDiagram = ({ chart }) => {
  const containerRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!chart) return

    // Initialize mermaid with theme settings
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#fff',
        primaryBorderColor: '#2563eb',
        lineColor: '#5b21b6',
        secondaryColor: '#8b5cf6',
        tertiaryColor: '#ddd6fe',
        background: '#ffffff',
        mainBkg: '#eff6ff',
        secondBkg: '#faf5ff',
        tertiaryBkg: '#f3f4f6',
        secondaryBorderColor: '#e5e7eb',
        tertiaryBorderColor: '#f3f4f6',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '14px',
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        rankSpacing: 50,
        nodeSpacing: 30,
        padding: 15,
      },
      er: {
        diagramPadding: 20,
        layoutDirection: 'TB',
        minEntityWidth: 100,
        minEntityHeight: 75,
        entityPadding: 15,
        stroke: 'gray',
        fill: 'honeydew',
        fontSize: 12,
      },
    })

    const renderDiagram = async () => {
      if (!containerRef.current) return

      try {
        // Clear previous content
        containerRef.current.innerHTML = ''
        
        // Generate unique id for the diagram
        const id = `mermaid-${Date.now()}`
        
        // Create a div element for the diagram
        const element = document.createElement('div')
        element.id = id
        containerRef.current.appendChild(element)

        // Render the diagram
        const { svg } = await mermaid.render(id, chart)
        element.innerHTML = svg
        
        setError(null)
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError('Failed to render diagram. Please check the syntax.')
        
        // Show the raw code as fallback
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-red-600 text-sm font-medium mb-2">Failed to render diagram</p>
              <pre class="bg-gray-900 text-gray-300 p-4 rounded overflow-x-auto text-sm">
                <code>${chart.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
              </pre>
            </div>
          `
        }
      }
    }

    renderDiagram()
  }, [chart])

  return (
    <div className="mermaid-container my-6">
      <div 
        ref={containerRef} 
        className="flex justify-center items-center min-h-[200px] bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto"
        style={{ maxWidth: '100%' }}
      />
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}

export default MermaidDiagram