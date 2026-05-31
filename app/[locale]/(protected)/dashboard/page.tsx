"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button, Card, Progress, Tag, Spin } from "antd";
import {
  CaretRightOutlined, ThunderboltOutlined,
  TrophyOutlined, ClockCircleOutlined,
} from "@ant-design/icons";
import Stats from "@/components/LayoutDashboard/stats";
import QuickActions from "@/components/LayoutDashboard/Quick-Actions";


import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

const difficultyColor: Record<string, string> = {
  Easy:   "!bg-cyan-50 !text-cyan-700 !border-cyan-200",
  Medium: "!bg-cyan-100 !text-cyan-800 !border-cyan-300",
  Hard:   "!bg-cyan-500 !text-white !border-cyan-600",
  Mixed:  "!bg-cyan-900 !text-cyan-100 !border-cyan-800",
};

export default function Page() {
  const t = useTranslations("dashboard");
  const { user } = useAuth();
  const router = useRouter();
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
    if (hours < 1) return t("justNow");
    if (hours < 24) return t("hoursAgo", { hours });
    if (days === 1) return t("yesterday");
    return t("daysAgo", { days });
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-900 py-6">
      <div className="relative px-2 lg:px-10 py-0 space-y-5">

        {/* ── WELCOME BANNER ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-400 dark:from-cyan-900 dark:via-cyan-800 dark:to-teal-900 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-16 -bottom-10 w-28 h-28 rounded-full bg-white/5" />
          <div className="relative z-10">
            <h1 className="text-2xl font-extrabold text-white leading-tight">
              {t("welcome")}{" "}
              <span className="text-cyan-100">{username}</span> !
            </h1>
            <p className="text-white/70 text-sm mt-1">{t("subtitle")}</p>
          </div>
          <div className="relative z-10 flex gap-2 flex-shrink-0">
            <button
              onClick={() => router.push("/browse-quiz")}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/15 text-white border border-white/25 hover:bg-white/25 transition-all"
            >
              {t("browseQuizzes")}
            </button>
            <button
              onClick={() => router.push("/create-quiz/manuelQuiz")}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-cyan-600 hover:bg-cyan-50 transition-all shadow-sm"
            >
              ✨ {t("generateAI")}
            </button>
          </div>
        </div>

        {/* ── STATS ── */}
        <Stats />

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Recent Activity */}
          <Card
            className="!rounded-2xl !border !border-cyan-100 !shadow-sm !bg-white dark:!bg-slate-800 dark:!border-slate-700"
            styles={{ body: { padding: "20px" } }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-800 dark:text-white">
                  {t("recentActivity")}
                </h2>
                
              </div>
              <ClockCircleOutlined className="text-cyan-400 text-base" />
            </div>

            {loadingActivity ? (
              <div className="flex justify-center py-8"><Spin /></div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <p className="text-5xl">🎯</p>
                <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">{t("noActivity")}</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">{t("noActivitySub")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item, i) => {
                  const percent = item.quizzes?.question_count
                    ? Math.round((item.score / item.quizzes.question_count) * 100)
                    : 0;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-cyan-50/50 dark:bg-slate-700/40 hover:bg-cyan-50 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-cyan-100"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <TrophyOutlined className="text-white text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-gray-800 dark:text-white text-sm truncate">
                            {item.quizzes?.title || "Quiz"}
                          </p>
                          <span className="text-[10px] text-cyan-500 ml-2 flex-shrink-0 bg-cyan-50 dark:bg-slate-600 px-2 py-0.5 rounded-full border border-cyan-100 dark:border-slate-500">
                            {formatDate(item.played_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress percent={percent} size="small" strokeColor="#06b6d4" className="!mb-0 flex-1" />
                          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-300 flex-shrink-0">
                            {item.score}/{item.quizzes?.question_count ?? "?"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Right column */}
          <div className="space-y-5">
            <QuickActions />

            {/* Recommended */}
            <Card
              className="!rounded-2xl !border !border-cyan-100 !shadow-sm !bg-white dark:!bg-slate-800 dark:!border-slate-700"
              styles={{ body: { padding: "20px" } }}
              
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800 dark:text-white">
                  {t("recommended")}
                </h2>
                <Tag className="!rounded-full !text-xs !font-bold !bg-cyan-500 !text-white !border-0">
                  AI ✨
                </Tag>
              </div>

              {loadingRecommended ? (
                <div className="flex justify-center py-8"><Spin /></div>
              ) : recommendedQuizzes.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-5xl">🤖</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">{t("noRecommended")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recommendedQuizzes.map((quiz, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-700/40 hover:bg-cyan-50 dark:hover:bg-slate-700 transition-all group border border-gray-100 dark:border-slate-600 hover:border-cyan-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-slate-600 flex items-center justify-center text-lg border border-cyan-100 dark:border-slate-500">
                          {quiz.categories?.icon || "🎯"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white text-sm">{quiz.title}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-400">
                            {quiz.question_count} {t("questions")} • {quiz.categories?.name || "General"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className={`!rounded-full !text-xs !font-bold ${difficultyColor[quiz.difficulty] ?? ""}`}>
                          {quiz.difficulty}
                        </Tag>
                        <Button
                          size="small"
                          icon={<CaretRightOutlined />}
                          onClick={() => router.push(`/play-quiz/${quiz.id}`)}
                          className="!bg-gradient-to-r !from-cyan-500 !to-teal-400 !text-white !border-0 !rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                block
                icon={<ThunderboltOutlined />}
                onClick={() => router.push("/browse")}
                className="!mt-4 !bg-gradient-to-r !from-cyan-500 !to-teal-400 !text-white !border-0 !rounded-xl !font-bold hover:!opacity-90"
              >
                {t("getMore")}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}