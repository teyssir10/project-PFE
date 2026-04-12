"use client"
import React from 'react'
import { useAuth } from "@/lib/auth"
import { Button, Menu } from 'antd';
import { LogoutOutlined,ThunderboltOutlined, CaretRightOutlined, PlusOutlined, RiseOutlined, ShareAltOutlined } from '@ant-design/icons';
import Image from 'next/image'
import logo from '@/app/assets/panda-logo.png';
import Link from 'next/link';
import { Card } from 'antd';
 import { Deco } from '@/app/components/Decoration/Deco';
  
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
  const recentQuizzes = [
    { id: 1, title: 'Biology Basics', questions: 15, responses: 24, created: '2 days ago' },
    { id: 2, title: 'History Quiz', questions: 20, responses: 18, created: '5 days ago' },
    { id: 3, title: 'Chemistry 101', questions: 12, responses: 31, created: '1 week ago' },
  ]

  const handleCreateQuiz = () => {
    alert('Quiz creation feature coming soon!')
  }
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
    
    <div className='relative overflow-hidden !py-4 !sm:py-2 !lg:py-10 px-8 sm:px-16 lg:px-24 mb-12'>

      <h1 className='lg:text-4xl'><span className='text-3xl font-extrabold text-[#0e92b6] '>welcome back,</span>  <span className='text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight '>{user?.user_metadata?.firstName || user?.email?.split('@')[0]} !</span></h1>
      <p className='text-gray-700'>Ready to create your next amazing quiz? Let&apos;s get started.</p>
     
    </div>
     <div  className=' relative flex flex-col md:flex-row gap-6 md:gap-12 px-8 sm:px-16 lg:px-24 py-4 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
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
        <div className=' relative flex flex-col md:flex-row gap-6 md:gap-12 px-8 sm:px-16 lg:px-24 py-4 grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 '>
        <Card className="!rounded-2xl !shadow-md hover:!shadow-lg transition-all !border-0 !bg-white/30 !backdrop-blur-md ">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Quizzes</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">3</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </Card>
            <Card className="!rounded-2xl !shadow-md hover:!shadow-lg transition-all !border-0 !bg-white/30 !backdrop-blur-md ">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Responses</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">0</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </Card>

            <Card className="!rounded-2xl !shadow-md hover:!shadow-lg transition-all !border-0 !bg-white/30 !backdrop-blur-md ">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Avg. Score</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">85%</p>
                </div>
                <div className="text-3xl">⭐</div>
              </div>
            </Card>

            <Card className="!rounded-2xl !shadow-md hover:!shadow-lg transition-all !border-0 !bg-white/30 !backdrop-blur-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Active Users</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">156</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </Card>
            </div>
            <div className='relative overflow-hidden !py-2 !sm:py-4 !lg:py-10 px-8 sm:px-16 lg:px-24'>
            <div className="flex items-center justify-between mb-6">
              <h3 className="!text-2xl font-bold text-gray-900">Your Recent Quizzes</h3>
              <Button
                onClick={handleCreateQuiz}
                icon={<PlusOutlined />}
                className="!bg-gradient-to-r !from-cyan-500 !to-teal-400 !text-white  hover:!opacity-90 transition-all size-35"
              >
                New Quiz
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden py-4 sm:py-6 lg:py-16 px-8 sm:px-16 lg:px-24">
          {recentQuizzes.map((quiz) => (
            <Card
              key={quiz.id} 
              className="!rounded-2xl !border-0 !shadow-md hover:!shadow-lg transition-all cursor-pointer !bg-white/30 !backdrop-blur-md relative !overflow-hidden"
            >
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-bold text-lg text-gray-900">{quiz.title}</h4>
                  <span className="text-2xl">📋</span>
                </div>

                {/* Infos */}
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <p>Questions: <span className="font-semibold text-gray-900">{quiz.questions}</span></p>
                  <p>Responses: <span className="font-semibold text-gray-900">{quiz.responses}</span></p>
                  <p>Created: <span className="font-semibold text-gray-900">{quiz.created}</span></p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <Button
                    className="flex-1 !rounded-lg !border-gray-200 !text-gray-600 hover:!border-cyan-400 hover:!text-cyan-500 transition-all text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    icon={<CaretRightOutlined/>}
                    className="!flex-1 !bg-gradient-to-r !from-cyan-500 !to-teal-400 !text-white"
                  >
                    Play
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="relative overflow-hidden py-4 sm:py-6 lg:py-16 px-8 sm:px-16 lg:px-24 grid grid-cols-1 md:grid-cols-3 gap-6 ">
  
          <Card className="!rounded-2xl !border-0 !shadow-md hover:!shadow-lg transition-all !bg-gradient-to-br !from-cyan-50 !to-teal-50">
            <ThunderboltOutlined className="!text-3xl !text-cyan-500 mb-4 block" />
            <h4 className="font-bold text-gray-900 mb-2">AI-Powered Generation</h4>
            <p className="text-sm text-gray-500">Create intelligent quizzes in seconds with advanced AI technology</p>
          </Card>

          <Card className="!rounded-2xl !border-0 !shadow-md hover:!shadow-lg transition-all !bg-gradient-to-br !from-teal-50 !to-cyan-50">
            <RiseOutlined className="!text-3xl !text-teal-500 !mb-4 block" />
            <h4 className="font-bold text-gray-900 mb-2">Advanced Analytics</h4>
            <p className="text-sm text-gray-500">Track performance metrics and engagement in real-time</p>
          </Card>

          <Card className="!rounded-2xl !border-0 !shadow-md hover:!shadow-lg transition-all !bg-gradient-to-br !from-cyan-50 !to-sky-50">
            <ShareAltOutlined className="!text-3xl !text-cyan-500 !mb-4 block" />
            <h4 className="font-bold text-gray-900 mb-2">Easy Sharing</h4>
            <p className="text-sm text-gray-500">Share your quizzes with students or colleagues instantly</p>
          </Card>

      </div>
     </div>
    </>
  )
  
}

export default Page