"use client"

import { ThemeProvider } from "next-themes"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create a client
const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Force a style refresh when pathname changes
    document.body.style.display = "none"
    document.body.offsetHeight // Force a reflow
    document.body.style.display = ""
  }, [pathname])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
