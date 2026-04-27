"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import winnerPanda from "@/public/winner-panda.png";
import cryPanda    from "@/public/cry-panda.png";

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { id }       = useParams<{ id: string }>();
  const { user }     = useAuth();

  const firstName = user?.user_metadata?.firstname ?? "Champion";

  const score      = parseInt(searchParams.get("score") ?? "0");
  const total      = parseInt(searchParams.get("total") ?? "1");
  const percentage = Math.round((score / total) * 100);
  const isWinner   = percentage >= 50;
  const wrong      = total - score;

  const [displayScore, setDisplayScore] = useState(0);
  const [displayPct, setDisplayPct]     = useState(0);
  const [visible, setVisible]           = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    let cur = 0;
    const interval = setInterval(() => {
      cur += 1;
      setDisplayScore(Math.min(cur, score));
      setDisplayPct(Math.round((Math.min(cur, score) / total) * 100));
      if (cur >= score) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [score, total]);

  const getMessage = () => {
    if (percentage === 100) return { title: `Parfait, ${firstName} ! 🏆`, sub: "Score absolu — tu es imbattable !", badge: "Légendaire", badgeColor: "from-yellow-400 to-amber-500" };
    if (percentage >= 80)  return { title: `Excellent, ${firstName} ! 🎉`, sub: "Très belle performance, continue !", badge: "Expert", badgeColor: "from-teal-400 to-cyan-500" };
    if (percentage >= 50)  return { title: `Bien joué, ${firstName} ! 👍`, sub: "Tu passes la barre, encore un effort !", badge: "Passable", badgeColor: "from-blue-400 to-indigo-500" };
    if (percentage >= 25)  return { title: `Peut mieux faire, ${firstName} 😅`, sub: "Révise et retente, tu vas y arriver !", badge: "Insuffisant", badgeColor: "from-orange-400 to-amber-500" };
    return { title: `Courage, ${firstName} ! 😢`, sub: "Ne lâche pas ! La prochaine sera la bonne !", badge: "À revoir", badgeColor: "from-rose-500 to-red-500" };
  };

  const { title, sub, badge, badgeColor } = getMessage();

  const radius = 54;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (displayPct / 100) * circ;

  const tips = isWinner
    ? ["Continue sur cette lancée ! 🚀", "Essaie un quiz plus difficile 💪", "Partage ton score avec tes amis 🎊"]
    : ["Relis le cours avant de retenter 📚", "Utilise les indices la prochaine fois 💡", "Commence par un quiz plus facile 🎯"];

  return (
    <div className="min-h-screen relative overflow-x-hidden">

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {isWinner ? (<>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-300/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-teal-300/10 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-300/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </>) : (<>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-300/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -left-20 w-80 h-80 bg-pink-300/10 rounded-full blur-3xl animate-pulse delay-500" />
          <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-orange-300/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </>)}
      </div>

      {/* ── Main content ── */}
      <div className={`relative z-10 max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6 transition-all duration-700
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >

        {/* ── HERO SECTION ── */}
        <div className={`w-full rounded-3xl overflow-hidden border-2
          ${isWinner ? "border-teal-200 dark:border-teal-800" : "border-rose-200 dark:border-rose-800"}`}
        >
          <div className={`h-2 w-full bg-gradient-to-r ${isWinner ? "from-cyan-400 to-teal-500" : "from-rose-400 to-pink-500"}`} />

          <div className="bg-white dark:bg-slate-900 px-8 py-6 flex items-center gap-8">
            {/* Panda */}
            <div className="shrink-0" style={{ animation: isWinner ? "float 3s ease-in-out infinite" : "sway 2.5s ease-in-out infinite" }}>
              <Image
                src={isWinner ? winnerPanda : cryPanda}
                alt={isWinner ? "Winner panda" : "Cry panda"}
                width={120} height={120}
                className="drop-shadow-xl"
                priority
              />
            </div>

            {/* Text */}
            <div className="flex-1 space-y-1">
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                Résultats du Quiz
              </p>
              <h1 className={`text-3xl font-black leading-tight
                ${isWinner ? "text-teal-600 dark:text-teal-400" : "text-rose-500 dark:text-rose-400"}`}>
                {title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">{sub}</p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">{score} correctes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">{wrong} fausses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">{total} total</span>
                </div>
              </div>
            </div>

            {/* Circle + Badge */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div className="relative">
                <svg width="110" height="110" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r={radius} fill="none" stroke="currentColor"
                    className="text-gray-100 dark:text-slate-800" strokeWidth="14" />
                  <circle cx="80" cy="80" r={radius} fill="none"
                    stroke={isWinner ? "#14b8a6" : "#f43f5e"}
                    strokeWidth="14" strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    transform="rotate(-90 80 80)"
                    style={{ transition: "stroke-dashoffset 0.05s linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black ${isWinner ? "text-teal-500" : "text-rose-500"}`}>
                    {displayScore}/{total}
                  </span>
                  <span className="text-xs font-bold text-gray-400">{displayPct}%</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-xl bg-gradient-to-br ${badgeColor} text-white text-xs font-black shadow-md`}>
                {badge}
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 QUICK STATS ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Correctes",  value: score,        icon: "✅", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-500",                     bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: "Fausses",    value: wrong,        icon: "❌", border: "border-rose-200 dark:border-rose-800",       text: "text-rose-500",                        bg: "bg-rose-50 dark:bg-rose-900/20" },
            { label: "Total",      value: total,        icon: "📝", border: "border-slate-200 dark:border-slate-700",     text: "text-slate-600 dark:text-slate-300",   bg: "bg-slate-50 dark:bg-slate-800/50" },
            { label: "XP Gagné",   value: `+${score*10}`, icon: "⚡", border: isWinner ? "border-cyan-200 dark:border-cyan-800" : "border-pink-200 dark:border-pink-800", text: isWinner ? "text-cyan-500" : "text-pink-500", bg: isWinner ? "bg-cyan-50 dark:bg-cyan-900/20" : "bg-pink-50 dark:bg-pink-900/20" },
          ].map(({ label, value, icon, border, text, bg }) => (
            <div key={label} className={`flex flex-col items-center gap-2 rounded-2xl p-5 border-2 ${border} ${bg} shadow-sm`}>
              <span className="text-2xl">{icon}</span>
              <span className={`text-2xl font-black ${text}`}>{value}</span>
              <span className="text-xs font-semibold text-gray-400 dark:text-slate-500">{label}</span>
            </div>
          ))}
        </div>

        {/* ── TWO COLUMNS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT */}
          <div className="space-y-6">

            {/* Progression */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 space-y-3">
              <h3 className="text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                📈 Progression
              </h3>
              <div className="flex justify-between text-xs font-semibold text-gray-400 dark:text-slate-500">
                <span>0%</span>
                <span className={isWinner ? "text-teal-500" : "text-rose-500"}>{displayPct}% réussi</span>
                <span>100%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-3 rounded-full bg-gradient-to-r relative overflow-hidden
                    ${isWinner ? "from-cyan-400 to-teal-500" : "from-rose-400 to-pink-500"}`}
                  style={{ width: `${displayPct}%`, transition: "width 0.05s linear" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
              <div className="flex justify-around text-xs text-gray-300 dark:text-slate-700">
                {[25, 50, 75].map(m => (
                  <div key={m} className="flex flex-col items-center gap-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full
                      ${displayPct >= m ? (isWinner ? "bg-teal-400" : "bg-rose-400") : "bg-gray-200 dark:bg-slate-700"}`} />
                    <span>{m}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Analyse */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                📊 Analyse
              </h3>
              {[
                { label: "Taux de réussite",   value: `${percentage}%`,    bar: percentage,        color: isWinner ? "bg-teal-400" : "bg-rose-400" },
                { label: "Bonnes réponses",    value: `${score}/${total}`, bar: (score/total)*100, color: "bg-emerald-400" },
                { label: "Mauvaises réponses", value: `${wrong}/${total}`, bar: (wrong/total)*100, color: "bg-rose-400" },
              ].map(({ label, value, bar, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-slate-400">
                    <span>{label}</span>
                    <span className="font-black text-gray-700 dark:text-white">{value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-2 rounded-full ${color} transition-all duration-700`} style={{ width: `${bar}%` }} />
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* Tips */}
            <div className={`rounded-2xl border-2 p-6 space-y-3
              ${isWinner
                ? "border-cyan-200 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-900/10"
                : "border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/10"
              }`}
            >
              <h3 className={`text-xs font-black uppercase tracking-widest
                ${isWinner ? "text-teal-600 dark:text-teal-400" : "text-rose-500 dark:text-rose-400"}`}>
                {isWinner ? "💡 Conseils pour continuer" : "💡 Conseils pour progresser"}
              </h3>
              <ul className="space-y-3">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300 font-medium">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0
                      ${isWinner ? "bg-teal-400" : "bg-rose-400"}`}>{i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Performance message */}
            <div className={`rounded-2xl p-6 bg-gradient-to-br text-white shadow-lg
              ${isWinner ? "from-cyan-500 to-teal-500 shadow-cyan-200/50 dark:shadow-cyan-900/40" : "from-rose-500 to-pink-500 shadow-rose-200/50 dark:shadow-rose-900/40"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Performance</p>
                  <p className="text-2xl font-black">{isWinner ? "Tu es dans le top ! 🏅" : "Tu peux faire mieux ! 💪"}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {isWinner
                      ? `${firstName}, tu maîtrises bien ce sujet.`
                      : `${firstName}, révise et retente ce quiz !`}
                  </p>
                </div>
                <span className="text-6xl opacity-70">{isWinner ? "🌟" : "📚"}</span>
              </div>
            </div>

            {/* Next challenge */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
              <h3 className="text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                🎯 Prochaine étape
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/play-quiz/${id}/play`)}
                  className={`w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:scale-105
                    ${isWinner ? "bg-gradient-to-r from-cyan-500 to-teal-400" : "bg-gradient-to-r from-rose-500 to-pink-400"}`}
                >
                  🔄 Rejouer ce quiz
                </button>
                <button
                  onClick={() => router.push("/browse-quiz")}
                  className="w-full py-3 rounded-xl font-bold text-sm border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 bg-transparent hover:border-gray-300 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  🔍 Explorer d'autres quiz
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── BOTTOM BUTTON ── */}
        <div className="pb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-4 rounded-2xl font-bold text-sm border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:border-gray-300 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
          >
            🏠 Retour au Dashboard
          </button>
        </div>

      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-4deg); }
          50%       { transform: rotate(4deg); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}