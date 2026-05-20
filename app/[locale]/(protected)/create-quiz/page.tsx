"use client";
import AIQuiz from "@/app/[locale]/(protected)/create-quiz/aiQuiz/page";
import Question from "@/app/[locale]/(protected)/create-quiz/manuelQuiz/Quiz/page";

import { useQuizModeStore } from "@/store/useQuizModeStore";

export default function CreateQuizPage() {
  const { mode } = useQuizModeStore();
  return (
    <div className="py-4 mb-2 gap-2">
      <div>{mode === "ai" ? <AIQuiz /> : <Question />}</div>
    </div>
  );
}
