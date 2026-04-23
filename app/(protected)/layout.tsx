"use client";

import { usePathname } from "next/navigation";  // ✅ ajoute
import Navbar from "@/components/Navbar/Navbar";
import { AuthGuard, useAuth } from "@/lib/auth";
import Footer from "@/components/Footer/Footer";
import RouteLoader from "@/components/RouteLoader/RouteLoader";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import Sidebar from "@/components/Navigation/sidebar";
import Topbar from "@/components/Navigation/topbar";
import Deco from "@/components/Decoration/Deco";

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

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();  // ✅ ajoute
  const username = user?.user_metadata?.firstName;

  // ✅ true si on est sur une page play
  const isPlayPage = pathname?.includes("/play");

  return (
    <>
      <Deco />
      <AuthGuard>
        <RouteLoader>
          <LazyWrapper>
            {isPlayPage ? (
              // ✅ page play : sans sidebar ni topbar
              <>{children}</>
            ) : (
              // ✅ toutes les autres pages : avec sidebar + topbar
              <Sidebar>
                <Topbar username={username} />
                {children}
              </Sidebar>
            )}
          </LazyWrapper>
        </RouteLoader>
      </AuthGuard>
    </>
  );
}