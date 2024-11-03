"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Github,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react"
import Link from "next/link"

interface ArtistProfileSidebarProps {
  user: {
    bio: string | null
    skills: string[]
    socialLinks: {
      website?: string | null
      twitter?: string | null
      instagram?: string | null
      linkedin?: string | null
      github?: string | null
      youtube?: string | null
    }
  }
}

export function ArtistProfileSidebar({ user }: ArtistProfileSidebarProps) {
  return (
    <aside className="space-y-6">
      <Card className="p-6 bg-[color:var(--color-surface-elevated)]">
        <h2 className="font-semibold text-[color:var(--color-text)] mb-4">
          About
        </h2>
        <p className="text-sm text-[color:var(--color-text-light)]">
          {user.bio}
        </p>
      </Card>

      {user.skills.length > 0 && (
        <Card className="p-6 bg-[color:var(--color-surface-elevated)]">
          <h2 className="font-semibold text-[color:var(--color-text)] mb-4">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-[color:var(--color-surface-elevated)]">
        <h2 className="font-semibold text-[color:var(--color-text)] mb-4">
          Connect
        </h2>
        <div className="space-y-3">
          {user.socialLinks.website && (
            <Link
              href={user.socialLinks.website}
              className="flex items-center gap-2 text-sm text-[color:var(--color-text-light)] hover:text-[color:var(--color-text)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe className="h-4 w-4" />
              Website
            </Link>
          )}
          {/* Add similar links for other social platforms */}
        </div>
      </Card>
    </aside>
  )
}
