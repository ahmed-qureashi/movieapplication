import React from 'react'
import { Film } from 'lucide-react'

const Spinner = ({ size = 'default', message = 'Loading movies...' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-12 h-12',
    large: 'w-16 h-16'
  }

  const iconSizes = {
    small: 'w-2 h-2',
    default: 'w-4 h-4',
    large: 'w-6 h-6'
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Film className={`${iconSizes[size]} text-indigo-600`} />
        </div>
      </div>
      {message && (
        <p className="text-gray-400 mt-4 text-sm animate-pulse">{message}</p>
      )}
    </div>
  )
}

export default Spinner