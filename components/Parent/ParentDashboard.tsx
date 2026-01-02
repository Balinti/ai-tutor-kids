"use client";

import Link from "next/link";
import { Plus, Play, TrendingUp, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlanBadge } from "@/components/PlanBadge";
import { formatPercentage, formatTime, getGradeLabel } from "@/lib/utils";
import type { PlanType } from "@/lib/constants";

interface Child {
  id: string;
  name: string;
  grade: number;
}

interface ChildStats {
  childId: string;
  accuracy: number;
  problemsCompleted: number;
  practiceDays: number;
  streak: number;
  avgTimeSeconds: number;
}

interface ParentDashboardProps {
  profile: {
    full_name?: string;
    email: string;
  };
  plan: PlanType;
  children: Child[];
  stats: Record<string, ChildStats>;
}

export function ParentDashboard({
  profile,
  plan,
  children,
  stats,
}: ParentDashboardProps) {
  const hasChildren = children.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s how your children are doing this week.
          </p>
        </div>
        <PlanBadge plan={plan} />
      </div>

      {!hasChildren ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Add Your First Child</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Get started by adding a child profile. They&apos;ll be able to practice
              math with personalized problems.
            </p>
            <Link href="/parent/children/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Child
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Children</h2>
            <Link href="/parent/children/new">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Child
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => {
              const childStats = stats[child.id];
              const accuracy = childStats?.accuracy || 0;

              return (
                <Card key={child.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{child.name}</CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {getGradeLabel(child.grade)}
                      </span>
                    </div>
                    <CardDescription>Last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {formatPercentage(accuracy)}
                        </p>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {childStats?.streak || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Day Streak</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Weekly Progress</span>
                        <span>{childStats?.practiceDays || 0}/7 days</span>
                      </div>
                      <Progress
                        value={((childStats?.practiceDays || 0) / 7) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{childStats?.problemsCompleted || 0} problems</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatTime(childStats?.avgTimeSeconds || 0)} avg
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/kid/${child.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <Play className="mr-2 h-3 w-3" />
                          Practice
                        </Button>
                      </Link>
                      <Link href={`/parent/children/${child.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          <TrendingUp className="mr-2 h-3 w-3" />
                          Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
