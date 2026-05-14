"use client";

import { InputNumber } from "antd";
import { useTranslations } from "next-intl";

interface TimerSelectorProps {
  value: string;
  isCustom: boolean;
  onSelect: (v: string) => void;
  onCustomToggle: () => void;
  onCustomChange: (v: string) => void;
}

const PRESETS = [10, 20, 30, 45, 60];

export default function TimerSelector({ value, isCustom, onSelect, onCustomToggle, onCustomChange }: TimerSelectorProps) {
  const t = useTranslations("timer");

  const btnIdle =
    "bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200 hover:text-gray-800 " +
    "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((time) => (
          <button key={time} type="button" onClick={() => onSelect(String(time))}
            className={`px-3 h-10 rounded-xl text-sm font-bold transition-all border ${
              !isCustom && value === String(time)
                ? "bg-teal-500 text-white border-transparent shadow-md shadow-teal-500/20"
                : btnIdle
            }`}>
            {time}s
          </button>
        ))}
        <button type="button" onClick={onCustomToggle}
          className={`px-3 h-10 rounded-xl text-sm font-bold transition-all border ${
            isCustom ? "bg-teal-500 text-white border-transparent shadow-md shadow-teal-500/20" : btnIdle
          }`}>
          {t("custom")}
        </button>
      </div>

      {isCustom && (
        <div className="flex items-center gap-2">
          <InputNumber min={1} max={300}
            className="flex-1 !rounded-xl dark:!bg-slate-800 dark:!border-slate-600 dark:!text-white"
            placeholder={t("placeholder")}
            onChange={(v) => onCustomChange(v ? String(v) : "")} />
          <span className="text-xs text-gray-400 dark:text-slate-500 font-medium shrink-0">{t("seconds")}</span>
        </div>
      )}

      <p className="text-[10px] text-gray-400 dark:text-slate-500">
        {t("currently")} <span className="font-bold text-teal-500">{value}{t("perQuestion")}</span>
      </p>
    </div>
  );
}