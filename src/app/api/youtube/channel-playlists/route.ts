import { NextResponse } from 'next/server';
import { getYouTubeApiKey } from '@/lib/youtube/config';

function parseChannelInput(input: string): { channelId?: string; query?: string } {
  if (!input) return {};
  try {
    if (input.startsWith('UC') && input.length >= 20) {
      return { channelId: input };
    }
    if (input.startsWith('@')) {
      return { query: input }; // handle, resolve via search
    }
    if (input.startsWith('http')) {
      const url = new URL(input);
      const p = url.pathname;
      const segs = p.split('/').filter(Boolean);
      if (segs[0] === 'channel' && segs[1]) {
        return { channelId: segs[1] };
      }
      // /@handle or /c/custom or /user/username -> search fallback
      const last = segs[0]?.startsWith('@') ? segs[0] : segs[1] || segs[0];
      if (last) return { query: last.startsWith('@') ? last : last };
    }
    // fallback: treat as search query
    return { query: input };
  } catch {
    return { query: input };
  }
}

export async function POST(req: Request) {
  try {
    const { channelUrlOrId, pageToken } = await req.json();
    const apiKey = await getYouTubeApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing YOUTUBE_API_KEY' }, { status: 400 });
    }

    const parsed = parseChannelInput(channelUrlOrId);
    let channelId = parsed.channelId;

    if (!channelId) {
      const q = (parsed.query || '').replace(/^@/, '');
      if (!q) return NextResponse.json({ error: 'Invalid channel input' }, { status: 400 });
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      searchUrl.searchParams.set('part', 'snippet');
      searchUrl.searchParams.set('type', 'channel');
      searchUrl.searchParams.set('q', q);
      searchUrl.searchParams.set('maxResults', '1');
      searchUrl.searchParams.set('key', apiKey);
      const sRes = await fetch(searchUrl.toString(), { next: { revalidate: 3600 } });
      const sData = await sRes.json();
      const first = sData.items?.[0];
      channelId = first?.snippet?.channelId || first?.id?.channelId;
    }

    if (!channelId) {
      return NextResponse.json({ error: 'Unable to resolve channel' }, { status: 404 });
    }

    const listUrl = new URL('https://www.googleapis.com/youtube/v3/playlists');
    listUrl.searchParams.set('part', 'snippet,contentDetails');
    listUrl.searchParams.set('channelId', channelId);
    listUrl.searchParams.set('maxResults', '50');
    listUrl.searchParams.set('key', apiKey);
    if (pageToken) listUrl.searchParams.set('pageToken', pageToken);

    const listRes = await fetch(listUrl.toString(), { next: { revalidate: 0 } });
    const listData = await listRes.json();
    const items = (listData.items || []).map((pl: any) => ({
      playlistId: pl.id,
      title: pl.snippet?.title,
      description: pl.snippet?.description,
      channelTitle: pl.snippet?.channelTitle,
      itemCount: pl.contentDetails?.itemCount,
      thumbnailUrl: pl.snippet?.thumbnails?.medium?.url || pl.snippet?.thumbnails?.high?.url,
    }));

    return NextResponse.json({ channelId, items, nextPageToken: listData.nextPageToken || null });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 });
  }
}


