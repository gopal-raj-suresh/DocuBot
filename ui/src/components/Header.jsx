import { Bot, Activity, CheckCircle, XCircle, Clock, FileText, Moon, Sun } from 'lucide-react'

function Header({ onLogsToggle, hasActiveJob, workflowStatus, theme, onThemeToggle }) {
  const getStatusConfig = () => {
    switch (workflowStatus) {
      case 'running':
        return {
          icon: <Clock className="w-4 h-4 animate-spin" />,
          text: 'Generating',
          className: 'status-running text-cloud2-purple'
        }
      case 'completed':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Completed',
          className: 'status-completed text-cloud2-success'
        }
      case 'failed':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'Failed',
          className: 'status-failed text-cloud2-error'
        }
      default:
        return {
          icon: <FileText className="w-4 h-4" />,
          text: 'Ready',
          className: 'bg-cloud2-purple-50 text-cloud2-purple'
        }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <header className="sticky top-0 z-50 shadow-card" style={{ backgroundColor: 'var(--bg-white)', borderBottom: '1px solid var(--border-primary)' }}>
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="bg-cloud2-purple p-2 sm:p-3 rounded-button shadow-card">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>DocuBot</h1>
                <span className="hidden sm:inline purple-badge text-xs">
                  Cloud2 Labs
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                AI-Powered Documentation
              </p>
            </div>
          </div>

          {/* Right Side - Status & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Status Indicator */}
            {hasActiveJob && (
              <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-button ${statusConfig.className} transition-all`}>
                {statusConfig.icon}
                <span className="text-xs sm:text-sm font-semibold">{statusConfig.text}</span>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className="p-2 rounded-button transition-all hover:bg-cloud2-purple-50 hover:border-cloud2-purple"
              style={{ backgroundColor: 'var(--bg-gray-50)', border: '1px solid var(--border-primary)' }}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-cloud2-purple" />
              ) : (
                <Sun className="w-4 h-4 text-cloud2-purple" />
              )}
            </button>

            {/* Agent Logs Button */}
            <button
              onClick={onLogsToggle}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-5 py-1.5 sm:py-2.5 btn-primary text-white rounded-button font-semibold transition-all shadow-card hover:shadow-card-hover"
            >
              <Activity className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Agent Logs</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
