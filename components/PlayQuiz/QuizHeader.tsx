"use client";

import { useTranslations } from "next-intl";

type Props = {
  title: string;
  category: string;
  difficulty: string;
  timeLeft: number;
  totalTime: number;
  onExit: () => void;
};

const difficultyConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Easy:   { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  Medium: { bg: "bg-amber-100 dark:bg-amber-900/30",     text: "text-amber-600 dark:text-amber-400",     dot: "bg-amber-500" },
  Hard:   { bg: "bg-red-100 dark:bg-red-900/30",         text: "text-red-600 dark:text-red-400",         dot: "bg-red-500" },
};

export default function QuizHeader({ title, category, difficulty, timeLeft, totalTime, onExit }: Props) {
  const t = useTranslations("quizHeader");
  const pct    = (timeLeft / totalTime) * 100;
  const diff   = difficultyConfig[difficulty] ?? difficultyConfig["Easy"];
  const urgent = timeLeft <= 5;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm">
      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-100 dark:bg-slate-800">
        <div
          className={`h-full transition-all duration-1000 rounded-full ${urgent ? "bg-red-500" : "bg-gradient-to-r from-cyan-500 to-teal-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-3 md:px-8 py-3 md:py-4 gap-2">
        {/* Left — title + difficulty */}
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="font-extrabold text-gray-900 dark:text-white text-sm md:text-base truncate max-w-[120px] sm:max-w-none">
            {title}
          </span>
          {category && (
            <span className="text-xs text-gray-400 dark:text-slate-500 font-medium hidden sm:inline">· {category}</span>
          )}
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${diff.bg} ${diff.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            <span className="hidden sm:inline">{difficulty}</span>
          </span>
        </div>

        {/* Right — timer + exit */}
        <div className="flex items-center gap-2 md:gap-5 flex-shrink-0">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black tabular-nums text-base md:text-lg transition-colors ${
            urgent
              ? "bg-red-100 dark:bg-red-900/30 text-red-500 animate-pulse"
              : "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
          }`}>
            <span>⏱</span>
            <span>{timeLeft}</span>
            <span className="text-xs font-medium opacity-70">{t("sec")}</span>
          </div>
          <button onClick={onExit}
            className="px-2 md:px-4 py-1.5 md:py-2 rounded-xl border border-gray-200 dark:border-slate-700
              text-xs md:text-sm text-gray-500 dark:text-slate-400
              hover:border-red-300 hover:text-red-500 dark:hover:border-red-500 dark:hover:text-red-400
              transition font-medium whitespace-nowrap">
            {t("exit")}
          </button>
        </div>
      </div>
    </div>
  );
}