import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";

export default function CourseOverview() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">My Courses</h1>

      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: "Overview",
                progress: 85,
                nextLesson: "Introduction to Music Theory",
              },
              {
                title: "Business",
                progress: 60,
                nextLesson: "Marketing Strategies for Musicians",
              },
              {
                title: "Songmaking",
                progress: 45,
                nextLesson: "Lyric Writing Techniques",
              },
              {
                title: "Creative Process",
                progress: 70,
                nextLesson: "Overcoming Creative Blocks",
              },
            ].map((course) => (
              <div key={course.title}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">{course.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {course.progress}%
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={course.progress} className="flex-grow" />
                  <button className="p-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Next: {course.nextLesson}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
