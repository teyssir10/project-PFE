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
import { Deco } from '@/components/Decoration/Deco';
import { DashboardLayout } from '@/components/DashboardLayout/page';

const stats = [
  { label: 'Quizzes Played', value: '24', trend: '+3 this week',
    icon: <ThunderboltOutlined className="text-xl text-cyan-500" /> },
  { label: 'Avg. Score', value: '85%', trend: '+5% vs last week',
    icon: <RiseOutlined className="text-xl text-teal-500" /> },
  { label: 'Total Points', value: '1,240', trend: '+120 today',
    icon: <TrophyOutlined className="text-xl text-cyan-600" /> },
  { label: 'Global Rank', value: '#42', trend: '↑ 8 positions',
    icon: <GlobalOutlined className="text-xl text-teal-600" /> },
]

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
  const username = user?.user_metadata?.firstName || user?.email?.split('@')[0]

  return (
      <div className="relative min-h-screen py-6">
        <Deco />

        <div className="relative px-6 lg:px-10 py-8 space-y-10">

          {/* WELCOME */}
          <div className="flex items-center justify-between">
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

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <Card
                key={i}
                className="!rounded-2xl !shadow-md 
                  !bg-gradient-to-br !from-[#D6EEF5] !to-cyan-200 
                  dark:!from-slate-800 dark:!to-slate-700
                  !backdrop-blur-md hover:!shadow-xl hover:!-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center mb-4 shadow-sm">
                  {stat.icon}
                </div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">{stat.label}</p>
                <div className="flex items-center gap-1 mt-3 bg-white dark:bg-slate-600/50 rounded-full px-3 py-1 w-fit">
                  <RiseOutlined className="text-cyan-400 text-xs" />
                  <p className="text-xs text-cyan-900 dark:text-cyan-300 font-semibold">{stat.trend}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* RECENT + RECOMMENDED */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Activity */}
            <Card className="!rounded-2xl !border-0 !shadow-md 
              !bg-gradient-to-br !from-[#D6EEF5] !to-cyan-100
              dark:!from-slate-800 dark:!to-slate-700
              !backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
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

            {/* Recommended */}
            <Card className="!rounded-2xl !border-0 !shadow-md 
              !bg-gradient-to-br !from-[#D6EEF5] !to-cyan-100
              dark:!from-slate-800 dark:!to-slate-700
              !backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Recommended for You
                </h2>
                <RobotOutlined className="text-cyan-400 text-lg" />
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

          {/* QUICK ACTIONS */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <button className="group p-6 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-500 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CaretRightOutlined className="text-2xl" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Start Quiz</p>
                  <p className="text-white/80 text-sm">Jump into a quiz now</p>
                </div>
              </button>

              <button className="group p-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TeamOutlined className="text-2xl" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Play with Friends</p>
                  <p className="text-white/80 text-sm">Challenge your friends</p>
                </div>
              </button>

              <button className="group p-6 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <RobotOutlined className="text-2xl" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Generate AI Quiz</p>
                  <p className="text-white/80 text-sm">Create with AI instantly</p>
                </div>
              </button>

            </div>
          </div>

        </div>
      </div>
  )
}

export default Page