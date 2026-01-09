import { Test } from '@/components/__dev__/test'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export default function Home() {
  return (
    <>
      <h1 className='text-4xl font-bold'>Hello</h1>

      {process.env.NODE_ENV === 'development' && <Test />}

      <div className='mt-2 flex flex-wrap gap-2'>
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
    </>
  )
}
