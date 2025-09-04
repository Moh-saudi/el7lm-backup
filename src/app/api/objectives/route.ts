import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const objectivesRef = collection(db, 'objectives');
    const snapshot = await getDocs(objectivesRef);
    const objectives = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ objectives });
  } catch (error) {
    console.error('Error fetching objectives:', error);
    return NextResponse.json({ error: 'Failed to fetch objectives' }, { status: 500 });
  }
}
