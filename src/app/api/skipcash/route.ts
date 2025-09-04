import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import * as cryptojs from 'crypto-js';

const paymentGatewayDetails = {
  sandboxURL: process.env.SKIPCASH_SANDBOX_URL || 'https://skipcashtest.azurewebsites.net',
  productionURL: process.env.SKIPCASH_PRODUCTION_URL || 'https://api.skipcash.app',
  secretKey: process.env.SKIPCASH_SECRET_KEY || '',
  keyId: process.env.SKIPCASH_KEY_ID || '',
  clientId: process.env.SKIPCASH_CLIENT_ID || '',
};

export async function POST(req: Request) {
  return new Response(JSON.stringify({ message: "SkipCash payment is disabled" }), { status: 501 });
} 
