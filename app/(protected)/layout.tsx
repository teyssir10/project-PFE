"use client";

import Navbar from "@/components/Navbar/Navbar";
import { AuthGuard, useAuth } from "@/lib/auth";
import  Footer  from "@/components/Footer/Footer";

import RouteLoader from "@/components/RouteLoader/RouteLoader";
import dynamic  from "next/dynamic";
import { Spin } from "antd";
import Sidebar from "@/components/Navigation/sidebar";
import Topbar from "@/components/Navigation/topbar";
const LazyWrapper = dynamic(
  () =>
    Promise.resolve(({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    )),
  {
    loading: () => (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    ),
  }
);



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
    
    
      <AuthGuard>
        <RouteLoader>
          <LazyWrapper>
            <Topbar username={username} /> 
             <Sidebar>
            {children}
       </Sidebar>
          </LazyWrapper>
          
        </RouteLoader>
      </AuthGuard>
     
     
         
     
    </>
  );
}