import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, ChevronUp, Activity, AlertCircle, CheckCircle, XCircle, Zap, Terminal } from 'lucide-react'

function FloatingLogsPanel({ isOpen, onClose, logs, currentJob }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const logsEndRef = useRef(null)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (isExpanded && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, isExpanded])

  const getLogIcon = (logType) => {
    // Handle all agent log types
    if (logType?.startsWith('agent_') || logType === 'agent') {
      return <Zap className="w-4 h-4 text-cloud2-purple flex-shrink-0" />
    }

    switch (logType) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
      case 'info':
      default:
        return <Terminal className="w-4 h-4 text-blue-500 flex-shrink-0" />
    }
  }

  const getLogTypeLabel = (logType) => {
    return logType?.toUpperCase() || 'INFO'
  }

  // Count logs by type - agent logs include: agent_start, agent_thinking, agent_action, agent_observation, agent_complete, agent_tool_use, agent_decision
  const countByType = {
    total: logs.length,
    success: logs.filter(log => log.log_type === 'success').length,
    error: logs.filter(log => log.log_type === 'error').length,
    // Count unique agents by agent_name, not total log entries
    agent: new Set(
      logs
        .filter(log => log.agent_name) // Only logs with agent_name
        .map(log => log.agent_name)
    ).size,
    thinking: logs.filter(log => log.log_type === 'agent_thinking').length,
    action: logs.filter(log => log.log_type === 'agent_action').length,
    observation: logs.filter(log => log.log_type === 'agent_observation').length
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-6 right-6 z-[500] animate-slideInFromBottom">
      {/* Floating Panel Container */}
      <div
        className="rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          backgroundColor: 'var(--bg-white)',
          border: '2px solid var(--border-primary)',
          width: '400px',
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: isExpanded ? '600px' : '72px'
        }}
      >
        {/* Header - Always Visible */}
        <div
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            backgroundColor: 'var(--bg-gray-50)',
            borderBottom: isExpanded ? '2px solid var(--border-primary)' : 'none'
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="bg-cloud2-purple p-2 rounded-lg">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-mono text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Agent Logs
              </div>
              {currentJob && (
                <div className="font-mono text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  Job: {currentJob.substring(0, 8)}...
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* KPI Badges */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="px-2 py-1 rounded text-[10px] font-mono font-semibold bg-cloud2-purple-50 text-cloud2-purple">
                {countByType.total}
              </div>
              {countByType.error > 0 && (
                <div className="px-2 py-1 rounded text-[10px] font-mono font-semibold bg-red-50 text-red-600">
                  {countByType.error} ERR
                </div>
              )}
            </div>

            {/* Expand/Collapse Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="p-1.5 rounded-lg hover:bg-cloud2-purple-50 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="flex flex-col" style={{ height: '528px' }}>
            {/* Stats Bar */}
            <div
              className="px-4 py-2 flex items-center justify-between text-[10px] font-mono"
              style={{
                backgroundColor: 'var(--bg-gray-50)',
                borderBottom: '1px solid var(--border-primary)',
                color: 'var(--text-secondary)'
              }}
            >
              <div className="flex items-center space-x-3 flex-wrap">
                <span>TOTAL: <span className="font-bold text-cloud2-purple">{countByType.total}</span></span>
                {countByType.agent > 0 && (
                  <span>AGENTS: <span className="font-bold text-blue-500">{countByType.agent}</span></span>
                )}
                {countByType.action > 0 && (
                  <span>ACTIONS: <span className="font-bold text-orange-500">{countByType.action}</span></span>
                )}
                {countByType.success > 0 && (
                  <span>SUCCESS: <span className="font-bold text-green-500">{countByType.success}</span></span>
                )}
                {countByType.error > 0 && (
                  <span>ERRORS: <span className="font-bold text-red-500">{countByType.error}</span></span>
                )}
              </div>
            </div>

            {/* Logs Content - Scrollable */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
              style={{ backgroundColor: 'var(--bg-white)' }}
            >
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
                  <Activity className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm font-mono">No logs yet...</p>
                  <p className="text-xs mt-1">Start a job to see agent activity</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className="rounded-lg p-3 transition-all hover:shadow-sm"
                    style={{
                      backgroundColor: 'var(--bg-gray-50)',
                      border: '1px solid var(--border-primary)'
                    }}
                  >
                    {/* Log Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getLogIcon(log.log_type)}
                        <span
                          className="font-mono text-[9px] px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: log.log_type === 'error'
                              ? 'rgba(239, 68, 68, 0.1)'
                              : log.log_type === 'success'
                              ? 'rgba(34, 197, 94, 0.1)'
                              : (log.log_type?.startsWith('agent_') || log.log_type === 'agent')
                              ? 'rgba(139, 92, 246, 0.1)'
                              : 'rgba(59, 130, 246, 0.1)',
                            color: log.log_type === 'error'
                              ? '#dc2626'
                              : log.log_type === 'success'
                              ? '#16a34a'
                              : (log.log_type?.startsWith('agent_') || log.log_type === 'agent')
                              ? '#8b5cf6'
                              : '#3b82f6'
                          }}
                        >
                          {getLogTypeLabel(log.log_type)}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Log Message */}
                    <p
                      className="font-mono text-xs leading-relaxed break-words"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {log.message}
                    </p>

                    {/* Agent Name (if available) */}
                    {log.agent_name && (
                      <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                          Agent: <span className="font-semibold text-cloud2-purple">{log.agent_name}</span>
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FloatingLogsPanel
