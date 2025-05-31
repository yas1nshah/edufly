import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
    const session = await auth.api.getSession(req);
    const userId = session?.user.id;

    if (!userId) return new Response("Unauthorized", { status: 401 });

    const subscription = await db.subscription.findUnique({
        where: { userId },
        select: {
            id: true,
            userId: true,
            planId: true,
            startedAt: true,
            expiresAt: true,
            renewed: true,
            plan: {
                select: {
                    id: true,
                    name: true,
                    storageLimitMB: true,
                    aiTokensPerMonth: true,
                    priceCents: true,
                    currency: true,
                    createdAt: true,
                    features: true,
                },
            },
        }
    });

    console.log(subscription);

    return new Response(JSON.stringify(subscription), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}