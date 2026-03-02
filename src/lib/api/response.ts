import { ApiError, ApiResult } from '@/lib/api/types'
import { NextResponse } from 'next/server'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiResult<T>>({ ok: true, data }, { status })
}

export function err(error: ApiError, status: number) {
  return NextResponse.json<ApiResult<never>>({ ok: false, error }, { status })
}
