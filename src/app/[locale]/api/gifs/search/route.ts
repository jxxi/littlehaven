import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { logError } from '@/utils/Logger';

const { TENOR_API_KEY } = process.env;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
        query,
      )}&key=${TENOR_API_KEY}`,
    );

    const data = await response.json();

    const results = data.results.map((gif: any) => ({
      id: gif.id,
      url: gif.media_formats.gif.url,
      preview: gif.media_formats.tinygif.url,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    logError('Error in gifs search API route', error);
    return NextResponse.json(
      { error: 'Failed to fetch GIFs' },
      { status: 500 },
    );
  }
}
