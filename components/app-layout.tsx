"use client";

import React from "react";

export function AppLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  return <main className="flex-1 overflow-y-auto">{children}</main>;
}
