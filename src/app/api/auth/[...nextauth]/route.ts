import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { NextRequest } from "next/server";

const handler = async (req: NextRequest, ctx: any) => {
  const protocol = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host");
  
  if (host && !process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = `${protocol}://${host}`;
  }
  
  return NextAuth(authOptions)(req, ctx);
};

export { handler as GET, handler as POST };
