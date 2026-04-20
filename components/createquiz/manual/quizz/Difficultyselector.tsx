"use client";

import { Difficulty } from "@/types/aiquiz";

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (v: Difficulty) => void;
}

const LEVELS: {
  value: Difficulty;
  label: string;
  icon: string;
  desc: string;
  active: string;
  bg: string;
}[] = [
  {
    value: "Easy",
    label: "Easy",
    icon: "🌱",
    desc: "Beginner friendly",
    active: "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20",
    bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400",
  },
  {
    value: "Medium",
    label: "Medium",
    icon: "⚡",
    desc: "Some challenge",
    active: "bg-amber-400 text-slate-900 border-amber-300 shadow-amber-400/20",
    bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400",
  },
  {
    value: "Hard",
    label: "Hard",
    icon: "🔥",
    desc: "Advanced level",
    active: "bg-rose-500 text-white border-rose-400 shadow-rose-500/20",
    bg: "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400",
  },
  {
    value: "Mixed",
    label: "Mixed",
    icon: "🎲",
    desc: "All levels",
    active: "bg-violet-500 text-white border-violet-400 shadow-violet-500/20",
    bg: "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800/40 text-violet-700 dark:text-violet-400",
  },
];

export default function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {LEVELS.map((level) => {
        const isActive = value === level.value;
        return (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            className={`flex flex-col items-center py-4 px-3 rounded-xl border-2 font-semibold transition-all duration-150 shadow-sm ${
              isActive ? `${level.active} border-transparent shadow-lg` : `${level.bg} hover:scale-[1.02]`
            }`}
          >
            <span className="text-2xl mb-1">{level.icon}</span>
            <span className="text-xs font-bold">{level.label}</span>
            <span className={`text-[10px] mt-0.5 ${isActive ? "opacity-80" : "opacity-60"}`}>
              {level.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}