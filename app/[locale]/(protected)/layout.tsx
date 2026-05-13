"use client";

import { usePathname } from "next/navigation";
import { useAuth, AuthGuard } from "@/lib/auth";
import RouteLoader from "@/components/RouteLoader/RouteLoader";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import Sidebar from "@/components/Navigation/sidebar";
import Topbar from "@/components/Navigation/topbar";
import Deco from "@/components/Decoration/Deco";

const LazyWrapper = dynamic(
  () => Promise.resolve(({ children }: { children: React.ReactNode }) => <>{children}</>),
  { loading: () => <div className="flex justify-center items-center h-screen"><Spin size="large" /></div> }
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const username = user?.user_metadata?.firstName;

  const isPlayPage = pathname?.includes("/play") && !pathname?.includes("/results");

  // ✅ Routes admin → laisser le layout (admin) gérer complètement
  // Pas de vérification, pas de redirection, pas de sidebar user
  const isAdminRoute = pathname?.includes("/admin");
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Spinner pendant chargement auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Deco />
      <AuthGuard>
        <RouteLoader>
          <LazyWrapper>
            {isPlayPage ? (
              <>{children}</>
            ) : (
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