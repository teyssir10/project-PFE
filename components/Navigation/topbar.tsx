"use client"
import React, { useEffect, useState } from 'react'
import { Button, Avatar, Dropdown, Badge } from 'antd'
import { useRouter, usePathname } from 'next/navigation'
import {
  BellOutlined, UserOutlined, LogoutOutlined,
  RobotOutlined, PlusOutlined, EditOutlined,
  CrownOutlined,
} from '@ant-design/icons'
import { supabase } from '@/lib/supabase'
import LightToDark from '../UI/Button/LightToDark'
import { useQuizModeStore } from '@/store/useQuizModeStore'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth'
import { useLocale } from 'next-intl'
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

type TopbarProps = {
  username: string
}

const typeIcon: Record<string, string> = {
  welcome:  "🎉",
  top10:    "🏆",
  reminder: "⏰",
  newquiz:  "🆕",
  custom:   "✏️",
}

export default function Topbar({ username }: TopbarProps) {
  const t = useTranslations('topbar')
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const currentPage = pathname.split("/").pop()
  const { mode, setMode } = useQuizModeStore()
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)

  const isCreateQuizPage = pathname.includes("/create-quiz") || pathname.includes("/quiz/create")

  // ── Check admin ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    const checkAdmin = async () => {
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()
      setIsAdmin(data?.role === "admin")
    }
    checkAdmin()
  }, [user])

  // ── Fetch + realtime notifications ────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    fetchNotifications()

    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
        setUnreadCount(c => c + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return
    const { data } = await supabase
      .from("notifications")
      .select("id, title, message, type, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    setNotifications(data ?? [])
    setUnreadCount((data ?? []).filter(n => !n.is_read).length)
  }

  const markAllRead = async () => {
    if (!user) return
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const markOneRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
    setUnreadCount(c => Math.max(0, c - 1))
  }

  const formatDate = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days === 1) return "Hier"
    return `Il y a ${days} jours`
  }

  // ── Dropdown notifications ────────────────────────────────────────────────
  const notifDropdown = (
    <div className="w-80 rounded-2xl overflow-hidden shadow-xl
      bg-white dark:bg-slate-900
      border border-gray-100 dark:border-slate-700">

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between
        border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-cyan-500 hover:text-cyan-400 font-medium transition-colors"
          >
            Tout marquer lu
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-2xl mb-2">🔔</p>
            <p className="text-sm text-gray-400 dark:text-slate-500">
              Aucune notification
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={async () => {
                if (!n.is_read) await markOneRead(n.id)
                setNotifOpen(false)
                router.push(`/${locale}/notifications`)
              }}
              className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors
                ${n.is_read
                  ? "hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  : "bg-cyan-50/60 dark:bg-cyan-900/10 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                }`}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                bg-gray-100 dark:bg-slate-800 text-lg">
                {typeIcon[n.type] ?? "🔔"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm leading-snug truncate ${
                    n.is_read
                      ? "text-gray-600 dark:text-slate-300 font-medium"
                      : "text-gray-900 dark:text-white font-bold"
                  }`}>
                    {n.title}
                  </p>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-2">
                  {n.message}
                </p>
                <p className="text-[10px] text-gray-300 dark:text-slate-600 mt-1">
                  {formatDate(n.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={() => {
            setNotifOpen(false)
            router.push(`/${locale}/notifications`)
          }}
          className="text-xs text-cyan-500 hover:text-cyan-400 font-semibold transition-colors"
        >
          Voir toutes les notifications →
        </button>
        <button
          onClick={() => setNotifOpen(false)}
          className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  )

  const formatName = (name: string | undefined) => {
    if (!name) return "Dashboard"
    return name.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
  }

  const profileMenu = {
    items: [
      { key: 'user', label: <span>{username}</span> },
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: t('profile'),
        onClick: () => router.push(`/${locale}/profile`),
      },
      {
        key: 'settings',
        icon: <UserOutlined />,
        label: t('settings'),
        onClick: () => router.push(`/${locale}/settings`),
      },
      {
        key: 'logout',
        icon: <span className="!text-cyan-500"><LogoutOutlined /></span>,
        label: <span className="text-cyan-500">{t('logout')}</span>,
        onClick: handleLogout,
      },
    ],
  }

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between h-16 px-6
      bg-white/80 dark:bg-slate-900/80 backdrop-blur-md
      border-b border-gray-100 dark:border-slate-700 gap-1">

      {/* Breadcrumb */}
      <div className="flex items-center gap-4 w-full max-w-md">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-cyan-500">PandoMind</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-800 dark:text-white font-medium">
            {formatName(currentPage)}
          </span>
        </div>
      </div>

      <div className='flex gap-4 items-center'>
        <LanguageSwitcher />

        {/* ── Cloche → dropdown notifications ── */}
        <Dropdown
          open={notifOpen}
          onOpenChange={(open) => {
            setNotifOpen(open)
            if (open) fetchNotifications()
          }}
          popupRender={() => notifDropdown}   
          trigger={['click']}
          placement="bottomRight"
        >
          <Badge count={unreadCount} size="small" color="#06b6d4">
            <Button
              className="rounded-full w-10 h-10 flex items-center justify-center transition hover:scale-110"
            >
              <BellOutlined />
            </Button>
          </Badge>
        </Dropdown>

        <LightToDark />

        {/* ── Admin ── */}
        {isAdmin && (
          <Button
            onClick={() => router.push(`/${locale}/admin/dashboard`)}
            className="!h-10 !px-4 !rounded-xl !font-bold !text-sm !border-0
              !bg-gradient-to-r !from-red-500 !to-orange-400
              !text-white !shadow-md hover:!shadow-red-500/30
              hover:!scale-105 transition-all duration-200 flex items-center gap-2"
            icon={<CrownOutlined />}
          >
            Admin
          </Button>
        )}

      
        {isCreateQuizPage ? (
          <div className="flex items-center p-1 gap-1 bg-gray-100 dark:bg-slate-700 rounded-[16px]">
            <Button
              onClick={() => setMode("ai")}
              className={`h-[38px] rounded-[12px] font-bold text-[13px] border-0 tracking-[0.02em] transition-all duration-300 hover:scale-[1.02] ${
                mode === "ai"
                  ? "!text-white !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0] shadow-[0_6px_16px_rgba(6,182,212,0.35)]"
                  : "!bg-transparent !text-gray-500 dark:!text-slate-400 hover:!text-cyan-500"
              }`}
              icon={<RobotOutlined />}
            >
              {t('aiGenerate')}
            </Button>
            <Button
              onClick={() => setMode("manual")}
              className={`h-[38px] rounded-[12px] font-bold text-[13px] border-0 tracking-[0.02em] transition-all duration-300 hover:scale-[1.02] ${
                mode === "manual"
                  ? "!text-white !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0] shadow-[0_6px_16px_rgba(6,182,212,0.35)]"
                  : "!bg-transparent !text-gray-500 dark:!text-slate-400 hover:!text-cyan-500"
              }`}
              icon={<EditOutlined />}
            >
              {t('manual')}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => router.push(`/${locale}/create-quiz`)}
            className="!h-10 !px-4 !rounded-xl !text-white !font-bold !text-sm !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0] !border-0 shadow-[0_6px_16px_rgba(6,182,212,0.35)] hover:scale-[1.03] transition-all duration-300"
            icon={<PlusOutlined />}
          >
            {t('generateQuiz')}
          </Button>
        )}

        {/* ── Avatar profil ── */}
        <Dropdown menu={profileMenu} trigger={['click']}>
          <Avatar
            className="!bg-gradient-to-br !from-cyan-500 !to-teal-900 !shadow-md hover:!shadow-xl ring-2 ring-white dark:ring-slate-800 transition-all duration-300 hover:scale-105 cursor-pointer"
            icon={<UserOutlined />}
          />
        </Dropdown>
        

      </div>
    </div>
  )
}