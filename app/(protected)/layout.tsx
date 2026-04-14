"use client";

import Navbar from "@/components/Navbar/Navbar";
import { AuthGuard } from "@/lib/auth";
import  Footer  from "@/components/Footer/Footer";


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