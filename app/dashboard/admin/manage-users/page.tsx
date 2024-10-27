"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ManageUsers from "../../../../features/admin/manageUsers";

const queryClient = new QueryClient();

export default function ManageUsersPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
        <ManageUsers />
      </div>
    </QueryClientProvider>
  );
}
