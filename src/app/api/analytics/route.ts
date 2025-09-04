import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDocs,
  getCountFromServer,
  orderBy,
  limit,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';

// Collections that represent users in the platform
const USER_COLLECTIONS = [
  'players',
  'academies',
  'clubs',
  'agents',
  'trainers',
  'marketers',
  'parents',
];

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

// Compute a naive profile completeness score (0-100) based on common fields
function computeProfileCompleteness(u: Record<string, any>): number {
  const fields = [
    'name',
    'email',
    'phone',
    'avatarUrl',
    'city',
    'country',
    'bio',
    'birthDate',
    'gender',
  ];
  const present = fields.reduce((acc, key) => acc + (u?.[key] ? 1 : 0), 0);
  return Math.round((present / fields.length) * 100);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { event = 'visit', route = '/', sessionId, userId } = body || {};

    // Basic validation
    if (!event) {
      return NextResponse.json({ error: 'Missing event' }, { status: 400 });
    }

    // Basic IP/Geo extraction from headers (free, no external API)
    const hdrs = (req as any).headers as Headers;
    const xff = hdrs?.get?.('x-forwarded-for') || '';
    const ipFromXff = xff.split(',')[0]?.trim();
    const ip = ipFromXff || hdrs?.get?.('x-real-ip') || hdrs?.get?.('cf-connecting-ip') || null;
    const country = hdrs?.get?.('x-vercel-ip-country') || hdrs?.get?.('cf-ipcountry') || null;
    const region = hdrs?.get?.('x-vercel-ip-country-region') || null;
    const city = hdrs?.get?.('x-vercel-ip-city') || null;
    const acceptLanguage = hdrs?.get?.('accept-language') || null;

    // Persist a lightweight visit record
    const visitsCol = collection(db, 'analytics_visits');
    await setDoc(doc(visitsCol), {
      event,
      route,
      sessionId: sessionId || null,
      userId: userId || null,
      userAgent: hdrs?.get?.('user-agent') || null,
      ip: ip || null,
      geo: {
        country: country || null,
        region: region || null,
        city: city || null,
        acceptLanguage: acceptLanguage || null,
      },
      createdAt: serverTimestamp(),
    } as any);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const now = new Date();
    const days = 30;
    const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Aggregate users counts per collection
    const userCounts: Record<string, number> = {};
    let totalUsers = 0;

    for (const colName of USER_COLLECTIONS) {
      try {
        const snap = await getCountFromServer(collection(db, colName));
        const count = snap.data().count || 0;
        userCounts[colName] = count;
        totalUsers += count;
      } catch {
        userCounts[colName] = 0;
      }
    }

    // Pull recent users for daily registrations and completeness sampling
    const recentUsers: any[] = [];
    for (const colName of USER_COLLECTIONS) {
      const q = query(
        collection(db, colName),
        orderBy('createdAt', 'desc'),
        limit(1000)
      );
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const createdAt = toDate(data?.createdAt);
        if (createdAt) {
          recentUsers.push({
            id: docSnap.id,
            collection: colName,
            createdAt,
            ...data,
          });
        }
      });
    }

    // Daily registrations last 30 days
    const dailyMap = new Map<string, number>();
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    recentUsers.forEach((u) => {
      if (u.createdAt && u.createdAt >= startOfDay(since)) {
        const key = fmt(u.createdAt);
        dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
      }
    });
    const dailyRegistrations = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Profile completeness distribution (sample from recentUsers)
    let completenessSum = 0;
    const completenessBuckets = { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 } as Record<string, number>;
    let completedOver80 = 0;
    recentUsers.forEach((u) => {
      const score = computeProfileCompleteness(u);
      completenessSum += score;
      if (score <= 25) completenessBuckets['0-25']++;
      else if (score <= 50) completenessBuckets['26-50']++;
      else if (score <= 75) completenessBuckets['51-75']++;
      else completenessBuckets['76-100']++;
      if (score >= 80) completedOver80++;
    });
    const avgCompleteness = recentUsers.length > 0 ? Math.round(completenessSum / recentUsers.length) : 0;

    // Visitors analytics from analytics_visits collection (last 30 days)
    const visitsQ = query(
      collection(db, 'analytics_visits'),
      where('createdAt', '>=', since),
      orderBy('createdAt', 'desc'),
      limit(5000)
    );
    const visitsSnap = await getDocs(visitsQ);
    const visits: { sessionId?: string | null; route?: string | null; createdAt?: Date | null; ip?: string | null; userAgent?: string | null; geo?: { country?: string | null; region?: string | null; city?: string | null } }[] = [];
    visitsSnap.forEach((d) => {
      const v = d.data();
      visits.push({
        sessionId: v?.sessionId || null,
        route: v?.route || null,
        createdAt: toDate(v?.createdAt),
        ip: v?.ip || null,
        userAgent: v?.userAgent || null,
        geo: {
          country: v?.geo?.country || null,
          region: v?.geo?.region || null,
          city: v?.geo?.city || null,
        },
      });
    });

    const totalVisits = visits.length;
    const uniqueSessions = new Set((visits.map((v) => v.sessionId).filter(Boolean) as string[])).size;

    // Visitors per day
    const visitorsDailyMap = new Map<string, number>();
    visits.forEach((v) => {
      if (!v.createdAt) return;
      const key = fmt(v.createdAt);
      visitorsDailyMap.set(key, (visitorsDailyMap.get(key) || 0) + 1);
    });
    const dailyVisitors = Array.from(visitorsDailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top routes
    const routeMap = new Map<string, number>();
    visits.forEach((v) => {
      const r = (v.route || 'unknown') as string;
      routeMap.set(r, (routeMap.get(r) || 0) + 1);
    });
    const topRoutes = Array.from(routeMap.entries())
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // By country
    const countryMap = new Map<string, number>();
    visits.forEach((v) => {
      const c = (v.geo?.country || 'UNKNOWN') as string;
      countryMap.set(c, (countryMap.get(c) || 0) + 1);
    });
    const byCountry = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Recent visits (last 20)
    const recent = visits
      .filter(v => !!v.createdAt)
      .slice(0, 20)
      .map(v => ({
        createdAt: (v.createdAt as Date)?.toISOString?.() || null,
        route: v.route || null,
        ip: v.ip || null,
        userAgent: v.userAgent || null,
        geo: v.geo || {},
      }));

    return NextResponse.json({
      users: {
        total: totalUsers,
        byType: userCounts,
        dailyRegistrations,
      },
      visitors: {
        totalVisits,
        uniqueSessions,
        dailyVisitors,
        topRoutes,
        byCountry,
        recent,
      },
      profiles: {
        avgCompleteness,
        completedOver80,
        completenessBuckets,
        sampleSize: recentUsers.length,
      },
      since: since.toISOString(),
      generatedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 });
  }
}
