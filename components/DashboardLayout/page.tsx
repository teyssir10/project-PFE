'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LogoutOutlined, HomeOutlined, LineChartOutlined,
  TeamOutlined, SettingOutlined, MenuOutlined,
  CloseOutlined, FileAddOutlined, UnorderedListOutlined
} from '@ant-design/icons'
import { useAuth } from '@/lib/auth'
import Image from 'next/image'
import logo from '@/app/assets/panda-logo.png'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
}

const navItems: NavItem[] = [
  { icon: HomeOutlined, label: 'Home', href: '/dashboard' },
  { icon: FileAddOutlined, label: 'Create Quiz', href: '/create' },
  { icon: UnorderedListOutlined, label: 'My Quizzes', href: '/quiz' },
  { icon: LineChartOutlined, label: 'Analytics', href: '/analytics' },
  { icon: TeamOutlined, label: 'Leaderboard', href: '/leaderboard' },
  { icon: SettingOutlined, label: 'Settings', href: '/settings' },
]

const LogoSection = () => (
  <div className="flex items-center gap-3">
    <Image src={logo} alt="logo" width={40} height={40} />
    <div>
      <h1 className="text-lg font-extrabold text-gray-900">
        Pando<span className="text-cyan-500">Mind</span>
      </h1>
      <p className="text-xs text-gray-400 font-medium">AI Quiz Platform</p>
    </div>
  </div>
)

function NavLinks({ onClickItem }: { onClickItem?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClickItem}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group ${
              isActive ? 'shadow-sm' : ''
            }`}
            style={{
              backgroundColor: isActive ? '#00333315' : undefined,
              color: '#003333',
            }}
          >
            <Icon
              style={{ color: '#003333' }}
              className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform"
            />
            <span style={{ color: '#003333' }}>{item.label}</span>
            {isActive && (
              <div
                className="ml-auto w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#003333' }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

function LogoutButton({ onClick }: { onClick?: () => void }) {
  const { signOut, user } = useAuth()
  const username = user?.user_metadata?.firstName || user?.email?.split('@')[0]

  return (
    <div className="px-4 py-6 border-t border-gray-100 space-y-3">
      {/* User info */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
          {username?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{username}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
      </div>
      {/* Logout */}
      <button
        onClick={() => { signOut(); onClick?.() }}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm"
      >
        <LogoutOutlined />
        Logout
      </button>
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
    <div className="flex h-screen bg-gray-50">

      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col sticky top-0 h-screen shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <LogoSection />
        </div>
        <NavLinks />
        <LogoutButton />
      </aside>
      <main className="flex-1 overflow-auto relative">

        <div className="w-full">
          {children}
        </div>

      </main>
    </div>
  )
}

export default DashboardLayout