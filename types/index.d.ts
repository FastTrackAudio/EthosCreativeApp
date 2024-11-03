// Kinde Auth types
declare module "@kinde-oss/kinde-auth-nextjs/dist/types" {
  export interface KindeUser {
    given_name?: string
    family_name?: string
    email?: string
    picture?: string
    id?: string
    sub?: string
    permissions?: string[]
    roles?: string[]
  }
}

// Course related types
export interface Course {
  id: string
  title: string
  description?: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
  published?: boolean
  sections?: CourseSection[]
}

export interface CourseSection {
  id: string
  title: string
  courseId: string
  order: number
  content?: string
}

// Feature flag types
export interface FeatureFlag {
  name: string
  enabled: boolean
  roles?: string[]
}

export interface UserPermissions {
  permissions: string[]
  roles: string[]
}
