import { prisma } from "@/lib/prisma";

export async function saveGeneratedDraft(userId: string, title: string, content: string) {
  if (!title.trim()) throw new Error("Document title is required.");
  if (!content.trim()) throw new Error("Document content is required.");

  return prisma.document.create({
    data: {
      userId,
      title: title.trim(),
      content,
      status: "DRAFT",
    },
  });
}
