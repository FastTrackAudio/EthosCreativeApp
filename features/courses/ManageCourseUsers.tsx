"use client"

import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  profileImage: string | null
  enrolled: boolean
  enrolledAt?: string
  artistPageUrl: string | null
}

interface ManageCourseUsersProps {
  courseId: string
}

export function ManageCourseUsers({ courseId }: ManageCourseUsersProps) {
  const [search, setSearch] = React.useState("")
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["course-users", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/users`)
      if (!response.ok) throw new Error("Failed to fetch users")
      return response.json()
    },
  })

  const toggleEnrollmentMutation = useMutation({
    mutationFn: async ({
      userId,
      enrolled,
    }: {
      userId: string
      enrolled: boolean
    }) => {
      const response = await fetch(`/api/courses/${courseId}/enrollments`, {
        method: enrolled ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (!response.ok) throw new Error("Failed to update enrollment")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-users", courseId] })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })

  const filteredUsers = users?.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Enrollment Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead>Curriculum</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers?.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImage || undefined} />
                  <AvatarFallback>
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <span>
                  {user.firstName} {user.lastName}
                </span>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.enrolledAt
                  ? format(new Date(user.enrolledAt), "MM/dd/yyyy")
                  : "Not enrolled"}
              </TableCell>
              <TableCell>
                {user.enrolled ? (
                  <Badge variant="default">Enrolled</Badge>
                ) : (
                  <Badge variant="secondary">Not Enrolled</Badge>
                )}
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
                <Button
                  variant={user.enrolled ? "destructive" : "default"}
                  onClick={() =>
                    toggleEnrollmentMutation.mutate({
                      userId: user.id,
                      enrolled: !user.enrolled,
                    })
                  }
                  disabled={toggleEnrollmentMutation.isPending}
                >
                  {user.enrolled ? "Remove" : "Enroll"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
