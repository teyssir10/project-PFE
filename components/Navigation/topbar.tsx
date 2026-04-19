"use client"
import React from 'react'
import { Button, Avatar, Dropdown } from 'antd'
import { useRouter, usePathname } from 'next/navigation'
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  RobotOutlined,
  PlusOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { supabase } from '@/lib/supabase'
import LightToDark from '../UI/Button/LightToDark'
import { useQuizModeStore } from '@/store/useQuizModeStore'

type TopbarProps = {
  username: string
}

const notifications = [
  { title: 'New challenge from Ahmed!', time: '2 min ago', read: false },
  { title: 'You ranked up to #42 globally', time: '1 hour ago', read: false },
  { title: 'Weekly report is ready', time: 'Yesterday', read: true },
]

export default function Topbar({ username }: TopbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentPage = pathname.split("/").pop()
  const { mode, setMode } = useQuizModeStore()

  const isCreateQuizPage = pathname === "/create-quiz" || pathname === "/quiz/create"

  const formatName = (name: string | undefined) => {
    if (!name) return "Dashboard"
    return name.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const notifMenu = {
    items: [
      {
        key: 'header',
        label: <span className="font-bold !text-cyan-600">Notifications</span>,
        disabled: true,
      },
      ...notifications.map((n, i) => ({
        key: i,
        label: (
          <div>
            <p className="text-sm">{n.title}</p>
            <span className="text-xs text-gray-400">{n.time}</span>
          </div>
        ),
      })),
    ],
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const profileMenu = {
    items: [
      {
        key: 'user',
        label: <span>{username}</span>,
      },
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Profile',
        onClick: () => router.push('/profile'),
      },
      {
        key: 'logout',
        icon: <span className="!text-cyan-500"><LogoutOutlined /></span>,
        label: <span className="text-cyan-500">Logout</span>,
        onClick: handleLogout,
      },
    ],
  }

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 py-3
      bg-white/80 dark:bg-slate-900/80 backdrop-blur-md
      border-b border-gray-100 dark:border-slate-700 gap-1">

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

        <Dropdown menu={notifMenu} trigger={['click']}>
          <Button className="rounded-full w-10 h-10 flex items-center justify-center transition hover:scale-110 !hover:border-cyan-500">
            <BellOutlined />
          </Button>
        </Dropdown>

        <LightToDark />

        {/* Boutons conditionnels */}
       {isCreateQuizPage ? (
  <div className="flex items-center p-1 gap-1 bg-gray-100 dark:bg-slate-700 rounded-[16px] transition-colors duration-300">
    
    <Button
      onClick={() => setMode("ai")}
      className={`h-[38px] rounded-[12px] font-bold text-[13px] border-0 tracking-[0.02em] transition-all duration-300 hover:scale-[1.02] ${
        mode === "ai"
          ? "!text-white !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0] shadow-[0_6px_16px_rgba(6,182,212,0.35)]"
          : "!bg-transparent !text-gray-500 dark:!text-slate-400 hover:!text-cyan-500 dark:hover:!text-cyan-400"
      }`}
      icon={<RobotOutlined />}
    >
      AI Generate
    </Button>

    <Button
      onClick={() => setMode("manual")}
      className={`h-[38px] rounded-[12px] font-bold text-[13px] border-0 tracking-[0.02em] transition-all duration-300 hover:scale-[1.02] ${
        mode === "manual"
          ? "!text-white !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0] shadow-[0_6px_16px_rgba(6,182,212,0.35)]"
          : "!bg-transparent !text-gray-500 dark:!text-slate-400 hover:!text-cyan-500 dark:hover:!text-cyan-400"
      }`}
      icon={<EditOutlined />}
    >
      Manual
    </Button>

  </div>
        ) : (
          <Button
            onClick={() => router.push('/create-quiz')}
            className="h-[58px] rounded-[16px] !text-white font-bold text-[16px] !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0] border-0 shadow-[0_10px_30px_rgba(6,182,212,0.4)] tracking-[0.02em] hover:scale-[1.03] transition-all duration-300"
            icon={<PlusOutlined />}
          >
            Generate AI Quiz
          </Button>
        )}

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