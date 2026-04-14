"use client";

import Navbar from "@/components/Navbar/Navbar";
import { AuthGuard } from "@/lib/auth";
import  Footer  from "@/components/Footer/Footer";
import Sidebar from "@/components/Navigation/sidebar";
import Topbar from "@/components/Navigation/topbar";
import { useAuth } from "@/lib/auth"


export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) 

{
  const { user } = useAuth()
  const username = user?.user_metadata?.firstName
  return (
    <>
      <Sidebar>
        <Topbar username={username} />  
      <AuthGuard>{children}</AuthGuard>
      </Sidebar>
    </>
  );
}