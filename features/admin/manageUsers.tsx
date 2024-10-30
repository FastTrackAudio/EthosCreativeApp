"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import axios from "axios";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  artistPageUrl: string | null;
  permissions: string;
  dateJoined: string;
}

export default function ManageUsers() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: { permissions?: string };
    }) => {
      const response = await axios.patch(`/api/users/${userId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handlePermissionChange = (userId: string, newPermission: string) => {
    updateUserMutation.mutate({
      userId,
      data: { permissions: newPermission },
    });
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Date Joined</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Profile</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Avatar>
                  <AvatarImage src={user.profileImage || undefined} />
                  <AvatarFallback>
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {format(new Date(user.dateJoined), "MM/dd/yyyy")}
              </TableCell>
              <TableCell>
                <Select
                  value={user.permissions}
                  onValueChange={(value) =>
                    handlePermissionChange(user.id, value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Beta Tester">Beta Tester</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button variant="secondary" asChild>
                  <a
                    href={user.artistPageUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Profile
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
