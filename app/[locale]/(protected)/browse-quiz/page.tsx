"use client";

import React, { useState, useEffect } from "react";
import QuizCard from "@/components/UI/QuizCard/quiz-card";
import { SearchOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { fetchQuizzes, deleteQuiz } from "@/lib/api/quiz";
import { fetchFavorites, addFavorite, removeFavorite } from "@/lib/api/favorites";
import { useAuth } from "@/lib/auth";
import { Modal, Spin, App } from "antd";
import { useTranslations, useLocale } from "next-intl";
import { useQuizModeStore } from "@/store/useQuizModeStore";
import { supabase } from "@/lib/supabase";

const ITEMS_PER_PAGE = 9;

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function QuizPage() {
  const { message } = App.useApp();
  const t = useTranslations("browsePage");
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();
  const { setMode } = useQuizModeStore();

  const [search, setSearch]                       = useState("");
  const [tab, setTab]                             = useState("all");
  const [selectedCategory, setSelectedCategory]   = useState<string | null>(null);
  const [categories, setCategories]               = useState<Category[]>([]);
  const [quizzes, setQuizzes]                     = useState<any[]>([]);
  const [favorites, setFavorites]                 = useState<string[]>([]);
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>([]);
  const [loading, setLoading]                     = useState(true);
  const [currentPage, setCurrentPage]             = useState(1);
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
            .from("quiz_history").select("quiz_id").eq("user_id", user.id)
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

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [search, tab, selectedCategory]);

  const toggleFavorite = async (id: string) => {
    try {
      if (favorites.includes(id)) {
        await removeFavorite(id);
        setFavorites((prev) => prev.filter((f) => f !== id));
      } else {
        await addFavorite(id);
        setFavorites((prev) => [...prev, id]);
      }
    } catch (err) { console.error(err); }
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
    const searchLower  = search.toLowerCase();
    const catName      = categories.find((c) => c.id === q.category_id)?.name ?? "";
    const matchSearch  = (q.title ?? "").toLowerCase().includes(searchLower) || catName.toLowerCase().includes(searchLower);
    const matchCategory = !selectedCategory || q.category_id === selectedCategory;
    if (!matchSearch || !matchCategory) return false;
    if (tab === "all")       return true;
    if (tab === "community") return q.creator_id !== user?.id;
    if (tab === "my")        return q.creator_id === user?.id;
    if (tab === "favorites") return favorites.includes(q.id);
    if (tab === "recently")  return recentlyPlayedIds.includes(q.id);
    return true;
  });

  // ── Pagination ──────────────────────────────────────────────────────────────
  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated   = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

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
          <button key={item.key} onClick={() => setTab(item.key)}
            className={`pb-2 text-sm font-medium whitespace-nowrap transition ${
              tab === item.key ? "text-cyan-500 border-b-2 border-cyan-500" : "text-gray-500 dark:text-gray-400"
            }`}>
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
            <button onClick={() => setSelectedCategory(null)} className="ml-1.5 text-gray-400 hover:text-gray-600">✕</button>
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
          <button onClick={() => { setMode("ai"); router.push(`/${locale}/create-quiz`); }}
            className="text-white px-4 py-2 rounded-lg font-semibold border border-white hover:bg-white/10 transition text-sm">
            {t("aiGenerate")}
          </button>
          <button onClick={() => { setMode("manual"); router.push(`/${locale}/create-quiz`); }}
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
            {selectedCategory ? "Aucun quiz dans cette catégorie"
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
        <>
          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {paginated.map((quiz) => (
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

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 pb-2">
              {/* Prev */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-xl flex items-center justify-center
                  border border-gray-200 dark:border-slate-700
                  text-gray-500 dark:text-slate-400
                  hover:border-cyan-400 hover:text-cyan-500
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all"
              >
                <LeftOutlined className="text-xs" />
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((page, i) =>
                page === "..." ? (
                  <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page as number)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      currentPage === page
                        ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
                        : "border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-cyan-400 hover:text-cyan-500"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-xl flex items-center justify-center
                  border border-gray-200 dark:border-slate-700
                  text-gray-500 dark:text-slate-400
                  hover:border-cyan-400 hover:text-cyan-500
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all"
              >
                <RightOutlined className="text-xs" />
              </button>

              {/* Page info */}
              <span className="text-xs text-gray-400 dark:text-slate-500 ml-2">
                {currentPage} / {totalPages}
              </span>
            </div>
          )}
        </>
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
          <span className="font-semibold text-gray-800 dark:text-white">{deletingQuiz?.title}</span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}