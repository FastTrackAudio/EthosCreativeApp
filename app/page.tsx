import React from "react";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Welcome to My App</h1>
      <div className="space-x-4">
        <LoginLink>
          <Button>Sign In</Button>
        </LoginLink>
        <RegisterLink>
          <Button variant="outline">Sign Up</Button>
        </RegisterLink>
      </div>
      <div className="mt-8">
        <Link href="/dashboard">
          <Button variant="link">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
