export async function POST(req: Request) {
  return new Response(JSON.stringify({ message: "SkipCash webhook is disabled" }), { status: 501 });
} 
