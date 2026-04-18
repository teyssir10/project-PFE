"use client"
import React, { useState } from 'react'
import { useAuth } from "@/lib/auth"
import { Button, Card, Progress, Tag } from 'antd';
import {
  CaretRightOutlined, RiseOutlined,
  ThunderboltOutlined, TrophyOutlined,
  ClockCircleOutlined, RobotOutlined, GlobalOutlined,
  TeamOutlined
} from '@ant-design/icons';

import Stats from '@/components/LayoutDashboard/stats';
import QuickActions from '@/components/LayoutDashboard/Quick-Actions';

import Image from 'next/image';
import welcomeLogo from '@/public/dashboard.png';


const recentActivity = [
  { title: 'Biology Basics', score: 90, total: 15, date: '2 hours ago', status: 'completed' },
  { title: 'History Quiz', score: 75, total: 20, date: 'Yesterday', status: 'completed' },
  { title: 'Chemistry 101', score: 60, total: 12, date: '3 days ago', status: 'completed' },
  { title: 'Math Challenge', score: 0, total: 10, date: '5 days ago', status: 'incomplete' },
]

const recommendedQuizzes = [
  { title: 'Physics Advanced', difficulty: 'Hard', questions: 20, tag: '🔬 Science' },
  { title: 'World Geography', difficulty: 'Medium', questions: 15, tag: '🌍 Geography' },
  { title: 'AI & Technology', difficulty: 'Easy', questions: 10, tag: '🤖 Tech' },
]

const difficultyColor: Record<string, string> = {
  Easy: '!bg-cyan-100 !text-cyan-600 !border-cyan-200 dark:!bg-cyan-900/40 dark:!text-cyan-300 dark:!border-cyan-700',
  Medium: '!bg-cyan-200 !text-cyan-700 !border-cyan-300 dark:!bg-cyan-800/40 dark:!text-cyan-200 dark:!border-cyan-600',
  Hard: '!bg-cyan-400 !text-cyan-900 !border-cyan-500 dark:!bg-cyan-600/40 dark:!text-white dark:!border-cyan-500',
}

export function Page() {
  const { user } = useAuth()
const username = user?.user_metadata?.firstname || user?.email?.split('@')[0] || 'User';

  return (
      <div className="relative min-h-screen py-6">

        <div className="relative px-2 lg:px-10 py-0 space-y-4">

          {/* WELCOME */}
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold">
                <span className="text-cyan-500">Welcome back, </span>
                <span className="text-gray-900 dark:text-white">{username} !</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Ready to challenge yourself today?
              </p>
            </div>
          </div>
          <Stats/>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Activity */}
            <Card className="!rounded-2xl !border-0 !shadow-md 
              !bg-gradient-to-br !from-[#D6EEF5] !to-cyan-100
              dark:!from-slate-800 dark:!to-slate-700
              !backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
  
  {/* LEFT */}
  <div className="flex items-center gap-2">
    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
      Recent Activity
    </h2>

    <Image
      src={welcomeLogo}
      alt="Welcome"
      width={20}
      height={20}
      className="w-10 h-10"
    />
  </div>

  {/* RIGHT */}
  <ClockCircleOutlined className="text-gray-400 dark:text-gray-500 text-lg" />
</div>
              <div className="space-y-4">
                {recentActivity.map((quiz, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                      <TrophyOutlined className="text-cyan-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {quiz.title}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                          {quiz.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          percent={Math.round((quiz.score / quiz.total) * 100)}
                          size="small"
                          strokeColor="#06b6d4"
                          className="!mb-0 flex-1"
                        />
                        <span className="text-xs font-semibold text-cyan-500 flex-shrink-0">
                          {quiz.score}/{quiz.total}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

           
            <div className="space-y-4">
            <div>
            <QuickActions/>
            </div>
            <div>
             {/* Recommended */}
            <Card className="!rounded-2xl !border-0 !shadow-md 
              !bg-gradient-to-br !from-[#D6EEF5] !to-cyan-100
              dark:!from-slate-800 dark:!to-slate-700
              !backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Recommended for You
                </h2>
                <Tag className="!rounded-full !text-xs !font-semibold !bg-cyan-500 !text-cyan-100 dark:!bg-slate-100/40 dark:!text-cyan-300">
                   AI ✨
                </Tag>
              </div>
              <div className="space-y-4">
                {recommendedQuizzes.map((quiz, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl 
                    bg-gray-50 dark:bg-slate-600/50 
                    hover:bg-cyan-50 dark:hover:bg-slate-600 
                    transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-500 shadow-sm flex items-center justify-center text-lg">
                        {quiz.tag.split(' ')[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {quiz.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-400">
                          {quiz.questions} questions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className={`!rounded-full !text-xs !font-semibold ${difficultyColor[quiz.difficulty]}`}>
                        {quiz.difficulty}
                      </Tag>
                      <Button
                        size="small"
                        icon={<CaretRightOutlined />}
                        className="!bg-gradient-to-r !from-cyan-500 !to-teal-400 !text-white !border-0 !rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button
                block
                icon={<ThunderboltOutlined />}
                className="!mt-4 !bg-gradient-to-r !from-cyan-500 !to-teal-400 !text-white !border-0 !rounded-xl !font-semibold hover:!opacity-90"
              >
                Get More Recommendations
              </Button>
            </Card>
            </div>
            </div>

          </div>

        </div>
      </div>
  )
}

export default Page