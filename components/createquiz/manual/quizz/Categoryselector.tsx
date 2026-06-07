"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface Category {
  id: string;
  name: string;
  name_en: string | null;
  name_fr: string | null;
  name_ar: string | null;
  icon: string;
}

interface CategorySelectorProps {
  categoryId: string | null;
  customCategory: string;
  isCustom: boolean;
  onSelect: (name: string, id: string) => void;
  onCustomToggle: () => void;
  onCustomChange: (v: string) => void;
  onCustomSaved?: (name: string, id: string) => void;
}

export default function CategorySelector({
  categoryId,
  customCategory,
  isCustom,
  onSelect,
  onCustomToggle,
  onCustomChange,
  onCustomSaved,
}: CategorySelectorProps) {
  const t      = useTranslations("categorySelector");
  const locale = useLocale();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [savedMsg, setSavedMsg]     = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, name_en, name_fr, name_ar, icon")
        .order("name");
      setCategories(data ?? []);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  // ✅ Retourne le nom traduit selon la locale active
  const getLocalizedName = (cat: Category): string => {
    if (locale === "ar" && cat.name_ar) return cat.name_ar;
    if (locale === "fr" && cat.name_fr) return cat.name_fr;
    if (locale === "en" && cat.name_en) return cat.name_en;
    // fallback : essaie les autres langues puis le nom par défaut
    return cat.name_en ?? cat.name_fr ?? cat.name_ar ?? cat.name;
  };

  const handleConfirmCustom = async () => {
    const trimmed = customCategory.trim();
    if (!trimmed) return;

    setSaving(true);
    setSavedMsg(null);
    try {
      const { data: existing } = await supabase
        .from("categories")
        .select("id, name, name_en, name_fr, name_ar, icon")
        .ilike("name", trimmed)
        .maybeSingle();

      if (existing) {
        setCategories((prev) =>
          prev.find((c) => c.id === existing.id) ? prev : [...prev, existing]
        );
        onCustomSaved?.(existing.name, existing.id);
        setSavedMsg(`"${getLocalizedName(existing)}" ${t("alreadyExists")}`);
      } else {
        const { data: inserted, error } = await supabase
          .from("categories")
          .insert({ name: trimmed, icon: "🏷️" })
          .select("id, name, name_en, name_fr, name_ar, icon")
          .single();

        if (error) throw error;

        setCategories((prev) =>
          [...prev, inserted].sort((a, b) => a.name.localeCompare(b.name))
        );
        onCustomSaved?.(inserted.name, inserted.id);
        setSavedMsg(`"${inserted.name}" ${t("added")}`);
      }
    } catch (err) {
      console.error("Category save error:", err);
      setSavedMsg(t("errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-slate-500">
        <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        {t("loading")}
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
              {getLocalizedName(cat)}
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
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              autoFocus
              value={customCategory}
              onChange={(e) => onCustomChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmCustom()}
              placeholder={t("customPlaceholder")}
              className="flex-1 p-3 rounded-xl border text-sm transition-all outline-none bg-white border-violet-300 text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 dark:bg-slate-800 dark:border-violet-500/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-violet-400"
            />
            <button
              type="button"
              disabled={!customCategory.trim() || saving}
              onClick={handleConfirmCustom}
              className="px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-violet-500/20 whitespace-nowrap"
            >
              {saving ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t("saving")}
                </span>
              ) : (
                t("confirm")
              )}
            </button>
          </div>

          {savedMsg && (
            <p className={`text-xs font-medium ${
              savedMsg.includes("Error") || savedMsg.includes("خطأ")
                ? "text-red-500"
                : "text-violet-500 dark:text-violet-400"
            }`}>
              {savedMsg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}