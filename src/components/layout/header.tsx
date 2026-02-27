import { ModeToggle } from '@/components/theme/mode-toggle'
import { APP_NAME } from '@/config/metadata'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Suspense } from 'react'
import { LogoIcon } from '../icons/logo-icon'

export function Header() {
  return (
    <header className='flex items-center justify-between gap-2 border-b border-border px-px py-py'>
      <div className='flex items-center gap-2 select-none'>
        <LogoIcon className='w-8' />
        <span className='font-bold'>{APP_NAME}</span>
      </div>
      <div className='flex items-center gap-4'>
        <Suspense>
          <SignedOut>
            <SignInButton mode='modal' />
            <SignUpButton mode='modal' />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Suspense>
        <ModeToggle />
      </div>
    </header>
  )
}
