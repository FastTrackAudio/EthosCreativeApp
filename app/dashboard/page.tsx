import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getMostRecentCourse, getMostRecentProject } from "@/app/utils/db";
import { Notification } from "@/components/Notification";
import { OnboardingProgress } from "@/components/OnboardingProgress";

export default async function DashboardPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return <div>Unauthorized</div>;
  }

  const recentCourse = await getMostRecentCourse(user.id);
  const recentProject = await getMostRecentProject(user.id);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Recent Course Card */}
        <Card>
          <CardHeader>
            <CardTitle>Most Recent Course</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCourse ? (
              <>
                <h3 className="text-lg font-semibold">{recentCourse.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated:{" "}
                  {new Date(recentCourse.updatedAt).toLocaleDateString()}
                </p>
                <Link href={`/dashboard/my-courses/${recentCourse.id}`}>
                  <Button className="mt-4">Continue Course</Button>
                </Link>
              </>
            ) : (
              <p>No courses found. Start creating your first course!</p>
            )}
          </CardContent>
        </Card>

        {/* Most Recent Project Card */}
        <Card>
          <CardHeader>
            <CardTitle>Most Recent Project</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProject ? (
              <>
                <h3 className="text-lg font-semibold">{recentProject.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated:{" "}
                  {new Date(recentProject.updatedAt).toLocaleDateString()}
                </p>
                <Link href={`/dashboard/projects/${recentProject.id}`}>
                  <Button className="mt-4">View Project</Button>
                </Link>
              </>
            ) : (
              <p>No projects found. Start creating your first project!</p>
            )}
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <Notification />
          </CardContent>
        </Card>

        {/* Onboarding Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <OnboardingProgress userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
