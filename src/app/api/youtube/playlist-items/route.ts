import { NextResponse } from 'next/server';
import { getYouTubeApiKey } from '@/lib/youtube/config';

function extractPlaylistId(input: string): string | null {
  try {
    input = String(input || '').trim().replace(/^@+/, '');
  } catch {}
  try {
    if (!input) return null;
    if (input.startsWith('http')) {
      const url = new URL(input);
      const list = url.searchParams.get('list');
      return list || null;
    }
    // Assume it's already an ID
    return input;
  } catch {
    return null;
  }
}

function parseISODurationToSeconds(iso?: string): number | undefined {
  if (!iso) return undefined;
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso);
  if (!match) return undefined;
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  const s = parseInt(match[3] || '0', 10);
  return h * 3600 + m * 60 + s;
}

export async function POST(req: Request) {
  try {
    const { playlistUrlOrId, pageToken } = await req.json();
    const apiKey = await getYouTubeApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing YOUTUBE_API_KEY' }, { status: 400 });
    }

    const playlistId = extractPlaylistId(playlistUrlOrId);
    if (!playlistId) {
      return NextResponse.json({ error: 'Invalid playlist' }, { status: 400 });
    }

    const items: any[] = [];
    let nextToken = pageToken || undefined;

    // Fetch one page per request (client can paginate) to avoid timeouts
    const listUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    listUrl.searchParams.set('part', 'snippet,contentDetails');
    listUrl.searchParams.set('playlistId', playlistId);
    listUrl.searchParams.set('maxResults', '50');
    listUrl.searchParams.set('key', apiKey);
    if (nextToken) listUrl.searchParams.set('pageToken', nextToken);

    const listRes = await fetch(listUrl.toString(), { next: { revalidate: 0 } });
    const listData = await listRes.json();
    if (!listRes.ok || listData?.error) {
      const msg = listData?.error?.message || 'YouTube playlistItems fetch failed';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    nextToken = listData.nextPageToken;

    const pageItems = (listData.items || []).map((it: any, idx: number) => {
      const vid = it.contentDetails?.videoId;
      const sn = it.snippet || {};
      return {
        videoId: vid,
        title: sn.title,
        description: sn.description,
        channelTitle: sn.channelTitle,
        publishedAt: sn.publishedAt,
        order: idx, // order within this page; client can accumulate across pages
        thumbnails: sn.thumbnails,
      };
    }).filter((x: any) => x.videoId);

    // Fetch durations in batches (<=50 per request)
    if (pageItems.length > 0) {
      const ids = pageItems.map((x: any) => x.videoId).join(',');
      const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
      videosUrl.searchParams.set('part', 'contentDetails');
      videosUrl.searchParams.set('id', ids);
      videosUrl.searchParams.set('key', apiKey);
      const videosRes = await fetch(videosUrl.toString(), { next: { revalidate: 0 } });
      const videosData = await videosRes.json();
      if (!videosRes.ok || videosData?.error) {
        const msg = videosData?.error?.message || 'YouTube videos fetch failed';
        return NextResponse.json({ error: msg, playlistId, items: pageItems, nextPageToken: nextToken || null }, { status: 400 });
      }
      const durations: Record<string, number | undefined> = {};
      const idToItem: Record<string, any> = {};
      for (const it of pageItems) { idToItem[it.videoId] = it; }
      for (const v of videosData.items || []) {
        const d = parseISODurationToSeconds(v.contentDetails?.duration);
        durations[v.id] = d;
      }
      for (const it of pageItems) {
        (it as any).durationSec = durations[it.videoId];
        const sn = idToItem[it.videoId];
        (it as any).thumbnailUrl = sn?.thumbnails?.medium?.url || sn?.thumbnails?.high?.url || sn?.thumbnails?.default?.url;
      }
    }

    items.push(...pageItems);

    return NextResponse.json({ playlistId, items, nextPageToken: nextToken || null });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 });
  }
}


