"use client";

import { QuestionType, TYPE_ICONS } from "@/types/quiz";
import { useTranslations } from "next-intl";

interface TypeTabsProps {
  activeType: QuestionType;
  onChange: (type: QuestionType) => void;
}

export default function TypeTabs({ activeType, onChange }: TypeTabsProps) {
  const t = useTranslations("typeTabs");

  const TYPE_LABELS_I18N: Record<QuestionType, string> = {
    multiple: t("multiple"),
    truefalse: t("truefalse"),
    short: t("short"),
  };

  return (
    <div className="flex items-center gap-1 p-4 border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
      {(["multiple", "truefalse", "short"] as QuestionType[]).map((type) => (
        <button key={type} onClick={() => onChange(type)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeType === type
              ? "bg-cyan-500 text-white shadow-sm"
              : "text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-300"
          }`}>
          <span>{TYPE_ICONS[type]}</span>
          {TYPE_LABELS_I18N[type]}
        </button>
      ))}
    </div>
  );
}