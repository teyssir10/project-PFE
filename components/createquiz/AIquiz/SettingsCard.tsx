"use client";

import { Select, InputNumber } from "antd";
import {
  DIFFICULTY_CONFIG, Difficulty, QuizFormState, QuestionType,
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

  const CATEGORIES_TRANSLATED = [
    { value: "Technology", label: t("catTechnology") },
    { value: "Science",    label: t("catScience") },
    { value: "History",    label: t("catHistory") },
    { value: "Math",       label: t("catMath") },
    { value: "Custom",     label: t("catCustom") },
  ];

  const LANGUAGES_TRANSLATED = [
    { value: "English", label: t("langEnglish") },
    { value: "French",  label: t("langFrench") },
    { value: "Spanish", label: t("langSpanish") },
    { value: "Arabic",  label: t("langArabic") },
    { value: "Custom",  label: t("langCustom") },
  ];


  const QUESTION_TYPES = [
    { value: "multiple_choice", label: t("questionTypeMultiple"), desc: t("questionTypeMultipleDesc"), icon: "≡" },
    { value: "true_false",      label: t("questionTypeTrueFalse"), desc: t("questionTypeTrueFalseDesc"), icon: "⇄" },
    { value: "short_answer",    label: t("questionTypeShort"),     desc: t("questionTypeShortDesc"),     icon: "✎" },
    { value: "mixed",           label: t("questionTypeMixed"),     desc: t("questionTypeMixedDesc"),     icon: "⊞" },
  ];

  const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    Easy:   t("difficultyEasy"),
    Medium: t("difficultyMedium"),
    Hard:   t("difficultyHard"),
    Mixed:  t("difficultyMixed"),
  };

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
            <Select
              value={form.category}
              onChange={(v) => onUpdate({ category: v, customCategory: "" })}
              className="w-full"
              options={CATEGORIES_TRANSLATED}
            />
            {form.category === "Custom" && (
              <input
                type="text"
                value={form.customCategory}
                placeholder={t("customCategoryPlaceholder")}
                className="mt-2 w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white outline-none focus:border-cyan-400 transition"
                onChange={(e) => onUpdate({ customCategory: e.target.value })}
              />
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-1.5">
              {t("language")}
            </label>
            <Select
              value={form.language}
              onChange={(v) => onUpdate({ language: v, customLanguage: "" })}
              className="w-full"
              options={LANGUAGES_TRANSLATED}
            />
            {form.language === "Custom" && (
              <input
                type="text"
                value={form.customLanguage}
                placeholder={t("customLanguagePlaceholder")}
                className="mt-2 w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white outline-none focus:border-cyan-400 transition"
                onChange={(e) => onUpdate({ customLanguage: e.target.value })}
              />
            )}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-2">
            {t("difficulty")}
          </label>
          <div className="grid grid-cols-4 gap-2" dir="ltr">
            {(["Easy", "Medium", "Hard", "Mixed"] as Difficulty[]).map((level) => {
              const isActive = form.difficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onUpdate({ difficulty: level })}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all duration-150 ${
                    isActive
                      ? `${DIFFICULTY_CONFIG[level].active} border-transparent shadow-md`
                      : "bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-600"
                  }`}
                >
                  {DIFFICULTY_LABELS[level]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Type de Questions */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-2">
            {t("questionType")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {QUESTION_TYPES.map((qt) => {
              const isActive = form.questionType === qt.value;
              const isMixed  = qt.value === "mixed";
              return (
                <button
                  key={qt.value}
                  type="button"
                  onClick={() => onUpdate({ questionType: qt.value as QuestionType })}
                  className={`
                    ${isMixed ? "col-span-2" : ""}
                    flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-150
                    ${isActive
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-500 shadow-sm"
                      : "bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600"
                    }
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 font-bold transition-all
                    ${isActive
                      ? "bg-amber-100 dark:bg-amber-800/40 text-amber-600 dark:text-amber-400"
                      : "bg-gray-200 dark:bg-slate-600 text-gray-400 dark:text-slate-400"
                    }
                  `}>
                    {qt.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate transition-colors ${
                      isActive ? "text-amber-700 dark:text-amber-400" : "text-gray-600 dark:text-slate-300"
                    }`}>
                      {qt.label}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-tight mt-0.5 truncate">
                      {qt.desc}
                    </p>
                  </div>
                  <div className={`
                    w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                    ${isActive ? "border-amber-400 bg-amber-400" : "border-gray-300 dark:border-slate-500"}
                  `}>
                    {isActive && (
                      <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none">
                        <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
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
              <button
                key={num}
                type="button"
                onClick={() => onUpdate({ numQuestions: String(num) })}
                className={`w-11 h-11 rounded-xl text-xs font-bold transition-all ${
                  form.numQuestions === String(num)
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-200"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onUpdate({ numQuestions: "other" })}
              className={`px-3 h-11 rounded-xl text-xs font-bold transition-all ${
                form.numQuestions === "other"
                  ? "bg-cyan-500 text-white shadow-md shadow-cyan-200"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
            >
              {t("other")}
            </button>
            {form.numQuestions === "other" && (
              <InputNumber
                min={1}
                className="flex-1 !rounded-xl dark:!bg-slate-700 dark:!border-slate-600 dark:!text-white"
                placeholder={t("customPlaceholder")}
                onChange={(v) => onUpdate({ customQuestions: v })}
              />
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
              <button
                key={time}
                type="button"
                onClick={() => onUpdate({ timer: String(time) })}
                className={`w-11 h-11 rounded-xl text-xs font-bold transition-all ${
                  form.timer === String(time)
                    ? "bg-teal-500 text-white shadow-md shadow-teal-200"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {time}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onUpdate({ timer: "other" })}
              className={`px-3 h-11 rounded-xl text-xs font-bold transition-all ${
                form.timer === "other"
                  ? "bg-teal-500 text-white shadow-md shadow-teal-200"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
            >
              {t("other")}
            </button>
            {form.timer === "other" && (
              <InputNumber
                min={1}
                className="flex-1 !rounded-xl dark:!bg-slate-700 dark:!border-slate-600 dark:!text-white"
                placeholder={t("customPlaceholder")}
                onChange={(v) => onUpdate({ customTimer: v })}
              />
            )}
          </div>
        </div>

        {/* Bouton Generate */}
        <button
          type="button"
          disabled={loading}
          onClick={onGenerate}
          className="w-full h-12 rounded-xl mt-1 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-bold tracking-wide shadow-lg shadow-cyan-200 hover:shadow-xl hover:shadow-cyan-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
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