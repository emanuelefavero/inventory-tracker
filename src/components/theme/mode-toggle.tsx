'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ThemeOption } from '@/types/theme'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

// * Menu Theme options
export const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const satisfies ThemeOption[]

// * ModeToggle component
export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      {/* Menu Trigger */}
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon' className='cursor-pointer'>
          <Sun className='h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      {/* Menu Content */}
      <DropdownMenuContent align='end'>
        {themes.map(({ value, label }) => (
          <DropdownMenuItem
            key={`theme-option-${value}`}
            onClick={() => setTheme(value)}
            className={cn(
              'cursor-pointer',
              theme === value && 'text-link hover:text-link!',
            )}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
