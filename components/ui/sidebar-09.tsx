"use client";

import * as React from "react";
import {
  Command,
  BookOpen,
  Briefcase,
  MessageSquare,
  User,
  Rocket,
  Users,
  PhoneCall,
  LineChart,
  FileQuestion,
  Zap,
  Archive,
  Clock,
  Folder,
  Inbox,
  Send,
  FileText,
  Edit,
  Settings,
  Activity,
  Compass,
  Search,
  UserCheck,
  UserPlus,
  Calendar,
  Star,
  Target,
  TrendingUp,
  BarChart,
  ArrowRight,
  ChevronDown,
  PlusCircle,
  ListChecks,
  ChevronsUpDown,
  Sparkles,
  BadgeCheck,
  CreditCard,
  Bell,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
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
import type { KindeUser } from "@kinde-oss/kinde-auth-nextjs/dist/types";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "My Courses",
      url: "/dashboard/my-courses",
      icon: BookOpen,
      isActive: false,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: Briefcase,
      isActive: false,
    },
    {
      title: "Messages",
      url: "/dashboard/messages",
      icon: MessageSquare,
      isActive: false,
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: User,
      isActive: false,
    },
    {
      title: "Text Editor",
      url: "/dashboard/text-editor",
      icon: Edit,
      isActive: false,
    },
    {
      title: "IndieLand",
      url: "/dashboard/indie-land",
      icon: Rocket,
      isActive: false,
    },
    {
      title: "MakerMatch",
      url: "/dashboard/maker-match",
      icon: Users,
      isActive: false,
    },
    {
      title: "Mentor On Call",
      url: "/dashboard/mentor-on-call",
      icon: PhoneCall,
      isActive: false,
    },
    {
      title: "Tracking",
      url: "/dashboard/tracking",
      icon: LineChart,
      isActive: false,
    },
    {
      title: "Quizzes",
      url: "/dashboard/quizzes",
      icon: FileQuestion,
      isActive: false,
    },
    // Add the Admin nav item here
    {
      title: "Admin",
      url: "/dashboard/admin",
      icon: ShieldAlert,
      isActive: false,
    },
  ],
  mails: [
    {
      name: "William Smith",
      email: "williamsmith@example.com",
      subject: "Meeting Tomorrow",
      date: "09:34 AM",
      teaser:
        "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
    },
    {
      name: "Alice Smith",
      email: "alicesmith@example.com",
      subject: "Re: Project Update",
      date: "Yesterday",
      teaser:
        "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
    },
    {
      name: "Bob Johnson",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      date: "2 days ago",
      teaser:
        "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
    },
    {
      name: "Emily Davis",
      email: "emilydavis@example.com",
      subject: "Re: Question about Budget",
      date: "2 days ago",
      teaser:
        "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
    },
    {
      name: "Michael Wilson",
      email: "michaelwilson@example.com",
      subject: "Important Announcement",
      date: "1 week ago",
      teaser:
        "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
    },
    {
      name: "Sarah Brown",
      email: "sarahbrown@example.com",
      subject: "Re: Feedback on Proposal",
      date: "1 week ago",
      teaser:
        "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
    },
    {
      name: "David Lee",
      email: "davidlee@example.com",
      subject: "New Project Idea",
      date: "1 week ago",
      teaser:
        "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
    },
    {
      name: "Olivia Wilson",
      email: "oliviawilson@example.com",
      subject: "Vacation Plans",
      date: "1 week ago",
      teaser:
        "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
    },
    {
      name: "James Martin",
      email: "jamesmartin@example.com",
      subject: "Re: Conference Registration",
      date: "1 week ago",
      teaser:
        "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
    },
    {
      name: "Sophia White",
      email: "sophiawhite@example.com",
      subject: "Team Dinner",
      date: "1 week ago",
      teaser:
        "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
    },
  ],
};

type SecondaryNavItem = {
  title: string;
  icon: React.ElementType;
  url: string;
  collapsible?: boolean;
  items?: SecondaryNavItem[];
};

type SecondaryNavItems = {
  [key: string]: SecondaryNavItem[];
};

const secondaryNavItems: SecondaryNavItems = {
  "My Courses": [
    { title: "All Courses", icon: BookOpen, url: "/dashboard/my-courses" },
    {
      title: "Create Course",
      icon: PlusCircle,
      url: "/dashboard/my-courses/create",
    },
    {
      title: "Development Plan",
      icon: FileText,
      url: "/dashboard/my-courses/development-plan",
    },
    { title: "Next", icon: ArrowRight, url: "/dashboard/my-courses/next" },
  ],
  Projects: [
    { title: "Active", icon: Zap, url: "/dashboard/projects/active" },
    { title: "Archived", icon: Archive, url: "/dashboard/projects/archived" },
    {
      title: "Collaborations",
      icon: Users,
      url: "/dashboard/projects/collaborations",
    },
    {
      title: "Recent Projects",
      icon: Clock,
      collapsible: true,
      url: "/dashboard/projects/recent",
      items: [
        {
          title: "Project A",
          icon: Folder,
          url: "/dashboard/projects/recent/project-a",
        },
        {
          title: "Project B",
          icon: Folder,
          url: "/dashboard/projects/recent/project-b",
        },
        {
          title: "Project C",
          icon: Folder,
          url: "/dashboard/projects/recent/project-c",
        },
      ],
    },
  ],
  Messages: [
    { title: "Inbox", icon: Inbox, url: "/dashboard/messages/inbox" },
    { title: "Sent", icon: Send, url: "/dashboard/messages/sent" },
    { title: "Drafts", icon: FileText, url: "/dashboard/messages/drafts" },
  ],
  Profile: [
    { title: "Edit Profile", icon: Edit, url: "/dashboard/profile/edit" },
    { title: "Settings", icon: Settings, url: "/dashboard/profile/settings" },
    { title: "Activity", icon: Activity, url: "/dashboard/profile/activity" },
  ],
  IndieLand: [
    { title: "Explore", icon: Compass, url: "/dashboard/indie-land/explore" },
    {
      title: "My Projects",
      icon: Folder,
      url: "/dashboard/indie-land/my-projects",
    },
    { title: "Community", icon: Users, url: "/dashboard/indie-land/community" },
  ],
  MakerMatch: [
    {
      title: "Find Partners",
      icon: Search,
      url: "/dashboard/maker-match/find-partners",
    },
    {
      title: "My Matches",
      icon: UserCheck,
      url: "/dashboard/maker-match/my-matches",
    },
    {
      title: "Requests",
      icon: UserPlus,
      url: "/dashboard/maker-match/requests",
    },
  ],
  "Mentor On Call": [
    {
      title: "Schedule",
      icon: Calendar,
      url: "/dashboard/mentor-on-call/schedule",
    },
    {
      title: "My Mentors",
      icon: Star,
      url: "/dashboard/mentor-on-call/my-mentors",
    },
    { title: "History", icon: Clock, url: "/dashboard/mentor-on-call/history" },
  ],
  Tracking: [
    { title: "Goals", icon: Target, url: "/dashboard/tracking/goals" },
    {
      title: "Progress",
      icon: TrendingUp,
      url: "/dashboard/tracking/progress",
    },
    { title: "Reports", icon: BarChart, url: "/dashboard/tracking/reports" },
  ],
  Quizzes: [
    {
      title: "Recent Quizzes",
      icon: Clock,
      collapsible: true,
      url: "/dashboard/quizzes/recent",
      items: [
        {
          title: "Quiz 1",
          icon: FileQuestion,
          url: "/dashboard/quizzes/recent/quiz-1",
        },
        {
          title: "Quiz 2",
          icon: FileQuestion,
          url: "/dashboard/quizzes/recent/quiz-2",
        },
        {
          title: "Quiz 3",
          icon: FileQuestion,
          url: "/dashboard/quizzes/recent/quiz-3",
        },
        {
          title: "Quiz 4",
          icon: FileQuestion,
          url: "/dashboard/quizzes/recent/quiz-4",
        },
        {
          title: "Quiz 5",
          icon: FileQuestion,
          url: "/dashboard/quizzes/recent/quiz-5",
        },
      ],
    },
    {
      title: "Create A Quiz",
      icon: PlusCircle,
      url: "/dashboard/quizzes/create",
    },
    {
      title: "My Quizzes",
      icon: ListChecks,
      url: "/dashboard/quizzes/my-quizzes",
    },
  ],
  Admin: [
    {
      title: "Manage Users",
      icon: Users,
      url: "/dashboard/admin/manage-users",
    },
    { title: "Quizzes", icon: FileQuestion, url: "/dashboard/admin/quizzes" },
    { title: "Analytics", icon: BarChart, url: "/dashboard/admin/analytics" },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: KindeUser }) {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  const [activeItem, setActiveItem] = React.useState(() => {
    return (
      data.navMain.find((item) => pathname.startsWith(item.url)) ||
      data.navMain[0]
    );
  });

  const [activeSecondaryItem, setActiveSecondaryItem] =
    React.useState<SecondaryNavItem | null>(() => {
      const secondaryItems = secondaryNavItems[activeItem.title] || [];
      return secondaryItems.find((item) => pathname === item.url) || null;
    });

  React.useEffect(() => {
    const newActiveItem =
      data.navMain.find((item) => pathname.startsWith(item.url)) ||
      data.navMain[0];
    setActiveItem(newActiveItem);

    const newSecondaryItems = secondaryNavItems[newActiveItem.title] || [];
    const newActiveSecondaryItem =
      newSecondaryItems.find((item) => pathname === item.url) || null;
    setActiveSecondaryItem(newActiveSecondaryItem);
  }, [pathname]);

  if (!user) {
    return null; // Or a sign-in prompt
  }

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      {/* First sidebar */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
      >
        <SidebarHeader className="h-[56px] flex items-center justify-center border-b">
          <SidebarMenu className="w-full">
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="w-full h-10 p-0">
                <Link href="/" className="flex items-center justify-center">
                  <div className="flex aspect-square w-8 h-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="w-4 h-4" />
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="pt-2">
          {" "}
          {/* Added padding-top */}
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Link href={item.url} passHref legacyBehavior>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        onClick={() => {
                          setActiveItem(item);
                          setActiveSecondaryItem(
                            secondaryNavItems[item.title]?.[0] || null
                          );
                        }}
                        isActive={activeItem.title === item.title}
                        className="px-2.5 md:px-2"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <ThemeToggle />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <NavUser user={user} />
        </SidebarFooter>
      </Sidebar>

      {/* Modified second sidebar */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="h-[56px] flex items-center justify-between px-6 border-b">
          <div className="text-lg font-semibold text-foreground tracking-tight flex items-center h-full">
            {activeItem.title}
          </div>
        </SidebarHeader>
        <SidebarContent className="pt-4">
          <SidebarGroup>
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                {secondaryNavItems[activeItem.title]?.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Link href={item.url} passHref legacyBehavior>
                      <SidebarMenuButton
                        onClick={() => {
                          setActiveSecondaryItem(item);
                          setOpen(true);
                        }}
                        isActive={pathname === item.url}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}

function NavUser({ user }: { user: KindeUser }) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user.picture || undefined}
                  alt={user.given_name || "User"}
                />
                <AvatarFallback className="rounded-lg">
                  {user.given_name?.[0] || user.family_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user.given_name || user.family_name || "User"}
                </span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user.picture || undefined}
                    alt={user.given_name || "User"}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.given_name?.[0] || user.family_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.given_name || user.family_name || "User"}
                  </span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <LogoutLink className="flex w-full items-center">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </LogoutLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
