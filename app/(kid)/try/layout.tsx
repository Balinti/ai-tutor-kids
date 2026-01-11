"use client";

import { TrialProvider } from "@/components/Trial/TrialProvider";

export default function TrialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TrialProvider>{children}</TrialProvider>;
}
