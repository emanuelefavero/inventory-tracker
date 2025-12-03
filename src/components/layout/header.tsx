import { ModeToggle } from '@/components/theme/mode-toggle'

export function Header() {
  return (
    <header className='flex items-center justify-between gap-2 border-b border-border px-4 py-2.5'>
      <div className='font-bold tracking-wide'>Inventory Tracker</div>
      <ModeToggle />
    </header>
  )
}
