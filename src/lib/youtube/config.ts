import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

let cachedKey: string | null | undefined;

export async function getYouTubeApiKey(): Promise<string | null> {
  if (typeof cachedKey !== 'undefined') return cachedKey;

  // Prefer environment variable
  const envKey = process.env.YOUTUBE_API_KEY?.trim();
  if (envKey) {
    cachedKey = envKey;
    return cachedKey;
  }

  try {
    // Fallback to Firestore settings: app_settings/youtube { apiKey: string }
    const ref = doc(db, 'app_settings', 'youtube');
    const snap = await getDoc(ref);
    const apiKey = (snap.exists() && (snap.data() as any)?.apiKey) || null;
    cachedKey = apiKey;
    return cachedKey;
  } catch {
    cachedKey = null;
    return cachedKey;
  }
}


