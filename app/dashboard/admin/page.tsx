import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/app/utils/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, FileQuestion, Users } from "lucide-react";

async function getRecentUsers() {
  return await prisma.user.findMany({
    orderBy: {
      dateJoined: "desc",
    },
    take: 5,
  });
}

async function getRecentCourse() {
  return await prisma.course.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });
}

async function getQuizCount() {
  return await prisma.quiz.count();
}

export default async function AdminDashboard() {
  const recentUsers = await getRecentUsers();
  const recentCourse = await getRecentCourse();
  const quizCount = await getQuizCount();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage || undefined} />
                    <AvatarFallback>
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(user.dateJoined).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/dashboard/admin/manage-users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Courses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Course</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentCourse ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium truncate">{recentCourse.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recentCourse.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{recentCourse._count.enrollments} Students</span>
                  </div>
                  <div>
                    Created:{" "}
                    {new Date(recentCourse.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No courses yet</p>
            )}
            <div className="flex flex-col gap-2 mt-4">
              <Button asChild>
                <Link href="/dashboard/admin/manage-courses/create">
                  Create Course
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/admin/manage-courses">
                  Manage Courses
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quizzes Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-2xl font-bold">{quizCount}</div>
              <p className="text-sm text-muted-foreground">
                Total quizzes in the platform
              </p>
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/dashboard/admin/quizzes">Manage Quizzes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
