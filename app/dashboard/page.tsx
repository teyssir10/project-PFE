"use client"
import React from 'react'
import { useAuth } from "@/lib/auth"
import { Button, Menu } from 'antd';
import { LogoutOutlined, PlusOutlined, RiseOutlined, ShareAltOutlined } from '@ant-design/icons';
import Image from 'next/image'
import logo from '@/app/assets/panda-logo.png';
import Link from 'next/link';
import { Deco } from '../components/Decoration/Deco';
  
const menuItems = [
  { key: 'home', label: <Link href="/">Home</Link> },
  { key: 'about', label: <Link href="/about">About</Link> },
  { key: 'quiz', label: <Link href="/quiz">Quiz</Link> },
  { key: 'leaderboard', label: <Link href="/leaderboard">Leaderboard</Link> },
  { key: 'contact', label: <Link href="/contact">Contact</Link> },
];
  const quickActions = [
    { icon: PlusOutlined, label: 'Create Quiz', color: 'from-primary to-secondary' },
    { icon: RiseOutlined, label: 'View Analytics', color: 'from-secondary to-cyan-400' },
    { icon: ShareAltOutlined, label: 'Share Quiz', color: 'from-cyan-400 to-primary' },
  ]
export function Page() {
  const { user } = useAuth()

  return (
    <>
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-gray-200/60 dark:border-gray-800 shadow-sm transition-all duration-300">
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
    <div className="flex justify-between items-center h-16">

      {/* Logo */}
      <div className="flex items-center gap-3 cursor-pointer transition-transform duration-200 hover:scale-105">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r   font-extrabold shadow-md">
          <Image src={logo} alt="PandaBrain AI logo" width={100} height={100} />
        </div>
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          PandoMind  <span className="text-cyan-500">AI</span>
        </h1>
      </div>
       <div className="hidden md:flex items-center">
        <Menu
          mode="horizontal"
          items={menuItems}
          className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-300 tracking-tight hover:text-cyan-500 transition-colors duration-200 [&_.ant-menu-item]:px-3"
          style={{ background: 'transparent' }}
        />
      </div>
       <div className='hidden md:flex items-center gap-2'>
  <Link href='/login'>
    <Button
      icon={<LogoutOutlined />}
      type='text'
      className='px-6 py-2 rounded-full font-semibold !text-white 
      !bg-gradient-to-r !from-cyan-500 !via-cyan-400 !to-[#00D4D0] shadow-md
      hover:shadow-lg hover:scale-105 transition-all duration-300'
    >
      Logout
    </Button>
  </Link>
</div>

     </div>
     </div>
    </nav>
    <div className='relative'> 
             <Deco />
    <div className='relative overflow-hidden py-12 sm:py-20 lg:py-28 py-8 px-8 sm:px-16 lg:px-24'>

      <h1><span className='text-3xl font-extrabold text-[#0e92b6] '>welcome back,</span>  <span className='text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight '>{user?.user_metadata?.firstName || user?.email?.split('@')[0]} !</span></h1>
      <p className='text-gray-700'>Ready to create your next amazing quiz? Let&apos;s get started.</p>
     
    </div>
     <div  className=' relative flex flex-col md:flex-row gap-6 md:gap-12 px-8 sm:px-16 lg:px-24 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  
                  className={`p-6 rounded-xl !bg-gradient-to-br !from-cyan-500 !to-[#00D4D0] text-white font-semibold hover:shadow-lg transition-all !duration-200 transform hover:scale-105 flex items-center gap-3`}
                >
                  <action.icon className="w-6 h-6" />
                  {action.label}
                </button>
              ))}
            </div>
            </div>
    </>
  )
  
}

export default Page
