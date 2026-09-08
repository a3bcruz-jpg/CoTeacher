import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    if (!title || title.length > 200) {
      return NextResponse.json({ error: "A task title between 1 and 200 characters is required." }, { status: 400 });
    }

    const priority = ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(body.priority) ? body.priority : "MEDIUM";
    const dueAt = body.dueAt ? new Date(body.dueAt) : null;
    if (dueAt && Number.isNaN(dueAt.getTime())) {
      return NextResponse.json({ error: "Invalid due date." }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title,
        description: body.description ? String(body.description).slice(0, 2000) : null,
        dueAt,
        priority,
        category: body.category ? String(body.category).slice(0, 100) : null,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create task." }, { status: 500 });
  }
}
