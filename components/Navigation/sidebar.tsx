'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LogoutOutlined, HomeOutlined, LineChartOutlined, SettingOutlined,
  FileAddOutlined, UsergroupAddOutlined,
  TrophyOutlined, PlusOutlined, AppstoreOutlined
} from '@ant-design/icons'
import { useAuth } from '@/lib/auth'
import Image from 'next/image'
import logo from '@/public/panda-logo.png';

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
}

const navSections = [
  {
    label: 'MAIN',
    items: [
      { icon: HomeOutlined,    label: 'Dashboard', href: '/dashboard' },
    ]
  },
  {
    label: 'PLAY',
    items: [
      { icon: AppstoreOutlined ,     label: 'Browse Quizzes',  href: '/browse-quiz' },
      { icon: PlusOutlined,      label: 'Create Quiz',  href: '/quiz' },
      { icon: LineChartOutlined, label: 'Analytics', href: '/analytics' },
      { icon: UsergroupAddOutlined, label: 'Multiplayer', href: '/multiplayer' },
      { icon: TrophyOutlined,       label: 'Leaderboard', href: '/leaderboard' },
    ]
  },
  {
    label: 'ACCOUNT',
    items: [
      { icon: SettingOutlined,   label: 'Settings',  href: '/settings' },
    ]
  },
]


const LogoSection = () => (
  <div className="items-center gap-3 ">
    <div className=' flex gap-7  items-center gap-3 cursor-pointer transition-transform duration-200 hover:scale-105'>
      
     
      <div>
      <h1 className="text-lg font-extrabold text-gray-900 dark:text-white">
        Pando<span className="text-cyan-500">Mind</span>
      </h1>
      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">AI Quiz Platform</p>
      </div>
      <div>
       <Image src={logo} alt="PandaBrain AI logo" width={40} height={40} />
       </div>
       
    </div>
  </div>
)

function NavLinks({ onClickItem }: { onClickItem?: () => void }) {
  const pathname = usePathname()

  return (
    <nav 
      className="flex-1 px-4 py-6 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none' }}
      >
      {navSections.map((section) => (
        <div key={section.label} className="space-y-2">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {section.label}
          </p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClickItem}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group
                ${isActive
                ? 'bg-cyan-50 dark:bg-cyan-900/30 text-[#003333] dark:text-white'
                : 'text-[#003333] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-cyan-500 dark:hover:text-cyan-400'
                }`}
            >
            <Icon className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform !text-[#003333] dark:!text-white" />
            <span className="text-[#003333] dark:text-white">{item.label}</span>
            {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#003333] dark:bg-white" />
            )}
            </Link>
                
                )
            })}
            </div>
        </div>
      ))}
            </nav>
        )
        }

function LogoutButton({ onClick }: { onClick?: () => void }) {
  const { signOut, user } = useAuth()
  const username = user?.user_metadata?.firstName || user?.email?.split('@')[0]

  return (
    <div className=" sticky px-4 py-6 border-t border-gray-100 dark:border-slate-700 space-y-3">
      {/* User info */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
          {username?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{username}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => { signOut(); onClick?.() }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
          bg-gradient-to-r from-cyan-500 to-teal-400 
          text-white rounded-xl font-semibold 
          hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm"
      >
        <LogoutOutlined />
        Logout
      </button>
    </div>
  )
}

export function sidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 
        bg-white dark:bg-slate-800 
        border-r border-gray-100 dark:border-slate-700 
        flex-col  h-screen shadow-sm">
        <div className=" h-16 px-6 py-3 border-b border-gray-100 dark:border-slate-700">
          <LogoSection />
        </div>
        <NavLinks />
        <LogoutButton />
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
        <div className="w-full">
          {children}
        </div>
      </main>

    </div>
  )
}

export default sidebar