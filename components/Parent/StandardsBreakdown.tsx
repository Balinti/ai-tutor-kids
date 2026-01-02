"use client";

import { CheckCircle, Circle, AlertCircle, HelpCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DOMAINS } from "@/lib/constants";
import { formatPercentage, formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MasteryItem {
  standardId: string;
  standardCode: string;
  domain: string;
  description: string;
  attemptsCount: number;
  correctCount: number;
  accuracy: number;
  avgTimeSeconds: number;
  trend: "improving" | "stable" | "struggling";
}

interface StandardsBreakdownProps {
  mastered: MasteryItem[];
  progressing: MasteryItem[];
  needsWork: MasteryItem[];
  notStarted: Array<{
    standardId: string;
    code: string;
    domain: string;
    description: string;
  }>;
}

export function StandardsBreakdown({
  mastered,
  progressing,
  needsWork,
  notStarted,
}: StandardsBreakdownProps) {
  const totalStandards =
    mastered.length + progressing.length + needsWork.length + notStarted.length;

  const sections = [
    {
      title: "Mastered",
      description: "80%+ accuracy with 5+ attempts",
      icon: CheckCircle,
      iconColor: "text-success",
      items: mastered,
      variant: "success" as const,
    },
    {
      title: "Progressing",
      description: "Making good progress",
      icon: Circle,
      iconColor: "text-primary",
      items: progressing,
      variant: "default" as const,
    },
    {
      title: "Needs Work",
      description: "Below 50% accuracy",
      icon: AlertCircle,
      iconColor: "text-destructive",
      items: needsWork,
      variant: "destructive" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Standards Progress</CardTitle>
        <CardDescription>
          {mastered.length} of {totalStandards} standards mastered
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress
          value={(mastered.length / totalStandards) * 100}
          className="h-3"
        />

        <Accordion type="multiple" className="w-full">
          {sections.map((section) => (
            <AccordionItem key={section.title} value={section.title}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <section.icon
                    className={cn("h-4 w-4", section.iconColor)}
                  />
                  <span>{section.title}</span>
                  <Badge variant="secondary" className="ml-2">
                    {section.items.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {section.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No standards in this category yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div
                        key={item.standardId}
                        className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.standardCode}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {DOMAINS[item.domain] || item.domain}
                            </span>
                          </div>
                          <p className="text-sm">{item.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {item.correctCount}/{item.attemptsCount} correct
                            </span>
                            <span>
                              {formatTime(item.avgTimeSeconds)} avg
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              "text-lg font-bold",
                              item.accuracy >= 80 && "text-success",
                              item.accuracy >= 50 &&
                                item.accuracy < 80 &&
                                "text-primary",
                              item.accuracy < 50 && "text-destructive"
                            )}
                          >
                            {formatPercentage(item.accuracy)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}

          {notStarted.length > 0 && (
            <AccordionItem value="notStarted">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Not Started</span>
                  <Badge variant="secondary" className="ml-2">
                    {notStarted.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {notStarted.slice(0, 5).map((item) => (
                    <div
                      key={item.standardId}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                    >
                      <Badge variant="outline" className="text-xs">
                        {item.code}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  ))}
                  {notStarted.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{notStarted.length - 5} more standards
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
