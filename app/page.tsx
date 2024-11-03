import React from "react"
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-20 p-8 pb-32">
      <div className="px-4 py-8">
        <h1 className="text-8xl md:text-[12rem] font-bold text-center bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent leading-none pb-12">
          Songmaking.com
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <LoginLink>
          <Button size="lg" className="w-full sm:w-auto min-w-[200px] text-lg">
            Login
          </Button>
        </LoginLink>
        <RegisterLink>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto min-w-[200px] text-lg"
          >
            Register
          </Button>
        </RegisterLink>
      </div>
    </div>
  )
}
