import { cn } from '@/lib/utils'

type MainProps = React.ComponentProps<'main'>

export function Main({ children, className, ...props }: MainProps) {
  return (
    <main className={cn('px-px py-py', className)} {...props}>
      {children}
    </main>
  )
}
