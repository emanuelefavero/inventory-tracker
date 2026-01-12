import { cn } from '@/lib/utils'

type LogoIconProps = {
  className?: string
  pathClassNames?: {
    path1?: string
    path2?: string
    path3?: string
    path4?: string
  }
}

/**
 * Renders an SVG logo icon.
 *
 * @example
 * <LogoIcon pathClassNames={{ path1: 'fill-white' }} className='w-8' />
 */
export function LogoIcon({ className, pathClassNames = {} }: LogoIconProps) {
  const basePathClassNames = /*tw*/ 'transition-colors duration-200 ease-in-out'
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 505 365'
      className={className}
      aria-hidden='true'
    >
      <path
        d='M281.885 100.202C450.292 92.362 489.911 243.503 463.534 284c-150.232-151.161-222.673-25.305-310.746-107.645C82.142 110.307 103.433 31.228 123.084 0c-.545 48.554 19.234 106.698 158.801 100.202'
        className={cn(
          basePathClassNames,
          'fill-teal-300 hover:fill-teal-200',
          pathClassNames.path1,
        )}
      />
      <path
        d='M270.579 137.502C433.637 116.339 483.329 315.1 482.998 328c-1.859-26.138-95.385-144.297-268.53-117.274C5.072 243.407 81.956 26.249 81.062 54.552s26.459 104.112 189.517 82.95'
        className={cn(
          basePathClassNames,
          'fill-cyan-400 hover:fill-cyan-300',
          pathClassNames.path2,
        )}
      />
      <path
        d='M505 365c-17.847-43.825-92.892-86.947-276.178-69.678C10.669 315.875 1.126 94.819.124 78.009q-.147-.579-.12-.86c.036-.365.066-.054.12.86C3.745 92.177 86.451 236.514 228.822 208.51 365.531 181.619 445.587 214.019 505 365'
        className={cn(
          basePathClassNames,
          'peer fill-sky-600 hover:fill-sky-500',
          pathClassNames.path3,
        )}
      />
      <path
        d='M503.655 363.23c-16.838-36.743-92.146-87.099-275.031-68.407C63.494 311.7 10.39 179.442 1.409 97.935.546 90.489.096 83.455 0 77c.135 6.452.588 13.481 1.409 20.935 8.955 77.244 62.423 198.848 227.215 179.736 222.729-25.831 262.904 58.542 275.031 85.559'
        className={cn(
          basePathClassNames,
          'dark fill-sky-700 peer-hover:fill-sky-600',
          pathClassNames.path4,
        )}
      />
    </svg>
  )
}
