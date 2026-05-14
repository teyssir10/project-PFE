"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LeaderboardUser } from "@/lib/api/leaderboard";
import { Avatar, getDisplayName, getDisplayValue, flag, FilterType } from "./helpers";

// ─── Table Header ─────────────────────────────────────────────────────────────
export function LeaderboardHeader({ filter }: { filter: FilterType }) {
  const t = useTranslations("leaderboard");
  return (
    <div className="grid grid-cols-12 px-5 py-3 bg-gray-50/80 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
      {[
        { label: "#",            cls: "col-span-1 text-center" },
        { label: t("col_player"),  cls: "col-span-6 md:col-span-5" },
        { label: t("col_country"), cls: "col-span-2 text-center hidden md:block" },
        { label: t("col_quizzes"), cls: "col-span-2 text-center" },
        {
          label: filter === "accuracy" ? t("col_accuracy")
               : filter === "quizzes"  ? t("col_quizzes")
               : t("col_score"),
          cls: "col-span-3 md:col-span-2 text-center",
        },
      ].map(({ label, cls }) => (
        <div key={label} className={`${cls} text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500`}>
          {label}
        </div>
      ))}
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────
function TableRow({
  user, rank, filter, isCurrentUser, isTop10, animDelay,
}: {
  user: LeaderboardUser;
  rank: number;
  filter: FilterType;
  isCurrentUser: boolean;
  isTop10: boolean;
  animDelay: number;
}) {
  const t = useTranslations("leaderboard");
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), animDelay); }, [animDelay]);

  return (
    <div className={`grid grid-cols-12 px-5 py-4 items-center border-b border-gray-100 dark:border-slate-800 last:border-0
      transition-all duration-500 ease-out
      ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
      ${isCurrentUser
        ? "bg-cyan-50 dark:bg-cyan-900/20 border-l-[3px] !border-l-cyan-500"
        : "hover:bg-gray-50/80 dark:hover:bg-slate-800/40"
      }`}
    >
      {/* Rank */}
      <div className="col-span-1 text-center">
        {rank <= 3
          ? <span className="text-xl">{["🥇", "🥈", "🥉"][rank - 1]}</span>
          : <span className={`text-sm font-bold tabular-nums ${isTop10 ? "text-gray-700 dark:text-slate-200" : "text-gray-400 dark:text-slate-500"}`}>{rank}</span>
        }
      </div>

      {/* Player */}
      <div className="col-span-6 md:col-span-5 flex items-center gap-3">
        <Avatar user={user} size="sm" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold truncate ${isCurrentUser ? "text-cyan-600 dark:text-cyan-400" : "text-gray-900 dark:text-white"}`}>
              {getDisplayName(user, t("anonymous"))}
            </p>
            {isCurrentUser && (
              <span className="text-[10px] bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                {t("you")}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">
            {user.region ?? user.country ?? "—"}
          </p>
        </div>
      </div>

      {/* Country */}
      <div className="col-span-2 text-center hidden md:block">
        <span className="text-sm text-gray-500 dark:text-slate-300">
          {flag(user.country)} {user.country ?? "—"}
        </span>
      </div>

      {/* Quizzes */}
      <div className="col-span-2 text-center">
        <span className="text-sm tabular-nums text-gray-500 dark:text-slate-300">
          {user.quizzes_played ?? 0}
        </span>
      </div>

      {/* Main metric */}
      <div className="col-span-3 md:col-span-2 text-center">
        <span className={`text-sm font-extrabold tabular-nums ${isTop10 ? "text-cyan-600 dark:text-cyan-400" : "text-gray-400 dark:text-slate-500"}`}>
          {getDisplayValue(user, filter)}
        </span>
      </div>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
interface TableProps {
  users: LeaderboardUser[];
  sorted: LeaderboardUser[];
  top10Ids: Set<string>;
  filter: FilterType;
  currentUserId?: string;
  startRank?: number;
  isTop10Section?: boolean;
}

export default function LeaderboardTable({
  users, sorted, top10Ids, filter, currentUserId, startRank, isTop10Section = false,
}: TableProps) {
  const t = useTranslations("leaderboard");

  if (users.length === 0)
    return (
      <div className="py-20 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-sm font-medium text-gray-400 dark:text-slate-500">{t("no_results")}</p>
      </div>
    );

  return (
    <>
      {users.map((user, i) => {
        const rank = isTop10Section ? i + 1 : sorted.findIndex((u) => u.id === user.id) + 1;
        return (
          <TableRow
            key={user.id}
            user={user}
            rank={rank}
            filter={filter}
            isCurrentUser={user.id === currentUserId}
            isTop10={top10Ids.has(user.id)}
            animDelay={Math.min(i * 60, 600)}
          />
        );
      })}
    </>
  );
}