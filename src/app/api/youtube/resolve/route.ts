import { NextResponse } from 'next/server';
import { getYouTubeApiKey } from '@/lib/youtube/config';

// Utility: extract IDs from a YouTube URL
function extractYouTubeIds(rawUrl: string): { videoId?: string; playlistId?: string } {
  try {
    const url = new URL(rawUrl);
    if (url.hostname.includes('youtu.be')) {
      const videoId = url.pathname.split('/')[1];
      return { videoId };
    }
    if (url.hostname.includes('youtube.com')) {
      const v = url.searchParams.get('v') || undefined;
      const list = url.searchParams.get('list') || undefined;
      const isEmbed = url.pathname.startsWith('/embed/');
      const embedId = isEmbed ? url.pathname.split('/')[2] : undefined;
      return { videoId: v || embedId, playlistId: list };
    }
  } catch {}
  return {};
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

    const ids = extractYouTubeIds(url);
    const apiKey = await getYouTubeApiKey();

    // If no API key, fallback to oEmbed for videos
    if (!apiKey) {
      if (ids.videoId) {
        try {
          const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ids.videoId}&format=json`);
          if (!oembedRes.ok) throw new Error('oEmbed failed');
          const oembed = await oembedRes.json();
          return NextResponse.json({
            ...ids,
            resolvedTitle: oembed.title,
            channelTitle: oembed.author_name,
            thumbnailUrl: oembed.thumbnail_url,
            // duration not available via oEmbed
          });
        } catch {
          return NextResponse.json({ ...ids });
        }
      }
      return NextResponse.json({ ...ids });
    }

    // With API key: call YouTube Data API
    if (ids.videoId) {
      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${ids.videoId}&key=${apiKey}`,
        { next: { revalidate: 3600 } }
      );
      const videoData = await videoRes.json();
      const item = videoData.items?.[0];
      let durationSec: number | undefined;
      if (item?.contentDetails?.duration) {
        // ISO 8601 duration to seconds
        const iso = item.contentDetails.duration as string;
        const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso);
        if (match) {
          const h = parseInt(match[1] || '0', 10);
          const m = parseInt(match[2] || '0', 10);
          const s = parseInt(match[3] || '0', 10);
          durationSec = h * 3600 + m * 60 + s;
        }
      }
      return NextResponse.json({
        ...ids,
        resolvedTitle: item?.snippet?.title,
        resolvedDescription: item?.snippet?.description,
        channelTitle: item?.snippet?.channelTitle,
        thumbnailUrl: item?.snippet?.thumbnails?.medium?.url,
        durationSec,
      });
    }

    if (ids.playlistId) {
      const listRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${ids.playlistId}&key=${apiKey}`,
        { next: { revalidate: 3600 } }
      );
      const listData = await listRes.json();
      const item = listData.items?.[0];
      return NextResponse.json({
        ...ids,
        resolvedTitle: item?.snippet?.title,
        resolvedDescription: item?.snippet?.description,
        channelTitle: item?.snippet?.channelTitle,
        thumbnailUrl: item?.snippet?.thumbnails?.medium?.url,
        itemCount: item?.contentDetails?.itemCount,
      });
    }

    return NextResponse.json({ ...ids });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to resolve' }, { status: 500 });
  }
}



