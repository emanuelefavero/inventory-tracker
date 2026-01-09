'use client'

import { useIsMounted } from '@/hooks/use-is-mounted'
import { useTheme } from 'next-themes'

// TODO test performance impact of use-dark-mode and use-is-mounted, possible optimization needed

/**
 * Hook to determine if the current theme is dark.
 *
 * @returns `true` if the current theme is dark, `false` otherwise.
 *
 * @example
 * const isDark = useDarkMode() // => true | false
 */
export function useDarkMode() {
  const { resolvedTheme } = useTheme()
  const isMounted = useIsMounted(false)

  return isMounted() && resolvedTheme === 'dark'
}
