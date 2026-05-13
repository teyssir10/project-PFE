"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
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

export default function QuizCard({
  quiz,
  isFavorite,
  onToggleFavorite,
  isOwner,
  onEdit,
  onDelete,
}: {
  quiz: any;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isOwner?: boolean;
  onEdit?: (quiz: any) => void;
  onDelete?: (quiz: any) => void;
}) {
  const router = useRouter();

  if (!quiz) return null;

  const difficultyConfig: Record<string, { color: string; bg: string; icon: string }> = {
    Easy:   { color: "text-green-600",  bg: "bg-green-50 border-green-200",   icon: "🟢" },
    Medium: { color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",   icon: "🟡" },
    Hard:   { color: "text-red-600",    bg: "bg-red-50 border-red-200",       icon: "🔴" },
    Mixed:  { color: "text-purple-600", bg: "bg-purple-50 border-purple-200", icon: "🟣" },
  };

  const diff = difficultyConfig[quiz.difficulty ?? ""] ?? difficultyConfig["Easy"];
  const questionCount = quiz.questionCount ?? quiz.question_count ?? 0;
  const minutes = Math.ceil((quiz.time_per_question ?? 30) * questionCount / 60);

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
              <StarOutlined className="text-[10px]" /> Featured
            </span>
          )}
          {quiz.isNew && (
            <span className="flex items-center gap-1 text-xs bg-orange-400 text-white px-2.5 py-1 rounded-full font-semibold">
              <FireOutlined className="text-[10px]" /> New
            </span>
          )}
        </div>

        {/* Difficulty badge */}
        {quiz.difficulty && (
          <div className={`absolute top-3 right-3 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${diff.bg} ${diff.color} dark:bg-slate-600/50 dark:border-slate-500 dark:text-slate-300`}>
            {diff.icon} {quiz.difficulty}
          </div>
        )}

        {/* Source badge — AI ou Manual */}
        {quiz.source && (
          <div className={`absolute bottom-3 left-3 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
            quiz.source === "ai"
              ? "bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
              : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-slate-600/50 dark:text-slate-300 dark:border-slate-500"
          }`}>
            {quiz.source === "ai" ? "🤖 AI Generated" : "✏️ Manual"}
          </div>
        )}

        {/* Edit / Delete — owner only, visible on hover */}
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
        {quiz.category && (
          <span className="text-xs text-cyan-500 font-semibold uppercase tracking-wide">
            {quiz.category}
          </span>
        )}

        <div className="flex items-start justify-between mt-1">
          <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 flex-1 dark:text-white">
            {quiz.title ?? "Untitled Quiz"}
          </h3>
          {isFavorite && (
            <span className="ml-2 text-xs bg-red-50 text-red-400 border border-red-200 px-2 py-0.5 rounded-full font-semibold flex-shrink-0 dark:bg-slate-600/50 dark:text-white dark:border-white">
              ❤️ Saved
            </span>
          )}
        </div>

        <p className="text-sm text-gray-400 mt-1">by {quiz.creator ?? "Unknown"}</p>

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span>📝 {questionCount} questions</span>
          <span><ClockCircleOutlined /> {minutes} min</span>
          <span>👥 {quiz.players ?? 0} played</span>
        </div>

        <div className="border-t border-gray-100 my-3" />

        <div className="flex gap-2">
          <Button
            icon={<PlayCircleOutlined />}
            block
            onClick={() => router.push(`/play-quiz/${quiz.id}/play`)}
            className="!h-10 !rounded-xl !bg-gradient-to-r !from-cyan-500 !to-teal-400 !text-white !border-0 !font-semibold hover:!opacity-90 !shadow-md !shadow-cyan-200"
          >
            Play now
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