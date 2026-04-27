"use client";

import { Select, InputNumber } from "antd";
import {
  CATEGORIES, DIFFICULTY_CONFIG, Difficulty, LANGUAGES, QuizFormState,
} from "@/types/aiquiz";
import { useTranslations } from "next-intl";

interface SettingsCardProps {
  form: QuizFormState;
  loading: boolean;
  onUpdate: (fields: Partial<QuizFormState>) => void;
  onGenerate: () => void;
}

export default function SettingsCard({ form, loading, onUpdate, onGenerate }: SettingsCardProps) {
  const t = useTranslations("aiQuiz");

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-50 dark:border-slate-700 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 flex items-center justify-center text-base">
          ⚙️
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-white">{t("settingsTitle")}</p>
          <p className="text-[11px] text-gray-400 dark:text-slate-400">{t("settingsSub")}</p>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* Category + Language */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-1.5">
              {t("category")}
            </label>
            <Select value={form.category} onChange={(v) => onUpdate({ category: v })} className="w-full" options={CATEGORIES} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-1.5">
              {t("language")}
            </label>
            <Select value={form.language} onChange={(v) => onUpdate({ language: v })} className="w-full" options={LANGUAGES} />
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-2">
            {t("difficulty")}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(["Easy", "Medium", "Hard", "Mixed"] as Difficulty[]).map((level) => {
              const isActive = form.difficulty === level;
              return (
                <button key={level} type="button" onClick={() => onUpdate({ difficulty: level })}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all duration-150 ${
                    isActive
                      ? `${DIFFICULTY_CONFIG[level].active} border-transparent shadow-md`
                      : "bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-600"
                  }`}>
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nombre de questions */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-2">
            {t("numQuestions")}
          </label>
          <div className="flex gap-2 flex-wrap items-center">
            {[5, 10, 15, 20].map((num) => (
              <button key={num} type="button" onClick={() => onUpdate({ numQuestions: String(num) })}
                className={`w-11 h-11 rounded-xl text-xs font-bold transition-all ${
                  form.numQuestions === String(num)
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-200"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}>
                {num}
              </button>
            ))}
            <button type="button" onClick={() => onUpdate({ numQuestions: "other" })}
              className={`px-3 h-11 rounded-xl text-xs font-bold transition-all ${
                form.numQuestions === "other"
                  ? "bg-cyan-500 text-white shadow-md shadow-cyan-200"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}>
              {t("other")}
            </button>
            {form.numQuestions === "other" && (
              <InputNumber min={1}
                className="flex-1 !rounded-xl dark:!bg-slate-700 dark:!border-slate-600 dark:!text-white"
                placeholder={t("customPlaceholder")}
                onChange={(v) => onUpdate({ customQuestions: v })} />
            )}
          </div>
        </div>

        {/* Timer */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-2">
            {t("timer")}
          </label>
          <div className="flex gap-2 flex-wrap items-center">
            {[5, 10, 15].map((time) => (
              <button key={time} type="button" onClick={() => onUpdate({ timer: String(time) })}
                className={`w-11 h-11 rounded-xl text-xs font-bold transition-all ${
                  form.timer === String(time)
                    ? "bg-teal-500 text-white shadow-md shadow-teal-200"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}>
                {time}
              </button>
            ))}
            <button type="button" onClick={() => onUpdate({ timer: "other" })}
              className={`px-3 h-11 rounded-xl text-xs font-bold transition-all ${
                form.timer === "other"
                  ? "bg-teal-500 text-white shadow-md shadow-teal-200"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}>
              {t("other")}
            </button>
            {form.timer === "other" && (
              <InputNumber min={1}
                className="flex-1 !rounded-xl dark:!bg-slate-700 dark:!border-slate-600 dark:!text-white"
                placeholder={t("customPlaceholder")}
                onChange={(v) => onUpdate({ customTimer: v })} />
            )}
          </div>
        </div>

        {/* Bouton Generate */}
        <button type="button" disabled={loading} onClick={onGenerate}
          className="w-full h-12 rounded-xl mt-1 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-bold tracking-wide shadow-lg shadow-cyan-200 hover:shadow-xl hover:shadow-cyan-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              {t("generating")}
            </>
          ) : (
            <>{t("generate")}</>
          )}
        </button>
      </div>
    </div>
  );
}