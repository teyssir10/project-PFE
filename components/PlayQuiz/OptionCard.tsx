"use client";

type State = "default" | "correct" | "wrong";

type Props = {
  label: string;
  text: string;
  state: State;
  onClick: () => void;
  disabled: boolean;
};

const stateStyles: Record<State, { card: string; label: string; icon?: string }> = {
  default: {
    card:  "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-cyan-400 hover:shadow-md hover:shadow-cyan-100 dark:hover:shadow-cyan-900/20 hover:-translate-y-0.5",
    label: "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 group-hover:bg-cyan-500 group-hover:text-white",
  },
  correct: {
    card:  "border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-md shadow-emerald-100 dark:shadow-emerald-900/20",
    label: "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm",
    icon:  "✓",
  },
  wrong: {
    card:  "border-red-400 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 shadow-md shadow-red-100 dark:shadow-red-900/20",
    label: "bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-sm",
    icon:  "✗",
  },
};

export default function OptionCard({ label, text, state, onClick, disabled }: Props) {
  const s = stateStyles[state];

  const handleClick = () => {
    // ✅ Double protection — bloque le clic si disabled, peu importe le DOM
    if (disabled) return;
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200
        ${s.card}
        ${disabled && state === "default" ? "opacity-40 pointer-events-none" : ""}
        ${disabled && state !== "default" ? "pointer-events-none" : ""}
        ${!disabled ? "cursor-pointer" : "cursor-default"}
      `}
    >
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-200 ${s.label}`}>
        {s.icon ?? label}
      </span>

      <span className="text-sm font-semibold text-gray-800 dark:text-slate-200 flex-1">
        {text}
      </span>

      {s.icon && (
        <span className={`text-lg font-bold ${state === "correct" ? "text-emerald-500" : "text-red-400"}`}>
          {s.icon}
        </span>
      )}
    </div>
  );
}