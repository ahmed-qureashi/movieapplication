// API Constants
export const API_BASE_URL = 'https://api.themoviedb.org/3'
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

// Image sizes available from TMDB
export const IMAGE_SIZES = {
  poster: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    xlarge: 'w780',
    original: 'original'
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original'
  }
}

// Movie genres mapping (TMDB genre IDs)
export const GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
}

// App Configuration
export const APP_CONFIG = {
  ITEMS_PER_PAGE: 20,
  SEARCH_DEBOUNCE_MS: 500,
  TRENDING_MOVIES_COUNT: 5,
  MAX_TRENDING_COUNT: 10,
  SEARCH_MIN_LENGTH: 2,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  API_KEY_MISSING: 'TMDB API key is not configured. Please check your environment variables.',
  API_KEY_INVALID: 'Invalid API credentials. Please check your TMDB API key.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NO_RESULTS: 'No movies found. Try different keywords.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  APPWRITE_CONFIG: 'Database configuration error. Please check your Appwrite settings.'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  MOVIES_LOADED: 'Movies loaded successfully',
  SEARCH_UPDATED: 'Search count updated',
  TRENDING_LOADED: 'Trending movies loaded'
}

// Loading Messages
export const LOADING_MESSAGES = {
  SEARCHING: 'Searching for movies...',
  LOADING_POPULAR: 'Loading popular movies...',
  LOADING_TRENDING: 'Loading trending movies...',
  RETRYING: 'Retrying...'
}

// Validation Rules
export const VALIDATION = {
  SEARCH_TERM: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9\s\-_.,!?]+$/
  },
  MOVIE_TITLE: {
    MAX_LENGTH: 200
  }
}

// Local Storage Keys
export const STORAGE_KEYS = {
  SEARCH_HISTORY: 'movie_search_history',
  USER_PREFERENCES: 'user_preferences',
  CACHED_MOVIES: 'cached_movies'
}

// API Endpoints
export const ENDPOINTS = {
  SEARCH_MOVIES: '/search/movie',
  DISCOVER_MOVIES: '/discover/movie',
  MOVIE_DETAILS: '/movie',
  TRENDING_MOVIES: '/trending/movie/day',
  POPULAR_MOVIES: '/movie/popular',
  TOP_RATED_MOVIES: '/movie/top_rated',
  UPCOMING_MOVIES: '/movie/upcoming'
}

// Default Query Parameters
export const DEFAULT_PARAMS = {
  include_adult: false,
  language: 'en-US',
  page: 1,
  sort_by: 'popularity.desc'
}

// Animation Durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
}

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}