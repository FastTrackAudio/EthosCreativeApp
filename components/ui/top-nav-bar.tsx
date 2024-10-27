"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function TopNavBar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex items-center justify-between h-[56px] w-full border-b bg-background">
      <div className="flex items-center space-x-4 px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <DynamicBreadcrumbs />
      </div>
      <div className="flex items-center space-x-4 px-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 w-64 h-9"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
