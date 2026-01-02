import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import { requireParentWithChildren } from "@/lib/auth/requireParent";
import { getRecentActivity, getStandardsBreakdown } from "@/lib/session/mastery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChildSwitcher } from "@/components/Parent/ChildSwitcher";
import { StandardsBreakdown } from "@/components/Parent/StandardsBreakdown";
import { GoalSetter } from "@/components/Parent/GoalSetter";
import { formatPercentage, formatTime, getGradeLabel } from "@/lib/utils";

interface ChildDetailPageProps {
  params: Promise<{ childId: string }>;
}

export default async function ChildDetailPage({ params }: ChildDetailPageProps) {
  const { childId } = await params;
  const { children, plan } = await requireParentWithChildren();

  const child = children.find((c) => c.id === childId);
  if (!child) {
    notFound();
  }

  const activity = await getRecentActivity(child.id);
  const breakdown = await getStandardsBreakdown(child.id, child.grade);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/parent"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
          <ChildSwitcher
            children={children.map((c) => ({
              id: c.id,
              name: c.name,
              grade: c.grade,
            }))}
            currentChildId={childId}
          />
        </div>
        <Link href={`/kid/${childId}`}>
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Start Practice
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week&apos;s Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatPercentage(activity.accuracy)}
            </div>
            <p className="text-xs text-muted-foreground">
              {activity.correctAttempts} of {activity.totalAttempts} correct
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Practice Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activity.streak} days</div>
            <p className="text-xs text-muted-foreground">
              {activity.practiceDays} days practiced this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Time per Problem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatTime(activity.avgTimeSeconds)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getGradeLabel(child.grade)} level
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StandardsBreakdown
            mastered={breakdown.mastered}
            progressing={breakdown.progressing}
            needsWork={breakdown.needsWork}
            notStarted={breakdown.notStarted}
          />
        </div>

        <div>
          <GoalSetter childName={child.name} />
        </div>
      </div>
    </div>
  );
}
