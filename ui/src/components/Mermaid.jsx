import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

function Mermaid({ chart }) {
  const containerRef = useRef(null)
  const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`)
  const [isDark, setIsDark] = useState(false)

  // Detect dark mode from CSS variable
  useEffect(() => {
    const detectDarkMode = () => {
      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-primary')
        .trim()
      // If background is dark (close to #1a1a1a or similar), use dark theme
      setIsDark(bgColor.includes('#1a') || bgColor.includes('#0f') || bgColor.includes('18, 18, 18'))
    }

    detectDarkMode()

    // Listen for theme changes
    const observer = new MutationObserver(detectDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Reinitialize mermaid with theme based on dark mode
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'strict',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      themeVariables: isDark ? {
        darkMode: true,
        background: '#1a1a1a',
        primaryColor: '#8b5cf6',
        primaryTextColor: '#e5e7eb',
        primaryBorderColor: '#4b5563',
        lineColor: '#6b7280',
        secondaryColor: '#374151',
        tertiaryColor: '#1f2937',
        textColor: '#e5e7eb',
        fontSize: '16px'
      } : {}
    })
  }, [isDark])

  useEffect(() => {
    if (containerRef.current && chart) {
      const renderDiagram = async () => {
        try {
          // Clear previous content
          containerRef.current.innerHTML = ''

          // Generate new ID for each render to avoid conflicts
          const newId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

          // Render the mermaid chart
          const { svg } = await mermaid.render(newId, chart)
          containerRef.current.innerHTML = svg

          // Apply dark mode styling to SVG if needed
          if (isDark) {
            const svgElement = containerRef.current.querySelector('svg')
            if (svgElement) {
              svgElement.style.backgroundColor = 'transparent'
              svgElement.style.color = '#e5e7eb'
            }
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error)
          const errorColor = isDark ? '#ef4444' : 'red'
          containerRef.current.innerHTML = `<pre style="color: ${errorColor}; padding: 1rem; background: ${isDark ? '#1f2937' : '#fee'};  border-radius: 8px;">Error rendering diagram: ${error.message}</pre>`
        }
      }

      renderDiagram()
    }
  }, [chart, isDark])

  return <div ref={containerRef} style={{ minHeight: '200px' }} />
}

export default Mermaid
