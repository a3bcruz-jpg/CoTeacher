import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  let database: "ok" | "error" = "ok";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }

  return NextResponse.json(
    {
      status: database === "ok" ? "ok" : "degraded",
      service: "coteacher",
      database,
      timestamp: new Date().toISOString(),
    },
    { status: database === "ok" ? 200 : 503 },
  );
}
