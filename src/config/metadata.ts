import { Metadata } from 'next'

export const APP_NAME = 'Inventory Tracker'

export const metadata = {
  title: APP_NAME,
  description: 'An inventory management app built with Next.js',
} as const satisfies Metadata
