"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth, AuthGuard } from "@/lib/auth";
import RouteLoader from "@/components/RouteLoader/RouteLoader";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import Sidebar from "@/components/Navigation/sidebar";
import Topbar from "@/components/Navigation/topbar";
import Deco from "@/components/Decoration/Deco";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocale } from "next-intl";

const LazyWrapper = dynamic(
  () => Promise.resolve(({ children }: { children: React.ReactNode }) => <>{children}</>),
  { loading: () => <div className="flex justify-center items-center h-screen"><Spin size="large" /></div> }
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const username = user?.user_metadata?.firstName;

  const [roleChecked, setRoleChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const isPlayPage = pathname?.includes("/play") && !pathname?.includes("/results");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setRoleChecked(true);
      return;
    }

    const checkRole = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        setIsAdmin(true);
        router.replace(`/${locale}/admin/dashboard`);
        // ✅ Ne pas setRoleChecked → garde le spinner pendant la redirection
      } else {
        setRoleChecked(true);
      }
    };

    checkRole();
  }, [user, isLoading, locale]);

  // ✅ Spinner pendant vérification du rôle OU pendant redirection admin
  if (isLoading || (!roleChecked && !isAdmin) || isAdmin) {
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