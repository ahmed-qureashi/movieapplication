import React, { useState } from 'react'
import { Film, Star, Calendar } from 'lucide-react'

const MovieCard = ({ movie, onClick = null }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  // Construct poster URL
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null

  // Extract year from release date
  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : 'N/A'
  
  // Format rating
  const rating = movie.vote_average 
    ? movie.vote_average.toFixed(1) 
    : null

  // Truncate overview for better display
  const truncatedOverview = movie.overview && movie.overview.length > 120
    ? movie.overview.substring(0, 120) + '...'
    : movie.overview

  const handleClick = () => {
    if (onClick) {
      onClick(movie)
    }
  }

  return (
    <li 
      className={`bg-white/5 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl group ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {/* Movie Poster */}
      <div className="aspect-[2/3] relative bg-gray-800 overflow-hidden">
        {posterUrl && !imageError ? (
          <>
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={posterUrl}
              alt={movie.title || 'Movie poster'}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
            />
          </>
        ) : (
          // Fallback for missing/broken images
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <Film className="w-12 h-12 text-gray-500 mb-2" />
            <span className="text-xs text-gray-500 text-center px-2">No Image Available</span>
          </div>
        )}
        
        {/* Rating Badge */}
        {rating && parseFloat(rating) > 0 && (
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-yellow-400 text-xs font-semibold">{rating}</span>
          </div>
        )}

        {/* Hover overlay */}
        {onClick && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center">
              <Film className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">View Details</p>
            </div>
          </div>
        )}
      </div>

      {/* Movie Information */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-white font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
          {movie.title || 'Untitled Movie'}
        </h3>
        
        {/* Release Year */}
        <div className="flex items-center gap-1 mb-2">
          <Calendar className="w-3 h-3 text-gray-500" />
          <p className="text-gray-400 text-xs">{releaseYear}</p>
        </div>
        
        {/* Overview */}
        {truncatedOverview && (
          <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">
            {truncatedOverview}
          </p>
        )}

        {/* Additional metadata */}
        {movie.genre_ids && movie.genre_ids.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {movie.genre_ids.slice(0, 2).map((genreId) => (
              <span 
                key={genreId}
                className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full"
              >
                Genre {genreId}
              </span>
            ))}
          </div>
        )}
      </div>
    </li>
  )
}

export default MovieCard