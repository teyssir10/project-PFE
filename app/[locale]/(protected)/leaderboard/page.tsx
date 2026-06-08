"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { getLeaderboard, LeaderboardUser } from "@/lib/api/leaderboard";
import { useAuth } from "@/lib/auth";
import { FilterType } from "@/components/leaderboard/helpers";
import LeaderboardPodium from "@/components/leaderboard/Leaderboardpodium";
import LeaderboardTable, { LeaderboardHeader } from "@/components/leaderboard/Leaderboardtable";

export default function LeaderboardPage() {
  const t = useTranslations("leaderboard");
  const { user: authUser } = useAuth();

  const [users, setUsers]                 = useState<LeaderboardUser[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(false);
  const [filter, setFilter]               = useState<FilterType>("score");
  const [search, setSearch]               = useState("");
  const [countryFilter, setCountryFilter] = useState("all");

  useEffect(() => {
    getLeaderboard()
      .then(setUsers)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => [...users].sort((a, b) => {
    if (filter === "accuracy") return (b.accuracy ?? 0) - (a.accuracy ?? 0);
    if (filter === "quizzes")  return (b.quizzes_played ?? 0) - (a.quizzes_played ?? 0);
    return (b.total_score ?? 0) - (a.total_score ?? 0);
  }), [users, filter]);

  const countries = useMemo(() => {
    const set = new Set(users.map((u) => u.country).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [users]);

  const filtered = useMemo(() => sorted.filter((u) => {
    const name = `${u.firstname ?? ""} ${u.lastname ?? ""}`.toLowerCase();
    const matchSearch  = !search || name.includes(search.toLowerCase());
    const matchCountry = countryFilter === "all" || u.country === countryFilter;
    return matchSearch && matchCountry;
  }), [sorted, search, countryFilter]);

  const top3     = filtered.slice(0, 3);
  const top10    = filtered.slice(0, 10);
  const top10Ids = useMemo(() => new Set(top10.map((u) => u.id)), [top10]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-gray-400 dark:text-slate-500 animate-pulse">{t("loading")}</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <p className="text-4xl">😕</p>
        <p className="text-sm text-red-500 dark:text-red-400">{t("error")}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="w-full px-4 py-8 md:px-10 lg:px-14">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">🏆</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {t("title")}
            </h1>
          </div>
          <p className="text-sm text-gray-400 dark:text-slate-500 ml-12">{t("subtitle")}</p>
        </div>

        {/* ── TABS + FILTRES PAYS EN HAUT ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-10">

          <div className="inline-flex gap-1 p-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm">
            {(["score", "accuracy", "quizzes"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  filter === f
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                {t(`filter_${f}`)}
              </button>
            ))}
          </div>

          {/* Séparateur */}
          <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-slate-700" />

          {/* Filtre Pays */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl cursor-pointer
              bg-white dark:bg-slate-900
              border border-gray-200 dark:border-slate-700
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-cyan-500
              transition-all duration-200 shadow-sm"
          >
            <option value="all">🌍 {t("all_countries")}</option>
            {countries.map((c) => (
              <option key={c} value={c}>🏳️ {c}</option>
            ))}
          </select>

          {/* Badge reset si filtre actif */}
          {countryFilter !== "all" && (
            <button
              onClick={() => setCountryFilter("all")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                bg-cyan-50 dark:bg-cyan-900/20
                text-cyan-600 dark:text-cyan-400
                border border-cyan-200 dark:border-cyan-800
                hover:bg-cyan-100 dark:hover:bg-cyan-900/40
                transition-all"
            >
              {countryFilter} ✕
            </button>
          )}
        </div>

        {/* Podium */}
        {top3.length === 3 && <LeaderboardPodium top3={top3} filter={filter} />}

        {/* Top 10 */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-cyan-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{t("top10_title")}</h2>
            </div>
            <span className="text-xs text-gray-400 dark:text-slate-500 tabular-nums">
              {t("showing_results", { count: filtered.length })}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <LeaderboardHeader filter={filter} />
            <LeaderboardTable
              users={top10}
              sorted={filtered}
              top10Ids={top10Ids}
              filter={filter}
              currentUserId={authUser?.id}
              isTop10Section={true}
            />
          </div>
        </section>

        {/* Recherche par nom — reste en bas */}
        <div className="relative group mb-3">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-cyan-500 transition-colors"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_placeholder")}
            className="w-full pl-10 pr-8 py-2.5 text-sm rounded-xl
              bg-white dark:bg-slate-900
              border border-gray-200 dark:border-slate-700
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-cyan-500
              transition-all duration-200"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400 dark:text-slate-600 mb-3 tabular-nums">
          {t("showing_results", { count: filtered.length })}
        </p>

        {/* Classement complet */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <LeaderboardHeader filter={filter} />
          <LeaderboardTable
            users={filtered}
            sorted={filtered}
            top10Ids={top10Ids}
            filter={filter}
            currentUserId={authUser?.id}
            isTop10Section={false}
          />
        </div>

        <div className="h-12" />
      </div>
    </div>
  );
}