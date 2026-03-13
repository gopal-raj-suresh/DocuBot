import { useState, useEffect } from 'react'
import Header from './components/Header'
import DocBotInterface from './components/DocGenInterface'
import FloatingLogsPanel from './components/FloatingLogsPanel'
import ResultsViewer from './components/ResultsViewer'
import ProjectSelector from './components/ProjectSelector'
import CosmicBackground from './components/CosmicBackground'
import StatusRibbon from './components/StatusRibbon'
import { api } from './services/api'

function App() {
  const [currentJob, setCurrentJob] = useState(null)
  const [logs, setLogs] = useState([])
  const [logsOpen, setLogsOpen] = useState(false)
  const [generatedReadme, setGeneratedReadme] = useState(null)
  const [workflowStatus, setWorkflowStatus] = useState('idle')
  const [workflowError, setWorkflowError] = useState(null)
  const [awaitingProjectSelection, setAwaitingProjectSelection] = useState(false)
  const [detectedProjects, setDetectedProjects] = useState(null)
  const [skippedFolders, setSkippedFolders] = useState(null)
  const [theme, setTheme] = useState('light')

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Poll job status to check for project selection
  useEffect(() => {
    if (!currentJob || workflowStatus === 'completed' || workflowStatus === 'failed') {
      return
    }

    const pollInterval = setInterval(async () => {
      try {
        const status = await api.getJobStatus(currentJob)

        if (status.awaiting_project_selection && !awaitingProjectSelection) {
          console.log('DEBUG: API Status Response:', status)
          console.log('DEBUG: Skipped Folders from API:', status.skipped_folders)
          setAwaitingProjectSelection(true)
          setDetectedProjects(status.detected_projects)
          setSkippedFolders(status.skipped_folders || [])
          setWorkflowStatus('awaiting_selection')
        }

        if (status.error_message && status.status === 'failed') {
          setWorkflowError(status.error_message)
          setWorkflowStatus('failed')
        }
      } catch (error) {
        console.error('Failed to poll job status:', error)
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [currentJob, workflowStatus, awaitingProjectSelection])

  const handleJobStart = (jobId) => {
    setCurrentJob(jobId)
    setLogs([])
    setGeneratedReadme(null)
    setWorkflowStatus('running')
    setWorkflowError(null)
    setAwaitingProjectSelection(false)
    setDetectedProjects(null)
    setSkippedFolders(null)
  }

  const handleLogReceived = (log) => {
    setLogs(prevLogs => [...prevLogs, log])

    if (log.log_type === 'success' && log.message.includes('Documentation generation complete')) {
      setWorkflowStatus('completed')
    } else if (log.log_type === 'error') {
      setWorkflowStatus('failed')
    }
  }

  const handleReadmeGenerated = (readme) => {
    setGeneratedReadme(readme)
  }

  const handleProjectsSelected = () => {
    setAwaitingProjectSelection(false)
    setDetectedProjects(null)
    setSkippedFolders(null)
    setWorkflowStatus('running')
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--bg-white)' }}>
      {/* Cosmic Background */}
      <CosmicBackground />

      {/* Header */}
      <Header
        onLogsToggle={() => setLogsOpen(!logsOpen)}
        hasActiveJob={!!currentJob}
        workflowStatus={workflowStatus}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />

      {/* Main Content */}
      <main className="relative z-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl pb-16 sm:pb-20">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-cloud2-purple/20 mb-3 sm:mb-4" style={{ backgroundColor: 'var(--bg-gray-50)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-cloud2-purple" />
            <span className="font-mono text-[10px] sm:text-[11px] text-cloud2-purple tracking-widest uppercase font-semibold">
              Cloud2 Labs Innovation Hub
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 sm:mb-3 leading-tight tracking-tight px-2">
            <span style={{ color: 'var(--text-primary)' }}>Intelligent README</span>
            <br />
            <span className="text-cloud2-purple font-extrabold">
              Documentation Generator
            </span>
          </h1>

          <p className="text-xs sm:text-sm lg:text-base max-w-2xl mx-auto mb-4 sm:mb-6 leading-relaxed px-4" style={{ color: 'var(--text-secondary)' }}>
            Point DocuBot at any GitHub repository. Our agentic AI scans the codebase, understands the architecture,
            and generates production-ready README documentation — automatically.
          </p>

          <div className="flex flex-wrap justify-center gap-2 px-2">
            {['Agentic AI', 'GitHub Integration', 'Markdown Export', 'Multi-Project Support', 'Real-time Analysis'].map((tag) => (
              <div key={tag} className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded font-mono text-[9px] sm:text-[10px]" style={{ border: '1px solid var(--border-primary)', color: 'var(--text-tertiary)' }}>
                {tag}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* Input Section */}
          <DocBotInterface
            onJobStart={handleJobStart}
            onLogReceived={handleLogReceived}
            currentJob={currentJob}
            workflowStatus={workflowStatus}
            workflowError={workflowError}
          />

          {/* Project Selection Section (Conditional) */}
          {awaitingProjectSelection && detectedProjects && (
            <div className="animate-fadeIn">
              <ProjectSelector
                currentJob={currentJob}
                detectedProjects={detectedProjects}
                skippedFolders={skippedFolders}
                onProjectsSelected={handleProjectsSelected}
              />
            </div>
          )}

          {/* Results Section (Conditional) */}
          {workflowStatus === 'completed' && (
            <div className="animate-fadeIn">
              <ResultsViewer
                readme={generatedReadme}
                onReadmeGenerated={handleReadmeGenerated}
                currentJob={currentJob}
                workflowStatus={workflowStatus}
              />
            </div>
          )}
        </div>
      </main>

      {/* Status Ribbon */}
      <StatusRibbon
        currentJob={currentJob}
        workflowStatus={workflowStatus}
        selectedProjectsCount={detectedProjects?.length || 0}
        logsCount={logs.length}
        onOpenLogs={() => setLogsOpen(true)}
      />

      {/* Floating Logs Panel */}
      <FloatingLogsPanel
        isOpen={logsOpen}
        onClose={() => setLogsOpen(false)}
        logs={logs}
        currentJob={currentJob}
      />
    </div>
  )
}

export default App
