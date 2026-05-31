"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LeaderboardPhaseProps, Rank } from "@/types/quiz";
import Deco from "../Decoration/Deco";
import Image from "next/image";
import twoPandas from "@/public/two-pandas.png";

const RANK: Rank[] = [
  {
    avatar:    "bg-amber-100 text-amber-600 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-700",
    score:     "text-amber-500 dark:text-amber-400",
    bar:       "bg-gradient-to-r from-amber-400 to-yellow-300",
    track:     "bg-amber-50 dark:bg-amber-900/20",
    rowAccent: "border-l-amber-400 dark:border-l-amber-500",
    rowBg:     "bg-amber-50/60 dark:bg-amber-900/10",
    rankNum:   "text-slate-300 dark:text-slate-600",
  },
  {
    avatar:    "bg-cyan-100 text-cyan-600 ring-cyan-300 dark:bg-cyan-900/40 dark:text-cyan-400 dark:ring-cyan-700",
    score:     "text-cyan-500 dark:text-cyan-400",
    bar:       "bg-gradient-to-r from-cyan-400 to-blue-300",
    track:     "bg-cyan-50 dark:bg-cyan-900/20",
    rowAccent: "border-l-cyan-400 dark:border-l-cyan-500",
    rowBg:     "bg-cyan-50/60 dark:bg-cyan-900/10",
    rankNum:   "text-slate-300 dark:text-slate-600",
  },
  {
    avatar:    "bg-violet-100 text-violet-600 ring-violet-300 dark:bg-violet-900/40 dark:text-violet-400 dark:ring-violet-700",
    score:     "text-violet-500 dark:text-violet-400",
    bar:       "bg-gradient-to-r from-violet-400 to-pink-300",
    track:     "bg-violet-50 dark:bg-violet-900/20",
    rowAccent: "border-l-violet-300 dark:border-l-violet-500",
    rowBg:     "bg-violet-50/40 dark:bg-violet-900/10",
    rankNum:   "text-slate-300 dark:text-slate-600",
  },
  {
    avatar:    "bg-slate-100 text-slate-400 ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700",
    score:     "text-slate-400 dark:text-slate-500",
    bar:       "bg-gradient-to-r from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-700",
    track:     "bg-slate-50 dark:bg-slate-800/50",
    rowAccent: "border-l-slate-200 dark:border-l-slate-700",
    rowBg:     "",
    rankNum:   "text-slate-300 dark:text-slate-600",
  },
  {
    avatar:    "bg-slate-100 text-slate-400 ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700",
    score:     "text-slate-400 dark:text-slate-500",
    bar:       "bg-gradient-to-r from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-700",
    track:     "bg-slate-50 dark:bg-slate-800/50",
    rowAccent: "border-l-slate-200 dark:border-l-slate-700",
    rowBg:     "",
    rankNum:   "text-slate-300 dark:text-slate-600",
  },
];

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardPhase({ wasCorrect, lastScoreEarned, myRank, leaderboard, isLast }: LeaderboardPhaseProps) {
  const t = useTranslations("leaderboardPhase");

  const [visible, setVisible] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [bars, setBars] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    leaderboard.forEach((_, i) => {
      setTimeout(() => {
        setRevealed(prev => [...prev, i]);
        setTimeout(() => setBars(prev => [...prev, i]), 350);
      }, 180 + i * 130);
    });
  }, [leaderboard]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const getFeedback = () => {
    if (wasCorrect === null) return {
      icon: "⏱",
      eyebrow: t("feedback.timeUpEyebrow"),
      headline:t("feedback.timeUpHeadline"),
      sub: t("feedback.zeroPoints"),
      bg: "bg-gradient-to-br from-slate-400 to-slate-600",
    };
    if (wasCorrect) return {
      icon: "✅",
      eyebrow: t("feedback.lastAnswerEyebrow"),
      headline:t("feedback.correctHeadline"),
      sub: t("feedback.pointsEarned", { pts: lastScoreEarned }),
      bg: "bg-gradient-to-br from-cyan-400 to-cyan-600",
    };
    return {
      icon: "❌",
      eyebrow: t("feedback.lastAnswerEyebrow"),
      headline:t("feedback.wrongHeadline"),
      sub: t("feedback.zeroPoints"),
      bg: "bg-gradient-to-br from-red-400 to-red-600",
    };
  };

  const fb = getFeedback();
  const top5 = leaderboard.slice(0, 5);
  const meOutside = leaderboard.find(p => p.isMe && p.rank > 5);
  const maxScore = leaderboard[0]?.score ?? 1;

  return (
    <div className="flex flex-col items-center px-4 py-2 relative min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Deco />

      <div
        className="w-full max-w-180 relative z-10 transition-all duration-500 ease-out"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(18px)" }}
      >
        <div className="text-center mb-4">
          <div className="flex justify-center mb-4">
            <Image src={twoPandas} alt={t("pandasAlt")} width={120} height={120}
              style={{ filter: "drop-shadow(0 8px 24px rgba(6,182,212,0.3))" }} />
          </div>
          <h1 className="text-[clamp(1.6rem,4vw,2rem)] font-black tracking-tight leading-tight text-slate-800 dark:text-slate-100">
            {isLast ? (
              <><span className="text-amber-400">{t("title.finished")}</span> 🏆</>
            ) : (
              <>{t("title.live.prefix")} <span className="text-cyan-400">{t("title.live.highlight")}</span></>
            )}
          </h1>
        </div>

        <div className={`${fb.bg} rounded-2xl p-4 flex items-center gap-4 mb-5 shadow-sm`}>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
            {fb.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/55 mb-0.5">{fb.eyebrow}</p>
            <p className="text-base font-black text-white">{fb.headline}</p>
            <p className="text-xs text-white/60 mt-0.5">{fb.sub}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/50">{t("myRankLabel")}</p>
            <p className="text-3xl font-black text-white leading-none mt-0.5">
              {MEDALS[myRank - 1] ?? `#${myRank}`}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-cyan-100 dark:bg-cyan-900/50" />
          <p className="text-[10px] font-black tracking-[0.22em] uppercase text-cyan-400 dark:text-cyan-500">
            {t("rankingLabel")}
          </p>
          <div className="flex-1 h-px bg-cyan-100 dark:bg-cyan-900/50" />
        </div>

        <div className="rounded-2xl overflow-hidden shadow-sm bg-white border border-cyan-100/80 dark:bg-slate-900 dark:border-slate-800">
          {top5.map((player, i) => {
            const rankStyle  = RANK[Math.min(i, RANK.length - 1)];
            const isTopThree = player.rank <= 3;
            const pct = Math.round((player.score / maxScore) * 100);
            const isVisible = revealed.includes(i);
            const barActive = bars.includes(i);

            return (
              <div
                key={player.userId}
                className={[
                  "flex items-center gap-3 px-4 py-3 border-l-4",
                  "transition-all duration-[400ms] ease-out",
                  i < top5.length - 1 ? "border-b border-slate-50 dark:border-slate-800" : "",
                  player.isMe ? `${rankStyle.rowAccent} ${rankStyle.rowBg}` : "border-l-transparent",
                ].join(" ")}
                style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateX(0)" : "translateX(-16px)" }}
              >
                <div className="w-7 text-center shrink-0">
                  {isTopThree
                    ? <span className="text-lg leading-none">{MEDALS[player.rank - 1]}</span>
                    : <span className={`text-xs font-black ${rankStyle.rankNum}`}>{player.rank}</span>}
                </div>

                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-xs font-black ring-2 ${rankStyle.avatar}`}>
                  {player.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={["text-sm font-bold truncate", player.isMe ? "text-cyan-700 dark:text-cyan-400" : "text-slate-700 dark:text-slate-300"].join(" ")}>
                      {player.name}
                    </span>
                    {player.isMe && (
                      <span className="shrink-0 text-[9px] font-black tracking-wide uppercase px-1.5 py-px rounded-full bg-cyan-50 text-cyan-500 border border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-400 dark:border-cyan-800">
                        {t("you")}
                      </span>
                    )}
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${rankStyle.track}`}>
                    <div className={`h-full rounded-full transition-[width] duration-[900ms] ease-out ${rankStyle.bar}`}
                      style={{ width: barActive ? `${pct}%` : "0%" }} />
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xl font-black leading-none ${rankStyle.score}`}>
                    {player.score.toLocaleString()}
                  </span>
                  <span className="block text-[10px] font-semibold mt-0.5 text-slate-300 dark:text-slate-600">
                    {t("pts")}
                  </span>
                </div>
              </div>
            );
          })}

          {meOutside && (
            <>
              <div className="flex items-center gap-2 px-4 py-1.5">
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                <span className="text-xs font-bold text-slate-200 dark:text-slate-700">…</span>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="flex items-center gap-3 px-4 py-3 border-l-4 border-l-teal-400 dark:border-l-cyan-500 bg-teal-50/60 dark:bg-teal-900/10">
                <div className="w-7 text-center shrink-0">
                  <span className="text-xs font-black text-slate-300 dark:text-slate-600">{meOutside.rank}</span>
                </div>
                <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-xs font-black ring-2 bg-cyan-100 text-cyan-600 ring-cyan-300 dark:bg-cyan-900/40 dark:text-cyan-400 dark:ring-cyan-700">
                  {meOutside.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold truncate text-cyan-700 dark:text-cyan-400">{meOutside.name}</span>
                    <span className="shrink-0 text-[9px] font-black tracking-wide uppercase px-1.5 py-px rounded-full bg-cyan-50 text-cyan-500 border border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-400 dark:border-cyan-800">
                      {t("you")}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl font-black text-slate-400 dark:text-slate-500">
                    {meOutside.score.toLocaleString()}
                  </span>
                  <span className="block text-[10px] font-semibold mt-0.5 text-slate-300 dark:text-slate-600">
                    {t("pts")}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2.5">
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black border-cyan-300 text-cyan-500 dark:border-cyan-700 dark:text-cyan-400">
            {countdown}
          </div>
          <p className="text-xs font-semibold text-cyan-400/80 dark:text-cyan-500/80">
            {isLast ? t("countdown.finished") : t("countdown.next")}
          </p>
        </div>

      </div>
    </div>
  );
}