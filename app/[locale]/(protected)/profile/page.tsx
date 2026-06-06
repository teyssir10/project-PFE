"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Avatar, Button, Card, Progress, Tag, Modal, Form, Input, Select, App, Spin } from "antd";
import {
  EditOutlined, TrophyOutlined, UserOutlined,
  StarOutlined, ClockCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, RiseOutlined, GlobalOutlined, LockOutlined,
  EnvironmentOutlined, FireOutlined, ThunderboltOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/lib/auth";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import AvatarUpload from "@/components/AvatarUpload/AvatarUpload";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

interface UserProfile {
  firstname: string | null;
  lastname: string | null;
  country: string | null;
  region: string | null;
  total_score: number;
  quizzes_played: number;
  accuracy: number;
  avatar_url: string | null;
}

interface QuizHistory {
  id: string;
  score: number;
  played_at: string;
  quizzes: { title: string; question_count: number } | null;
}

const COUNTRIES = [
  { value: "Algeria",      label: "🇩🇿 Algeria"        },
  { value: "Tunisia",      label: "🇹🇳 Tunisia"         },
  { value: "Morocco",      label: "🇲🇦 Morocco"         },
  { value: "Egypt",        label: "🇪🇬 Egypt"           },
  { value: "France",       label: "🇫🇷 France"          },
  { value: "Germany",      label: "🇩🇪 Germany"         },
  { value: "Spain",        label: "🇪🇸 Spain"           },
  { value: "Italy",        label: "🇮🇹 Italy"           },
  { value: "UK",           label: "🇬🇧 United Kingdom"  },
  { value: "USA",          label: "🇺🇸 United States"   },
  { value: "Canada",       label: "🇨🇦 Canada"          },
  { value: "Saudi Arabia", label: "🇸🇦 Saudi Arabia"    },
  { value: "UAE",          label: "🇦🇪 UAE"             },
  { value: "Turkey",       label: "🇹🇷 Turkey"          },
  { value: "Other",        label: "🌐 Other"            },
];

const achievements = [
  { name: "Quiz Master",   desc: "Completed 20+ quizzes",  emoji: "🏆", bg: "bg-amber-50  dark:bg-amber-900/20",  text: "text-amber-600  dark:text-amber-400",  border: "border-amber-100  dark:border-amber-800/40"  },
  { name: "Perfect Score", desc: "Got 100% in 5 quizzes",  emoji: "⭐", bg: "bg-green-50  dark:bg-green-900/20",  text: "text-green-600  dark:text-green-400",  border: "border-green-100  dark:border-green-800/40"  },
  { name: "Fast Learner",  desc: "Answered 100 questions", emoji: "⚡", bg: "bg-blue-50   dark:bg-blue-900/20",   text: "text-blue-600   dark:text-blue-400",   border: "border-blue-100   dark:border-blue-800/40"   },
  { name: "7-Day Streak",  desc: "Played 7 days in a row", emoji: "🔥", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400", border: "border-orange-100 dark:border-orange-800/40" },
  { name: "Top 10",        desc: "Reached global top 10",  emoji: "🌍", bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400", border: "border-purple-100 dark:border-purple-800/40" },
];

const editSchema = yup.object({
  firstname:       yup.string().optional(),
  lastname:        yup.string().optional(),
  country:         yup.string().optional(),
  region:          yup.string().optional(),
  password:        yup.string()
                      .transform((v) => v === "" ? undefined : v)
                      .min(6, "Min 6 characters")
                      .optional(),
  confirmPassword: yup.string()
                      .transform((v) => v === "" ? undefined : v)
                      .oneOf([yup.ref("password"), undefined], "Passwords do not match")
                      .optional(),
});

export default function ProfilePage() {
  const { message } = App.useApp();
  const t = useTranslations("profile");
  const { user } = useAuth();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [profile, setProfile]             = useState<UserProfile | null>(null);
  const [quizHistory, setQuizHistory]     = useState<QuizHistory[]>([]);
  const [globalRank, setGlobalRank]       = useState<number | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving]               = useState(false);
  const [avatarUrl, setAvatarUrl]         = useState<string | null>(null);

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(editSchema),
  });

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoadingProfile(true);

      const { data: profileData } = await supabase
        .from("users")
        .select("firstname, lastname, country, region, total_score, quizzes_played, accuracy, avatar_url")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setAvatarUrl(profileData.avatar_url);
        reset({
          firstname: profileData.firstname ?? "",
          lastname:  profileData.lastname  ?? "",
          country:   profileData.country   ?? "",
          region:    profileData.region    ?? "",
        });
      }

      const { data: historyData } = await supabase
        .from("quiz_history")
        .select("id, score, played_at, quizzes(title, question_count)")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .limit(4);

      const formattedHistory = (historyData as any[])?.map(q => ({
        ...q,
        quizzes: Array.isArray(q.quizzes) ? q.quizzes[0] : q.quizzes
      })) ?? [];

      setQuizHistory(formattedHistory);

      const { data: rankData } = await supabase
        .from("users")
        .select("id, total_score")
        .order("total_score", { ascending: false });

      if (rankData && profileData) {
        const rank = rankData.findIndex((u) => u.id === user.id) + 1;
        setGlobalRank(rank > 0 ? rank : null);
      }

      setLoadingProfile(false);
    };
    fetchAll();
  }, [user]);

  const onSave = async (values: any) => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ firstname: values.firstname || null, lastname: values.lastname || null, country: values.country || null, region: values.region || null })
        .eq("id", user.id);
      if (error) throw error;
      if (values.password) {
        const { error: pwErr } = await supabase.auth.updateUser({ password: values.password });
        if (pwErr) throw pwErr;
      }
      setProfile((prev) => prev ? { ...prev, firstname: values.firstname || null, lastname: values.lastname || null, country: values.country || null, region: values.region || null } : prev);
      message.success(t("saveSuccess"));
      setEditModalOpen(false);
    } catch (err: any) {
      message.error(err.message ?? t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.firstname
    ? `${profile.firstname} ${profile.lastname ?? ""}`.trim()
    : user?.email?.split("@")[0] ?? "User";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  const getScoreColor = (p: number) => p >= 80 ? "#0891b2" : p >= 60 ? "#06b6d4" : "#f59e0b";

  const formatDate = (date: string) => {
    const diff  = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(hours / 24);
    if (hours < 1)  return t("justNow");
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return t("yesterday");
    return `${days} days ago`;
  };

  if (loadingProfile)
    return <div className="flex items-center justify-center h-screen"><Spin size="large" /></div>;

  return (
    <Fragment>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* ── HERO CARD ── */}
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500" />
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-5">
                <AvatarUpload
                  currentUrl={avatarUrl}
                  size={88}
                  onUploadSuccess={(url) => {
                    setAvatarUrl(url);
                  }}
                />
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{displayName}</h1>
                  <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">{user?.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs font-semibold border border-cyan-100 dark:border-cyan-800/40">
                      🌍 {profile?.country ?? t("countryNotSet")}
                    </span>
                    {profile?.region && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-semibold border border-violet-100 dark:border-violet-800/40">
                        📍 {profile.region}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold border border-green-100 dark:border-green-800/40">
                      ✅ {t("memberSince")} {memberSince}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 text-white text-sm font-bold shadow-md hover:opacity-90 hover:scale-[1.02] transition-all duration-200 self-start md:self-center"
              >
                <EditOutlined />
                {t("editProfile")}
              </button>
            </div>
          </div>

          {/* ── MAIN GRID ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT COL */}
            <div className="space-y-6">

              {/* User Info */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center text-sm">👤</span>
                  <h2 className="font-bold text-sm text-gray-700 dark:text-slate-200">{t("userInfo")}</h2>
                </div>
                <div className="p-6 space-y-0 divide-y divide-gray-50 dark:divide-slate-800">
                  {[
                    { label: t("username"),      value: displayName                                  },
                    { label: t("email"),         value: user?.email                                  },
                    { label: t("country"),       value: profile?.country  ?? t("notSpecified")       },
                    { label: t("region"),        value: profile?.region   ?? t("notSpecified")       },
                    { label: t("memberSince"),   value: memberSince                                  },
                    { label: t("quizzesPlayed"), value: String(profile?.quizzes_played ?? 0)         },
                    { label: t("totalScore"),    value: (profile?.total_score ?? 0).toLocaleString() },
                    { label: t("accuracy"),      value: `${profile?.accuracy ?? 0}%`                 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <span className="text-xs text-gray-400 dark:text-slate-500 font-medium shrink-0">{item.label}</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-white truncate max-w-[140px] text-right ml-2">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-sm">🏅</span>
                  <h2 className="font-bold text-sm text-gray-700 dark:text-slate-200">{t("achievements")}</h2>
                </div>
                <div className="p-4 space-y-2">
                  {achievements.map((a, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${a.bg} ${a.border} transition-all hover:scale-[1.01]`}>
                      <span className="text-xl">{a.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${a.text}`}>{a.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 truncate">{a.desc}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${a.bg} ${a.text} ${a.border} shrink-0`}>
                        {t("unlocked")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COL */}
            <div className="lg:col-span-2 space-y-6">

              {/* Performance */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-sm">📊</span>
                  <h2 className="font-bold text-sm text-gray-700 dark:text-slate-200">{t("performance")}</h2>
                </div>
                <div className="p-6 space-y-5">
                  {[
                    { label: t("successRate"),   value: profile?.accuracy      ?? 0, color: "#0891b2" },
                    { label: t("completionRate"), value: profile?.quizzes_played ?? 0, color: "#06b6d4" },
                  ].map((perf, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-slate-300">{perf.label}</span>
                        <span className="text-sm font-extrabold" style={{ color: perf.color }}>{perf.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(perf.value, 100)}%`, background: perf.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Quizzes */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-sm">🕐</span>
                  <h2 className="font-bold text-sm text-gray-700 dark:text-slate-200">{t("recentQuizzes")}</h2>
                </div>

                {quizHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-3">
                    <span className="text-4xl">🎯</span>
                    <p className="text-sm text-gray-400 dark:text-slate-500">{t("noQuizzes")}</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {quizHistory.map((quiz, i) => {
                      const total   = quiz.quizzes?.question_count ?? 10;
                      const percent = Math.round((quiz.score / total) * 100);
                      const passed  = percent >= 50;
                      return (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-slate-700/60 transition-all border border-transparent hover:border-cyan-100 dark:hover:border-cyan-900/40 group">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${passed ? "bg-cyan-100 dark:bg-cyan-900/30" : "bg-red-50 dark:bg-red-900/20"}`}>
                            {passed
                              ? <CheckCircleOutlined className="text-cyan-500 text-base" />
                              : <CloseCircleOutlined className="text-red-400 text-base" />
                            }
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-sm font-bold text-gray-800 dark:text-white truncate pr-2">
                                {quiz.quizzes?.title ?? "Quiz"}
                              </p>
                              <span className="text-[11px] text-gray-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
                                <ClockCircleOutlined />
                                {formatDate(quiz.played_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${percent}%`, background: getScoreColor(percent) }}
                                />
                              </div>
                              <span className="text-xs font-extrabold shrink-0" style={{ color: getScoreColor(percent) }}>
                                {quiz.score}/{total}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── EDIT MODAL ── */}
      <Modal
        title={<span className="font-bold text-gray-900 dark:text-white">{t("editProfile")}</span>}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        className="!rounded-2xl"
      >
        <form onSubmit={handleSubmit(onSave)} className="mt-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t("firstName")}</label>
              <Controller name="firstname" control={control} render={({ field }) => (
                <Input {...field} className="!rounded-xl !mt-1 dark:!bg-gray-800 dark:!border-gray-600 dark:!text-white" placeholder="First name" />
              )} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t("lastName")}</label>
              <Controller name="lastname" control={control} render={({ field }) => (
                <Input {...field} className="!rounded-xl !mt-1 dark:!bg-gray-800 dark:!border-gray-600 dark:!text-white" placeholder="Last name" />
              )} />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t("country")}</label>
              <Controller name="country" control={control} render={({ field }) => (
                <Select {...field} className="w-full !mt-1" showSearch optionFilterProp="label" options={COUNTRIES} placeholder="Select country" suffixIcon={<GlobalOutlined className="text-slate-400" />} />
              )} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t("region")}</label>
              <Controller name="region" control={control} render={({ field }) => (
                <Input {...field} prefix={<EnvironmentOutlined className="text-slate-400" />} className="!rounded-xl !mt-1 dark:!bg-gray-800 dark:!border-gray-600 dark:!text-white" placeholder="e.g. Tunis, Paris..." />
              )} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t("newPassword")}</label>
            <Controller name="password" control={control} render={({ field }) => (
              <Input.Password {...field} prefix={<LockOutlined className="text-slate-400" />} className="!rounded-xl !mt-1 dark:!bg-gray-800 dark:!border-gray-600 dark:!text-white" placeholder="••••••••" />
            )} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t("confirmPassword")}</label>
            <Controller name="confirmPassword" control={control} render={({ field }) => (
              <Input.Password {...field} prefix={<LockOutlined className="text-slate-400" />} className="!rounded-xl !mt-1 dark:!bg-gray-800 dark:!border-gray-600 dark:!text-white" placeholder="••••••••" />
            )} />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <Button
            htmlType="submit"
            loading={saving}
            block
            className="!h-11 !rounded-xl !bg-gradient-to-r !from-cyan-500 !to-teal-400 !text-white !border-0 !font-semibold hover:!opacity-90"
          >
            {t("saveChanges")}
          </Button>
        </form>
      </Modal>
    </Fragment>
  );
}