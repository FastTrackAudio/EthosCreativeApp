import "@/styles/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/app/Providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Course Content Kanban",
  description: "Manage your course content with a beautiful Kanban board",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
