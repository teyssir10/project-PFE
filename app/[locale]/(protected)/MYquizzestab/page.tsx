"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useTranslations } from "next-intl";
import { Spin } from "antd";
import {
  BellOutlined, CheckOutlined, DeleteOutlined,
  TrophyOutlined, UserOutlined, RobotOutlined,
  TeamOutlined, FireOutlined
} from "@ant-design/icons";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "welcome" | "trophy" | "quiz" | "multiplayer" | "ai";
  is_read: boolean;
  created_at: string;
};

const typeConfig = {
  welcome:     { icon: <UserOutlined />,     bg: "bg-cyan-100",   color: "text-cyan-600"  },
  trophy:      { icon: <TrophyOutlined />,   bg: "bg-amber-100",  color: "text-amber-600" },
  quiz:        { icon: <FireOutlined />,     bg: "bg-rose-100",   color: "text-rose-500"  },
  multiplayer: { icon: <TeamOutlined />,     bg: "bg-violet-100", color: "text-violet-600"},
  ai:          { icon: <RobotOutlined />,    bg: "bg-teal-100",   color: "text-teal-600"  },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("notifications");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setNotifications(data);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markOneRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const deleteOne = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const formatDate = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (mins  < 1)  return t("justNow");
    if (mins  < 60) return t("minsAgo",  { mins });
    if (hours < 24) return t("hoursAgo", { hours });
    if (days  === 1) return t("yesterday");
    return t("daysAgo", { days });
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read")   return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-6 px-2 lg:px-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center shadow-sm">
            <BellOutlined className="text-white text-base" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800 dark:text-white">
              {t("title")}
            </h1>
            {unreadCount > 0 && (
              <p className="text-xs text-cyan-500 font-semibold">
                {t("unreadCount", { count: unreadCount })}
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-100 transition-all"
          >
            <CheckOutlined className="text-xs" />
            {t("markAllRead")}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {(["all", "unread", "read"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              filter === f
                ? "bg-cyan-500 text-white border-cyan-500"
                : "bg-white text-gray-500 border-gray-200 hover:border-cyan-300 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-600"
            }`}
          >
            {t(f)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Spin size="large" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-6xl">🔔</p>
          <p className="font-bold text-gray-700 dark:text-gray-300 text-base">{t("empty")}</p>
          <p className="text-gray-400 text-sm">{t("emptySub")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const cfg = typeConfig[notif.type] ?? typeConfig.welcome;
            return (
              <div
                key={notif.id}
                onClick={() => markOneRead(notif.id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                  notif.is_read
                    ? "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700"
                    : "bg-cyan-50/60 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800"
                } hover:border-cyan-200 hover:shadow-sm`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center flex-shrink-0 text-base`}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold truncate ${notif.is_read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0" />
                      )}
                      <span className="text-[10px] text-gray-400">{formatDate(notif.created_at)}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteOne(notif.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-all text-gray-300 hover:text-red-400"
                      >
                        <DeleteOutlined className="text-xs" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">
                    {notif.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}