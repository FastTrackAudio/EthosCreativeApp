import React from "react";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-8 sm:gap-20 p-4 sm:p-8 pb-16 sm:pb-32">
      <div className="w-full max-w-[100vw] sm:max-w-[80vw] md:max-w-[70vw] px-4 py-4 sm:py-8">
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-center bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent leading-tight sm:leading-none pb-6 sm:pb-12 tracking-tight">
          Songmaking.com
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-md mx-auto px-4">
        <LoginLink className="w-full">
          <Button 
            size="lg" 
            className="w-full text-base sm:text-lg py-6"
          >
            Login
          </Button>
        </LoginLink>
        <RegisterLink className="w-full">
          <Button
            size="lg"
            variant="outline"
            className="w-full text-base sm:text-lg py-6"
          >
            Register
          </Button>
        </RegisterLink>
      </div>
    </div>
  );
}
