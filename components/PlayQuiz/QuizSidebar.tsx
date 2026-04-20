"use client";

import { PlayQuestion } from "@/types/quiz";
import Image from "next/image";
import play from "@/public/play-quiz.png";

type Status = "unanswered" | "correct" | "wrong" | "skipped";

type Props = {
  questions: PlayQuestion[];
  currentIndex: number;
  statuses: Status[];
  onJump: (i: number) => void;
  answered: number;
  skipped: number;
  remaining: number;
};

const statusStyle: Record<Status, string> = {
  unanswered: "bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-500",
  correct:    "bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-transparent text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30",
  wrong:      "bg-gradient-to-br from-red-400 to-rose-500 border-2 border-transparent text-white shadow-md shadow-red-200 dark:shadow-red-900/30",
  skipped:    "bg-gradient-to-br from-amber-400 to-orange-400 border-2 border-transparent text-white shadow-md shadow-amber-200 dark:shadow-amber-900/30",
};

export default function QuizSidebar({ questions, currentIndex, statuses, onJump, answered, skipped, remaining }: Props) {
  const progress = Math.round(((answered + skipped) / questions.length) * 100);

  return (
    <div className="sticky w-56 shrink-0 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col py-6 px-5 shadow-sm">

      {/* Header */}
      <div className=" flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-lg bg-cyan-500 flex items-center justify-center text-white text-xs">📋</span>
        <p className="text-xs font-extrabold tracking-widest uppercase text-gray-500 dark:text-slate-400">
          Questions
        </p>
      </div>

      {/* Grid numéros */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 ${statusStyle[statuses[i]]} ${
              i === currentIndex ? "ring-2 ring-cyan-500 ring-offset-2 scale-110" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="space-y-2.5 mb-6">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
            <span className="text-gray-500 dark:text-slate-400 font-medium">Answered</span>
          </div>
          <span className="font-bold text-gray-700 dark:text-slate-300">{answered}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-400" />
            <span className="text-gray-500 dark:text-slate-400 font-medium">Skipped</span>
          </div>
          <span className="font-bold text-gray-700 dark:text-slate-300">{skipped}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-slate-700" />
            <span className="text-gray-500 dark:text-slate-400 font-medium">Remaining</span>
          </div>
          <span className="font-bold text-gray-700 dark:text-slate-300">{remaining}</span>
        </div>
      </div>
        <div className="absolute   py-123 pointer-events-none select-none z-10">
                        <Image
                          src={play}
                          alt="PandoMind mascot"
                          width={180}
                          height={180}
                          className="object-contain drop-shadow-xl"
                          priority
                        />
                      </div>

      {/* Progress */}
      <div className="mt-auto">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-400 dark:text-slate-500 font-medium">Progress</span>
          <span className="font-bold text-cyan-500">{progress}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}