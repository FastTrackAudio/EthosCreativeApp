"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy } from "lucide-react"
import Link from "next/link"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const customUrlSchema = z.object({
  customUrl: z
    .string()
    .min(3, "URL must be at least 3 characters")
    .max(30, "URL must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Only letters, numbers, underscores, and hyphens allowed"
    ),
})

interface CustomUrlManagerProps {
  currentUrl: string | null
  userId: string
  type: "artist" | "dashboard"
  label?: string
  description?: string
}

export function CustomUrlManager({
  currentUrl,
  userId,
  type,
  label = "Custom Profile URL",
  description = "Choose a unique URL for your profile",
}: CustomUrlManagerProps) {
  const [url, setUrl] = useState(currentUrl)
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const form = useForm<z.infer<typeof customUrlSchema>>({
    resolver: zodResolver(customUrlSchema),
    defaultValues: {
      customUrl: currentUrl || "",
    },
  })

  const updateUrl = useMutation({
    mutationFn: async (values: z.infer<typeof customUrlSchema>) => {
      const response = await axios.patch("/api/user/custom-url", {
        ...values,
        type,
      })
      return response.data
    },
    onSuccess: (data) => {
      toast.success("Custom URL updated successfully")
      setUrl(type === "artist" ? data.artistPageUrl : data.customUrl)
      // Force a refresh to update the UI
      window.location.reload()
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        form.setError("customUrl", {
          type: "manual",
          message: "This URL is already taken",
        })
      } else {
        toast.error("Failed to update custom URL")
      }
    },
  })

  const handleCopyUrl = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(`${origin}/${url}`)
      toast.success("URL copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy URL")
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => updateUrl.mutate(values))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="customUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[color:var(--color-text)]">
                  {label}
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <span className="text-[color:var(--color-text-light)]">
                      {origin}/
                    </span>
                    <Input
                      {...field}
                      placeholder="your-custom-url"
                      className="bg-[color:var(--color-surface)] border-[color:var(--color-border)] text-[color:var(--color-text)]"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-[color:var(--color-text-light)]">
                  {description}
                </FormDescription>
                <FormMessage className="text-[color:var(--color-red)]" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={updateUrl.isPending}
            className="w-full bg-[color:var(--color-accent)] hover:bg-[color:var(--color-accent)]/90"
          >
            {updateUrl.isPending ? "Updating..." : "Update URL"}
          </Button>
        </form>
      </Form>

      {url && origin && (
        <div className="pt-4 border-t border-[color:var(--color-border)]">
          <p className="text-sm font-medium text-[color:var(--color-text)] mb-2">
            Your Current Profile URL
          </p>
          <div className="flex items-center gap-2 p-2 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)]">
            <code className="flex-1 text-sm text-[color:var(--color-text-light)]">
              {`${origin}/${url}`}
            </code>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyUrl}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link
                  href={`/${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
