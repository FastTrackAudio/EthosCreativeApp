"use client"

import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { MoreHorizontal, Trash } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  enrolled: boolean
  permissions: string
  artistPageUrl: string | null
  dateJoined: Date
  profileImage: string | null
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch("/api/users")
  if (!response.ok) {
    throw new Error("Failed to fetch users")
  }
  return response.json()
}

export default function ManageUsers() {
  const queryClient = useQueryClient()

  const {
    data: users,
    isLoading,
    error,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string
      data: Partial<User>
    }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to update user")
      }
      return response.json()
    },
    onMutate: async ({ userId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["users"] })
      const previousUsers = queryClient.getQueryData<User[]>(["users"])
      queryClient.setQueryData<User[]>(["users"], (old) =>
        old?.map((user) => (user.id === userId ? { ...user, ...data } : user))
      )
      return { previousUsers }
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["users"], context?.previousUsers)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const handleEnrollmentToggle = (
    userId: string,
    currentEnrollment: boolean
  ) => {
    updateUserMutation.mutate({
      userId,
      data: { enrolled: !currentEnrollment },
    })
  }

  const handlePermissionChange = (userId: string, newPermission: string) => {
    updateUserMutation.mutate({ userId, data: { permissions: newPermission } })
  }

  const handleDateChange = (userId: string, newDate: Date) => {
    updateUserMutation.mutate({ userId, data: { dateJoined: newDate } })
  }

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete user")
      }
    },
    onSuccess: (_, userId) => {
      queryClient.setQueryData<User[]>(["users"], (old) =>
        old?.filter((user) => user.id !== userId)
      )
    },
  })

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId)
    }
  }

  if (isLoading) {
    return (
      <Table>
        <TableCaption>Loading user information...</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Enrollment</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>View Profile</TableHead>
            <TableHead>View Curriculum</TableHead>
            <TableHead>Date Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-10 w-10 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[150px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[200px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-10 w-[120px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-10 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-10 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-10 w-[120px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-10 w-[120px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 p-0" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  if (error) return <div>Error: {(error as Error).message}</div>

  return (
    <Table>
      <TableCaption>A list of users and their information.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Avatar</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Enrollment</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead>View Profile</TableHead>
          <TableHead>View Curriculum</TableHead>
          <TableHead>Date Joined</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users && users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9}>No users found</TableCell>
          </TableRow>
        ) : (
          users?.map((user) => (
            <TableRow key={user.id}>
              {/* Avatar cell */}
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="p-0">
                      <Avatar>
                        <AvatarImage
                          src={user.profileImage || undefined}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback>
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {user.firstName} {user.lastName}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center">
                      <Avatar className="w-32 h-32">
                        <AvatarImage
                          src={user.profileImage || undefined}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback className="text-4xl">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell className="font-medium">
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Button
                  variant={user.enrolled ? "default" : "outline"}
                  onClick={() => handleEnrollmentToggle(user.id, user.enrolled)}
                  className="w-[120px]"
                >
                  {user.enrolled ? "Enrolled!" : "Unenrolled"}
                </Button>
              </TableCell>
              <TableCell>
                <Select
                  onValueChange={(value) =>
                    handlePermissionChange(user.id, value)
                  }
                  defaultValue={user.permissions}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Coach">Coach</SelectItem>
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
              <TableCell>
                <Button variant="secondary" asChild>
                  <Link href={`/dashboard/admin/users/${user.id}/curriculum`}>
                    View Curriculum
                  </Link>
                </Button>
              </TableCell>
              <TableCell>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[120px]">
                      {format(new Date(user.dateJoined), "MMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(user.dateJoined)}
                      onSelect={(date) =>
                        date && handleDateChange(user.id, date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
