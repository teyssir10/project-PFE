"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getQuizWithQuestions } from "@/lib/api/quiz";
import QuizPlayer from "@/components/PlayQuiz/QuizPlayer";
import { useTranslations } from "next-intl";

export default function PlayQuizPage() {
  const t = useTranslations("quizPlay");
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getQuizWithQuestions(id)
      .then(setQuiz)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-950">
      <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !quiz) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <p className="text-gray-500">{t("quizNotFound")}</p>
      <button onClick={() => router.back()} className="text-cyan-500 underline text-sm">
        {t("goBack")}
      </button>
    </div>
  );

  return <QuizPlayer quiz={quiz} />;
}