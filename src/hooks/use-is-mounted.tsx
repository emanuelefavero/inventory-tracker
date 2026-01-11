import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * Hook to check if the component is mounted.
 * Uses `useSyncExternalStore` to avoid hydration mismatches without triggering
 * "setState within effect" warnings or unnecessary effect cycles.
 *
 * @returns `true` if the component is mounted on the client, `false` otherwise.
 *
 * @example
 * const isMounted = useIsMounted()
 * if (isMounted) {}
 */
export function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}
