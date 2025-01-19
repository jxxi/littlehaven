import type { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

import { getPublicCircles } from '@/utils/circle/route';

export async function GET(_req: NextApiRequest) {
  try {
    const circles = await getPublicCircles();
    return NextResponse.json(circles); // Return the response for GET
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch public circles' },
      { status: 500 },
    ); // Handle errors
  }
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  // Handle POST requests if needed
  res.setHeader('Allow', ['GET']);
  return NextResponse.json(
    { error: `Method ${req.method} Not Allowed` },
    { status: 500 },
  ); // Return for unsupported methods
}

// Add more named exports for other HTTP methods as needed
