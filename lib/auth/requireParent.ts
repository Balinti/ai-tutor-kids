import { redirect } from "next/navigation";
import { createClient, getUser, getProfile, getSubscription } from "@/lib/supabase/server";

export async function requireParent() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile();

  if (!profile || profile.role !== "parent") {
    redirect("/login");
  }

  const subscription = await getSubscription();

  return {
    user,
    profile,
    subscription,
    plan: subscription?.plan || "free",
  };
}

export async function requireParentWithChildren() {
  const { user, profile, subscription, plan } = await requireParent();

  const supabase = await createClient();
  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true });

  return {
    user,
    profile,
    subscription,
    plan,
    children: children || [],
  };
}
