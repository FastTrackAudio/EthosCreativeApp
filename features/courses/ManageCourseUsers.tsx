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
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { BookOpen } from "lucide-react"
import axios from "axios"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  profileImage: string | null
  artistPageUrl: string | null
  enrollment: {
    id: string
    enrolledAt: string
  } | null
}

interface ManageCourseUsersProps {
  courseId: string
}

export function ManageCourseUsers({ courseId }: ManageCourseUsersProps) {
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["courseUsers", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/courses/${courseId}/users`)
      return response.data
    },
  })

  const toggleEnrollmentMutation = useMutation({
    mutationFn: async ({
      userId,
      isEnrolled,
    }: {
      userId: string
      isEnrolled: boolean
    }) => {
      if (!isEnrolled) {
        await axios.post(`/api/courses/${courseId}/enrollments`, { userId })
      } else {
        await axios.delete(`/api/courses/${courseId}/enrollments`, {
          data: { userId },
        })
      }
    },
    onMutate: async ({ userId, isEnrolled }) => {
      await queryClient.cancelQueries({ queryKey: ["courseUsers", courseId] })
      const previousUsers = queryClient.getQueryData<User[]>([
        "courseUsers",
        courseId,
      ])

      if (previousUsers) {
        queryClient.setQueryData<User[]>(
          ["courseUsers", courseId],
          previousUsers.map((user) => {
            if (user.id === userId) {
              return {
                ...user,
                enrollment: isEnrolled
                  ? null
                  : {
                      id: "temp",
                      enrolledAt: new Date().toISOString(),
                    },
              }
            }
            return user
          })
        )
      }

      return { previousUsers }
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          ["courseUsers", courseId],
          context.previousUsers
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["courseUsers", courseId] })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="rounded-md border max-w-full overflow-x-auto p-20">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Enrolled Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead>Curriculum</TableHead>
            <TableHead>Actions</TableHead>
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
                {user.enrollment?.enrolledAt
                  ? format(new Date(user.enrollment.enrolledAt), "MM/dd/yyyy")
                  : "Not enrolled"}
              </TableCell>
              <TableCell>
                {user.enrollment ? (
                  <Badge>Enrolled</Badge>
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
                  <Link
                    href={`/dashboard/admin/manage-courses/${courseId}/users/${user.id}/curriculum`}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Curriculum
                  </Link>
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant={user.enrollment ? "destructive" : "default"}
                  onClick={() =>
                    toggleEnrollmentMutation.mutate({
                      userId: user.id,
                      isEnrolled: !!user.enrollment,
                    })
                  }
                  disabled={toggleEnrollmentMutation.isPending}
                >
                  {user.enrollment ? "Remove" : "Enroll"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
