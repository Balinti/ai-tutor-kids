import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { createClient, getUser } from "@/lib/supabase/server";

interface KidTokenPayload {
  childId: string;
  parentId: string;
  exp: number;
}

export async function requireKidAccess(childId: string) {
  // First check if parent is logged in
  const user = await getUser();

  if (user) {
    // Verify the child belongs to this parent
    const supabase = await createClient();
    const { data: child } = await supabase
      .from("children")
      .select("*, profiles!inner(*)")
      .eq("id", childId)
      .eq("parent_id", user.id)
      .single();

    if (child) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("parent_id", user.id)
        .in("status", ["active", "trialing"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        child,
        parentId: user.id,
        plan: subscription?.plan || "free",
        isParentSession: true,
      };
    }
  }

  // Check for kid token
  const cookieStore = await cookies();
  const kidToken = cookieStore.get("kid_token")?.value;

  if (!kidToken) {
    redirect(`/kid/${childId}`);
  }

  try {
    const payload = jwt.verify(
      kidToken,
      process.env.KID_TOKEN_JWT_SECRET!
    ) as KidTokenPayload;

    if (payload.childId !== childId) {
      redirect(`/kid/${childId}`);
    }

    const supabase = await createClient();
    const { data: child } = await supabase
      .from("children")
      .select("*")
      .eq("id", childId)
      .single();

    if (!child) {
      redirect(`/kid/${childId}`);
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("parent_id", payload.parentId)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return {
      child,
      parentId: payload.parentId,
      plan: subscription?.plan || "free",
      isParentSession: false,
    };
  } catch {
    redirect(`/kid/${childId}`);
  }
}

export function generateKidToken(childId: string, parentId: string): string {
  return jwt.sign(
    { childId, parentId },
    process.env.KID_TOKEN_JWT_SECRET!,
    { expiresIn: "8h" }
  );
}

export function verifyKidToken(token: string): KidTokenPayload | null {
  try {
    return jwt.verify(
      token,
      process.env.KID_TOKEN_JWT_SECRET!
    ) as KidTokenPayload;
  } catch {
    return null;
  }
}
