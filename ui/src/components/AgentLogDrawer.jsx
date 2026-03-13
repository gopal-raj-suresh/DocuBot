import { X, Bot, CheckCircle, AlertCircle, Info, Zap, Activity } from 'lucide-react'
import { useState } from 'react'

function AgentLogDrawer({ isOpen, onClose, logs, currentJob }) {
  const [activeFilter, setActiveFilter] = useState('ALL')

  if (!isOpen) return null

  const getLogIcon = (logType) => {
    switch (logType) {
      case 'agent_start':
        return <Bot className="w-4 h-4 text-cloud2-purple" />
      case 'agent_complete':
        return <CheckCircle className="w-4 h-4 text-cloud2-success" />
      case 'agent_thinking':
        return <Zap className="w-4 h-4 text-cloud2-warning" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-cloud2-error" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-cloud2-success" />
      default:
        return <Info className="w-4 h-4 text-cloud2-gray-500" />
    }
  }

  const getLogColor = (logType) => {
    switch (logType) {
      case 'agent_start':
        return 'bg-cloud2-purple-50 border-cloud2-purple'
      case 'agent_complete':
        return 'bg-green-50 border-cloud2-success'
      case 'agent_thinking':
        return 'bg-yellow-50 border-cloud2-warning'
      case 'error':
        return 'bg-red-50 border-cloud2-error'
      case 'success':
        return 'bg-green-50 border-cloud2-success'
      default:
        return 'bg-cloud2-gray-50 border-cloud2-gray-300'
    }
  }

  const getLogTag = (logType) => {
    switch (logType) {
      case 'agent_start':
        return { label: 'ACTION', color: 'text-cloud2-warning bg-yellow-50' }
      case 'agent_complete':
        return { label: 'OK', color: 'text-cloud2-success bg-green-50' }
      case 'agent_thinking':
        return { label: 'ACTION', color: 'text-cloud2-warning bg-yellow-50' }
      case 'error':
        return { label: 'ERROR', color: 'text-cloud2-error bg-red-50' }
      case 'success':
        return { label: 'OK', color: 'text-cloud2-success bg-green-50' }
      default:
        return { label: 'INFO', color: 'text-cloud2-purple bg-cloud2-purple-50' }
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractional: 3 })
  }

  const calculateStats = () => {
    const toolCalls = logs.filter(l => l.log_type === 'agent_thinking').length
    const errors = logs.filter(l => l.log_type === 'error').length
    const agents = new Set(logs.filter(l => l.agent_name).map(l => l.agent_name)).size

    return {
      steps: logs.length,
      toolCalls,
      agents,
      errors
    }
  }

  const filteredLogs = activeFilter === 'ALL'
    ? logs
    : logs.filter(log => {
        if (activeFilter === 'ACTION') return log.log_type === 'agent_start' || log.log_type === 'agent_thinking'
        if (activeFilter === 'TOOL') return log.log_type === 'agent_thinking'
        if (activeFilter === 'OK') return log.log_type === 'success' || log.log_type === 'agent_complete'
        if (activeFilter === 'ERRORS') return log.log_type === 'error'
        return true
      })

  const stats = calculateStats()

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-500 opacity-100 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 bottom-0 right-0 w-full sm:w-[480px] lg:w-[560px] z-501 shadow-2xl flex flex-col animate-slideIn"
        style={{ backgroundColor: 'var(--bg-white)', borderLeft: '2px solid var(--border-primary)' }}
        role="complementary"
        aria-label="Agent Logs"
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 sm:p-5" style={{ borderBottom: '2px solid var(--border-primary)', backgroundColor: 'var(--bg-gray-50)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cloud2-success animate-pulse" style={{ boxShadow: '0 0 8px #34d399' }} />
              <div>
                <div className="font-mono text-sm font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>AGENT LOGS</div>
                {currentJob && (
                  <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    JOB: <span className="text-cloud2-purple font-semibold">{currentJob.substring(0, 8)}...</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-button hover:border-cloud2-purple hover:bg-cloud2-purple-50 flex items-center justify-center transition-all"
              style={{ backgroundColor: 'var(--bg-white)', border: '1px solid var(--border-primary)' }}
              aria-label="Close logs"
            >
              <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="flex-shrink-0 grid grid-cols-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="p-2 sm:p-3 text-center" style={{ borderRight: '1px solid var(--border-primary)' }}>
            <div className="font-mono text-base sm:text-lg font-bold text-cloud2-purple">{stats.steps}</div>
            <div className="font-mono text-[10px] sm:text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Steps</div>
          </div>
          <div className="p-2 sm:p-3 text-center" style={{ borderRight: '1px solid var(--border-primary)' }}>
            <div className="font-mono text-base sm:text-lg font-bold text-cloud2-purple">{stats.toolCalls}</div>
            <div className="font-mono text-[10px] sm:text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Tools</div>
          </div>
          <div className="p-2 sm:p-3 text-center" style={{ borderRight: '1px solid var(--border-primary)' }}>
            <div className="font-mono text-base sm:text-lg font-bold text-cloud2-success">{stats.agents}</div>
            <div className="font-mono text-[10px] sm:text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Agents</div>
          </div>
          <div className="p-2 sm:p-3 text-center">
            <div className="font-mono text-base sm:text-lg font-bold text-cloud2-error">{stats.errors}</div>
            <div className="font-mono text-[10px] sm:text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Errors</div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex-shrink-0 flex gap-1 p-3 overflow-x-auto" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          {['ALL', 'ACTION', 'TOOL', 'OK', 'ERRORS'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 sm:px-3 py-1 rounded-full font-mono text-[10px] sm:text-xs tracking-wider transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-cloud2-purple-50 border border-cloud2-purple text-cloud2-purple'
                  : 'bg-transparent border border-transparent hover:bg-cloud2-gray-50'
              }`}
              style={{ color: activeFilter === filter ? undefined : 'var(--text-tertiary)' }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Log Entries */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Bot className="w-16 h-16 sm:w-20 sm:h-20 mb-4 opacity-20 text-cloud2-purple" />
              <p className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>No activity yet</p>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>Agent logs will appear here during generation</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const tag = getLogTag(log.log_type)
              return (
                <div
                  key={index}
                  className="grid grid-cols-[50px_40px_1fr] sm:grid-cols-[65px_50px_1fr] gap-2 p-2 rounded-button transition-all"
                  style={{ ':hover': { backgroundColor: 'var(--bg-gray-50)' } }}
                >
                  <span className="font-mono text-[10px] sm:text-xs pt-1" style={{ color: 'var(--text-tertiary)' }}>
                    {log.timestamp ? formatTimestamp(log.timestamp) : '--:--'}
                  </span>
                  <span className={`font-mono text-[9px] sm:text-[10px] font-bold tracking-wider text-center py-1 rounded ${tag.color}`}>
                    {tag.label}
                  </span>
                  <div className="min-w-0">
                    {log.agent_name && (
                      <div className="font-mono text-[10px] sm:text-xs font-bold text-cloud2-purple uppercase tracking-wider mb-1">
                        {log.agent_name}
                      </div>
                    )}
                    <p className="font-mono text-xs sm:text-sm leading-relaxed break-words" style={{ color: 'var(--text-primary)' }}>
                      {log.message}
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 p-2 rounded-button font-mono text-[10px] sm:text-xs break-all" style={{ backgroundColor: 'var(--bg-gray-50)', color: 'var(--text-tertiary)', border: '1px solid var(--border-primary)' }}>
                        {JSON.stringify(log.metadata, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>
    </>
  )
}

export default AgentLogDrawer
