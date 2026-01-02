import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { requireParent } from "@/lib/auth/requireParent";
import { getWeeklyReports } from "@/lib/reports/weekly";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WeeklyReportCard } from "@/components/Parent/WeeklyReportCard";

export default async function ReportsPage() {
  const { profile, plan } = await requireParent();

  const reports = plan !== "free" ? await getWeeklyReports(profile.id) : [];

  const isPro = plan !== "free";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/parent"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold">Weekly Reports</h1>
      </div>

      {!isPro ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upgrade to Unlock</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Weekly email reports with detailed progress by Common Core standard
              are available on Pro and Pro+ plans.
            </p>
            <Link href="/parent/billing">
              <Button>Upgrade Now</Button>
            </Link>
          </CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Reports Yet</CardTitle>
            <CardDescription>
              Weekly reports are generated every Monday. Start practicing to see
              your first report!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {reports.map((report) => (
            <WeeklyReportCard
              key={report.id}
              report={report}
              showChildName={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
