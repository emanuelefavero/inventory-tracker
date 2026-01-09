import { useCallback, useEffect, useRef } from 'react'

/**
 * Hook that returns a function to check if the component is mounted.
 *
 * @param initialValue Initial value.
 * @return Function that returns `true` only if the component is mounted.
 *
 * @example
 * const isMounted = useIsMounted()
 * isMounted() // => true | false
 */
export function useIsMounted(initialValue = false): () => boolean {
  const isMounted = useRef(initialValue)
  const get = useCallback(() => isMounted.current, [])

  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, [])

  return get
}
