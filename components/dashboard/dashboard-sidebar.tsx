import { usePathname } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 px-4 text-lg font-semibold">Dashboard</h2>
        <div className="space-y-1">
          <DashboardNav
            items={[
              {
                title: "Overview",
                href: "/dashboard",
                icon: "home",
              },
              {
                title: "My Courses",
                href: "/dashboard/my-courses",
                icon: "bookOpen",
              },
              {
                title: "Profile",
                href: "/dashboard/profile",
                icon: "user",
              },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
