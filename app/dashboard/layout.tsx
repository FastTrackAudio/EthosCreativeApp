import { AppLayout } from "@/components/app-layout";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/sidebar-09";
import { TopNavBar } from "@/components/ui/top-nav-bar";
import "@blocknote/mantine/style.css";
import "@/styles/globals.css";
import "@/styles/text-editor.css";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar user={user} />
        <div className="flex flex-col flex-grow">
          <div className="sticky top-0 z-10 bg-background">
            <TopNavBar />
          </div>
          <div className="flex-grow overflow-y-auto">
            <AppLayout user={user}>
              <div className="flex flex-col gap-4 p-4">{children}</div>
            </AppLayout>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
