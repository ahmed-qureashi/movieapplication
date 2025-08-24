import { TMDB_IMAGE_BASE_URL, IMAGE_SIZES, GENRES } from './constants.js'

/**
 * Construct TMDB image URL
 * @param {string} path - Image path from TMDB API
 * @param {string} size - Image size (small, medium, large, etc.)
 * @param {string} type - Image type (poster or backdrop)
 * @returns {string|null} Complete image URL or null if path is invalid
 */
export const getImageUrl = (path, size = 'medium', type = 'poster') => {
  if (!path) return null
  
  const sizeCode = IMAGE_SIZES[type]?.[size] || IMAGE_SIZES.poster.medium
  return `${TMDB_IMAGE_BASE_URL}/${sizeCode}${path}`
}

/**
 * Format release date
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date or 'N/A'
 */
export const formatReleaseDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    
    // Return just year for simplicity
    if (!isNaN(year)) return year.toString()
    
    // Or return formatted date if you prefer
    // return date.toLocaleDateString('en-US', {
    //   year: 'numeric',
    //   month: 'long',
    //   day: 'numeric'
    // })
    
    return 'N/A'
  } catch (error) {
    console.warn('Invalid date format:', dateString)
    return 'N/A'
  }
}

/**
 * Format vote average rating
 * @param {number} rating - Rating from TMDB (0-10)
 * @returns {string} Formatted rating or 'N/A'
 */
export const formatRating = (rating) => {
  if (!rating || rating === 0) return 'N/A'
  return rating.toFixed(1)
}

/**
 * Get genre names from genre IDs
 * @param {number[]} genreIds - Array of genre IDs
 * @returns {string[]} Array of genre names
 */
export const getGenreNames = (genreIds) => {
  if (!Array.isArray(genreIds)) return []
  return genreIds.map(id => GENRES[id]).filter(Boolean)
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text || ''
  return text.substring(0, maxLength).trim() + suffix
}

/**
 * Sanitize search term
 * @param {string} term - Search term
 * @returns {string} Sanitized term
 */
export const sanitizeSearchTerm = (term) => {
  if (!term || typeof term !== 'string') return ''
  
  return term
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\-_.]/g, '') // Remove special characters except basic ones
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 100) // Limit length
}

/**
 * Validate search term
 * @param {string} term - Search term to validate
 * @returns {boolean} Is valid
 */
export const isValidSearchTerm = (term) => {
  if (!term || typeof term !== 'string') return false
  const sanitized = sanitizeSearchTerm(term)
  return sanitized.length >= 1 && sanitized.length <= 100
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retry attempts
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} Promise that resolves with function result
 */
export const retryWithBackoff = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await sleep(delay)
      return retryWithBackoff(fn, retries - 1, delay * 2)
    }
    throw error
  }
}

/**
 * Check if device is mobile
 * @returns {boolean} Is mobile device
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Get viewport dimensions
 * @returns {Object} Viewport width and height
 */
export const getViewportSize = () => {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  }
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0'
  return num.toLocaleString()
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const cloned = {}
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key])
    })
    return cloned
  }
}

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} Is empty
 */
export const isEmpty = (obj) => {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert snake_case to camelCase
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 */
export const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}

/**
 * Convert camelCase to snake_case
 * @param {string} str - String to convert
 * @returns {string} snake_case string
 */
export const toSnakeCase = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

/**
 * Parse error message from different error types
 * @param {Error|string|Object} error - Error to parse
 * @returns {string} Parsed error message
 */
export const parseErrorMessage = (error) => {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error) return error.error
  if (typeof error === 'object') return JSON.stringify(error)
  return 'An unknown error occurred'
}