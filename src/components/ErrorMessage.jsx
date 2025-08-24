import React from 'react'
import { AlertCircle, RefreshCw, Wifi, Search } from 'lucide-react'

const ErrorMessage = ({ 
  message, 
  onRetry = null, 
  type = 'general',
  isRetrying = false 
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: Wifi,
          title: 'Connection Problem',
          suggestions: ['Check your internet connection', 'Try refreshing the page']
        }
      case 'search':
        return {
          icon: Search,
          title: 'No Results Found',
          suggestions: ['Try different keywords', 'Check for typos']
        }
      case 'server':
        return {
          icon: AlertCircle,
          title: 'Server Error',
          suggestions: ['The service is temporarily unavailable', 'Please try again in a moment']
        }
      default:
        return {
          icon: AlertCircle,
          title: 'Something went wrong',
          suggestions: []
        }
    }
  }

  const { icon: Icon, title, suggestions } = getErrorConfig()

  return (
    <div className="text-center py-12 px-4 max-w-md mx-auto">
      <div className="mb-6">
        <Icon className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-red-400 text-sm leading-relaxed">{message}</p>
      </div>
      
      {suggestions.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2">Try these suggestions:</p>
          <ul className="text-gray-300 text-sm space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center justify-center gap-2">
                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {onRetry && (
        <button 
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 hover:border-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Try Again'}
        </button>
      )}
    </div>
  )
}

export default ErrorMessage