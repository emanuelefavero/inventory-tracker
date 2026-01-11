import { Test } from '@/__dev__/test'

export default function Home() {
  return (
    <>
      <h1 className='text-4xl font-bold'>Hello</h1>

      {process.env.NODE_ENV === 'development' && <Test />}
    </>
  )
}
