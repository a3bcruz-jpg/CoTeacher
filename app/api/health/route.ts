import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  let database: "ok" | "error" = "ok";
  let errorCode: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    database = "error";
    const code = (error as { code?: unknown })?.code;
    errorCode = typeof code === "string" ? code : null;
  }

  return NextResponse.json(
    {
      status: database === "ok" ? "ok" : "degraded",
      service: "coteacher",
      database,
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      databaseErrorCode: errorCode,
      timestamp: new Date().toISOString(),
    },
    { status: database === "ok" ? 200 : 503 },
  );
}
