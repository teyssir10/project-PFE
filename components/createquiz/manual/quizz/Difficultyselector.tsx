"use client";

import { Difficulty } from "@/types/aiquiz";
import { useTranslations } from "next-intl";

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (v: Difficulty) => void;
}

export default function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  const t = useTranslations("difficulty");

  const LEVELS = [
    { value: "Easy" as Difficulty, labelKey: "easy", descKey: "easyDesc", icon: "🌱", active: "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20", bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400" },
    { value: "Medium" as Difficulty, labelKey: "medium", descKey: "mediumDesc", icon: "⚡", active: "bg-amber-400 text-slate-900 border-amber-300 shadow-amber-400/20", bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400" },
    { value: "Hard" as Difficulty, labelKey: "hard", descKey: "hardDesc", icon: "🔥", active: "bg-rose-500 text-white border-rose-400 shadow-rose-500/20", bg: "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400" },
    { value: "Mixed" as Difficulty, labelKey: "mixed", descKey: "mixedDesc", icon: "🎲", active: "bg-cyan-500 text-white border-cyan-400 shadow-cyan-500/20", bg: "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800/40 text-cyan-700 dark:text-cyan-400" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {LEVELS.map((level) => {
        const isActive = value === level.value;
        return (
          <button key={level.value} type="button" onClick={() => onChange(level.value)}
            className={`flex flex-col items-center py-4 px-3 rounded-xl border-2 font-semibold transition-all duration-150 shadow-sm ${
              isActive ? `${level.active} border-transparent shadow-lg` : `${level.bg} hover:scale-[1.02]`
            }`}>
            <span className="text-2xl mb-1">{level.icon}</span>
            <span className="text-xs font-bold">{t(level.labelKey)}</span>
            <span className={`text-[10px] mt-0.5 ${isActive ? "opacity-80" : "opacity-60"}`}>
              {t(level.descKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
}