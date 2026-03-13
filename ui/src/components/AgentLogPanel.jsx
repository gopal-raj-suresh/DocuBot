import { X, Bot, CheckCircle, AlertCircle, Info, Zap, Activity } from 'lucide-react'

function AgentLogPanel({ isOpen, onClose, logs, currentJob }) {
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

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end">
      {/* Click outside to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="relative w-full max-w-2xl h-full bg-white border-l-2 border-cloud2-gray-200 shadow-2xl flex flex-col animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-cloud2-gray-200 bg-cloud2-gray-50">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <div className="p-2 bg-cloud2-purple-50 rounded-button">
                <Activity className="w-6 h-6 text-cloud2-purple" />
              </div>
              <h2 className="text-2xl font-bold text-cloud2-black">Agent Activity Log</h2>
            </div>
            {currentJob && (
              <p className="text-sm text-cloud2-gray-600 mt-1">Job ID: <span className="text-cloud2-purple font-mono font-semibold">{currentJob}</span></p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cloud2-purple-50 rounded-button transition-colors border border-cloud2-gray-300 hover:border-cloud2-purple"
          >
            <X className="w-6 h-6 text-cloud2-black" />
          </button>
        </div>

        {/* Logs Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-cloud2-gray-500">
              <Bot className="w-20 h-20 mb-4 opacity-20 text-cloud2-purple" />
              <p className="text-lg font-semibold text-cloud2-gray-700">No activity yet</p>
              <p className="text-sm">Agent logs will appear here during generation</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`p-4 rounded-button border-l-4 ${getLogColor(log.log_type)} transition-all hover:shadow-card`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getLogIcon(log.log_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      {log.agent_name && (
                        <span className="text-xs font-bold text-cloud2-purple uppercase tracking-wider">
                          {log.agent_name}
                        </span>
                      )}
                      {log.timestamp && (
                        <span className="text-xs text-cloud2-gray-600 font-medium">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-cloud2-black whitespace-pre-wrap leading-relaxed">{log.message}</p>

                    {/* Metadata */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-3 p-3 bg-cloud2-gray-50 rounded-button text-xs font-mono border border-cloud2-gray-300">
                        {JSON.stringify(log.metadata, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        {logs.length > 0 && (
          <div className="border-t-2 border-cloud2-gray-200 p-5 bg-cloud2-gray-50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-cloud2-gray-600 font-medium">
                Total Events: <span className="font-bold text-cloud2-purple">{logs.length}</span>
              </span>
              <div className="flex space-x-6">
                <span className="text-cloud2-gray-600 font-medium">
                  Agents: <span className="font-bold text-cloud2-purple">
                    {new Set(logs.filter(l => l.agent_name).map(l => l.agent_name)).size}
                  </span>
                </span>
                {logs.filter(l => l.log_type === 'error').length > 0 && (
                  <span className="text-cloud2-gray-600 font-medium">
                    Errors: <span className="font-bold text-cloud2-error">
                      {logs.filter(l => l.log_type === 'error').length}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentLogPanel
