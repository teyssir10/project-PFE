"use client";

const PRESET_CATEGORIES = [
  { value: "science",  label: "🔬 Science" },
  { value: "history",  label: "📜 History" },
  { value: "tech",     label: "💻 Technology" },
  { value: "math",     label: "➗ Mathematics" },
  { value: "language", label: "🗣️ Language" },
  { value: "culture",  label: "🎨 Culture & Arts" },
  { value: "sport",    label: "⚽ Sport" },
  { value: "music",    label: "🎵 Music" },
  { value: "geo",      label: "🌍 Geography" },
  { value: "cinema",   label: "🎬 Cinema" },
];

interface CategorySelectorProps {
  category: string;
  customCategory: string;
  isCustom: boolean;
  onSelect: (v: string) => void;
  onCustomToggle: () => void;
  onCustomChange: (v: string) => void;
}

export default function CategorySelector({
  category,
  customCategory,
  isCustom,
  onSelect,
  onCustomToggle,
  onCustomChange,
}: CategorySelectorProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {PRESET_CATEGORIES.map((cat) => {
          const isActive = !isCustom && category === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onSelect(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isActive
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20"
                  : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onCustomToggle}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            isCustom
              ? "bg-violet-500 text-white border-violet-400 shadow-md shadow-violet-500/20"
              : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
          }`}
        >
          ✏️ Custom...
        </button>
      </div>

      {isCustom && (
        <input
          autoFocus
          value={customCategory}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="Type your own category..."
          className={
            "w-full p-3 rounded-xl border text-sm transition-all outline-none " +
            "bg-white border-violet-300 text-gray-900 placeholder-gray-400 " +
            "focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 " +
            "dark:bg-slate-800 dark:border-violet-500/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-violet-400"
          }
        />
      )}
    </div>
  );
}