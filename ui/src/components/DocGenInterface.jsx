import { useState, useEffect } from 'react'
import { Github, Play, Loader2, CheckCircle, AlertCircle, Clock, FileText, Zap } from 'lucide-react'
import { api } from '../services/api'

function DocBotInterface({ onJobStart, onLogReceived, currentJob, workflowStatus, workflowError }) {
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sseConnection, setSseConnection] = useState(null)

  useEffect(() => {
    if (workflowError) {
      setError(workflowError)
      setLoading(false)
    }
  }, [workflowError])

  useEffect(() => {
    return () => {
      if (sseConnection) {
        sseConnection.close()
      }
    }
  }, [sseConnection])

  useEffect(() => {
    if (currentJob && !sseConnection) {
      console.log('Connecting to SSE for job:', currentJob)

      const eventSource = api.connectToLogs(
        currentJob,
        (log) => {
          console.log('Received log:', log)
          onLogReceived(log)

          if (log.log_type === 'success' && log.message.includes('complete')) {
            setLoading(false)
          } else if (log.log_type === 'error') {
            setLoading(false)
          }
        },
        (error) => {
          console.error('SSE connection error:', error)
          setError('Connection to the server was lost. Please try again.')
          setLoading(false)
        }
      )

      setSseConnection(eventSource)

      return () => {
        console.log('Closing SSE connection')
        eventSource.close()
      }
    }
  }, [currentJob])

  useEffect(() => {
    if (workflowStatus === 'completed' || workflowStatus === 'failed') {
      setLoading(false)
    }
  }, [workflowStatus])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!repoUrl.trim()) {
        throw new Error('Please enter a GitHub repository URL.')
      }

      if (!repoUrl.includes('github.com')) {
        throw new Error('Please provide a valid GitHub repository URL (e.g., https://github.com/username/repository)')
      }

      const response = await api.generateDocs(repoUrl)
      onJobStart(response.job_id)

    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to start documentation generation. Please try again.'
      setError(errorMessage)
      setLoading(false)
    }
  }

  const isDisabled = loading || workflowStatus === 'running'

  const getStatusMessage = () => {
    switch (workflowStatus) {
      case 'running':
        return {
          icon: <Zap className="w-5 h-5 animate-pulse" />,
          className: 'status-running',
          text: 'text-cloud2-purple',
          message: 'AI agents are analyzing your repository and generating documentation. Click "View Logs" to watch the progress.'
        }
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          className: 'status-completed',
          text: 'text-cloud2-success',
          message: 'Documentation generation complete! Check the generated README below.'
        }
      case 'failed':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          className: 'status-failed',
          text: 'text-cloud2-error',
          message: workflowError || 'Documentation generation failed. Please check the logs for details.'
        }
      default:
        return null
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <div className="innovation-card p-6 sm:p-8">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-cloud2-purple-50 rounded-button">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-cloud2-purple" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Generate Documentation</h2>
        </div>
        <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Enter a GitHub repository URL to automatically generate comprehensive, AI-powered documentation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Repository URL Input */}
        <div>
          <label htmlFor="repoUrl" className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            GitHub Repository URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Github className="w-5 h-5 text-cloud2-purple" />
            </div>
            <input
              type="text"
              id="repoUrl"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              disabled={isDisabled}
              className="w-full pl-12 pr-4 py-3 rounded-button input-focus disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
              style={{
                backgroundColor: 'var(--bg-white)',
                border: '2px solid var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            Max repo size: 10GB. Analyzes up to 500 files (1MB max each, up to 500 lines/file). All limits configurable in backend .env
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 status-failed rounded-button border-l-4 border-cloud2-error">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-cloud2-error flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-cloud2-error">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-cloud2-error hover:text-red-400 text-xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isDisabled}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 btn-primary text-white rounded-button font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-card hover:shadow-card-hover"
        >
          {loading || workflowStatus === 'running' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Documentation...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Generate Documentation</span>
            </>
          )}
        </button>
      </form>

      {/* Workflow Status */}
      {currentJob && statusInfo && (
        <div className={`mt-6 p-4 rounded-button ${statusInfo.className} border-l-4`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {statusInfo.icon}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${statusInfo.text}`}>
                {statusInfo.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocBotInterface
