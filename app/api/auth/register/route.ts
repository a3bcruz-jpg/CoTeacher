import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const fullName = String(body.fullName ?? "").trim();

    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || fullName.length < 2) {
      return NextResponse.json({ error: "Enter a valid name, email, and password of at least 8 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "Unable to create account with these details." }, { status: 409 });

    const user = await prisma.user.create({
      data: { email, passwordHash: await hashPassword(password), teacherProfile: { create: { fullName } } },
      select: { id: true },
    });

    await createSession(user.id);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create your account right now." }, { status: 500 });
  }
}
