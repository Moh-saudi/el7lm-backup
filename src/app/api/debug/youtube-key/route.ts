import { NextResponse } from 'next/server';

export async function GET() {
  const present = Boolean(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY.trim().length > 0);
  // Do NOT expose the key value
  return NextResponse.json({ present });
}


