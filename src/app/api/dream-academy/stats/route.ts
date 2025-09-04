import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { sourceId, action } = await req.json();
    if (!sourceId || !['view', 'like', 'unlike'].includes(action)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const ref = doc(db, 'dream_academy_stats', sourceId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { views: 0, likes: 0, updatedAt: new Date() });
    }
    if (action === 'view') {
      await updateDoc(ref, { views: increment(1), updatedAt: new Date() });
    } else if (action === 'like') {
      await updateDoc(ref, { likes: increment(1), updatedAt: new Date() });
    } else if (action === 'unlike') {
      await updateDoc(ref, { likes: increment(-1), updatedAt: new Date() });
    }
    const fresh = await getDoc(ref);
    return NextResponse.json(fresh.data());
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sourceId = searchParams.get('sourceId');
    if (!sourceId) return NextResponse.json({ error: 'Missing sourceId' }, { status: 400 });
    const ref = doc(db, 'dream_academy_stats', sourceId);
    const snap = await getDoc(ref);
    return NextResponse.json(snap.exists() ? snap.data() : { views: 0, likes: 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 });
  }
}


