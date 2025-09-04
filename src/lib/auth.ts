import { NextAuthOptions, Session } from "next-auth";

// Extend the Session type to include user ID
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    }
  }
}

export const authOptions = {};
