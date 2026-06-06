"use client";

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import {
  LogoutOutlined, HomeOutlined, SettingOutlined,
  UsergroupAddOutlined, TrophyOutlined, PlusOutlined,
  AppstoreOutlined, MenuOutlined, CloseOutlined
} from '@ant-design/icons'
import { useAuth } from '@/lib/auth'
import Image from 'next/image'
import logo from '@/public/panda-logo.png'
import { useTranslations } from 'next-intl'

const LogoSection = ({ platform }: { platform: string }) => (
  <div className="flex gap-4 items-center cursor-pointer transition-transform duration-200 hover:scale-105">
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 dark:text-white">
        Pando<span className="text-cyan-500">Mind</span>
      </h1>
      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{platform}</p>
    </div>
    <Image src={logo} alt="PandoBrain AI logo" width={40} height={40} />
  </div>
);

function NavLinks({ onClickItem }: { onClickItem?: () => void }) {
  const t = useTranslations('sidebar')
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'

  const navSections = [
    {
      label: t("main"),
      items: [
        { icon: HomeOutlined, label: t('dashboard'), href: `/${locale}/dashboard` },
      ]
    },
    {
      label: t("play"),
      items: [
        { icon: AppstoreOutlined,     label: t("browseQuizzes"), href: `/${locale}/browse-quiz`      },
        { icon: PlusOutlined,         label: t("createQuiz"),    href: `/${locale}/create-quiz`       },
        { icon: UsergroupAddOutlined, label: t("multiplayer"),   href: `/${locale}/multiplayerroom`   },
        { icon: TrophyOutlined,       label: t("leaderboard"),   href: `/${locale}/leaderboard`       },
      ],
    },
    {
      label: t("account"),
      items: [
        { icon: SettingOutlined, label: t('settings'), href: `/${locale}/settings` },
      ]
    },
  ];

  return (
    <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
      {navSections.map((section) => (
        <div key={section.label} className="space-y-1">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-2">
            {section.label}
          </p>
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClickItem}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group
                  ${isActive
                    ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-white"
                    : "text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-cyan-500 dark:hover:text-cyan-400"
                  }`}
              >
                <Icon className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>{item.label}</span>
                {isActive && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-cyan-500" />}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function LogoutButton({ onClick }: { onClick?: () => void }) {
  const t = useTranslations("sidebar");
  const { signOut, user } = useAuth();
  const username = user?.user_metadata?.firstName || user?.email?.split("@")[0];

  return (
    <div className="px-4 py-6 border-t border-gray-100 dark:border-slate-700 space-y-3">
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {username?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{username}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={() => { signOut(); onClick?.(); }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5
          bg-gradient-to-r from-cyan-500 to-teal-400 text-white rounded-xl font-semibold
          hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm"
      >
        <LogoutOutlined />
        {t("logout")}
      </button>
    </div>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const t = useTranslations("sidebar");
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 overflow-hidden">
      <div className="h-16 px-6 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
        <LogoSection platform={t('platform')} />
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
          >
            <CloseOutlined />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        <NavLinks onClickItem={onClose} />
      </div>
      <div className="flex-shrink-0 pb-16 md:pb-0">
        <LogoutButton onClick={onClose} />
      </div>
    </div>
  );
}

// ── Context pour partager openMobile avec le Topbar ───────────────────────────
import { createContext, useContext } from 'react'
export const SidebarContext = createContext<{ openMobile: () => void }>({ openMobile: () => {} })
export const useSidebar = () => useContext(SidebarContext)

export function sidebar({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ openMobile: () => setMobileOpen(true) }}>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">

        {/* ── Desktop sidebar ─────────────────────────────────────────── */}
        <aside className="hidden md:flex w-64 flex-col flex-shrink-0 border-e border-gray-100 dark:border-slate-700 shadow-sm">
          <SidebarContent />
        </aside>

        {/* ── Mobile overlay ───────────────────────────────────────────── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Mobile drawer ────────────────────────────────────────────── */}
        <aside className={`
          fixed inset-y-0 start-0 z-50 w-72 flex flex-col
          transform transition-transform duration-300 ease-in-out md:hidden
          shadow-2xl
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <SidebarContent onClose={() => setMobileOpen(false)} />
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main
          className="flex-1 overflow-auto relative min-w-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
        >
          <div className="w-full min-w-0">{children}</div>
        </main>

      </div>
    </SidebarContext.Provider>
  );
}

export default sidebar;