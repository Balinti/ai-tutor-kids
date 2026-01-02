import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { getUser, getProfile } from "@/lib/supabase/server";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile();

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader user={profile} />
      <main className="container py-8">{children}</main>
    </div>
  );
}
