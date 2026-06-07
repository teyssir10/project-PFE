"use client";

import { PlayQuestion } from "@/types/quiz";
import Image from "next/image";
import play from "@/public/play-quiz.png";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CloseOutlined, AppstoreOutlined } from "@ant-design/icons";

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

function SidebarContent({ questions, currentIndex, statuses, onJump, answered, skipped, remaining, onClose }: Props & { onClose?: () => void }) {
  const t = useTranslations("quizSidebarPlay");
  const progress = Math.round(((answered + skipped) / questions.length) * 100);

  return (
    <div className="flex flex-col h-full py-6 px-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-cyan-500 flex items-center justify-center text-white text-xs">📋</span>
          <p className="text-xs font-extrabold tracking-widest uppercase text-gray-500 dark:text-slate-400">
            {t("questions")}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">
            <CloseOutlined />
          </button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 mb-6">
        {questions.map((_, i) => (
          <button key={i} onClick={() => { onJump(i); onClose?.(); }}
            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 ${statusStyle[statuses[i]]} ${
              i === currentIndex ? "ring-2 ring-cyan-500 ring-offset-2 scale-110" : ""
            }`}>
            {i + 1}
          </button>
        ))}
      </div>

      <div className="space-y-2.5 mb-6">
        {[
          { color: "from-emerald-400 to-teal-500", label: t("answered"), value: answered },
          { color: "from-amber-400 to-orange-400", label: t("skipped"),  value: skipped  },
          { color: "bg-gray-200 dark:bg-slate-700", label: t("remaining"), value: remaining, plain: true },
        ].map(({ color, label, value, plain }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${plain ? color : `bg-gradient-to-br ${color}`}`} />
              <span className="text-gray-500 dark:text-slate-400 font-medium">{label}</span>
            </div>
            <span className="font-bold text-gray-700 dark:text-slate-300">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        {/* Mascot — just above progress bar */}
        <div className="hidden md:flex justify-center mb-1 mt-4 pointer-events-none select-none">
          <Image src={play} alt="PandoMind mascot" width={120} height={120} className="object-contain drop-shadow-xl" priority />
        </div>

        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-400 dark:text-slate-500 font-medium">{t("progress")}</span>
          <span className="font-bold text-cyan-500">{progress}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function QuizSidebar(props: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex sticky top-0 w-56 shrink-0 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex-col shadow-sm h-screen">
        <SidebarContent {...props} />
      </div>

      {/* Mobile floating button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-4 left-4 z-40 w-12 h-12 rounded-full
          bg-cyan-500 text-white shadow-lg shadow-cyan-500/30
          flex items-center justify-center hover:bg-cyan-400 active:scale-95 transition-all"
      >
        <AppstoreOutlined className="text-lg" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 shadow-2xl">
            <SidebarContent {...props} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}