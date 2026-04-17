"use client";

import React, { useState, Fragment } from "react";
import { Avatar, Button, Card, Progress, Tag, Modal, Form, Input, Select } from "antd";
import {
  EditOutlined, TrophyOutlined,UserOutlined,
  StarOutlined, ClockCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, RiseOutlined, GlobalOutlined, LockOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/lib/auth";
import Deco from "@/components/Decoration/Deco";
import { Controller, useForm } from 'react-hook-form'

const achievements = [
  { name: "Quiz Master", desc: "Completed 20+ quizzes", emoji: "🏆", color: "!bg-amber-50 !text-amber-600 !border-amber-200" },
  { name: "Perfect Score", desc: "Got 100% in 5 quizzes", emoji: "⭐", color: "!bg-green-50 !text-green-600 !border-green-200" },
  { name: "Fast Learner", desc: "Answered 100 questions", emoji: "⚡", color: "!bg-blue-50 !text-blue-600 !border-blue-200" },
  { name: "7-Day Streak", desc: "Played 7 days in a row", emoji: "🔥", color: "!bg-orange-50 !text-orange-600 !border-orange-200" },
  { name: "Top 10", desc: "Reached global top 10", emoji: "🌍", color: "!bg-purple-50 !text-purple-600 !border-purple-200" },
];

const recentQuizzes = [
  { title: "Biology Basics", score: 90, total: 100, date: "2 hours ago", status: "completed" },
  { title: "History Quiz", score: 75, total: 100, date: "Yesterday", status: "completed" },
  { title: "Chemistry 101", score: 60, total: 100, date: "3 days ago", status: "completed" },
  { title: "Math Challenge", score: 0, total: 100, date: "5 days ago", status: "incomplete" },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const username = user?.user_metadata?.firstName || user?.email?.split('@')[0];
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { control, formState: { errors } } = useForm();

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Jan 2026';

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#067f8f';
    if (score >= 60) return '#06b6d4';
    return '#f59e0b';
  };

  return (
<Fragment>
  <Deco />
  <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8 space-y-4">
    <div className="mx-auto max-w-7xl !space-y-6 dark:!bg-gray-800">

      {/* ── HEADER ── */}
      <Card className="rounded-2xl! border-0! shadow-md! bg-white dark:!bg-slate-800">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar
                size={100}
                className="bg-linear-to-br! from-cyan-500! to-teal-400! text-white! text-4xl! font-bold! shadow-lg!"
              >
                {username?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-slate-800" />
            </div>

            {/* Info */}
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{username}</h1>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Tag className="rounded-full! bg-cyan-50! text-cyan-600! border-cyan-200! text-xs! font-semibold!">
                  🌍 {user?.user_metadata?.country || "Country not set"}
                </Tag>
                <Tag className="rounded-full! bg-green-50! text-green-600! border-green-200! text-xs! font-semibold!">
                  ✅ Member since {memberSince}
                </Tag>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <Button
            icon={<EditOutlined />}
            onClick={() => setEditModalOpen(true)}
            className="h-12! px-6! rounded-xl! text-white! font-semibold! bg-linear-to-r! from-cyan-500! to-teal-400! border-0! shadow-md! hover:opacity-90! hover:scale-105! transition-all duration-300"
          >
            Edit Profile
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── LEFT COLUMN ── */}
        <div className="!space-y-6 lg:col-span-1 ">

          {/* User Information */}
          <div className="space-y-4">
          <Card
            title={<span className="font-semibold text-gray-900 dark:text-white">👤 User Information</span>}
            className="rounded-2xl! border-0! shadow-md! bg-white dark:!bg-slate-800"
          >
            <div className="!space-y-4 text-sm">
              {[
                { label: "Username", value: username },
                { label: "Email", value: user?.email },
                { label: "Country", value: user?.user_metadata?.country || "Not specified" },
                { label: "Member since", value: memberSince },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between space-x-3 border-b border-gray-100 dark:border-slate-700 pb-3 last:border-0 last:pb-0 pr-0">
                  <span className="text-gray-400 dark:text-gray-400 shrink-0">{item.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white truncate max-w-45">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
          </div>

          {/* Achievements */}
          <Card
            title={<span className="font-bold text-gray-900 dark:text-white">🏅 Achievements</span>}
            className="rounded-2xl! border-0! shadow-md! bg-white dark:!bg-slate-800"
          >
            <div className="!space-y-3">
              {achievements.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700 hover:bg-cyan-50 dark:hover:bg-slate-600 transition-all">
                  <div className="text-2xl">{a.emoji}</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{a.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-400">{a.desc}</p>
                  </div>
                  <Tag className={`ml-auto rounded-full! text-xs! font-semibold! !bg-cyan-100 !text-cyan-800 !border-cyan-200`}>
                    Unlocked
                  </Tag>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="!space-y-6 lg:col-span-2">

          {/* Performance Overview */}
          <Card
            title={<span className="font-bold text-gray-900 dark:text-white">📊 Performance Overview</span>}
            className="rounded-2xl! border-0! shadow-md! bg-white dark:!bg-slate-800"
          >
            <div className="space-y-5">
              {[
                { label: "Overall Success Rate", value: 78, color: "#04525c" },
                { label: "Quiz Completion Rate", value: 92, color: "#067f8f" },
                { label: "Average Response Time", value: 65, color: "#06b6d4" },
                { label: "Hint Usage Rate", value: 30, color: "#0cada3" },
              ].map((perf, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-white font-medium">{perf.label}</span>
                    <span className="text-sm font-bold dark:text-white " style={{ color: perf.color }}>{perf.value}%</span>
                  </div>
                  <Progress
                    percent={perf.value}
                    showInfo={false}
                    strokeColor={perf.color}
                    railColor={isDark ? "#334155" : "#f1f5f9"}
                    className="mb-0!"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Quizzes */}
          <Card
            title={<span className="font-bold text-gray-900 dark:text-white">🕐 Recent Quizzes</span>}
            extra={
              <Button
                size="small"
                className="rounded-lg! border-cyan-300! text-cyan-500! hover:bg-cyan-50!"
              >
                View All
              </Button>
            }
            className="rounded-2xl! border-0! shadow-md! bg-white dark:!bg-slate-800"
          >
            <div className="space-y-4">
              {recentQuizzes.map((quiz, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-slate-700 hover:bg-cyan-50 dark:hover:bg-slate-600 transition-all group">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-600 shadow-sm flex items-center justify-center shrink-0">
                    {quiz.status === 'completed'
                      ? <CheckCircleOutlined className="!text-cyan-500 !text-lg" />
                      : <CloseCircleOutlined className="!text-red-200 !text-lg" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{quiz.title}</p>
                      <span className="text-xs text-gray-400 ml-2 shrink-0 dark:text-gray-400">
                        <ClockCircleOutlined className="mr-1" />{quiz.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        percent={quiz.score}
                        size="small"
                        strokeColor={getScoreColor(quiz.score)}
                        railColor={isDark ? "#334155" : "#f1f5f9"}
                        className="mb-0! flex-1"
                        showInfo={false}
                      />
                      <span className="text-xs font-bold shrink-0 dark:text-white" style={{ color: getScoreColor(quiz.score) }}>
                        {quiz.score}/{quiz.total}
                      </span>
                    </div>
                  </div>

                  {/* Play again */}
                  <Button
                    size="small"
                    className="bg-linear-to-r! from-cyan-500! to-teal-400! text-white! border-0! rounded-lg! opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    Retry
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
                {/* Global Ranking */}
          <Card
            title={<span className="font-bold text-gray-900 dark:text-white">🌍 Global Ranking</span>}
            className="rounded-2xl! border-0! shadow-md! bg-white dark:!bg-slate-800"
          >
            <div className="flex items-center justify-around text-center">
              {[
                { label: "Global Rank", value: "#42", icon: <GlobalOutlined />, color: "text-cyan-500" },
                { label: "Total Points", value: "1,240", icon: <TrophyOutlined />, color: "text-cyan-500" },
                { label: "Best Score", value: "98%", icon: <StarOutlined />, color: "text-cyan-500" },
                { label: "Top Category", value: "Science", icon: <RiseOutlined />, color: "text-cyan-500" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`text-2xl ${item.color}`}>{item.icon}</div>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">{item.value}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-400">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>
  </div>

  <Modal
    title={<span className="font-bold text-gray-900 dark:text-white">Edit Profile</span>}
    open={editModalOpen}
    onCancel={() => setEditModalOpen(false)}
    footer={null}
    className="rounded-2xl! bg-white dark:!bg-slate-800"
  >
    <Form form={form} layout="vertical" className="mt-4">
      <Form.Item label="Username" name="username">
        <Input
          placeholder={username}
            className="rounded-xl! text-sm border-gray-200 dark:!border-gray-600 dark:!bg-gray-800 dark:!text-white focus:!border-cyan-500 transition-all"
        />
      </Form.Item>
      <Form.Item label="Email" name="email">
        <Input
          placeholder={user?.email}
            className="rounded-xl! text-sm border-gray-200 dark:!border-gray-600 dark:!bg-gray-800 dark:!text-white focus:!border-cyan-500 transition-all"
          type="email"
        />
      </Form.Item>
      <Form.Item
        label={<span className="dark:text-gray-300">Password</span>}
        validateStatus={errors.password ? 'error' : undefined}
        help={typeof errors.password?.message === 'string' ? errors.password.message : undefined}
      >
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input.Password
              autoComplete="new-password"
              {...field}
              prefix={<LockOutlined className="text-slate-400" />}
              size="large"
              className="rounded-xl! text-sm border-gray-200 dark:!border-gray-600 dark:!bg-gray-800 dark:!text-white focus:!border-cyan-500 transition-all"
              placeholder="••••••••"
            />
          )}
        />
      </Form.Item>
      <Form.Item
        label={<span className="dark:text-gray-300">Confirm Password</span>}
        validateStatus={errors.confirmPassword ? 'error' : undefined}
        help={typeof errors.confirmPassword?.message === 'string' ? errors.confirmPassword.message : undefined}
      >
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <Input.Password
              autoComplete="new-password"
              {...field}
              prefix={<LockOutlined className="text-slate-400" />}
              size="large"
                className="rounded-xl! text-sm border-gray-200 dark:!border-gray-600 dark:!bg-gray-800 dark:!text-white focus:!border-cyan-500 transition-all"
              placeholder="••••••••"
            />
          )}
        />
      </Form.Item>
      <Form.Item label="Country" name="country">
        <Select
          placeholder="Select your country"
            className="rounded-xl! text-sm !border-gray-200 dark:!border-gray-600 dark:!bg-gray-800 dark:!text-white focus:!border-cyan-500 transition-all"
          options={[
            { value: 'Tunisia', label: '🇹🇳 Tunisia' },
            { value: 'France', label: '🇫🇷 France' },
            { value: 'USA', label: '🇺🇸 USA' },
            { value: 'Germany', label: '🇩🇪 Germany' },
            { value: 'Morocco', label: '🇲🇦 Morocco' },
            { value: 'Algeria', label: '🇩🇿 Algeria' },
          ]}
        />
      </Form.Item>
      <Form.Item className="mb-0!">
        <Button
          block
          className="h-11! rounded-xl! bg-linear-to-r! from-cyan-500! to-teal-400! text-white! border-0! font-semibold! hover:opacity-90!"
          onClick={() => setEditModalOpen(false)}
        >
          Save Changes
        </Button>
      </Form.Item>
    </Form>
  </Modal>
</Fragment>
  );
}