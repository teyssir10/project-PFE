"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategorySelectorProps {
  categoryId: string | null;
  customCategory: string;
  isCustom: boolean;
  onSelect: (name: string, id: string) => void; // ← retourne nom + uuid
  onCustomToggle: () => void;
  onCustomChange: (v: string) => void;
}

export default function CategorySelector({
  categoryId,
  customCategory,
  isCustom,
  onSelect,
  onCustomToggle,
  onCustomChange,
}: CategorySelectorProps) {
  const t = useTranslations("categorySelector");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, icon")
        .order("name");
      setCategories(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-slate-500">
      <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      Chargement...
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {categories.map((cat) => {
          const isActive = !isCustom && categoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.name, cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20"
                  : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
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
          {t("custom")}
        </button>
      </div>

      {isCustom && (
        <input
          autoFocus
          value={customCategory}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder={t("customPlaceholder")}
          className="w-full p-3 rounded-xl border text-sm transition-all outline-none bg-white border-violet-300 text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 dark:bg-slate-800 dark:border-violet-500/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-violet-400"
        />
      )}
    </div>
  );
}