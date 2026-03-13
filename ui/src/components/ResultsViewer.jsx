import { useState, useEffect } from 'react'
import { Download, Copy, Check, FileText, Loader2, AlertCircle, GitPullRequest, ExternalLink } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import Mermaid from './Mermaid'
import { api } from '../services/api'

// Import GitHub markdown CSS (includes dark mode support)
import 'github-markdown-css/github-markdown.css'
import 'highlight.js/styles/github-dark.css'

// Custom CSS override for markdown in our theme
const markdownStyles = `
  .markdown-body {
    background-color: transparent !important;
  }

  /* Dark mode overrides */
  [data-theme="dark"] .markdown-body,
  .dark .markdown-body {
    color-scheme: dark;
  }

  [data-theme="dark"] .markdown-body,
  .dark .markdown-body {
    color: var(--text-primary) !important;
  }

  [data-theme="dark"] .markdown-body h1,
  [data-theme="dark"] .markdown-body h2,
  [data-theme="dark"] .markdown-body h3,
  [data-theme="dark"] .markdown-body h4,
  [data-theme="dark"] .markdown-body h5,
  [data-theme="dark"] .markdown-body h6,
  .dark .markdown-body h1,
  .dark .markdown-body h2,
  .dark .markdown-body h3,
  .dark .markdown-body h4,
  .dark .markdown-body h5,
  .dark .markdown-body h6 {
    color: var(--text-primary) !important;
    border-bottom-color: var(--border-primary) !important;
  }

  [data-theme="dark"] .markdown-body a,
  .dark .markdown-body a {
    color: #8b5cf6 !important;
  }

  [data-theme="dark"] .markdown-body code,
  .dark .markdown-body code {
    background-color: var(--bg-gray-100) !important;
    color: var(--text-primary) !important;
  }

  [data-theme="dark"] .markdown-body pre,
  .dark .markdown-body pre {
    background-color: var(--bg-gray-100) !important;
  }

  [data-theme="dark"] .markdown-body table tr,
  .dark .markdown-body table tr {
    background-color: transparent !important;
    border-top-color: var(--border-primary) !important;
  }

  [data-theme="dark"] .markdown-body table th,
  [data-theme="dark"] .markdown-body table td,
  .dark .markdown-body table th,
  .dark .markdown-body table td {
    border-color: var(--border-primary) !important;
  }

  [data-theme="dark"] .markdown-body blockquote,
  .dark .markdown-body blockquote {
    color: var(--text-secondary) !important;
    border-left-color: var(--border-primary) !important;
  }

  [data-theme="dark"] .markdown-body hr,
  .dark .markdown-body hr {
    background-color: var(--border-primary) !important;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'markdown-dark-mode-styles'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = markdownStyles
    document.head.appendChild(style)
  }
}

function ResultsViewer({ readme, onReadmeGenerated, currentJob, workflowStatus }) {
  const [copied, setCopied] = useState(false)
  const [markdownContent, setMarkdownContent] = useState(null)
  const [projectTitle, setProjectTitle] = useState(null)
  const [creatingPR, setCreatingPR] = useState(false)
  const [prUrl, setPrUrl] = useState(null)
  const [prError, setPrError] = useState(null)

  const toTitleCase = (str) => {
    return str
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  useEffect(() => {
    if (markdownContent) {
      const lines = markdownContent.split('\n')
      for (let i = 0; i < Math.min(15, lines.length); i++) {
        const line = lines[i].trim()
        if (line.startsWith('## ')) {
          const title = line.substring(3).trim()
          setProjectTitle(toTitleCase(title))
          break
        } else if (line.startsWith('# ') && !line.startsWith('## ')) {
          const title = line.substring(2).trim()
          setProjectTitle(toTitleCase(title))
          break
        }
      }
    }
  }, [markdownContent])

  useEffect(() => {
    console.log('[ResultsViewer] useEffect triggered:', { workflowStatus, currentJob, hasMarkdown: !!markdownContent })
    if (workflowStatus === 'completed' && currentJob && !markdownContent) {
      console.log('[ResultsViewer] Conditions met - starting fetch')
      const fetchReadme = async () => {
        try {
          console.log('Fetching job status for:', currentJob)
          const jobStatus = await api.getJobStatus(currentJob)
          console.log('Job status:', jobStatus)

          if (jobStatus.readme_preview || jobStatus.status === 'completed') {
            try {
              const readmeBlob = await api.downloadReadme(currentJob)
              const readmeText = await readmeBlob.text()
              console.log('Downloaded README:', readmeText.substring(0, 100))
              setMarkdownContent(readmeText)
              if (onReadmeGenerated) {
                onReadmeGenerated(readmeText)
              }
            } catch (err) {
              console.warn('Could not download README, using preview:', err)
              if (jobStatus.readme_preview) {
                setMarkdownContent(jobStatus.readme_preview)
                if (onReadmeGenerated) {
                  onReadmeGenerated(jobStatus.readme_preview)
                }
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch README:', error)
        }
      }

      const timer = setTimeout(fetchReadme, 1000)
      return () => clearTimeout(timer)
    }
  }, [workflowStatus, currentJob, markdownContent])

  const handleCopy = async () => {
    if (markdownContent) {
      await navigator.clipboard.writeText(markdownContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (markdownContent) {
      const blob = new Blob([markdownContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'README.md'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleCreatePR = async () => {
    if (!currentJob) return

    setCreatingPR(true)
    setPrError(null)

    try {
      const result = await api.createPullRequest(currentJob)

      if (result.status === 'success') {
        setPrUrl(result.pr_url)
        console.log('PR created successfully:', result.pr_url)
      } else {
        setPrError(result.message || 'Failed to create PR')
      }
    } catch (error) {
      console.error('Failed to create PR:', error)
      setPrError(error.response?.data?.detail || error.message || 'Failed to create pull request')
    } finally {
      setCreatingPR(false)
    }
  }

  if (workflowStatus !== 'completed' || !markdownContent) {
    return null
  }

  return (
    <div className="innovation-card p-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b-2 border-cloud2-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cloud2-purple-50 rounded-button">
            <FileText className="w-7 h-7 text-cloud2-purple" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-cloud2-black">
              Generated README
            </h2>
            {projectTitle && (
              <p className="text-sm text-cloud2-gray-600 mt-1 font-medium">{projectTitle}</p>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            className="p-3 bg-cloud2-gray-50 hover:bg-cloud2-purple-50 border border-cloud2-gray-300 hover:border-cloud2-purple rounded-button transition-all shadow-card"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-5 h-5 text-cloud2-success" />
            ) : (
              <Copy className="w-5 h-5 text-cloud2-purple" />
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-3 bg-cloud2-gray-50 hover:bg-cloud2-purple-50 border border-cloud2-gray-300 hover:border-cloud2-purple rounded-button transition-all shadow-card"
            title="Download README.md"
          >
            <Download className="w-5 h-5 text-cloud2-purple" />
          </button>

          {/* Create PR Button */}
          {prUrl ? (
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 status-completed rounded-button transition-all shadow-card"
              title="View Pull Request"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm font-semibold text-cloud2-success">View PR</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <button
              onClick={handleCreatePR}
              disabled={creatingPR}
              className="flex items-center space-x-2 px-4 py-2 bg-cloud2-purple hover:bg-cloud2-purple-dark rounded-button disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white shadow-card hover:shadow-card-hover"
              title="Create Pull Request on GitHub"
            >
              {creatingPR ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-semibold">Creating PR...</span>
                </>
              ) : (
                <>
                  <GitPullRequest className="w-4 h-4" />
                  <span className="text-sm font-semibold">Create PR</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="overflow-y-auto border-2 rounded-card"
        style={{
          maxHeight: '70vh',
          backgroundColor: 'var(--bg-white)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <div
          className="markdown-body"
          style={{
            padding: '32px',
            backgroundColor: 'var(--bg-white)',
            color: 'var(--text-primary)'
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                const language = match ? match[1] : null

                if (!inline && language === 'mermaid') {
                  return (
                    <div className="my-4 bg-cloud2-gray-50 p-6 rounded-button border border-cloud2-gray-300 flex items-center justify-center">
                      <Mermaid chart={String(children).replace(/\n$/, '')} />
                    </div>
                  )
                }

                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      </div>

      {/* Footer Stats */}
      {markdownContent && (
        <div className="mt-6 pt-5 border-t-2 border-cloud2-gray-200">
          <div className="flex items-center justify-between text-sm text-cloud2-gray-600">
            <span>
              Lines: <span className="font-bold text-cloud2-purple">{markdownContent.split('\n').length}</span>
            </span>
            <span>
              Characters: <span className="font-bold text-cloud2-purple">{markdownContent.length}</span>
            </span>
            <span>
              Words: <span className="font-bold text-cloud2-purple">{markdownContent.split(/\s+/).length}</span>
            </span>
          </div>
        </div>
      )}

      {/* PR Error Display */}
      {prError && (
        <div className="mt-4 p-4 status-failed rounded-button border-l-4 border-cloud2-error flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-cloud2-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-cloud2-error">Failed to Create Pull Request</h3>
            <p className="text-sm text-cloud2-error mt-1">{prError}</p>
            {prError.includes('GITHUB_TOKEN') && (
              <p className="text-xs text-cloud2-error mt-2">
                Make sure GITHUB_TOKEN is configured in your backend environment variables.
              </p>
            )}
          </div>
          <button
            onClick={() => setPrError(null)}
            className="text-cloud2-error hover:text-red-400 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default ResultsViewer
