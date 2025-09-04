export async function GET(req: Request) {
  return new Response(JSON.stringify({ message: "SkipCash cards endpoint is disabled" }), { status: 501 });
} 
