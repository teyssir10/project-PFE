"use client";

import { EyeOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";

interface PreviewPanelProps {
  loading: boolean;
}

export default function PreviewPanel({ loading }: PreviewPanelProps) {
  const t = useTranslations("aiQuiz");

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm min-h-[600px] flex flex-col h-full transition-colors duration-300">

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 flex items-center justify-center text-base">
            <EyeOutlined className="text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{t("previewTitle")}</p>
            <p className="text-[11px] text-gray-400 dark:text-slate-400">{t("previewSub")}</p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full font-medium border ${
          loading
            ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700"
            : "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-400 border-gray-200 dark:border-slate-600"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            loading ? "bg-amber-400 animate-pulse" : "bg-gray-300 dark:bg-slate-500"
          }`} />
          {loading ? t("statusGenerating") : t("statusWaiting")}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 overflow-y-auto">

        {/* Empty state */}
        {!loading && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/30 dark:to-teal-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center text-3xl shadow-sm">
                ✨
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 border-2 border-white dark:border-slate-800" />
            </div>
            <p className="text-gray-700 dark:text-slate-300 font-semibold text-sm mb-1">
              {t("noQuizYet")}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 max-w-xs leading-relaxed">
              {t("noQuizSub")}{" "}
              <span className="text-cyan-500 font-medium">{t("noQuizBtn")}</span>{" "}
              {t("noQuizSub2")}
            </p>

            {/* Ghost cards */}
            <div className="mt-8 w-full max-w-md space-y-3 opacity-[0.15] pointer-events-none select-none">
              {[75, 55, 85].map((w, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-left">
                  <div className="h-3 bg-gray-300 dark:bg-slate-500 rounded mb-3" style={{ width: `${w}%` }} />
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((o) => (
                      <div key={o} className="h-7 bg-gray-200 dark:bg-slate-600 rounded-lg" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-slate-600 rounded-lg" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-slate-600 rounded" />
                </div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-600 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-slate-600 rounded mb-4" />
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((o) => (
                    <div key={o} className="h-9 bg-gray-200 dark:bg-slate-600 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}