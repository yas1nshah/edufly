import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";
import { v4 as uuid } from "uuid";
import  db  from "@/lib/db";
import { auth } from "@/lib/auth";

export const POST = async (req: Request) => {
  const session = await auth.api.getSession(req);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { fileName, fileSize, fileType, tags } = body;

  if (!fileName || !fileSize || !fileType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const usage = await db.file.aggregate({
    where: { userId },
    _sum: { size: true },
  });

  const subscription = await db.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  const max = (subscription?.plan?.storageLimitMB ?? 100) * 1024 * 1024;
  const current = usage._sum.size ?? 0;

  if (current + fileSize > max) {
    return NextResponse.json({ error: "Storage limit exceeded" }, { status: 403 });
  }

  const key = `uploads/${userId}/${uuid()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    ContentType: fileType,
  });

  const url = await getSignedUrl(r2, command, { expiresIn: 60 });

  return NextResponse.json({ url, key });
};
