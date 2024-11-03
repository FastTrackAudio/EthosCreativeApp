"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import axios from "axios"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArtistType, CreativeWorkType } from "@prisma/client"

const profileFormSchema = z.object({
  bio: z.string().max(500, "Bio must be less than 500 characters"),
  artistType: z.nativeEnum(ArtistType).optional(),
  workType: z.nativeEnum(CreativeWorkType).optional(),
  skills: z.array(z.string()),
  socialLinks: z.object({
    website: z.string().url().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    youtube: z.string().optional(),
  }),
  achievements: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
  featuredWorks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface EditProfileFormProps {
  user: ProfileFormValues & { id: string }
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: user.bio || "",
      artistType: user.artistType,
      workType: user.workType,
      skills: user.skills || [],
      socialLinks: user.socialLinks || {},
      achievements: user.achievements || [],
      featuredWorks: user.featuredWorks || [],
    },
  })

  const updateProfile = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const response = await axios.patch("/api/user/profile", values)
      return response.data
    },
    onSuccess: () => {
      toast.success("Profile updated successfully")
    },
    onError: () => {
      toast.error("Failed to update profile")
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => updateProfile.mutate(values))}
        className="space-y-8"
      >
        {/* Bio */}
        <div className="space-y-8 pb-8 border-b border-[color:var(--color-border)]">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
              Basic Information
            </h2>
            <p className="text-[color:var(--color-text-light)] mt-1">
              Tell others about yourself
            </p>
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[color:var(--color-text)]">
                  Bio
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Tell us about yourself..."
                    className="h-32 bg-[color:var(--color-surface)] border-[color:var(--color-border)] text-[color:var(--color-text)]"
                  />
                </FormControl>
                <FormDescription className="text-[color:var(--color-text-light)]">
                  A brief description that will appear on your profile
                </FormDescription>
                <FormMessage className="text-[color:var(--color-red)]" />
              </FormItem>
            )}
          />
        </div>

        {/* Artist Type & Work Style */}
        <div className="space-y-8 pb-8 border-b border-[color:var(--color-border)]">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
              Artist Profile
            </h2>
            <p className="text-[color:var(--color-text-light)] mt-1">
              Define your artistic identity
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <FormField
              control={form.control}
              name="artistType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[color:var(--color-text)]">
                    Artist Type
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[color:var(--color-surface)] border-[color:var(--color-border)]">
                        <SelectValue placeholder="Select your artist type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ArtistType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[color:var(--color-text-light)]">
                    Choose the type that best describes you as an artist
                  </FormDescription>
                  <FormMessage className="text-[color:var(--color-red)]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[color:var(--color-text)]">
                    Creative Work Style
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[color:var(--color-surface)] border-[color:var(--color-border)]">
                        <SelectValue placeholder="Select your work style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CreativeWorkType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[color:var(--color-text-light)]">
                    Choose how you prefer to work creatively
                  </FormDescription>
                  <FormMessage className="text-[color:var(--color-red)]" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-8 pb-8 border-b border-[color:var(--color-border)]">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
              Skills & Expertise
            </h2>
            <p className="text-[color:var(--color-text-light)] mt-1">
              List your creative skills
            </p>
          </div>

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[color:var(--color-text)]">
                  Skills
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Add skills (comma separated)"
                    className="bg-[color:var(--color-surface)] border-[color:var(--color-border)] text-[color:var(--color-text)]"
                    onChange={(e) => {
                      const skills = e.target.value
                        .split(",")
                        .map((skill) => skill.trim())
                        .filter(Boolean)
                      field.onChange(skills)
                    }}
                    value={field.value.join(", ")}
                  />
                </FormControl>
                <FormDescription className="text-[color:var(--color-text-light)]">
                  List your skills, separated by commas
                </FormDescription>
                <FormMessage className="text-[color:var(--color-red)]" />
              </FormItem>
            )}
          />
        </div>

        {/* Social Links */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
              Social Links
            </h2>
            <p className="text-[color:var(--color-text-light)] mt-1">
              Connect with your audience
            </p>
          </div>

          <div className="grid gap-6">
            {Object.keys(form.getValues().socialLinks).map((platform) => (
              <FormField
                key={platform}
                control={form.control}
                name={`socialLinks.${platform}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize text-[color:var(--color-text)]">
                      {platform}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={`Your ${platform} URL`}
                        className="bg-[color:var(--color-surface)] border-[color:var(--color-border)] text-[color:var(--color-text)]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={updateProfile.isPending}
          className="w-full"
        >
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}
