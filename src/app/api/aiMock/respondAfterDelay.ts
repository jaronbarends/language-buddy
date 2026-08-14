import { NextResponse } from 'next/server';

export async function respondAfterDelay({
  data,
  delayMs = 1000,
  status = 200,
}: {
  data: object;
  delayMs?: number;
  status?: number;
}): Promise<NextResponse> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return NextResponse.json(data, { status });
}
