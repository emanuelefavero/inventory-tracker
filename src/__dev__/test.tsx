'use client'

import { Button } from '@/components/ui/button'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { Trash2 } from 'lucide-react'

export function Test() {
  const isMounted = useIsMounted()

  if (!isMounted) return null

  return (
    <div className='mt-4 flex flex-wrap gap-2 rounded-2xl border border-foreground/20 p-4'>
      <Button variant='outline'>Outline Button</Button>
      <Button className='align-bottom'>Default Button</Button>
      <Button variant='secondary'>Secondary Button</Button>
      <Button variant='ghost'>Ghost Button</Button>
      <Button variant='link'>Link Button</Button>
      <Button variant='destructive'>Destructive Button</Button>
      <Button variant='ghost'>
        <Trash2 />
      </Button>
      <Button variant='destructive'>
        <Trash2 />
      </Button>
      <input
        type='text'
        placeholder='Ciao'
        className='rounded-lg border border-border bg-input px-2'
      />
      <a href='#'>Test Link</a>
    </div>
  )
}
