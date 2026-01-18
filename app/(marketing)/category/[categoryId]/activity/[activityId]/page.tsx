"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActivityPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const activityId = params.activityId as string;

  // Format the activity name from the ID
  const activityName = activityId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href={`/category/${categoryId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Category
        </Link>

        {/* Activity Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <div className="text-6xl mb-6">🎮</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{activityName}</h1>
            <p className="text-gray-600 mb-8">
              Get ready for a fun learning adventure!
            </p>

            <div className="bg-blue-50 rounded-2xl p-6 mb-8">
              <div className="text-5xl mb-4">🚀</div>
              <p className="text-blue-800 font-medium">
                This activity is coming soon! We&apos;re working hard to bring you
                amazing learning experiences.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/category/${categoryId}`}>
                <Button variant="outline" size="lg">
                  Try Another Activity
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg">
                  <Play className="w-5 h-5 mr-2" />
                  Explore More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
