import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
    const session = await auth.api.getSession(req);

    if (!session?.user.id) {
        return redirect("/auth/sign-in");
    }

    return redirect("/dashboard");
};