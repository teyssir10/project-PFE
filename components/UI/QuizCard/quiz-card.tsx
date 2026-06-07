"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "antd";
import { supabase } from "@/lib/supabase";
import {
  PlayCircleOutlined,
  StarOutlined,
  FireOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  HeartFilled,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

export default function QuizCard({ quiz, isFavorite, onToggleFavorite, isHostMode, isOwner, onEdit, onDelete }: {
  quiz: any;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isHostMode?: boolean;
  isOwner?: boolean;
  onEdit?: (quiz: any) => void;
  onDelete?: (quiz: any) => void;
}) {
  const router = useRouter();
  const t = useTranslations("quizCard");
  if (!quiz) return null;

  const handlePlay = async () => {
    if (!isHostMode) {
      router.push(`/play-quiz/${quiz.id}/play`);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: room, error } = await supabase
      .from("rooms")
      .insert({
        code: newCode,
        host_id: user.id,
        quiz_id: quiz.id,
        room_status: "waiting",
        game_phase: "idle",
        current_question_index: 0,
      })
      .select()
      .single();

    if (error) { console.error("Erreur création room:", error.message); return; }

    await supabase.from("players").insert({
      user_id: user.id, room_id: room.id, is_ready: true, score: 0,
    });

    router.push(`/lobby/${newCode}`);
  };

  const difficultyConfig: Record<string, { color: string; bg: string; icon: string }> = {
    Easy:   { color: "text-green-600",  bg: "bg-green-50 border-green-200",   icon: "🟢" },
    Medium: { color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",   icon: "🟡" },
    Hard:   { color: "text-red-600",    bg: "bg-red-50 border-red-200",       icon: "🔴" },
    Mixed:  { color: "text-purple-600", bg: "bg-purple-50 border-purple-200", icon: "🟣" },
  };

  const questionTypeConfig: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
    multiple_choice: {
      label: "Choix multiple",
      icon:  "≡",
      color: "text-cyan-600 dark:text-cyan-400",
      bg:    "bg-cyan-50 dark:bg-cyan-900/30",
      border:"border-cyan-200 dark:border-cyan-700",
    },
    true_false: {
      label: "Vrai / Faux",
      icon:  "⇄",
      color: "text-blue-600 dark:text-blue-400",
      bg:    "bg-blue-50 dark:bg-blue-900/30",
      border:"border-blue-200 dark:border-blue-700",
    },
    short_answer: {
      label: "Réponse courte",
      icon:  "✎",
      color: "text-purple-600 dark:text-purple-400",
      bg:    "bg-purple-50 dark:bg-purple-900/30",
      border:"border-purple-200 dark:border-purple-700",
    },
    mixed: {
      label: "Mixte",
      icon:  "⊞",
      color: "text-teal-600 dark:text-teal-400",
      bg:    "bg-teal-50 dark:bg-teal-900/30",
      border:"border-teal-200 dark:border-teal-700",
    },
  };

  const diff          = difficultyConfig[quiz.difficulty ?? ""] ?? difficultyConfig["Easy"];
  const qType         = questionTypeConfig[quiz.question_type ?? "multiple_choice"] ?? questionTypeConfig["multiple_choice"];
  const questionCount = quiz.questionCount ?? quiz.question_count ?? 0;
  const categoryName  = quiz.categoryName ?? quiz.category ?? null;
  const categoryIcon  = quiz.categoryIcon ?? null;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100 group dark:bg-slate-700 dark:border-slate-600">

      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center overflow-hidden dark:from-slate-600/50 dark:to-slate-500/50">

        {quiz.cover_image ? (
          <img
            src={quiz.cover_image}
            alt={quiz.title ?? "Quiz"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
            {quiz.emoji ?? "🎯"}
          </span>
        )}

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {quiz.featured && (
            <span className="flex items-center gap-1 text-xs bg-cyan-500 text-white px-2.5 py-1 rounded-full font-semibold">
              <StarOutlined className="text-[10px]" /> {t("featured")}
            </span>
          )}
          {quiz.isNew && (
            <span className="flex items-center gap-1 text-xs bg-orange-400 text-white px-2.5 py-1 rounded-full font-semibold">
              <FireOutlined className="text-[10px]" /> {t("new")}
            </span>
          )}
        </div>

        {/* Difficulty badge — top right */}
        {quiz.difficulty && (
          <div className={`absolute top-3 right-3 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${diff.bg} ${diff.color} dark:bg-slate-600/50 dark:border-slate-500 dark:text-slate-300`}>
            {diff.icon} {quiz.difficulty}
          </div>
        )}

        {/* Source badge — bottom left */}
        {quiz.source && (
          <div className={`absolute bottom-3 left-3 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
            quiz.source === "ai"
              ? "bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
              : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-slate-600/50 dark:text-slate-300 dark:border-slate-500"
          }`}>
            {quiz.source === "ai" ? "🤖 AI Generated" : "✏️ Manual"}
          </div>
        )}

        {/* Category pill — bottom right (hidden when owner hovers) */}
        {categoryName && (
          <div className={`absolute bottom-3 right-3 transition-opacity duration-200 ${isOwner ? "group-hover:opacity-0" : ""}`}>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/20">
              {categoryIcon && <span>{categoryIcon}</span>}
              {categoryName}
            </span>
          </div>
        )}

        {/* Edit / Delete — bottom right (owner only) */}
        {isOwner && (
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(quiz); }}
              className="h-8 w-8 rounded-lg bg-white/90 dark:bg-slate-800/90 border border-gray-200 dark:border-slate-600 flex items-center justify-center text-cyan-600 hover:bg-cyan-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              title="Edit quiz"
            >
              <EditOutlined style={{ fontSize: 14 }} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(quiz); }}
              className="h-8 w-8 rounded-lg bg-white/90 dark:bg-slate-800/90 border border-gray-200 dark:border-slate-600 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              title="Delete quiz"
            >
              <DeleteOutlined style={{ fontSize: 14 }} />
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">

        {/* Question type badge only */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${qType.bg} ${qType.color} ${qType.border}`}>
            {qType.icon} {qType.label}
          </span>
        </div>

        <div className="flex items-start justify-between mt-1">
          <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 flex-1 dark:text-white">
            {quiz.title ?? "Untitled Quiz"}
          </h3>
          {isFavorite && (
            <span className="ml-2 text-xs bg-red-50 text-red-400 border border-red-200 px-2 py-0.5 rounded-full font-semibold flex-shrink-0 dark:bg-slate-600/50 dark:text-white dark:border-white">
              ❤️ {t("saved")}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-400 mt-1">{t("by")} {quiz.creator}</p>

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span>📝 {t("questions", { count: quiz.questionCount ?? 10 })}</span>
          <span><ClockCircleOutlined /> {t("duration", { min: quiz.duration ?? 15 })}</span>
          <span>👥 {t("played", { count: quiz.players ?? 0 })}</span>
        </div>

        <div className="border-t border-gray-100 my-3" />

        <div className="flex gap-2">
          <Button
            icon={<PlayCircleOutlined />}
            block
            onClick={handlePlay}
            className="!h-10 !rounded-xl !bg-gradient-to-r !from-cyan-500 !to-teal-400 !text-white !border-0 !font-semibold hover:!opacity-90 !shadow-md !shadow-cyan-200"
          >
            {isHostMode ? t("createRoom") : t("playNow")}
          </Button>
          <button
            onClick={() => onToggleFavorite(quiz.id)}
            className={`h-10 w-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-105
              ${isFavorite
                ? "border-red-300 bg-red-50 text-red-500"
                : "border-gray-200 bg-white text-gray-400 hover:border-red-300 hover:text-red-400"}
              dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:border-red-300 dark:hover:text-red-400`}
          >
            {isFavorite ? <HeartFilled /> : <HeartOutlined />}
          </button>
        </div>
      </div>
    </div>
  );
}