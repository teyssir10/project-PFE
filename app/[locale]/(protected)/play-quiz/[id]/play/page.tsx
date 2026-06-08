"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getQuizWithQuestions } from "@/lib/api/quiz";
import QuizPlayer from "@/components/PlayQuiz/QuizPlayer";
import MultiplayerQuizPlayer from "@/components/PlayQuiz/MultiplayerQuizPlayer";
import { useTranslations } from "next-intl";
import { Spin } from "antd";

export default function PlayQuizPage() {
  const t = useTranslations("quizPlay");
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [blocked, setBlocked] = useState(false); 

  useEffect(() => {
    const init = async () => {
      try {
        const data = await getQuizWithQuestions(id);
        setQuiz(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, roomId]);



  if (loading) return (
    <div className="flex justify-center items-center h-screen"><Spin size="large" /></div> 
  );

  if (error || !quiz) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <p className="text-gray-500">{t("quizNotFound")}</p>
      <button onClick={() => router.back()} className="text-cyan-500 underline text-sm">
        {t("goBack")}
      </button>
    </div>
  );
  if (roomId) return <MultiplayerQuizPlayer quiz={quiz} roomId={roomId} />;
  return <QuizPlayer quiz={quiz} />;
}