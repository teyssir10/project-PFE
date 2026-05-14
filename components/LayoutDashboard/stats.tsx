"use client";
import React, { useEffect, useState } from "react";
import { RiseOutlined, ThunderboltOutlined, TrophyOutlined, GlobalOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useTranslations } from "next-intl";

const Stats = () => {
  const t = useTranslations("stats");
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    quizzesPlayed: 0,
    avgScore: 0,
    totalPoints: 0,
    globalRank: 0,
    trend: { quizzes: "", score: "", points: "", rank: "" },
  });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      setLoading(true);
      const { data: history } = await supabase
        .from("quiz_history").select("score, played_at").eq("user_id", user.id);

      const oneWeekAgo    = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const thisWeek      = history?.filter((h) => new Date(h.played_at) > oneWeekAgo) || [];
      const quizzesPlayed = history?.length || 0;
      const totalPoints   = history?.reduce((sum, h) => sum + (h.score || 0), 0) || 0;
      const avgScore      = quizzesPlayed > 0 ? Math.round(totalPoints / quizzesPlayed) : 0;
      const weekPoints    = thisWeek.reduce((s, h) => s + h.score, 0);

      const { data: allUsers } = await supabase.from("quiz_history").select("user_id, score");
      const userTotals: Record<string, number> = {};
      allUsers?.forEach((h) => { userTotals[h.user_id] = (userTotals[h.user_id] || 0) + h.score; });
      const sortedUsers = Object.entries(userTotals).sort((a, b) => b[1] - a[1]);
      const rank = sortedUsers.findIndex(([id]) => id === user.id) + 1;

      setStats({
        quizzesPlayed,
        avgScore,
        totalPoints,
        globalRank: rank || 0,
        trend: {
          quizzes: t("thisWeek", { count: thisWeek.length }),
          score:   t("avgPercent", { avg: avgScore }),
          points:  t("pointsWeek", { points: weekPoints }),
          rank:    rank > 0 ? `#${rank}` : t("notRanked"),
        },
      });
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  const statsItems = [
    { label: t("quizzesPlayed"), value: stats.quizzesPlayed.toString(), trend: stats.trend.quizzes, icon: <ThunderboltOutlined /> },
    { label: t("avgScore"),      value: `${stats.avgScore}%`,           trend: stats.trend.score,   icon: <RiseOutlined />        },
    { label: t("totalPoints"),   value: stats.totalPoints.toLocaleString(), trend: stats.trend.points, icon: <TrophyOutlined />   },
    { label: t("globalRank"),    value: stats.globalRank > 0 ? `#${stats.globalRank}` : "-", trend: stats.trend.rank, icon: <GlobalOutlined /> },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4">
            <div className="flex justify-center py-3"><Spin size="small" /></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statsItems.map((stat, i) => (
        <div key={i}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 hover:shadow-md hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              {stat.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-extrabold text-gray-900 dark:text-white leading-none">{stat.value}</p>
              <p className="text-gray-400 dark:text-slate-500 text-[11px] font-medium mt-0.5 truncate">{stat.label}</p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-cyan-100 dark:border-cyan-800/40 bg-cyan-50 dark:bg-cyan-900/20 text-[10px] font-semibold text-cyan-700 dark:text-cyan-300">
            <RiseOutlined style={{ fontSize: 9 }} />
            {stat.trend}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;