"use client";

import Navbar from "@/components/Navbar/Navbar";
import { AuthGuard } from "@/lib/auth";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <AuthGuard>{children}</AuthGuard>
    </>
  );
}