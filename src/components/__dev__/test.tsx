'use client'

import { useDarkMode } from '@/hooks/use-dark-mode'

export function Test() {
  const isDark = useDarkMode()

  return (
    <div className={`${isDark ? 'text-amber-500' : 'text-fuchsia-500'} p-4`}>
      Current theme: {isDark ? 'Dark' : 'Light'}
    </div>
  )
}
