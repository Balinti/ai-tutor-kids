import { requireParentWithChildren } from "@/lib/auth/requireParent";
import { getRecentActivity } from "@/lib/session/mastery";
import { ParentDashboard } from "@/components/Parent/ParentDashboard";
import type { PlanType } from "@/lib/constants";

export default async function ParentPage() {
  const { profile, plan, children } = await requireParentWithChildren();

  // Get stats for each child
  const stats: Record<
    string,
    {
      childId: string;
      accuracy: number;
      problemsCompleted: number;
      practiceDays: number;
      streak: number;
      avgTimeSeconds: number;
    }
  > = {};

  for (const child of children) {
    const activity = await getRecentActivity(child.id);
    stats[child.id] = {
      childId: child.id,
      accuracy: activity.accuracy,
      problemsCompleted: activity.totalAttempts,
      practiceDays: activity.practiceDays,
      streak: activity.streak,
      avgTimeSeconds: activity.avgTimeSeconds,
    };
  }

  return (
    <ParentDashboard
      profile={{ full_name: profile.full_name, email: profile.email }}
      plan={plan as PlanType}
      children={children.map((c) => ({
        id: c.id,
        name: c.name,
        grade: c.grade,
      }))}
      stats={stats}
    />
  );
}
