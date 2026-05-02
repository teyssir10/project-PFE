"use client";
import React from "react";
import { useRouter } from "next/navigation"; 
import { Button } from "antd";
import { supabase } from "@/lib/supabase";
import { PlayCircleOutlined, StarOutlined, FireOutlined, ClockCircleOutlined, HeartOutlined, HeartFilled } from "@ant-design/icons";

export default function QuizCard({ quiz, isFavorite, onToggleFavorite, isHostMode }: {
  quiz: any;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isHostMode?: boolean;
}) {
  const router = useRouter();

  const handlePlay = async () => {
    if (!isHostMode) {
      router.push(`/play-quiz/${quiz.id}/play`)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { error } = await supabase.from('rooms').insert({
      code: newCode,
      host_id: user.id,
      quiz_id: quiz.id,
      status: 'waiting',
    })

    if (error) {
      console.error('Erreur création room:', error.message)
      return
    }

    router.push(`/room/${newCode}`)  // ← redirige vers la lobby
  }
  

  const difficultyConfig: Record<string, { color: string; bg: string; icon: string }> = {
    Easy:   { color: "text-green-600", bg: "bg-green-50 border-green-200", icon: "🟢" },
    Medium: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: "🟡" },
    Hard:   { color: "text-red-600",   bg: "bg-red-50 border-red-200",     icon: "🔴" },
  };

  const diff = difficultyConfig[quiz.difficulty] || difficultyConfig["Easy"];

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100 group dark:bg-slate-700 dark:border-slate-600">

      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center overflow-hidden dark:from-slate-600/50 dark:to-slate-500/50">

  {quiz.cover_image ? (
    <img
      src={quiz.cover_image}
      alt={quiz.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  ) : (
    <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
      {quiz.emoji || "🎯"}
    </span>
  )}

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

        <div className={`absolute top-3 right-3 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${diff.bg} ${diff.color} dark:bg-slate-600/50 dark:border-slate-500 dark:text-slate-300`}>
          {diff.icon} {quiz.difficulty}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {quiz.category && (
          <span className="text-xs text-cyan-500 font-semibold uppercase tracking-wide">
            {quiz.category}
          </span>
        )}

        <div className="flex items-start justify-between mt-1">
          <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 flex-1 dark:text-white">
            {quiz.title}
          </h3>
          {isFavorite && (
            <span className="ml-2 text-xs bg-red-50 text-red-400 border border-red-200 px-2 py-0.5 rounded-full font-semibold flex-shrink-0 dark:bg-slate-600/50 dark:text-white dark:border-white">
              ❤️ Saved
            </span>
          )}
        </div>

        <p className="text-sm text-gray-400 mt-1">by {quiz.creator}</p>

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span>📝 {quiz.questionCount || 10} questions</span>
          <span><ClockCircleOutlined /> {quiz.duration || 15} min</span>
          <span>👥 {quiz.players || 0} played</span>
        </div>

        <div className="border-t border-gray-100 my-3" />

        <div className="flex gap-2">
          <Button
            icon={<PlayCircleOutlined />}
            block
            onClick={handlePlay}
            className="!h-10 !rounded-xl !bg-gradient-to-r !from-cyan-500 !to-teal-400 !text-white !border-0 !font-semibold hover:!opacity-90 !shadow-md !shadow-cyan-200"
          >
          {isHostMode ? 'Create a room' : 'Play now'}
          </Button>
          <button
            onClick={() => onToggleFavorite(quiz.id)}
            className={`h-10 w-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-105
              ${isFavorite ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 bg-white text-gray-400 hover:border-red-300 hover:text-red-400'} dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:border-red-300 dark:hover:text-red-400`}
          > 
          {isFavorite ? <HeartFilled /> : <HeartOutlined />} 
          </button>
        </div>
      </div>
    </div>
  );
}