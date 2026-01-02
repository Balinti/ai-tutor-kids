import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ReportEmailData {
  reportId: string;
  parentEmail: string;
  parentName: string;
  childName: string;
  weekStart: string;
  weekEnd: string;
  accuracy: number;
  problemsCompleted: number;
  practiceDays: number;
  improvedStandards: Array<{ code: string; improvement: number }>;
  stuckStandards: Array<{ code: string; accuracy: number }>;
  nextWeekFocus: Array<{ code: string; reason: string }>;
}

export async function sendWeeklyReportEmail(data: ReportEmailData) {
  const supabase = createAdminClient();

  const html = generateEmailHtml(data);

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "WordProblem Coach <reports@example.com>",
      to: data.parentEmail,
      subject: `Weekly Progress Report: ${data.childName} (${data.weekStart} - ${data.weekEnd})`,
      html,
    });

    // Mark as sent
    await supabase
      .from("weekly_reports")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", data.reportId);

    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

function generateEmailHtml(data: ReportEmailData): string {
  const accuracyColor =
    data.accuracy >= 80 ? "#22c55e" : data.accuracy >= 60 ? "#f59e0b" : "#ef4444";

  const improvedSection =
    data.improvedStandards.length > 0
      ? `
    <div style="margin: 20px 0; padding: 15px; background: #f0fdf4; border-radius: 8px;">
      <h3 style="margin: 0 0 10px; color: #166534;">Great Progress!</h3>
      <ul style="margin: 0; padding-left: 20px;">
        ${data.improvedStandards.map((s) => `<li>${s.code}: ${s.improvement.toFixed(0)}% accuracy</li>`).join("")}
      </ul>
    </div>
  `
      : "";

  const stuckSection =
    data.stuckStandards.length > 0
      ? `
    <div style="margin: 20px 0; padding: 15px; background: #fef2f2; border-radius: 8px;">
      <h3 style="margin: 0 0 10px; color: #991b1b;">Areas to Focus On</h3>
      <ul style="margin: 0; padding-left: 20px;">
        ${data.stuckStandards.map((s) => `<li>${s.code}: ${s.accuracy.toFixed(0)}% accuracy - needs more practice</li>`).join("")}
      </ul>
    </div>
  `
      : "";

  const focusSection =
    data.nextWeekFocus.length > 0
      ? `
    <div style="margin: 20px 0; padding: 15px; background: #eff6ff; border-radius: 8px;">
      <h3 style="margin: 0 0 10px; color: #1e40af;">Next Week's Focus</h3>
      <ul style="margin: 0; padding-left: 20px;">
        ${data.nextWeekFocus.map((s) => `<li>${s.code}: ${s.reason}</li>`).join("")}
      </ul>
    </div>
  `
      : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #7c3aed; margin: 0;">WordProblem Coach</h1>
    <p style="color: #666; margin: 5px 0;">Weekly Progress Report</p>
  </div>

  <p>Hi ${data.parentName || "there"},</p>

  <p>Here's how <strong>${data.childName}</strong> did this week (${data.weekStart} - ${data.weekEnd}):</p>

  <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <div style="display: flex; justify-content: space-around; text-align: center;">
      <div>
        <div style="font-size: 32px; font-weight: bold; color: ${accuracyColor};">${data.accuracy}%</div>
        <div style="color: #666; font-size: 14px;">Accuracy</div>
      </div>
      <div>
        <div style="font-size: 32px; font-weight: bold; color: #7c3aed;">${data.problemsCompleted}</div>
        <div style="color: #666; font-size: 14px;">Problems</div>
      </div>
      <div>
        <div style="font-size: 32px; font-weight: bold; color: #0ea5e9;">${data.practiceDays}/7</div>
        <div style="color: #666; font-size: 14px;">Practice Days</div>
      </div>
    </div>
  </div>

  ${improvedSection}
  ${stuckSection}
  ${focusSection}

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #666; font-size: 14px; margin: 0;">
      Keep up the great work! Consistent daily practice makes a big difference.
    </p>
    <p style="margin-top: 20px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/parent" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
        View Full Dashboard
      </a>
    </p>
  </div>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #999; font-size: 12px; text-align: center;">
    <p>WordProblem Coach - Helping kids master math, one problem at a time.</p>
    <p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/parent/billing" style="color: #999;">Manage subscription</a>
    </p>
  </div>
</body>
</html>
`;
}
