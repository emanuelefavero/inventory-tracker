import { ModeToggle } from '@/components/theme/mode-toggle'

export function Header() {
  return (
    <header className='flex items-center justify-between gap-2 border-b border-border px-px py-py'>
      <div className='font-bold'>Inventory Tracker</div>
      <ModeToggle />
    </header>
  )
}
