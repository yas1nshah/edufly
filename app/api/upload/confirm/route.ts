import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // your getServerSession wrapper
import  db  from "@/lib/db";
import { z } from "zod";

const confirmSchema = z.object({
  key: z.string(),
  size: z.number(),
  name: z.string(),
  type: z.string(),
  tags: z.array(z.string()).optional(),
});

export const POST = async (req: Request) => {
  const session = await auth.api.getSession(req);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = confirmSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { key, size, name, type } = parsed.data;

  await db.file.create({
    data: {
      userId,
      key,
      size,
      name,
      type,
    },
  });

  return NextResponse.json({ success: true });
};
