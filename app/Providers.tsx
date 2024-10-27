"use client";

import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@/components/query-client-provider";
import { PropsWithChildren } from "react";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
