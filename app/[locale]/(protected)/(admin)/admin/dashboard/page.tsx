"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";
import {
  UserOutlined, AppstoreOutlined, TrophyOutlined, PlayCircleOutlined,
} from "@ant-design/icons";

interface Stats {
  total_users: number;
  total_quizzes: number;
  total_played: number;
  published_quizzes: number;
}

interface RecentUser {
  id: string;
  firstname: string | null;
  lastname: string | null;
  country: string | null;
  role: string | null;
  created_at: string;
  total_score: number;
}

interface RecentQuiz {
  id: string;
  title: string;
  difficulty: string;
  players: number;
  is_published: boolean;
  created_at: string;
}

export default function AdminDashboardPage() {
  const t      = useTranslations("adminDashboard");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "fr";

  const [stats,         setStats]         = useState<Stats | null>(null);
  const [recentUsers,   setRecentUsers]   = useState<RecentUser[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [usersRes, quizzesRes, historyRes] = await Promise.all([
        supabase.from("users").select("id, firstname, lastname, country, role, created_at, total_score").order("created_at", { ascending: false }).limit(5),
        supabase.from("quizzes").select("id, title, difficulty, players, is_published, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("quiz_history").select("id", { count: "exact" }),
      ]);

      const allQuizzesRes = await supabase.from("quizzes").select("id, is_published", { count: "exact" });
      const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true });

      setStats({
        total_users:       userCount ?? 0,
        total_quizzes:     allQuizzesRes.data?.length ?? 0,
        total_played:      historyRes.count ?? 0,
        published_quizzes: allQuizzesRes.data?.filter(q => q.is_published).length ?? 0,
      });

      setRecentUsers(usersRes.data ?? []);
      setRecentQuizzes(quizzesRes.data ?? []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const statCards = [
    { label: t("stats.users"),            value: stats?.total_users ?? 0,       icon: UserOutlined,       color: "text-cyan-600 dark:text-cyan-400",     bg: "bg-cyan-50 border-cyan-200 dark:bg-cyan-500/10 dark:border-cyan-500/20",         iconBg: "bg-cyan-100 border-cyan-200 dark:bg-cyan-500/10 dark:border-cyan-500/20"         },
    { label: t("stats.totalQuizzes"),     value: stats?.total_quizzes ?? 0,     icon: AppstoreOutlined,   color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/20", iconBg: "bg-violet-100 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/20" },
    { label: t("stats.publishedQuizzes"), value: stats?.published_quizzes ?? 0, icon: TrophyOutlined,     color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20",     iconBg: "bg-amber-100 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20"     },
    { label: t("stats.gamesPlayed"),      value: stats?.total_played ?? 0,      icon: PlayCircleOutlined, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20", iconBg: "bg-emerald-100 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20" },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{t("subtitle")}</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, iconBg }) => (
          <div key={label} className={`rounded-2xl border ${bg} p-5 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${iconBg}`}>
              <Icon className={`text-xl ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Recent Users ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t("recentUsers.title")}</h2>
            <button
              onClick={() => router.push(`/${locale}/admin/users`)}
              className="text-xs text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
            >
              {t("recentUsers.viewAll")} 
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {recentUsers.map((u) => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {u.firstname?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {u.firstname ? `${u.firstname} ${u.lastname ?? ""}`.trim() : t("recentUsers.anonymous")}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{u.country ?? "—"}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  u.role === "admin"
                    ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                    : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
                }`}>
                  {u.role ?? "user"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Quizzes ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t("recentQuizzes.title")}</h2>
            <button
              onClick={() => router.push(`/${locale}/admin/quizzes`)}
              className="text-xs text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
            >
              {t("recentQuizzes.viewAll")} 
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {recentQuizzes.map((q) => (
              <div key={q.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{q.title}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{t("recentQuizzes.players", { count: q.players })}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    q.difficulty === "Easy"   ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : q.difficulty === "Hard" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                  }`}>
                    {q.difficulty}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    q.is_published
                      ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400"
                      : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400"
                  }`}>
                    {q.is_published ? t("recentQuizzes.published") : t("recentQuizzes.draft")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}