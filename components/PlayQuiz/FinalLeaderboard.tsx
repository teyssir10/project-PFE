"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Player, leaderProps } from "@/types/quiz";
import winnerPanda from "@/public/winner-panda.png";

const getRank = (rank: number, isMe: boolean) => {
  if (rank === 1) return {
    badgeBg:        "linear-gradient(135deg, #c8960c, #f5c842, #c8960c)",
    barColor:       "#f5c842",
    rowBgLight:     isMe ? "linear-gradient(90deg, rgba(245,200,66,0.12) 0%, rgba(245,200,66,0.04) 100%)" : "linear-gradient(90deg, rgba(245,200,66,0.07) 0%, transparent 100%)",
    rowBorderLight: isMe ? "rgba(245,200,66,0.50)" : "rgba(245,200,66,0.25)",
    rowBgDark:      isMe ? "linear-gradient(90deg, rgba(245,200,66,0.12) 0%, rgba(245,200,66,0.03) 100%)" : "linear-gradient(90deg, rgba(245,200,66,0.06) 0%, transparent 100%)",
    rowBorderDark:  isMe ? "rgba(245,200,66,0.45)" : "rgba(245,200,66,0.2)",
    scoreColorLight: "#b07d08", scoreColorDark: "#f5c842",
    trackColorLight: "rgba(200,150,12,0.15)", trackColorDark: "rgba(245,200,66,0.15)",
    nameColorLight: isMe ? "#0e7490" : "#1e3a5f", nameColorDark: isMe ? "#e2e8f0" : "rgba(255,255,255,0.75)",
    medal: "🥇",
  };
  if (rank === 2) return {
    badgeBg:        "linear-gradient(135deg, #0891b2, #0d9488)",
    barColor:       "#22d3ee",
    rowBgLight:     isMe ? "linear-gradient(90deg, rgba(6,182,212,0.12) 0%, rgba(6,182,212,0.04) 100%)" : "linear-gradient(90deg, rgba(6,182,212,0.06) 0%, transparent 100%)",
    rowBorderLight: isMe ? "rgba(6,182,212,0.50)" : "rgba(6,182,212,0.22)",
    rowBgDark:      isMe ? "linear-gradient(90deg, rgba(6,182,212,0.10) 0%, rgba(6,182,212,0.03) 100%)" : "linear-gradient(90deg, rgba(6,182,212,0.05) 0%, transparent 100%)",
    rowBorderDark:  isMe ? "rgba(6,182,212,0.45)" : "rgba(6,182,212,0.2)",
    scoreColorLight: "#0a8f8f", scoreColorDark: "#22d3ee",
    trackColorLight: "rgba(6,182,212,0.15)", trackColorDark: "rgba(6,182,212,0.15)",
    nameColorLight: isMe ? "#0e7490" : "#1e3a5f", nameColorDark: isMe ? "#e2e8f0" : "rgba(255,255,255,0.75)",
    medal: "🥈",
  };
  if (rank === 3) return {
    badgeBg:        "linear-gradient(135deg, #475569, #64748b)",
    barColor:       "#94a3b8",
    rowBgLight:     isMe ? "linear-gradient(90deg, rgba(148,163,184,0.12) 0%, rgba(148,163,184,0.04) 100%)" : "linear-gradient(90deg, rgba(148,163,184,0.06) 0%, transparent 100%)",
    rowBorderLight: isMe ? "rgba(148,163,184,0.45)" : "rgba(148,163,184,0.20)",
    rowBgDark:      isMe ? "linear-gradient(90deg, rgba(148,163,184,0.10) 0%, rgba(148,163,184,0.03) 100%)" : "linear-gradient(90deg, rgba(148,163,184,0.05) 0%, transparent 100%)",
    rowBorderDark:  isMe ? "rgba(148,163,184,0.4)" : "rgba(148,163,184,0.15)",
    scoreColorLight: "#475569", scoreColorDark: "#94a3b8",
    trackColorLight: "rgba(100,116,139,0.18)", trackColorDark: "rgba(148,163,184,0.15)",
    nameColorLight: isMe ? "#0e7490" : "#1e3a5f", nameColorDark: isMe ? "#e2e8f0" : "rgba(255,255,255,0.75)",
    medal: "🥉",
  };
  return {
    badgeBg: "linear-gradient(135deg, #94a3b8, #64748b)",
    barColor: "#64748b",
    rowBgLight: isMe ? "rgba(6,182,212,0.06)" : "rgba(248,250,252,1)",
    rowBorderLight: isMe ? "rgba(6,182,212,0.30)" : "rgba(226,232,240,1)",
    rowBgDark: isMe ? "rgba(6,182,212,0.07)" : "rgba(30,41,59,1)",
    rowBorderDark: isMe ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.05)",
    scoreColorLight: isMe ? "#0a8f8f" : "#64748b", scoreColorDark: isMe ? "#22d3ee" : "rgba(255,255,255,0.4)",
    trackColorLight: "rgba(100,116,139,0.15)", trackColorDark: "rgba(255,255,255,0.06)",
    nameColorLight: isMe ? "#0e7490" : "#334155", nameColorDark: isMe ? "#e2e8f0" : "rgba(255,255,255,0.55)",
    medal: "",
  };
};

const CONFETTI_COLORS = ["#0bc5c5","#f5c842","#67e8f9","#0891b2","#c8960c","#7ee8e8"];

export default function FinalLeaderboard({ leaderboard, myRank, totalScore }: leaderProps) {
  const router = useRouter();
  const t = useTranslations("finalLeaderboard");

  const [visible, setVisible] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [bars, setBars] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setConfetti(true), 350);
    const t3 = setTimeout(() => setBars(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const deduped = Object.values(
    leaderboard.reduce<Record<string, Player>>((acc, p) => {
      if (!acc[p.userId] || p.isMe) acc[p.userId] = p;
      return acc;
    }, {})
  ).sort((a, b) => b.score - a.score);

  const ranked = deduped.map((p) => ({
    ...p,
    rank: deduped.findIndex(o => o.score === p.score) + 1,
  }));

  const topScore = ranked[0]?.score ?? 0;
  const winners = ranked.filter(p => p.score === topScore && topScore > 0);
  const isTie = winners.length > 1;
  const iAmWinner = winners.some(p => p.isMe);
  const myPlayer = ranked.find(p => p.isMe);
  const myActualRank = myPlayer?.rank ?? myRank;

  const getResult = () => {
    if (isTie && iAmWinner) return { emoji: "🤝", line1: t("result.tieLine1"), line2: t("result.tieLine2") };
    if (!isTie && myActualRank === 1) return { emoji: "🏆", line1: t("result.wonLine1"),     line2: t("result.wonLine2") };
    if (myActualRank === 2) return { emoji: "🥈", line1: t("result.2ndLine1"), line2: t("result.2ndLine2") };
    if (myActualRank === 3) return { emoji: "🎖️", line1: t("result.3rdLine1"), line2: t("result.3rdLine2") };
    return { emoji: "🎮", line1: t("result.defaultLine1"), line2: t("result.defaultLine2", { rank: myActualRank }) };
  };
  const result = getResult();

  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    w: [7, 9, 6, 10, 8][i % 5],
    h: [7, 5, 9, 6, 8][i % 5],
    left: `${3 + (i * 4.1) % 94}%`,
    delay: `${(i * 0.19) % 2.6}s`,
    dur: `${2.4 + (i * 0.22) % 2}s`,
  }));

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden py-8 px-4  bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <style>{`
        @keyframes fall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity:1; }
          85%  { opacity:.5; }
          100% { transform: translateY(108vh) rotate(540deg); opacity:0; }
        }
        @keyframes panda-float {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-9px); }
        }
        @keyframes glow-pulse {
          0%,100% { opacity:.3;  transform:scale(1); }
          50%     { opacity:.12; transform:scale(1.2); }
        }
        @keyframes shimmer-title {
          0%   { background-position: -300% center; }
          100% { background-position:  300% center; }
        }
        @keyframes banner-shine {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .title-shimmer-dark {
          background: linear-gradient(120deg, #f1f5f9 0%, #22d3ee 35%, #67e8f9 55%, #f1f5f9 80%);
          background-size: 300% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: shimmer-title 5s linear infinite;
        }
        .title-shimmer-light {
          background: linear-gradient(120deg, #1a2b4a 0%, #0bc5c5 35%, #67e8f9 55%, #1a2b4a 80%);
          background-size: 300% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: shimmer-title 5s linear infinite;
        }
        .banner-shine {
          background: linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.12) 50%, transparent 75%);
          background-size: 200% auto;
          animation: banner-shine 3s linear infinite;
        }
      `}</style>

      {confetti && particles.map(p => (
        <div key={p.id} className="absolute pointer-events-none rounded-sm"
          style={{ width: p.w, height: p.h, backgroundColor: p.color,
            left: p.left, top: -12, animation: `fall ${p.dur} ease-in ${p.delay} infinite` }} />
      ))}

      <div className="relative w-full max-w-180"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>

        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div aria-hidden className="absolute inset-0 rounded-full blur-[40px]"
              style={{ background: "#0bc5c5", opacity: .2, transform: "scale(1.7)", animation: "glow-pulse 3.5s ease-in-out infinite" }} />
            <div aria-hidden className="absolute inset-0 rounded-full blur-[30px]"
              style={{ background: "#f5c842", opacity: .12, transform: "scale(1.3)", animation: "glow-pulse 3.5s ease-in-out 1s infinite" }} />
            <div style={{ animation: "panda-float 4s ease-in-out infinite", position: "relative" }}>
              <Image src={winnerPanda} alt={t("pandaAlt")} width={120} height={120}
                style={{ filter: "drop-shadow(0 8px 24px rgba(6,182,212,0.3))" }} />
            </div>
          </div>
          <span className="title-shimmer-light dark:hidden block text-[clamp(2rem,5vw,2.8rem)] font-black tracking-tight leading-none">
            {t("title")}
          </span>
          <span className="title-shimmer-dark hidden dark:block text-[clamp(2rem,5vw,2.8rem)] font-black tracking-tight leading-none">
            {t("title")}
          </span>
        </div>

        {myActualRank > 0 && (
          <div className="relative rounded-2xl overflow-hidden shadow-lg mb-2"
            style={{ background: "linear-gradient(135deg, #0891b2 0%, #0d9488 100%)", border: "1px solid rgba(6,182,212,0.3)",
              opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s" }}>
            <div className="banner-shine absolute inset-0 pointer-events-none" />
            <div className="relative flex items-center gap-4 px-5 py-4">
              <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl border border-white/20"
                style={{ background: "rgba(255,255,255,0.12)" }}>
                {result.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/60 text-[11px] font-bold tracking-[0.12em] uppercase mb-0.5">{result.line1}</p>
                <p className="text-white font-black text-[22px] leading-tight tracking-tight mb-1">{result.line2}</p>
                <p className="text-white/55 text-[12px]">
                  <span className="text-white font-bold">{myPlayer?.score ?? totalScore} {t("pts")}</span>
                  {" · "}{t("playerCount", { count: ranked.length })}
                </p>
              </div>
              {(myActualRank === 1 || (isTie && iAmWinner)) && (
                <div className="flex-shrink-0 text-[28px]" style={{ filter: "drop-shadow(0 0 10px #f5c842)" }}>⭐</div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease 0.25s" }}>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(6,182,212,0.4) 50%, transparent)" }} />
          <span className="text-[10px] font-black tracking-[0.25em] uppercase text-cyan-600 dark:text-cyan-500/60">
            {t("rankingLabel")}
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(6,182,212,0.4) 50%, transparent)" }} />
        </div>

        <div className="flex flex-col gap-2">
          {ranked.map((player, i) => {
            const rankStyle = getRank(player.rank, player.isMe);
            const barW = topScore > 0 ? Math.round((player.score / topScore) * 100) : 0;
            const delay = 0.3 + i * 0.09;

            return (
              <div key={player.userId}
                className="relative flex items-center gap-3 px-4 py-3 rounded-2xl overflow-hidden dark:[background:var(--row-bg-dark)] dark:[border-color:var(--row-border-dark)]"
                style={{
                  // @ts-ignore
                  "--row-bg-dark": rankStyle.rowBgDark, "--row-border-dark": rankStyle.rowBorderDark,
                  background: rankStyle.rowBgLight, border: `1.5px solid ${rankStyle.rowBorderLight}`,
                  backdropFilter: "blur(8px)", opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-16px)",
                  transition: `opacity 0.42s ease ${delay}s, transform 0.42s cubic-bezier(0.34,1.56,0.64,1) ${delay}s`,
                }}>

                <div className="absolute inset-0 pointer-events-none rounded-2xl"
                  style={{ background: `linear-gradient(90deg, ${rankStyle.barColor}22 0%, transparent 100%)`, width: bars ? `${barW}%` : "0%", transition: `width 1.1s ease ${delay + 0.25}s` }} 
                />

                <div className="relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-md"
                  style={{ background: rankStyle.badgeBg, fontSize: rankStyle.medal ? 18 : 13, color: "#fff" }}>
                  {rankStyle.medal || `#${player.rank}`}
                </div>

                <div className="relative flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                      style={{ background: player.rank <= 3 ? `${rankStyle.barColor}33` : "rgba(100,116,139,0.15)",
                        color: rankStyle.scoreColorLight, border: player.isMe ? `1.5px solid ${rankStyle.barColor}` : "1.5px solid transparent" }}>
                      <span className="dark:hidden">{player.name.slice(0, 2).toUpperCase()}</span>
                      <span className="hidden dark:inline" style={{ color: rankStyle.scoreColorDark }}>{player.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-semibold truncate dark:hidden" style={{ color: rankStyle.nameColorLight }}>{player.name}</span>
                    <span className="text-sm font-semibold truncate hidden dark:inline" style={{ color: rankStyle.nameColorDark }}>{player.name}</span>
                    {player.isMe && (
                      <span className="flex-shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded text-cyan-600 bg-cyan-100 dark:text-cyan-300 dark:bg-cyan-900/40 uppercase tracking-wide">
                        {t("you")}
                      </span>
                    )}
                    {player.rank === 1 && isTie && (
                      <span className="flex-shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide text-amber-600 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30">
                        {t("tied")} 🤝
                      </span>
                    )}
                  </div>
                  <div className="h-1 rounded-full overflow-hidden dark:[background:var(--track-dark)]"
                    // @ts-ignore
                    style={{ "--track-dark": rankStyle.trackColorDark, background: rankStyle.trackColorLight }}>
                    <div className="h-full rounded-full"
                      style={{ background: rankStyle.barColor, width: bars ? `${barW}%` : "0%", transition: `width 1.1s ease ${delay + 0.25}s` }} />
                  </div>
                </div>

                <div className="relative flex-shrink-0 text-right">
                  <span className="text-base font-black tabular-nums dark:hidden" style={{ color: rankStyle.scoreColorLight }}>
                    {player.score.toLocaleString()}
                  </span>
                  <span className="text-base font-black tabular-nums hidden dark:inline" style={{ color: rankStyle.scoreColorDark }}>
                    {player.score.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold ml-0.5 text-slate-400 dark:text-slate-600">{t("pts")}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2.5 mt-6"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: `opacity 0.4s ease ${0.3 + ranked.length * 0.09 + 0.2}s, transform 0.4s ease ${0.3 + ranked.length * 0.09 + 0.2}s` }}>
          <button onClick={() => router.push("/browse-quiz")}
            className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98]  text-cyan-700 border border-cyan-200 bg-white/80 hover:border-cyan-400 hover:text-cyan-600 dark:text-cyan-400 dark:border-white/10 dark:bg-white/4 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300">
            {t("exploreQuizzes")}
          </button>
          <button onClick={() => router.push("/dashboard")}
            className="flex-1 py-3.5 rounded-xl text-white font-bold text-sm transition-all duration-200 active:scale-[0.98] hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0891b2, #0d9488)", boxShadow: "0 6px 20px rgba(6,182,212,0.25)" }}>
            {t("dashboard")}
          </button>
        </div>

      </div>
    </div>
  );
}