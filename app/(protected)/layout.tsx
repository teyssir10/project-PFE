"use client";

import Navbar from "@/components/Navbar/Navbar";
import { AuthGuard } from "@/lib/auth";
import  Footer  from "@/components/Footer/Footer";
import DashboardLayout from "@/components/DashboardLayout/page";


export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    
      <Navbar />
      <DashboardLayout>
      <AuthGuard>{children}</AuthGuard>
      </DashboardLayout>
      <Footer/>
    </>
  );
}