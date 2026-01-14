import { ModeToggle } from '@/components/theme/mode-toggle'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export function Header() {
  return (
    <header className='flex items-center justify-between gap-2 border-b border-border px-px py-py'>
      <div className='font-bold'>Inventory Tracker</div>
      <div className='flex items-center gap-4'>
        <SignedOut>
          <SignInButton mode='modal' />
          <SignUpButton mode='modal' />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <ModeToggle />
      </div>
    </header>
  )
}
