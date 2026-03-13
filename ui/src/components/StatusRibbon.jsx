function StatusRibbon({ currentJob, workflowStatus, selectedProjectsCount, logsCount, onOpenLogs }) {
  const getStatusInfo = () => {
    switch (workflowStatus) {
      case 'running':
        return { color: '#34d399', label: 'Agent Active', pulse: true }
      case 'completed':
        return { color: '#2dd4bf', label: 'Complete', pulse: false }
      case 'failed':
        return { color: '#f87171', label: 'Failed', pulse: false }
      case 'awaiting_selection':
        return { color: '#fbbf24', label: 'Awaiting Selection', pulse: true }
      default:
        return { color: '#6C757D', label: 'Ready', pulse: false }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-100 bg-white/90 backdrop-blur-lg border-t border-cloud2-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-10 flex items-center gap-6 text-xs font-mono text-cloud2-gray-600">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${statusInfo.pulse ? 'animate-pulse' : ''}`}
            style={{
              backgroundColor: statusInfo.color,
              boxShadow: statusInfo.pulse ? `0 0 6px ${statusInfo.color}` : 'none'
            }}
          />
          <span>{statusInfo.label}</span>
        </div>

        <div className="w-px h-4 bg-cloud2-gray-300" />

        {/* Project Selection Status */}
        {selectedProjectsCount > 0 && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#A335FC' }} />
              <span>{selectedProjectsCount} project{selectedProjectsCount !== 1 ? 's' : ''} selected</span>
            </div>
            <div className="w-px h-4 bg-cloud2-gray-300" />
          </>
        )}

        {/* README Status */}
        {workflowStatus === 'completed' && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#2dd4bf' }} />
              <span>README ready</span>
            </div>
            <div className="w-px h-4 bg-cloud2-gray-300" />
          </>
        )}

        {/* Logs Link */}
        {currentJob && logsCount > 0 && (
          <button
            onClick={onOpenLogs}
            className="ml-auto text-cloud2-purple hover:text-cloud2-purple-dark transition-colors cursor-pointer"
          >
            {logsCount} log entries → View Logs
          </button>
        )}
      </div>
    </div>
  )
}

export default StatusRibbon
