"use client";

import Navbar from "@/components/Navbar/Navbar";
import { AuthGuard } from "@/lib/auth";
import  Footer  from "@/components/Footer/Footer";
import DashboardLayout from "@/components/DashboardLayout/page";
import RouteLoader from "@/components/RouteLoader/RouteLoader";
import dynamic  from "next/dynamic";
import { Spin } from "antd";
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
}) {
  return (
    <>
    
      <Navbar />
      <AuthGuard>
        <RouteLoader>
          <LazyWrapper>
            <DashboardLayout>
            {children}
          </DashboardLayout>
          </LazyWrapper>
          
        </RouteLoader>
      </AuthGuard>
     
    </>
  );
}