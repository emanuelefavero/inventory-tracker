'use client'

import { useIsMounted } from '@/hooks/use-is-mounted'

export function Test() {
  const isMounted = useIsMounted()

  if (!isMounted) return null

  return <div>Hello from test file</div>
}
