"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button, Card, Progress, Tag, Spin } from "antd";
import {
  CaretRightOutlined, ThunderboltOutlined,
  TrophyOutlined, ClockCircleOutlined,
} from "@ant-design/icons";
import Stats from "@/components/LayoutDashboard/stats";
import QuickActions from "@/components/LayoutDashboard/Quick-Actions";
import Image from "next/image";
import welcomeLogo from "@/public/dashboard.png";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

const difficultyColor: Record<string, string> = {
  Easy: "!bg-cyan-100 !text-cyan-600 !border-cyan-200 dark:!bg-cyan-900/40 dark:!text-cyan-300 dark:!border-cyan-700",
  Medium: "!bg-cyan-200 !text-cyan-700 !border-cyan-300 dark:!bg-cyan-800/40 dark:!text-cyan-200 dark:!border-cyan-600",
  Hard: "!bg-cyan-400 !text-cyan-900 !border-cyan-500 dark:!bg-cyan-600/40 dark:!text-white dark:!border-cyan-500",
};

export function Page() {
  const t = useTranslations('dashboard');
  const { user } = useAuth();
  const username = user?.user_metadata?.firstname || user?.email?.split("@")[0] || "User";
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recommendedQuizzes, setRecommendedQuizzes] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchRecentActivity = async () => {
      setLoadingActivity(true);
      const { data, error } = await supabase
        .from("quiz_history")
        .select(`*, quizzes (title, question_count)`)
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .limit(4);
      if (!error && data) setRecentActivity(data);
      setLoadingActivity(false);
    };
    fetchRecentActivity();
  }, [user]);

  useEffect(() => {
    const fetchRecommended = async () => {
      setLoadingRecommended(true);
      const { data, error } = await supabase
        .from("quizzes")
        .select(`*, categories (name, icon)`)
        .eq("is_published", true)
        .order("players", { ascending: false })
        .limit(3);
      if (!error && data) setRecommendedQuizzes(data);
      setLoadingRecommended(false);
    };
    fetchRecommended();
  }, []);

  const formatDate = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return t('justNow');
    if (hours < 24) return t('hoursAgo', { hours });
    if (days === 1) return t('yesterday');
    return t('daysAgo', { days });
  };

  return (
    <div className="relative min-h-screen py-6">
      <div className="relative px-2 lg:px-10 py-0 space-y-4">

        {/* WELCOME */}
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">
              <span className="text-cyan-500">{t('welcome')} </span>
              <span className="text-gray-900 dark:text-white">{username} !</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <Stats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Activity */}
          <Card className="!rounded-2xl !border-0 !shadow-md
            !bg-gradient-to-br !from-[#D6EEF5] !to-cyan-100
            dark:!from-slate-800 dark:!to-slate-700 !backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('recentActivity')}
                </h2>
                <Image src={welcomeLogo} alt="Welcome" width={20} height={20} className="w-10 h-10" />
              </div>
              <ClockCircleOutlined className="text-gray-400 dark:text-gray-500 text-lg" />
            </div>

            {loadingActivity ? (
              <div className="flex justify-center py-8"><Spin /></div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">🎯</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noActivity')}</p>
                <p className="text-gray-400 text-xs mt-1">{t('noActivitySub')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item, i) => {
                  const percent = item.quizzes?.question_count
                    ? Math.round((item.score / item.quizzes.question_count) * 100)
                    : 0;
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                        <TrophyOutlined className="text-cyan-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {item.quizzes?.title || "Quiz"}
                          </p>
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {formatDate(item.played_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress percent={percent} size="small" strokeColor="#06b6d4" className="!mb-0 flex-1" />
                          <span className="text-xs font-semibold text-cyan-500 flex-shrink-0">
                            {item.score}/{item.quizzes?.question_count || "?"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <QuickActions />

            {/* Recommended */}
            <Card className="!rounded-2xl !border-0 !shadow-md
              !bg-gradient-to-br !from-[#D6EEF5] !to-cyan-100
              dark:!from-slate-800 dark:!to-slate-700 !backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('recommended')}
                </h2>
                <Tag className="!rounded-full !text-xs !font-semibold !bg-cyan-500 !text-cyan-100">
                  AI ✨
                </Tag>
              </div>

              {loadingRecommended ? (
                <div className="flex justify-center py-8"><Spin /></div>
              ) : recommendedQuizzes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">🤖</p>
                  <p className="text-gray-500 text-sm">{t('noRecommended')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendedQuizzes.map((quiz, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl
                      bg-gray-50 dark:bg-slate-600/50
                      hover:bg-cyan-50 dark:hover:bg-slate-600
                      transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-500 shadow-sm flex items-center justify-center text-lg">
                          {quiz.categories?.icon || "🎯"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {quiz.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {quiz.question_count} {t('questions')} • {quiz.categories?.name || "General"}
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
              )}

              <Button block icon={<ThunderboltOutlined />}
                className="!mt-4 !bg-gradient-to-r !from-cyan-500 !to-teal-400 !text-white !border-0 !rounded-xl !font-semibold hover:!opacity-90">
                {t('getMore')}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;