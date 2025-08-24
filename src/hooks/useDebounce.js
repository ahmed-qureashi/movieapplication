import { useState, useEffect } from 'react'

/**
 * Custom hook for debouncing values
 * @param {*} value - The value to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {*} The debounced value
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Set up a timeout to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up the timeout if value changes before delay completes
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Alternative debounce hook that also returns loading state
 * @param {*} value - The value to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {[*, boolean]} - [debouncedValue, isPending]
 */
export const useDebounceWithStatus = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setIsPending(true)
    
    const handler = setTimeout(() => {
      setDebouncedValue(value)
      setIsPending(false)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return [debouncedValue, isPending]
}