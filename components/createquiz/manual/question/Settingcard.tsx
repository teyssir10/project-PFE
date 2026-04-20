"use client";

import { Question } from "@/types/quiz";

interface SettingsCardProps {
  question: Question;
  onUpdate: (updated: Partial<Question>) => void;
}

const POINTS_OPTIONS = [
  { value: "No points",     label: "No points",  icon: "—",  desc: "Not graded"   },
  { value: "Standard (1x)", label: "Standard",   icon: "★",  desc: "1× points"    },
  { value: "Double (2x)",   label: "Double",     icon: "★★", desc: "2× points"    },
];

export default function SettingsCard({ question, onUpdate }: SettingsCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
      <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-4">
        Question Settings
      </h3>

      {/* Points */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-3">
          🏆 Points value
        </label>
        <div className="grid grid-cols-3 gap-2">
          {POINTS_OPTIONS.map((opt) => {
            const isActive = question.points === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate({ points: opt.value })}
                className={`flex flex-col items-center py-3 px-2 rounded-xl border transition-all duration-150 ${
                  isActive
                    ? "bg-cyan-500 text-white border-transparent shadow-md shadow-cyan-500/20"
                    : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 hover:border-cyan-300 dark:hover:border-cyan-700 hover:text-cyan-500 dark:hover:text-cyan-400"
                }`}
              >
                <span className={`text-lg mb-1 ${isActive ? "text-white" : "text-amber-400"}`}>
                  {opt.icon}
                </span>
                <span className="text-[11px] font-bold">{opt.label}</span>
                <span className={`text-[9px] mt-0.5 ${isActive ? "text-cyan-100" : "text-gray-300 dark:text-slate-600"}`}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}