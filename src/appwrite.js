import { Client, Databases, ID, Query } from 'appwrite'

// Environment variables with validation
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID

// Validate required environment variables
const validateEnvVars = () => {
  const missing = []
  if (!PROJECT_ID) missing.push('VITE_APPWRITE_PROJECT_ID')
  if (!DATABASE_ID) missing.push('VITE_APPWRITE_DATABASE_ID')
  if (!COLLECTION_ID) missing.push('VITE_APPWRITE_COLLECTION_ID')
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Validate on module load
validateEnvVars()

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1') // Updated to latest endpoint
  .setProject(PROJECT_ID)

const database = new Databases(client)

/**
 * Update search count for a movie search term
 * @param {string} searchTerm - The search term
 * @param {Object} movie - The movie object from TMDB API
 * @returns {Promise<Object|null>} The updated or created document
 */
export const updateSearchCount = async (searchTerm, movie) => {
  // Validate inputs
  if (!searchTerm || !movie) {
    console.warn('updateSearchCount: Missing required parameters')
    return null
  }

  // Sanitize search term
  const sanitizedTerm = searchTerm.trim().toLowerCase()
  if (!sanitizedTerm) return null

  try {
    // Check if the search term already exists
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', sanitizedTerm),
      Query.limit(1) // We only need to know if it exists
    ])

    if (result.documents.length > 0) {
      // Update existing document
      const doc = result.documents[0]
      const updatedDoc = await database.updateDocument(
        DATABASE_ID, 
        COLLECTION_ID, 
        doc.$id, 
        {
          count: doc.count + 1,
          lastSearched: new Date().toISOString(),
          // Update movie info in case it changed
          title: movie.title,
          poster_url: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null
        }
      )
      console.log(`Updated search count for "${sanitizedTerm}": ${updatedDoc.count}`)
      return updatedDoc
    } else {
      // Create new document
      const newDoc = await database.createDocument(
        DATABASE_ID, 
        COLLECTION_ID, 
        ID.unique(), 
        {
          searchTerm: sanitizedTerm,
          count: 1,
          movie_id: movie.id,
          title: movie.title,
          poster_url: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,
          release_date: movie.release_date || null,
          vote_average: movie.vote_average || 0,
          firstSearched: new Date().toISOString(),
          lastSearched: new Date().toISOString()
        }
      )
      console.log(`Created new search record for "${sanitizedTerm}"`)
      return newDoc
    }
  } catch (error) {
    console.error('Error updating search count:', error.message)
    
    // Handle specific Appwrite errors
    if (error.code === 401) {
      console.error('Appwrite authentication failed. Check your project ID and permissions.')
    } else if (error.code === 404) {
      console.error('Appwrite database or collection not found. Check your configuration.')
    }
    
    return null
  }
}

/**
 * Get trending movies based on search count
 * @param {number} limit - Number of trending movies to return (default: 10)
 * @returns {Promise<Array>} Array of trending movies
 */
export const getTrendingMovies = async (limit = 10) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(Math.min(limit, 100)), // Appwrite has a max limit
      Query.orderDesc('count'),
      Query.greaterThan('count', 0) // Only include movies that have been searched
    ])

    // Transform the data for easier use in components
    const trendingMovies = result.documents.map(doc => ({
      $id: doc.$id,
      searchTerm: doc.searchTerm,
      title: doc.title,
      movie_id: doc.movie_id,
      poster_path: doc.poster_url ? doc.poster_url.replace('https://image.tmdb.org/t/p/w500', '') : null,
      poster_url: doc.poster_url,
      count: doc.count,
      vote_average: doc.vote_average,
      release_date: doc.release_date,
      lastSearched: doc.lastSearched
    }))

    console.log(`Retrieved ${trendingMovies.length} trending movies`)
    return trendingMovies
  } catch (error) {
    console.error('Error fetching trending movies:', error.message)
    
    // Handle specific errors
    if (error.code === 401) {
      console.error('Appwrite authentication failed. Check your project ID and permissions.')
    } else if (error.code === 404) {
      console.error('Appwrite database or collection not found. Check your configuration.')
    }
    
    return []
  }
}

/**
 * Get search statistics
 * @returns {Promise<Object>} Search statistics
 */
export const getSearchStats = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(100),
      Query.orderDesc('count')
    ])

    const totalSearches = result.documents.reduce((sum, doc) => sum + doc.count, 0)
    const uniqueTerms = result.documents.length
    const topSearch = result.documents[0]

    return {
      totalSearches,
      uniqueTerms,
      topSearch: topSearch ? {
        term: topSearch.searchTerm,
        count: topSearch.count,
        title: topSearch.title
      } : null,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching search stats:', error.message)
    return {
      totalSearches: 0,
      uniqueTerms: 0,
      topSearch: null,
      error: error.message
    }
  }
}

/**
 * Clear old search records (utility function for maintenance)
 * @param {number} daysOld - Delete records older than this many days
 * @returns {Promise<number>} Number of deleted records
 */
export const clearOldSearches = async (daysOld = 90) => {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.lessThan('lastSearched', cutoffDate.toISOString()),
      Query.limit(100)
    ])

    let deletedCount = 0
    for (const doc of result.documents) {
      await database.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id)
      deletedCount++
    }

    console.log(`Deleted ${deletedCount} old search records`)
    return deletedCount
  } catch (error) {
    console.error('Error clearing old searches:', error.message)
    return 0
  }
}

// Export client for advanced usage
export { client, database }