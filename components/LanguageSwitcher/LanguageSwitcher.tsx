"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const languages = [
  { code: "fr", short: "FR", label: "Français", flag: "🇫🇷" },
  { code: "en", short: "EN", label: "English", flag: "🇬🇧" },
  { code: "ar", short: "AR", label: "العربية", flag: "🇸🇦" },
];

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLanguage = (newLocale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
    setOpen(false);
  };

  const current = languages.find((l) => l.code === currentLocale);

  return (
    <div className="relative" ref={ref}>
      
      {/* Bouton compact */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-full
        border border-gray-200 dark:border-gray-700
        bg-white dark:bg-slate-800
        text-xs font-semibold text-gray-700 dark:text-white
        hover:border-cyan-400 transition-all duration-200"
      >
        <span>{current?.short}</span>
        <span className="text-[10px] text-gray-400">{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-xl shadow-lg
          bg-white dark:bg-slate-800
          border border-gray-100 dark:border-gray-700
          overflow-hidden z-50"
        >
          {languages.map(({ code, label, flag }) => (
            <button
              key={code}
              onClick={() => switchLanguage(code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5
              text-sm transition-colors duration-150
              ${
                currentLocale === code
                  ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 font-semibold"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              <span>{flag}</span>
              <span>{label}</span>

              {currentLocale === code && (
                <span className="ml-auto text-cyan-500">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}