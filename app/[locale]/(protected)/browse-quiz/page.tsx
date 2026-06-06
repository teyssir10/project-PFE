"use client";

import React, { useState, useEffect } from "react";
import QuizCard from "@/components/UI/QuizCard/quiz-card";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { fetchQuizzes, deleteQuiz } from "@/lib/api/quiz";
import { fetchFavorites, addFavorite, removeFavorite } from "@/lib/api/favorites";
import { useAuth } from "@/lib/auth";
import { Modal, Spin, message } from "antd";
import { useTranslations, useLocale } from "next-intl";
import { useQuizModeStore } from "@/store/useQuizModeStore";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function QuizPage() {
  const t = useTranslations("browsePage");
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();
  const { setMode } = useQuizModeStore();

  const [search, setSearch]                     = useState("");
  const [tab, setTab]                           = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories]             = useState<Category[]>([]);
  const [quizzes, setQuizzes]                   = useState<any[]>([]);
  const [favorites, setFavorites]               = useState<string[]>([]);
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>([]);
  const [loading, setLoading]                   = useState(true);
  const searchParams = useSearchParams();
  const isHostMode = searchParams.get("mode") === "host";

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingQuiz, setDeletingQuiz]       = useState<any>(null);
  const [deleteLoading, setDeleteLoading]     = useState(false);

  const tabs = [
    { key: "all",       label: t("tabAll") },
    { key: "community", label: t("tabCommunity") },
    { key: "my",        label: t("tabMy") },
    { key: "favorites", label: t("tabFavorites") },
    { key: "recently",  label: t("tabRecently") },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [quizzesData, { data: catsData }] = await Promise.all([
          fetchQuizzes(),
          supabase.from("categories").select("id, name, icon").order("name"),
        ]);

        setQuizzes(quizzesData);
        setCategories(catsData ?? []);

        if (user) {
          const favs = await fetchFavorites(user.id);
          setFavorites(favs);

          const { data: historyData } = await supabase
            .from("quiz_history")
            .select("quiz_id")
            .eq("user_id", user.id)
            .order("played_at", { ascending: false });

          if (historyData) {
            const ids = [...new Set(historyData.map((p: any) => p.quiz_id))] as string[];
            setRecentlyPlayedIds(ids);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const toggleFavorite = async (id: string) => {
    try {
      if (favorites.includes(id)) {
        await removeFavorite(id);
        setFavorites((prev) => prev.filter((f) => f !== id));
      } else {
        await addFavorite(id);
        setFavorites((prev) => [...prev, id]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (quiz: any) => {
    setMode("manual");
    router.push(`/${locale}/create-quiz?edit=${quiz.id}`);
  };

  const handleOpenDelete = (quiz: any) => {
    setDeletingQuiz(quiz);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingQuiz) return;
    setDeleteLoading(true);
    try {
      await deleteQuiz(deletingQuiz.id);
      setQuizzes((prev) => prev.filter((q) => q.id !== deletingQuiz.id));
      message.success("Quiz deleted successfully");
      setDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
      message.error("Failed to delete quiz");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = quizzes.filter((q) => {
    if (!q) return false;
    const searchLower = search.toLowerCase();
    const matchTitle    = (q.title ?? "").toLowerCase().includes(searchLower);
    const catName       = categories.find((c) => c.id === q.category_id)?.name ?? "";
    const matchCatText  = catName.toLowerCase().includes(searchLower);
    const matchSearch   = matchTitle || matchCatText;
    const matchCategory = !selectedCategory || q.category_id === selectedCategory;

    if (!matchSearch || !matchCategory) return false;
    if (tab === "all")       return true;
    if (tab === "community") return q.creator_id !== user?.id;
    if (tab === "my")        return q.creator_id === user?.id;
    if (tab === "favorites") return favorites.includes(q.id);
    if (tab === "recently")  return recentlyPlayedIds.includes(q.id);
    return true;
  });

  // Count per category (for the active tab/search, ignoring category filter)
  const countByCategory = (catId: string) =>
    quizzes.filter((q) => {
      if (!q) return false;
      const _sl = search.toLowerCase(); const _cn = categories.find((c) => c.id === q.category_id)?.name ?? ""; const matchSearch = (q.title ?? "").toLowerCase().includes(_sl) || _cn.toLowerCase().includes(_sl);
      if (!matchSearch) return false;
      if (tab === "all")       return q.category_id === catId;
      if (tab === "community") return q.category_id === catId && q.creator_id !== user?.id;
      if (tab === "my")        return q.category_id === catId && q.creator_id === user?.id;
      if (tab === "favorites") return q.category_id === catId && favorites.includes(q.id);
      if (tab === "recently")  return q.category_id === catId && recentlyPlayedIds.includes(q.id);
      return false;
    }).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* Search */}
      <div className="flex items-center gap-2 w-full px-4 py-2 rounded-2xl
        bg-white/70 dark:bg-slate-800/70 backdrop-blur-md
        border border-gray-200 dark:border-slate-700
        shadow-sm focus-within:ring-2 focus-within:ring-cyan-400 transition-all">
        <SearchOutlined className="text-gray-400 text-lg" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="bg-transparent outline-none w-full text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 sm:gap-6 border-b border-gray-200 dark:border-slate-700 overflow-x-auto pb-px scrollbar-hide">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`pb-2 text-sm font-medium whitespace-nowrap transition ${
              tab === item.key
                ? "text-cyan-500 border-b-2 border-cyan-500"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t("showing")}{" "}
        <span className="font-bold text-cyan-900 dark:text-white">
          {filtered.length} {t("quizzes")}
        </span>
        {selectedCategory && (
          <span className="ml-2 text-xs text-cyan-500 font-medium">
            — {categories.find((c) => c.id === selectedCategory)?.icon}{" "}
            {categories.find((c) => c.id === selectedCategory)?.name}
            <button
              onClick={() => setSelectedCategory(null)}
              className="ml-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </span>
        )}
      </p>

      {/* Banner */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-500 text-white p-5 sm:p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">{t("bannerTitle")}</h2>
          <p className="text-sm opacity-80">{t("bannerSub")}</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => { setMode("ai"); router.push(`/${locale}/create-quiz`); }}
            className="text-white px-4 py-2 rounded-lg font-semibold border border-white hover:bg-white/10 transition text-sm">
            {t("aiGenerate")}
          </button>
          <button
            onClick={() => { setMode("manual"); router.push(`/${locale}/create-quiz`); }}
            className="border border-white px-4 py-2 rounded-lg hover:bg-white/10 transition text-sm">
            {t("manual")}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">
            {selectedCategory ? "🏷️" : tab === "favorites" ? "❤️" : tab === "recently" ? "🕐" : "🔍"}
          </p>
          <p className="text-gray-500 font-medium">
            {selectedCategory
              ? `Aucun quiz dans cette catégorie`
              : tab === "favorites" ? t("emptyFavTitle")
              : tab === "recently"  ? "Aucun quiz joué récemment"
              : t("emptySearchTitle")}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {selectedCategory
              ? <button onClick={() => setSelectedCategory(null)} className="text-cyan-500 hover:underline">Voir tous les quiz</button>
              : tab === "favorites" ? t("emptyFavSub")
              : tab === "recently"  ? "Jouez des quiz pour les retrouver ici"
              : t("emptySearchSub")}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={{
                ...quiz,
                creator: quiz.creator_name,
                questionCount: quiz.question_count,
                categoryName: categories.find((c) => c.id === quiz.category_id)?.name ?? quiz.category ?? null,
                categoryIcon: categories.find((c) => c.id === quiz.category_id)?.icon ?? null,
              }}
              isFavorite={favorites.includes(quiz.id)}
              onToggleFavorite={toggleFavorite}
              isHostMode={isHostMode}
              isOwner={quiz.creator_id === user?.id}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={handleConfirmDelete}
        okText="Delete"
        cancelText="Cancel"
        confirmLoading={deleteLoading}
        okButtonProps={{ danger: true }}
        title="🗑️ Delete quiz"
      >
        <p className="text-gray-500 mt-2">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-800 dark:text-white">
            {deletingQuiz?.title}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}