import { useEffect, useState, useCallback } from 'react'
import { Film, TrendingUp, Star } from 'lucide-react'

// Components
import SearchComponent from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import ErrorMessage from './components/ErrorMessage.jsx'

// Custom hooks
import { useDebounce } from './hooks/useDebounce.js'

// Appwrite functions
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

// API Configuration
const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

// Validate API key
if (!API_KEY) {
  console.error('TMDB API key is missing. Please set VITE_TMDB_API_KEY in your .env file')
}

const App = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [movieList, setMovieList] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [trendingMovies, setTrendingMovies] = useState([])
  const [initialLoad, setInitialLoad] = useState(true)

  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 500)

  /**
   * Determine error type based on error message
   */
  const getErrorType = (error) => {
    const message = error.message.toLowerCase()
    if (message.includes('network') || message.includes('fetch')) return 'network'
    if (message.includes('404') || message.includes('not found')) return 'search'
    if (message.includes('500') || message.includes('server')) return 'server'
    return 'general'
  }

  /**
   * Fetch movies from TMDB API
   */
  const fetchMovies = useCallback(async (query = '', isRetry = false) => {
    // Don't fetch if we're just clearing search or if API key is missing
    if (!query && !initialLoad) return
    if (!API_KEY) {
      setErrorMessage('TMDB API key is not configured. Please check your environment variables.')
      return
    }
    
    if (isRetry) {
      setIsRetrying(true)
    } else {
      setIsLoading(true)
    }
    setErrorMessage('')

    try {
      // Construct API endpoint
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
        : `${API_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`

      console.log(`Fetching movies: ${endpoint}`)

      const response = await fetch(endpoint, API_OPTIONS)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Handle empty results
      if (!data.results || data.results.length === 0) {
        const message = query 
          ? `No movies found for "${query}". Try different keywords.`
          : 'No movies available at the moment.'
        setErrorMessage(message)
        setMovieList([])
        return
      }

      // Filter out movies without posters for better UX
      const moviesWithPosters = data.results.filter(movie => movie.poster_path)
      
      setMovieList(moviesWithPosters.length > 0 ? moviesWithPosters : data.results)

      // Update search statistics in Appwrite (only for search queries)
      if (query && data.results.length > 0) {
        try {
          await updateSearchCount(query, data.results[0])
        } catch (appwriteError) {
          console.warn('Failed to update search count:', appwriteError.message)
          // Don't show this error to user as it's not critical
        }
      }

      console.log(`Successfully fetched ${data.results.length} movies`)

    } catch (error) {
      console.error('Error fetching movies:', error)
      
      const errorType = getErrorType(error)
      let userMessage = 'Failed to load movies. Please try again later.'
      
      if (error.message.includes('401')) {
        userMessage = 'Invalid API credentials. Please check your TMDB API key.'
      } else if (error.message.includes('429')) {
        userMessage = 'Too many requests. Please wait a moment and try again.'
      } else if (error.message.includes('Failed to fetch')) {
        userMessage = 'Network error. Please check your connection and try again.'
      }
      
      setErrorMessage(userMessage)
      setMovieList([])
    } finally {
      setIsLoading(false)
      setIsRetrying(false)
      if (initialLoad) setInitialLoad(false)
    }
  }, [initialLoad])

  /**
   * Load trending movies from Appwrite
   */
  const loadTrendingMovies = useCallback(async () => {
    try {
      const movies = await getTrendingMovies(5)
      setTrendingMovies(movies)
      console.log(`Loaded ${movies.length} trending movies`)
    } catch (error) {
      console.error('Error fetching trending movies:', error)
      // Don't show this error to user as trending is not critical
    }
  }, [])

  /**
   * Retry fetch function
   */
  const retryFetch = () => {
    fetchMovies(debouncedSearchTerm, true)
  }

  /**
   * Handle movie card click (optional feature)
   */
  const handleMovieClick = (movie) => {
    console.log('Movie clicked:', movie.title)
    // You can add modal, navigation, or other functionality here
  }

  // Effect for search
  useEffect(() => {
    fetchMovies(debouncedSearchTerm)
  }, [debouncedSearchTerm, fetchMovies])

  // Effect for trending movies
  useEffect(() => {
    loadTrendingMovies()
  }, [loadTrendingMovies])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background pattern */}
      <div className="fixed inset-0 opacity-10">
        <div 
          className="absolute inset-0 animate-pulse" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Film className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Find{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Movies
            </span>
            <br className="md:hidden" />
            <span className="text-4xl md:text-6xl"> You'll Love</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover your next favorite film without the hassle
          </p>

          <SearchComponent 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            isLoading={isLoading || isRetrying}
          />
        </header>

        {/* Trending Movies Section */}
        {trendingMovies.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
              <h2 className="text-3xl font-bold text-white">Trending Searches</h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {trendingMovies.map((movie, index) => (
                <div key={movie.$id} className="flex-shrink-0 relative group cursor-pointer">
                  <div className="w-32 md:w-40 bg-white/5 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 hover:border-indigo-400/50 transition-all duration-300 hover:scale-105">
                    <div className="aspect-[2/3] relative">
                      {movie.poster_url ? (
                        <img
                          src={movie.poster_url}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                          <Film className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                      
                      {/* Ranking badge */}
                      <div className="absolute top-2 left-2 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      
                      {/* Search count */}
                      <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-white text-xs">{movie.count} searches</span>
                      </div>
                    </div>
                    
                    {/* Movie title */}
                    <div className="p-2">
                      <p className="text-white text-xs font-medium line-clamp-2">
                        {movie.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main Movies Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Film className="w-6 h-6 text-indigo-400" />
              {searchTerm 
                ? `Search Results for "${searchTerm}"` 
                : 'Popular Movies'
              }
            </h2>
            
            {movieList.length > 0 && (
              <div className="flex items-center gap-2 text-gray-400">
                <Star className="w-4 h-4" />
                <span className="text-sm">{movieList.length} movies</span>
              </div>
            )}
          </div>

          {/* Content Area */}
          {isLoading ? (
            <Spinner message={searchTerm ? `Searching for "${searchTerm}"...` : 'Loading popular movies...'} />
          ) : errorMessage ? (
            <ErrorMessage 
              message={errorMessage} 
              onRetry={retryFetch}
              type={getErrorType({ message: errorMessage })}
              isRetrying={isRetrying}
            />
          ) : movieList.length > 0 ? (
            <>
              {/* Movies Grid */}
              <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {movieList.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    onClick={handleMovieClick}
                  />
                ))}
              </ul>
              
              {/* Load More Button (optional) */}
              {movieList.length >= 20 && (
                <div className="text-center mt-12">
                  <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors duration-200">
                    Load More Movies
                  </button>
                </div>
              )}
            </>
          ) : (
            !isLoading && (
              <div className="text-center py-20">
                <Film className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm ? 'No movies found' : 'No movies to display'}
                </h3>
                <p className="text-gray-400">
                  {searchTerm 
                    ? `Try searching for different keywords`
                    : 'Start by searching for your favorite movies'
                  }
                </p>
              </div>
            )
          )}
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/10">
          <div className="text-center text-gray-400">
            <p className="text-sm">
              Powered by{' '}
              <a 
                href="https://www.themoviedb.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                The Movie Database (TMDB)
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App