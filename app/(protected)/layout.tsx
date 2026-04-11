"use client";

import { AuthGuard } from "@/lib/auth";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
 
}