declare module "@kinde-oss/kinde-auth-nextjs/dist/types" {
  export interface KindeUser {
    given_name?: string
    family_name?: string
    email?: string
    picture?: string
    id?: string
    // Add other properties that you're using
  }
}
