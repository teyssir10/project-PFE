'use client'
import { useTranslations } from 'next-intl';
import { Avatar, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  id: string;
  firstname: string | null;
  lastname: string | null;
  country: string | null;
  region: string | null;
  total_score: number;
  quizzes_played: number;
  avatar_url: string | null;
}

const COUNTRY_FLAGS: Record<string, string> = {
  tunisia: "🇹🇳", france: "🇫🇷", algeria: "🇩🇿", morocco: "🇲🇦",
  usa: "🇺🇸", germany: "🇩🇪", uk: "🇬🇧", spain: "🇪🇸",
  italy: "🇮🇹", canada: "🇨🇦",
};

function getFlag(country: string | null): string {
  if (!country) return "🌐";
  const key = country.toLowerCase().trim();
  return COUNTRY_FLAGS[key] ?? "🌐";
}

function getInitials(firstname: string | null, lastname: string | null, fallback?: string): string {
  if (firstname && lastname) return `${firstname[0]}${lastname[0]}`.toUpperCase();
  if (firstname) return firstname[0].toUpperCase();
  if (fallback) return fallback[0].toUpperCase();
  return "?";
}

const AVATAR_COLORS = [
  "bg-orange-400", "bg-pink-500", "bg-violet-500", "bg-teal-500",
  "bg-cyan-500", "bg-emerald-500", "bg-amber-500", "bg-blue-500",
];

export default function LeaderboardSection() {
  const t = useTranslations('landingLeaderboard');

  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
    const { data, error } = await supabase
      .from('public_leaderboard')
      .select('*')
        .order('total_score', { ascending: false })
        .limit(10);

      if (!error && data) setPlayers(data as LeaderboardEntry[]);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-sm font-bold text-gray-400">{rank}</span>;
  };

  return (
    <section className="bg-white dark:bg-slate-950 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">

          {/* Table header */}
          <div className="bg-gradient-to-r from-[#00D4D0] to-cyan-500 text-white grid grid-cols-4 gap-4 px-6 py-4 font-semibold text-sm uppercase tracking-wide">
            <span>{t('rank')}</span>
            <span>{t('user')}</span>
            <div className="text-right">{t('score')}</div>
            <div className="text-right">{t('quizzes')}</div>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="flex justify-center py-16"><Spin size="large" /></div>
          ) : players.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <span className="text-4xl">🏆</span>
              <p className="text-sm text-gray-400">{t('empty')}</p>
            </div>
          ) : (
            players.map((player, index) => {
              const rank     = index + 1;
              const initials = getInitials(player.firstname, player.lastname);
              const name     = player.firstname
                ? `${player.firstname} ${player.lastname ?? ""}`.trim()
                : "Anonymous";
              const sub      = player.region || player.country || "—";
              const color    = AVATAR_COLORS[index % AVATAR_COLORS.length];
              const isTop3   = rank <= 3;

              return (
                <div
                  key={player.id}
                  className={`grid grid-cols-4 items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800 last:border-0 transition-all
                    ${isTop3
                      ? "bg-cyan-50/40 dark:bg-cyan-900/10 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-slate-800/60"
                    }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-start w-10">
                    {getRankIcon(rank)}
                  </div>

                  {/* Player */}
                  <div className="flex items-center gap-3 min-w-0">
                    {player.avatar_url ? (
                      <img
                        src={player.avatar_url}
                        alt={name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${color}`}>
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs">{getFlag(player.country)}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 truncate">{sub}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className={`font-extrabold text-sm ${isTop3 ? "text-cyan-500" : "text-gray-700 dark:text-slate-200"}`}>
                      {player.total_score.toLocaleString()}
                    </span>
                  </div>

                  {/* Quizzes */}
                  <div className="text-right">
                    <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                      {player.quizzes_played}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}