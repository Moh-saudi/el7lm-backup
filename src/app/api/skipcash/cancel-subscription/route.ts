export async function POST(req: Request) {
  return new Response(JSON.stringify({ message: "SkipCash cancel subscription is disabled" }), { status: 501 });
} 
