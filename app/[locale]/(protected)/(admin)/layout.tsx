"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import logo from "@/public/panda-logo.png";
import { useTranslations } from "next-intl";
import {
  DashboardOutlined, UserOutlined, AppstoreOutlined,
  ClockCircleOutlined, LogoutOutlined, MenuOutlined,
} from "@ant-design/icons";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("adminLayout");
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin/dashboard", icon: DashboardOutlined,  label: t("nav.dashboard") },
    { href: "/admin/users",     icon: UserOutlined,        label: t("nav.users")     },
    { href: "/admin/quizzes",   icon: AppstoreOutlined,    label: t("nav.quizzes")   },
    { href: "/admin/Pending",   icon: ClockCircleOutlined, label: t("nav.pending")   },
  ];

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    const check = async () => {
      const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
      // ✅ FIX: .trim() pour ignorer les espaces/retours à la ligne dans la BDD
      if (data?.role?.trim() !== "admin") router.replace("/dashboard");
      else setChecking(false);
    };
    check();
  }, [user]);

  if (checking)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white dark:bg-slate-900 border-e border-gray-200 dark:border-slate-800 w-64">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-gray-200 dark:border-slate-800">
        <Image src={logo} alt="logo" width={36} height={36} />
        <div>
          <h1 className="text-sm font-extrabold text-white">
            Pando<span className="text-cyan-500">Mind</span>
          </h1>
          <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold uppercase tracking-wider">{t("adminPanel")}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.includes(href);
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30"
                  : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                }`}>
              <Icon className="text-base flex-shrink-0" />
              {label}
              {isActive && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-6 border-t border-gray-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.user_metadata?.firstname || "Admin"}
            </p>
            <p className="text-xs text-red-400 font-medium">{t("administrator")}</p>
          </div>
        </div>
        <button onClick={() => router.push("/dashboard")}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl text-sm font-medium transition-all duration-200 border border-cyan-500/20 mb-2">
          <UserOutlined />
          {t("userMode")}
        </button>
        <button onClick={() => { signOut(); router.replace("/login"); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl text-sm font-medium transition-all duration-200 border border-slate-700 hover:border-red-500/30">
          <LogoutOutlined />
          {t("logout")}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute start-0 top-0 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">
            <MenuOutlined className="text-xl" />
          </button>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">{t("mobileTitle")}</h1>
        </div>
        <div className="p-6 min-h-full">{children}</div>
      </main>
    </div>
  );
}