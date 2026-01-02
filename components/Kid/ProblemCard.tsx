import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DOMAINS } from "@/lib/constants";

interface ProblemCardProps {
  problem: {
    prompt: string;
    difficulty: number;
    standard?: {
      code: string;
      domain: string;
    };
  };
  position: number;
  totalProblems: number;
}

export function ProblemCard({
  problem,
  position,
  totalProblems,
}: ProblemCardProps) {
  const difficultyLabel = ["", "Easy", "Medium", "Challenging", "Hard", "Expert"][
    problem.difficulty
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Problem {position + 1} of {totalProblems}
          </span>
          <div className="flex items-center gap-2">
            {problem.standard && (
              <Badge variant="outline" className="text-xs">
                {DOMAINS[problem.standard.domain] || problem.standard.domain}
              </Badge>
            )}
            <Badge
              variant={
                problem.difficulty <= 2
                  ? "secondary"
                  : problem.difficulty <= 3
                    ? "default"
                    : "destructive"
              }
              className="text-xs"
            >
              {difficultyLabel}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-relaxed">{problem.prompt}</p>
      </CardContent>
    </Card>
  );
}
