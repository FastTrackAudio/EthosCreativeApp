"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, Mail, Share2, Copy } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageUploadButton } from "@/components/ui/image-upload-button"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ArtistProfileHeaderProps {
  user: {
    firstName: string
    lastName: string
    profileImage: string | null
    artistType: string | null
    workType: string | null
    customUrl: string | null
    isOwner?: boolean
  }
}

export function ArtistProfileHeader({ user }: ArtistProfileHeaderProps) {
  const updateProfileImage = useMutation({
    mutationFn: async (imageUrl: string) => {
      await axios.patch("/api/user/profile-image", { imageUrl })
    },
    onSuccess: () => {
      toast.success("Profile image updated")
      window.location.reload()
    },
    onError: () => {
      toast.error("Failed to update profile image")
    },
  })

  const handleShare = async () => {
    const url = `${window.location.origin}/${user.customUrl}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Profile URL copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy URL")
    }
  }

  return (
    <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)]">
      <div className="container max-w-7xl py-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-[color:var(--color-border)]">
              <AvatarImage
                src={user.profileImage || ""}
                alt={`${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback className="text-2xl bg-[color:var(--color-surface)] text-[color:var(--color-text-light)]">
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            {user.isOwner && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageUploadButton
                  onUploadComplete={(url) => updateProfileImage.mutate(url)}
                />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-[color:var(--color-text)]">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                {user.artistType && (
                  <span className="text-sm text-[color:var(--color-text-light)]">
                    {user.artistType.replace(/_/g, " ")}
                  </span>
                )}
                {user.workType && (
                  <span className="text-sm text-[color:var(--color-text-light)]">
                    • {user.workType.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Mail className="h-4 w-4" />
                Contact
              </Button>
              {user.customUrl && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share Profile
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleShare}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/${user.customUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
