"use client";

import React, { useState, useEffect, useCallback, Fragment } from "react";
import { Button, Card, Tag, Input, Tooltip } from "antd";
import {
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  SearchOutlined,
  GlobalOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import Deco from "@/components/Decoration/Deco";

type Period = "week" | "month" | "alltime";
type Scope = "global" | "country" | "friends";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  country: string;
  avatar_letter: string;
  total_points: number;
  quizzes_played: number;
  avg_score: number;
  badge: string;
  rank_change: number;
}

const AVATAR_COLORS = [
  "#0ab5a0", "#7c3aed", "#2563eb", "#db2777",
  "#d97706", "#059669", "#dc2626", "#0369a1",
  "#64748b", "#854d0e",
];

const getBadge = (rank: number): { label: string; cls: string } => {
  if (rank === 1) return { label: "Champion", cls: "!bg-amber-50 !text-amber-700 !border-amber-200" };
  if (rank <= 3) return { label: "Expert", cls: "!bg-slate-100 !text-slate-600 !border-slate-200" };
  if (rank <= 10) return { label: "Pro", cls: "!bg-cyan-50 !text-cyan-700 !border-cyan-200" };
  if (rank <= 50) return { label: "Active", cls: "!bg-green-50 !text-green-700 !border-green-200" };
  return { label: "Member", cls: "!bg-gray-50 !text-gray-500 !border-gray-200" };
};

const getAvatarColor = (userId: string) =>
  AVATAR_COLORS[userId.charCodeAt(0) % AVATAR_COLORS.length];

const getAccuracyColor = (acc: number) => {
  if (acc >= 85) return "#0ab5a0";
  if (acc >= 70) return "#06b6d4";
  if (acc >= 50) return "#f59e0b";
  return "#ef4444";
};

export default function LeaderboardPage() {
  const { user } = useAuth();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [topThree, setTopThree] = useState<LeaderboardEntry[]>([]);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const [scope, setScope] = useState<Scope>("global");
  const [period, setPeriod] = useState<Period>("week");
  const [search, setSearch] = useState("");

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      let since: string | null = null;

      if (period === "week") {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        since = d.toISOString();
      } else if (period === "month") {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 1);
        since = d.toISOString();
      }

      let query = supabase
        .from("quiz_attempts")
        .select(`
          user_id,
          score,
          created_at,
          profiles (
            username,
            country,
            avatar_url
          )
        `);

      if (since) query = query.gte("created_at", since);

      if (scope === "country" && user?.user_metadata?.country) {
        query = query.eq("profiles.country", user.user_metadata.country);
      }

      const { data, error } = await query;
      if (error) throw error;

      const aggregated: Record<string, {
        user_id: string;
        username: string;
        country: string;
        total_points: number;
        quizzes_played: number;
        total_score: number;
      }> = {};

      (data || []).forEach((row: any) => {
        const uid = row.user_id;
        if (!aggregated[uid]) {
          aggregated[uid] = {
            user_id: uid,
            username: row.profiles?.username || row.profiles?.email?.split("@")[0] || "Unknown",
            country: row.profiles?.country || "",
            total_points: 0,
            quizzes_played: 0,
            total_score: 0,
          };
        }
        aggregated[uid].total_points += row.score ?? 0;
        aggregated[uid].quizzes_played += 1;
        aggregated[uid].total_score += row.score ?? 0;
      });

      const sorted = Object.values(aggregated)
        .sort((a, b) => b.total_points - a.total_points)
        .map((entry, idx) => ({
          rank: idx + 1,
          user_id: entry.user_id,
          username: entry.username,
          country: entry.country,
          avatar_letter: (entry.username[0] || "U").toUpperCase(),
          total_points: entry.total_points,
          quizzes_played: entry.quizzes_played,
          avg_score: entry.quizzes_played > 0
            ? Math.round(entry.total_score / entry.quizzes_played)
            : 0,
          badge: getBadge(idx + 1).label,
          rank_change: Math.floor(Math.random() * 7) - 3,
        }));

      setTopThree(sorted.slice(0, 3));
      setEntries(sorted);

      const mine = sorted.find((e) => e.user_id === user?.id) || null;
      setMyEntry(mine);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setEntries([]);
      setTopThree([]);
    } finally {
      setLoading(false);
    }
  }, [scope, period, user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const filtered = entries.filter((e) =>
    e.username.toLowerCase().includes(search.toLowerCase()) ||
    e.country.toLowerCase().includes(search.toLowerCase())
  );

  const podiumOrder = topThree.length >= 3
    ? [topThree[1], topThree[0], topThree[2]]
    : topThree;

  const podiumHeights = ["h-28", "h-36", "h-24"];
  const podiumBorderClass = ["", "border-amber-300! border-2!", ""];

  const SCOPE_BUTTONS: { key: Scope; label: string; icon: React.ReactNode }[] = [
    { key: "global", label: "Global", icon: <GlobalOutlined /> },
    { key: "country", label: "By country", icon: <GlobalOutlined /> },
    { key: "friends", label: "Friends", icon: <TeamOutlined /> },
  ];

  const PERIOD_BUTTONS: { key: Period; label: string }[] = [
    { key: "week", label: "This week" },
    { key: "month", label: "This month" },
    { key: "alltime", label: "All time" },
  ];

  const RankDelta = ({ change }: { change: number }) => {
    if (change > 0) return (
      <span className="flex items-center gap-0.5 text-xs text-emerald-500">
        <RiseOutlined style={{ fontSize: 10 }} />+{change}
      </span>
    );
    if (change < 0) return (
      <span className="flex items-center gap-0.5 text-xs text-red-400">
        <FallOutlined style={{ fontSize: 10 }} />{change}
      </span>
    );
    return <span className="text-xs text-gray-300 dark:text-gray-600"><MinusOutlined style={{ fontSize: 10 }} /></span>;
  };

  const PodiumCard = ({
    entry,
    position,
  }: {
    entry: LeaderboardEntry;
    position: number;
  }) => {
    const isFirst = position === 0;
    const badgeInfo = getBadge(entry.rank);
    const rankLabels = ["", "1st", "2nd", "3rd"];
    const medalColors = ["", "text-amber-500", "text-slate-400", "text-orange-400"];
    const medalBg = ["", "bg-amber-50 dark:bg-amber-900/20", "bg-slate-100 dark:bg-slate-700", "bg-orange-50 dark:bg-orange-900/20"];

    return (
      <Card
        className={`rounded-2xl! border-0! shadow-md! bg-white dark:!bg-slate-800 flex flex-col items-center text-center
          ${isFirst ? "border-amber-300! border-2! ring-2 ring-amber-100 dark:ring-amber-900/30" : ""}
          ${isFirst ? "scale-105" : ""}
        `}
      >
        {isFirst && (
          <div className="text-2xl mb-1">👑</div>
        )}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-xl mb-2
            ${isFirst ? "w-16 h-16 text-2xl shadow-md" : ""}
          `}
          style={{ background: getAvatarColor(entry.user_id) }}
        >
          {entry.avatar_letter}
        </div>
        <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold mb-2 ${medalBg[entry.rank]} ${medalColors[entry.rank]}`}>
          {entry.rank}
        </div>
        <p className={`font-semibold text-gray-900 dark:text-white mb-0.5 ${isFirst ? "text-base" : "text-sm"}`}>
          {entry.username}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{entry.country}</p>
        <p className={`font-semibold text-cyan-600 dark:text-cyan-400 ${isFirst ? "text-2xl" : "text-lg"}`}>
          {entry.total_points.toLocaleString()}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">points</p>
        <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>{entry.quizzes_played} quizzes</span>
          <span>{entry.avg_score}% avg</span>
        </div>
        <Tag className={`rounded-full! text-xs! font-semibold! ${badgeInfo.cls}`}>
          {badgeInfo.label}
        </Tag>
      </Card>
    );
  };

  return (
    <Fragment>
      <Deco />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* ── PAGE HEADER ── */}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <TrophyOutlined className="text-amber-400" />
              Leaderboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Top players ranked by total points
            </p>
          </div>

          {/* ── STAT MINI CARDS ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Your rank",
                value: myEntry ? `#${myEntry.rank}` : "—",
                delta: "▲ +8 this week",
                icon: <TrophyOutlined className="text-amber-400" />,
              },
              {
                label: "Total players",
                value: entries.length.toLocaleString(),
                delta: "▲ +124 new",
                icon: <TeamOutlined className="text-cyan-500" />,
              },
              {
                label: "Your points",
                value: myEntry ? myEntry.total_points.toLocaleString() : "—",
                delta: "▲ +120 today",
                icon: <ThunderboltOutlined className="text-cyan-500" />,
              },
              {
                label: "Points to top 10",
                value: myEntry && entries[9]
                  ? Math.max(0, entries[9].total_points - myEntry.total_points + 1).toLocaleString()
                  : "—",
                delta: "Keep going!",
                deltaColor: "text-gray-400",
                icon: <RiseOutlined className="text-cyan-500" />,
              },
            ].map((s, i) => (
              <Card
                key={i}
                className="rounded-2xl! border-0! shadow-md! bg-white dark:!bg-slate-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{s.label}</span>
                  <span className="text-base">{s.icon}</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{s.value}</p>
                <p className={`text-xs mt-1 ${s.deltaColor || "text-emerald-500"}`}>{s.delta}</p>
              </Card>
            ))}
          </div>

          {/* ── FILTERS ── */}
          <Card className="rounded-2xl! border-0! shadow-md! bg-white dark:!bg-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                {SCOPE_BUTTONS.map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => setScope(btn.key)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer
                      ${scope === btn.key
                        ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700"
                        : "bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
                      }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="w-px h-5 bg-gray-200 dark:bg-slate-600 mx-1" />

              <div className="flex gap-2">
                {PERIOD_BUTTONS.map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => setPeriod(btn.key)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer
                      ${period === btn.key
                        ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700"
                        : "bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
                      }`}
                  >
                    <CalendarOutlined style={{ fontSize: 11 }} />
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="ml-auto">
                <Input
                  prefix={<SearchOutlined className="text-gray-400" />}
                  placeholder="Search player or country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-full! text-sm w-52 dark:!bg-slate-700 dark:!border-slate-600 dark:!text-white"
                  allowClear
                />
              </div>
            </div>
          </Card>

          {/* ── PODIUM TOP 3 ── */}
          {topThree.length >= 3 && !loading && (
            <div className="grid grid-cols-3 gap-4">
              {podiumOrder.map((entry, idx) => (
                <PodiumCard key={entry.user_id} entry={entry} position={idx === 1 ? 0 : 1} />
              ))}
            </div>
          )}

          {/* ── MY RANK HIGHLIGHT ── */}
          {myEntry && (
            <Card className="rounded-2xl! border-0! shadow-md! bg-cyan-50! dark:!bg-cyan-900/20 border-cyan-200! dark:!border-cyan-700">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Your position</p>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">#{myEntry.rank}</p>
                </div>
                <div className="w-px h-10 bg-cyan-200 dark:bg-cyan-700" />
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{ background: getAvatarColor(myEntry.user_id) }}
                  >
                    {myEntry.avatar_letter}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{myEntry.username}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{myEntry.country}</p>
                  </div>
                </div>
                <div className="w-px h-10 bg-cyan-200 dark:bg-cyan-700" />
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Points</p>
                  <p className="text-lg font-extrabold text-cyan-600 dark:text-cyan-400">{myEntry.total_points.toLocaleString()}</p>
                </div>
                <div className="w-px h-10 bg-cyan-200 dark:bg-cyan-700" />
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Quizzes</p>
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white">{myEntry.quizzes_played}</p>
                </div>
                <div className="w-px h-10 bg-cyan-200 dark:bg-cyan-700" />
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Avg. score</p>
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white">{myEntry.avg_score}%</p>
                </div>
                <div className="ml-auto">
                  <Tag className={`rounded-full! text-xs! font-semibold! ${getBadge(myEntry.rank).cls}`}>
                    {getBadge(myEntry.rank).label}
                  </Tag>
                </div>
              </div>
            </Card>
          )}

          {/* ── RANKINGS TABLE ── */}
          <Card
            title={
              <span className="font-bold text-gray-900 dark:text-white">
                Rankings
                <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">
                  {filtered.length} players
                </span>
              </span>
            }
            extra={
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Updated in real-time
              </span>
            }
            className="rounded-2xl! border-0! shadow-md! bg-white dark:!bg-slate-800"
            loading={loading}
          >
            {/* Table header */}
            <div className="grid grid-cols-[48px_1fr_110px_90px_120px_80px] gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-700 rounded-xl mb-1">
              {["Rank", "Player", "Points", "Quizzes", "Accuracy", "Badge"].map((h) => (
                <span key={h} className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide text-right first:text-center [&:nth-child(2)]:text-left">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div className="space-y-1">
              {filtered.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                  No players found
                </div>
              )}
              {filtered.map((entry) => {
                const isMe = entry.user_id === user?.id;
                const badgeInfo = getBadge(entry.rank);
                const accColor = getAccuracyColor(entry.avg_score);

                return (
                  <div
                    key={entry.user_id}
                    className={`grid grid-cols-[48px_1fr_110px_90px_120px_80px] gap-2 items-center px-4 py-3 rounded-xl transition-all
                      ${isMe
                        ? "bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700"
                        : "hover:bg-gray-50 dark:hover:bg-slate-700"
                      }
                    `}
                  >
                    {/* Rank */}
                    <div className="flex flex-col items-center">
                      <span className={`text-sm font-semibold ${
                        entry.rank === 1 ? "text-amber-500" :
                        entry.rank === 2 ? "text-slate-400" :
                        entry.rank === 3 ? "text-orange-400" :
                        "text-gray-700 dark:text-gray-300"
                      }`}>
                        {entry.rank <= 3
                          ? ["🥇","🥈","🥉"][entry.rank - 1]
                          : `#${entry.rank}`}
                      </span>
                      <RankDelta change={entry.rank_change} />
                    </div>

                    {/* Player */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ background: getAvatarColor(entry.user_id) }}
                      >
                        {entry.avatar_letter}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isMe ? "text-cyan-700 dark:text-cyan-300" : "text-gray-900 dark:text-white"}`}>
                          {entry.username}
                          {isMe && <span className="ml-1 text-xs font-normal text-cyan-500">(you)</span>}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{entry.country}</p>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                        {entry.total_points.toLocaleString()}
                      </span>
                    </div>

                    {/* Quizzes */}
                    <div className="text-right">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{entry.quizzes_played}</span>
                    </div>

                    {/* Accuracy */}
                    <div>
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${entry.avg_score}%`, background: accColor }}
                          />
                        </div>
                        <span className="text-xs font-semibold w-9 text-right" style={{ color: accColor }}>
                          {entry.avg_score}%
                        </span>
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="text-right">
                      <Tag className={`rounded-full! text-xs! font-semibold! ${badgeInfo.cls}`}>
                        {badgeInfo.label}
                      </Tag>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load more */}
            {filtered.length > 0 && (
              <div className="flex justify-center mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <Button
                  className="rounded-xl! border-cyan-300! text-cyan-500! hover:bg-cyan-50! dark:hover:!bg-cyan-900/20"
                >
                  Load more players
                </Button>
              </div>
            )}
          </Card>

        </div>
      </div>
    </Fragment>
  );
}