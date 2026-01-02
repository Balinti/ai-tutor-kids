import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - Math Word Problem Practice for Grades 5-8`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "10-minute daily Socratic micro-tutoring for Grades 5-8 Common Core math word problems. Tool-verified answers and weekly parent reports.",
  keywords: [
    "math tutor",
    "word problems",
    "grade 5",
    "grade 6",
    "grade 7",
    "grade 8",
    "common core",
    "math practice",
    "kids education",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
