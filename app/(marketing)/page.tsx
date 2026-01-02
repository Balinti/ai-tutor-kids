import Link from "next/link";
import {
  Clock,
  CheckCircle,
  Brain,
  LineChart,
  Shield,
  Users,
  ArrowRight,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProfile } from "@/lib/supabase/server";

export default async function HomePage() {
  const profile = await getProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader user={profile} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Master Math Word Problems in{" "}
              <span className="text-primary">10 Minutes a Day</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Socratic micro-tutoring for Grades 5-8. Our AI coach guides your
              child through Common Core math word problems step-by-step, never
              giving away the answer.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/login">
                <Button size="xl">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="xl" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/50 py-20">
          <div className="container">
            <h2 className="text-center text-3xl font-bold">
              Why Parents Love WordProblem Coach
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Our evidence-based approach helps kids build real problem-solving
              skills, not just memorize formulas.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">10 Minutes Daily</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Short, focused sessions fit into busy schedules. Just enough
                    practice to build skills without burnout.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Socratic Method</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Our AI coach asks guiding questions, never gives away
                    answers. Kids learn to think, not just copy.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Tool-Verified</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Answers are verified by math engine, not just AI. Precise
                    feedback every time.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <LineChart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Weekly Reports</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Get detailed progress reports by Common Core standard. See
                    exactly where your child needs help.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Multiple Children</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Pro plans support multiple child profiles with individual
                    progress tracking for each.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Kid-Safe PIN</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Kids can practice independently with a simple PIN. No email
                    or password needed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container">
            <h2 className="text-center text-3xl font-bold">How It Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Our 4-step framework teaches real problem-solving skills
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-4">
              {[
                {
                  step: 1,
                  title: "Read",
                  description:
                    "Identify key information and understand what the problem is asking",
                },
                {
                  step: 2,
                  title: "Represent",
                  description:
                    "Create equations, diagrams, or tables to visualize the problem",
                },
                {
                  step: 3,
                  title: "Solve",
                  description:
                    "Work through the representation step-by-step to find the answer",
                },
                {
                  step: 4,
                  title: "Check",
                  description:
                    "Verify the answer makes sense in the context of the problem",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-primary py-20">
          <div className="container text-center">
            <h2 className="text-3xl font-bold text-primary-foreground">
              Start Your Child&apos;s Math Journey Today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Try free with 3 problems per day. No credit card required.
            </p>
            <div className="mt-8">
              <Link href="/login">
                <Button size="xl" variant="secondary">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
