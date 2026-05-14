"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LeaderboardUser } from "@/lib/api/leaderboard";
import { Avatar, getDisplayName, getDisplayValue, flag, FilterType } from "./helpers";

interface Props {
  top3: LeaderboardUser[];
  filter: FilterType;
}

const slots_config = [
  { idx: 1, rank: 2, barH: "h-32", barGradient: "from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700", ringColor: "ring-slate-300 dark:ring-slate-500", medal: "🥈", textColor: "text-slate-500 dark:text-slate-300", delay: "delay-100" },
  { idx: 0, rank: 1, barH: "h-48", barGradient: "from-amber-300 to-yellow-400", ringColor: "ring-amber-400 ring-4", medal: "🥇", textColor: "text-amber-500", delay: "delay-0" },
  { idx: 2, rank: 3, barH: "h-24", barGradient: "from-orange-300 to-amber-400", ringColor: "ring-orange-400", medal: "🥉", textColor: "text-orange-500", delay: "delay-200" },
];

export default function LeaderboardPodium({ top3, filter }: Props) {
  const t = useTranslations("leaderboard");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <div className="relative mb-12 w-full">
      {/* Ambient glow */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cyan-50 dark:from-cyan-950/20 to-transparent rounded-3xl" />

      <div className="relative flex items-end justify-center gap-8 md:gap-20 pt-4">
        {slots_config.map(({ idx, rank, barH, barGradient, ringColor, medal, textColor, delay }) => {
          const user = top3[idx];
          if (!user) return null;
          return (
            <div
              key={user.id}
              className={`flex flex-col items-center gap-0 transition-all duration-700 ${delay} ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              {/* Crown for #1 */}
              {rank === 1 && (
                <div className={`text-3xl mb-1 transition-all duration-1000 ${mounted ? "opacity-100" : "opacity-0 -translate-y-4"}`}>
                  👑
                </div>
              )}

              {/* Avatar */}
              <div className={`relative ring-4 ${ringColor} rounded-full transition-transform duration-300 hover:scale-110 cursor-default`}>
                <Avatar user={user} size={rank === 1 ? "lg" : "md"} />
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xl">{medal}</span>
              </div>

              {/* Info */}
              <div className="text-center mt-6 mb-3 min-w-0 w-28">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {getDisplayName(user, t("anonymous"))}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  {flag(user.country)} {user.country ?? "—"}
                </p>
                <p className={`text-lg font-extrabold mt-1 ${textColor}`}>
                  {getDisplayValue(user, filter)}
                </p>
              </div>

              {/* Podium bar */}
              <div className={`w-28 md:w-36 ${barH} rounded-t-2xl bg-gradient-to-b ${barGradient} shadow-lg flex items-start justify-center pt-3 transition-all duration-700 ${delay} ${mounted ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"} origin-bottom`}>
                <span className="text-white/80 font-black text-2xl drop-shadow">#{rank}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}