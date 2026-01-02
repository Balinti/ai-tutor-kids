import { TrendingUp, TrendingDown, Minus, Calendar, Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDateRange, formatPercentage, formatTime } from "@/lib/utils";

interface WeeklyReportCardProps {
  report: {
    week_start: string;
    week_end: string;
    accuracy: number;
    avg_time_seconds: number;
    problems_completed: number;
    practice_days: number;
    missed_days: number;
    improved_standards: Array<{ code: string; improvement: number }>;
    stuck_standards: Array<{ code: string; accuracy: number }>;
    children?: { name: string };
  };
  showChildName?: boolean;
}

export function WeeklyReportCard({
  report,
  showChildName = false,
}: WeeklyReportCardProps) {
  const getTrend = () => {
    if (report.accuracy >= 80) return { icon: TrendingUp, color: "text-success" };
    if (report.accuracy >= 60) return { icon: Minus, color: "text-warning" };
    return { icon: TrendingDown, color: "text-destructive" };
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {showChildName && report.children && (
              <p className="text-sm text-muted-foreground mb-1">
                {report.children.name}
              </p>
            )}
            <CardTitle className="text-base">
              {formatDateRange(report.week_start, report.week_end)}
            </CardTitle>
            <CardDescription>Weekly Progress Report</CardDescription>
          </div>
          <div className={`flex items-center gap-1 ${trend.color}`}>
            <TrendIcon className="h-5 w-5" />
            <span className="text-2xl font-bold">
              {formatPercentage(report.accuracy)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-2xl font-bold">{report.problems_completed}</p>
            <p className="text-muted-foreground">Problems</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{report.practice_days}/7</p>
            <p className="text-muted-foreground">Practice Days</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {formatTime(report.avg_time_seconds)}
            </p>
            <p className="text-muted-foreground">Avg Time</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Practice Consistency
            </span>
            <span>{formatPercentage((report.practice_days / 7) * 100)}</span>
          </div>
          <Progress value={(report.practice_days / 7) * 100} className="h-2" />
        </div>

        {report.improved_standards.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              Improved Standards
            </p>
            <div className="flex flex-wrap gap-1">
              {report.improved_standards.map((s) => (
                <Badge key={s.code} variant="outline" className="text-xs">
                  {s.code}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {report.stuck_standards.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1">
              <Target className="h-3 w-3 text-warning" />
              Focus Areas
            </p>
            <div className="flex flex-wrap gap-1">
              {report.stuck_standards.map((s) => (
                <Badge key={s.code} variant="secondary" className="text-xs">
                  {s.code}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
