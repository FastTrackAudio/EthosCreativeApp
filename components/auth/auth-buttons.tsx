import {
  LoginLink,
  RegisterLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/server"
import { Button } from "@/components/ui/button"

export function LoginButton() {
  return (
    <LoginLink>
      <Button variant="ghost">Sign In</Button>
    </LoginLink>
  )
}

export function RegisterButton() {
  return (
    <RegisterLink>
      <Button variant="default">Get Started</Button>
    </RegisterLink>
  )
}

export function LogoutButton() {
  return (
    <LogoutLink>
      <Button variant="ghost">Sign Out</Button>
    </LogoutLink>
  )
}
