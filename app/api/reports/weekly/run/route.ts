import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateWeeklyReport,
  saveWeeklyReport,
  getAllChildrenForReports,
} from "@/lib/reports/weekly";
import { sendWeeklyReportEmail } from "@/lib/reports/email";

const RequestSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weekEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const headersList = await headers();
    const cronSecret = headersList.get("x-cron-secret");
    const authorization = headersList.get("authorization");

    const isAuthorized =
      cronSecret === process.env.APP_CRON_SECRET ||
      authorization === `Bearer ${process.env.APP_CRON_SECRET}`;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { weekStart, weekEnd } = RequestSchema.parse(body);

    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekEnd);
    weekEndDate.setHours(23, 59, 59, 999);

    const supabase = createAdminClient();

    // Get all children with Pro/Pro+ parents
    const children = await getAllChildrenForReports();

    let reportsGenerated = 0;
    let emailsSent = 0;

    for (const child of children) {
      try {
        // Generate report
        const reportData = await generateWeeklyReport(
          child.id,
          weekStartDate,
          weekEndDate
        );

        if (!reportData) {
          // No activity this week
          continue;
        }

        // Save report
        const savedReport = await saveWeeklyReport(reportData);
        reportsGenerated++;

        // Get parent email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", child.parent_id)
          .single();

        if (profile?.email) {
          // Send email
          const result = await sendWeeklyReportEmail({
            reportId: savedReport.id,
            parentEmail: profile.email,
            parentName: profile.full_name || "",
            childName: reportData.childName,
            weekStart: reportData.weekStart,
            weekEnd: reportData.weekEnd,
            accuracy: reportData.accuracy,
            problemsCompleted: reportData.problemsCompleted,
            practiceDays: reportData.practiceDays,
            improvedStandards: reportData.improvedStandards,
            stuckStandards: reportData.stuckStandards,
            nextWeekFocus: reportData.nextWeekFocus,
          });

          if (result.success) {
            emailsSent++;
          }
        }
      } catch (error) {
        console.error(`Error processing report for child ${child.id}:`, error);
      }
    }

    // Log the run
    await supabase.from("audit_events").insert({
      event_type: "weekly_reports_run",
      payload: {
        weekStart,
        weekEnd,
        reportsGenerated,
        emailsSent,
        childrenProcessed: children.length,
      },
    });

    return NextResponse.json({
      ok: true,
      reportsGenerated,
      emailsSent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    console.error("Weekly reports run error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
