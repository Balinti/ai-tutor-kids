import * as React from "react";

interface WeeklyReportEmailProps {
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
  dashboardUrl: string;
}

export function WeeklyReportEmail({
  parentName,
  childName,
  weekStart,
  weekEnd,
  accuracy,
  problemsCompleted,
  practiceDays,
  improvedStandards,
  stuckStandards,
  nextWeekFocus,
  dashboardUrl,
}: WeeklyReportEmailProps) {
  const accuracyColor =
    accuracy >= 80 ? "#22c55e" : accuracy >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: 1.6,
          color: "#333",
          maxWidth: "600px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ color: "#7c3aed", margin: 0 }}>WordProblem Coach</h1>
          <p style={{ color: "#666", margin: "5px 0" }}>Weekly Progress Report</p>
        </div>

        <p>Hi {parentName || "there"},</p>

        <p>
          Here&apos;s how <strong>{childName}</strong> did this week ({weekStart} -{" "}
          {weekEnd}):
        </p>

        <div
          style={{
            background: "#f9fafb",
            borderRadius: "12px",
            padding: "20px",
            margin: "20px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: accuracyColor,
                }}
              >
                {accuracy}%
              </div>
              <div style={{ color: "#666", fontSize: "14px" }}>Accuracy</div>
            </div>
            <div>
              <div
                style={{ fontSize: "32px", fontWeight: "bold", color: "#7c3aed" }}
              >
                {problemsCompleted}
              </div>
              <div style={{ color: "#666", fontSize: "14px" }}>Problems</div>
            </div>
            <div>
              <div
                style={{ fontSize: "32px", fontWeight: "bold", color: "#0ea5e9" }}
              >
                {practiceDays}/7
              </div>
              <div style={{ color: "#666", fontSize: "14px" }}>Practice Days</div>
            </div>
          </div>
        </div>

        {improvedStandards.length > 0 && (
          <div
            style={{
              margin: "20px 0",
              padding: "15px",
              background: "#f0fdf4",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ margin: "0 0 10px", color: "#166534" }}>
              Great Progress!
            </h3>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {improvedStandards.map((s) => (
                <li key={s.code}>
                  {s.code}: {s.improvement.toFixed(0)}% accuracy
                </li>
              ))}
            </ul>
          </div>
        )}

        {stuckStandards.length > 0 && (
          <div
            style={{
              margin: "20px 0",
              padding: "15px",
              background: "#fef2f2",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ margin: "0 0 10px", color: "#991b1b" }}>
              Areas to Focus On
            </h3>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {stuckStandards.map((s) => (
                <li key={s.code}>
                  {s.code}: {s.accuracy.toFixed(0)}% accuracy - needs more practice
                </li>
              ))}
            </ul>
          </div>
        )}

        {nextWeekFocus.length > 0 && (
          <div
            style={{
              margin: "20px 0",
              padding: "15px",
              background: "#eff6ff",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ margin: "0 0 10px", color: "#1e40af" }}>
              Next Week&apos;s Focus
            </h3>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {nextWeekFocus.map((s) => (
                <li key={s.code}>
                  {s.code}: {s.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div
          style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
            Keep up the great work! Consistent daily practice makes a big
            difference.
          </p>
          <p style={{ marginTop: "20px" }}>
            <a
              href={dashboardUrl}
              style={{
                display: "inline-block",
                background: "#7c3aed",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              View Full Dashboard
            </a>
          </p>
        </div>

        <div
          style={{
            marginTop: "40px",
            paddingTop: "20px",
            borderTop: "1px solid #e5e7eb",
            color: "#999",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          <p>WordProblem Coach - Helping kids master math, one problem at a time.</p>
        </div>
      </body>
    </html>
  );
}

export default WeeklyReportEmail;
