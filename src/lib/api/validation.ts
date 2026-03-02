import { z } from 'zod'

export async function parseJsonWithSchema<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  const body = await request.json()
  return schema.parse(body)
}

export function parseSearchParamsWithSchema<T>(
  url: URL,
  schema: z.ZodType<T>,
): T {
  const params = Object.fromEntries(url.searchParams.entries())
  return schema.parse(params)
}
