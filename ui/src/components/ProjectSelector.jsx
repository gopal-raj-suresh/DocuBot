import { useState, useEffect } from 'react'
import { Folder, CheckSquare, Square, Play, Loader2, CheckCheck, XSquare, Search, AlertCircle, FolderTree } from 'lucide-react'
import { api } from '../services/api'

function ProjectSelector({ currentJob, detectedProjects, skippedFolders, onProjectsSelected }) {
  const [selectedPaths, setSelectedPaths] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)

  console.log('DEBUG ProjectSelector - skippedFolders:', skippedFolders)
  console.log('DEBUG ProjectSelector - skippedFolders type:', typeof skippedFolders)
  console.log('DEBUG ProjectSelector - skippedFolders length:', skippedFolders?.length)

  useEffect(() => {
    if (detectedProjects && detectedProjects.length > 0) {
      if (detectedProjects.length <= 10) {
        setSelectedPaths(detectedProjects.map(p => p.path))
      } else {
        setSelectedPaths([])
      }
    }
  }, [detectedProjects])

  const selectAll = () => {
    const filtered = getFilteredProjects()
    setSelectedPaths(prev => {
      const newPaths = filtered.map(p => p.path)
      return Array.from(new Set([...prev, ...newPaths]))
    })
  }

  const deselectAll = () => {
    const filtered = getFilteredProjects()
    const filteredPaths = filtered.map(p => p.path)
    setSelectedPaths(prev => prev.filter(path => !filteredPaths.includes(path)))
  }

  const getFilteredProjects = () => {
    if (!detectedProjects) return []
    if (!searchQuery.trim()) return detectedProjects

    const query = searchQuery.toLowerCase()
    return detectedProjects.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.path.toLowerCase().includes(query) ||
      p.types.some(t => t.toLowerCase().includes(query))
    )
  }

  const toggleProject = (path) => {
    setError(null)
    setSelectedPaths(prev => {
      if (prev.includes(path)) {
        return prev.filter(p => p !== path)
      } else {
        return [...prev, path]
      }
    })
  }

  const handleSubmit = async () => {
    if (selectedPaths.length === 0) {
      setError('Please select at least one project to document')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await api.selectProjects(currentJob, selectedPaths)
      onProjectsSelected()
    } catch (err) {
      console.error('Failed to submit project selection:', err)
      const errorMessage = err.response?.data?.detail || 'Failed to submit selection. Please try again.'
      setError(errorMessage)
      setSubmitting(false)
    }
  }

  if (!detectedProjects || detectedProjects.length === 0) {
    return null
  }

  const filteredProjects = getFilteredProjects()

  return (
    <div className="innovation-card p-8">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-cloud2-purple-50 rounded-button">
            <FolderTree className="w-7 h-7 text-cloud2-purple" />
          </div>
          <h3 className="text-2xl font-bold text-cloud2-black">
            🔍 Multiple Projects Detected
          </h3>
        </div>
        <p className="text-cloud2-gray-600 text-base leading-relaxed">
          <span className="font-semibold text-cloud2-purple">{detectedProjects.length} project(s)</span> Found in this repository. Select a project to generate Readme file.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 status-failed rounded-button border-l-4 border-cloud2-error">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-cloud2-error flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-cloud2-error">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Bulk Actions */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cloud2-purple" />
          <input
            type="text"
            placeholder="Search projects by name, path, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-cloud2-gray-300 text-cloud2-black rounded-button focus:border-cloud2-purple focus:ring-2 focus:ring-cloud2-purple/20 transition-all placeholder:text-cloud2-gray-500"
          />
        </div>

        {/* Bulk Selection Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <button
              onClick={selectAll}
              className="flex items-center space-x-2 px-4 py-2 bg-cloud2-gray-50 border border-cloud2-gray-300 hover:border-cloud2-purple text-cloud2-purple rounded-button text-sm font-semibold transition-all hover:shadow-card"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Select {searchQuery ? 'Filtered' : 'All'}</span>
            </button>
            <button
              onClick={deselectAll}
              className="flex items-center space-x-2 px-4 py-2 bg-cloud2-gray-50 border border-cloud2-gray-300 hover:border-cloud2-purple text-cloud2-gray-700 rounded-button text-sm font-semibold transition-all hover:shadow-card"
            >
              <XSquare className="w-4 h-4" />
              <span>Deselect {searchQuery ? 'Filtered' : 'All'}</span>
            </button>
          </div>
          <p className="text-sm text-cloud2-gray-600 font-medium">
            <span className="font-bold text-cloud2-purple">{selectedPaths.length}</span> of {detectedProjects.length} selected
          </p>
        </div>
      </div>

      {/* Project List */}
      <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-cloud2-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No projects match your search criteria.</p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isSelected = selectedPaths.includes(project.path)
            const projectTypes = project.types.join(', ')
            const isRoot = project.path === '/'

            return (
              <div
                key={project.path}
                onClick={() => toggleProject(project.path)}
                className={`
                  flex items-start space-x-4 p-5 rounded-card border-2 cursor-pointer transition-all
                  ${isSelected
                    ? 'bg-cloud2-purple-50 border-cloud2-purple shadow-card-hover'
                    : 'bg-white border-cloud2-gray-300 hover:border-cloud2-purple'
                  }
                `}
              >
                <div className="flex-shrink-0 mt-1">
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-cloud2-purple" />
                  ) : (
                    <Square className="w-5 h-5 text-cloud2-gray-500" />
                  )}
                </div>

                <div className="flex-grow">
                  <div className="flex items-center space-x-2 mb-2">
                    <Folder className="w-5 h-5 text-cloud2-purple" />
                    <h4 className="font-bold text-cloud2-black text-base">
                      {project.name}
                      {isRoot && <span className="text-xs ml-2 text-cloud2-purple font-semibold">(Root)</span>}
                    </h4>
                  </div>

                  <p className="text-sm text-cloud2-gray-600 mb-1">
                    <span className="font-semibold text-cloud2-black">Path:</span> {project.path}
                  </p>

                  <p className="text-sm text-cloud2-gray-600 mb-2">
                    <span className="font-semibold text-cloud2-black">Type:</span> {projectTypes}
                  </p>

                  <div className="flex space-x-4 text-xs text-cloud2-gray-500 font-medium">
                    <span>{project.file_count} files</span>
                    <span>{project.dir_count} directories</span>
                  </div>

                  {project.indicators && project.indicators.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.indicators.map((indicator, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-cloud2-purple-50 border border-cloud2-purple text-cloud2-purple text-xs font-semibold rounded-button"
                        >
                          {indicator}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Skipped Folders Section */}
      {skippedFolders && skippedFolders.length > 0 && (
        <div className="mb-6 p-4 bg-cloud2-gray-50 rounded-card border border-cloud2-gray-300">
          <h4 className="text-sm font-semibold text-cloud2-gray-700 mb-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Skipped Folders ({skippedFolders.length})</span>
          </h4>
          <p className="text-xs text-cloud2-gray-600 mb-3">
            The following folders were not detected as code projects:
          </p>
          <ul className="space-y-2">
            {skippedFolders.map((folder, idx) => (
              <li key={idx} className="text-sm text-cloud2-gray-600">
                • <span className="font-medium text-cloud2-black">{folder.name}</span> - {folder.reason} <span className="text-cloud2-gray-500">({folder.details})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-6 border-t-2 border-cloud2-gray-200">
        <p className="text-sm text-cloud2-gray-600 font-medium">
          <span className="font-bold text-cloud2-purple text-base">{selectedPaths.length}</span> project{selectedPaths.length !== 1 ? 's' : ''} selected
        </p>

        <button
          onClick={handleSubmit}
          disabled={submitting || selectedPaths.length === 0}
          className="flex items-center space-x-2 px-6 py-3 btn-primary text-white rounded-button font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-card hover:shadow-card-hover"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Generate Documentation</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ProjectSelector
