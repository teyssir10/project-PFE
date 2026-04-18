/*import { useState } from "react";
import { Question } from "@/types/quiz";

const defaultQuestion = (): Question => ({
  id: crypto.randomUUID(),
  text: "",
  type: "multiple",
  options: [
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" },
  ],
  correctOptionId: null,
  timeLimit: "30",
  customTime: "",
  points: "Standard (1x)",
  difficulty: "Easy",
  explanation: "",
});

export function useManualQuiz() {
  const [questions, setQuestions] = useState<Question[]>([defaultQuestion()]);
  const [activeId, setActiveId] = useState<string>(() => questions[0].id);
  const [quizTitle, setQuizTitle] = useState("Untitled Quiz");

  const activeQuestion = questions.find(q => q.id === activeId)!;

  const updateQuestion = (updated: Partial<Question>) => {
    setQuestions(prev =>
      prev.map(q => q.id === activeId ? { ...q, ...updated } : q)
    );
  };

  const addQuestion = () => {
    const newQ = defaultQuestion();
    setQuestions(prev => [...prev, newQ]);
    setActiveId(newQ.id);
  };

  const deleteQuestion = (id: string) => {
    if (questions.length === 1) return;
    const remaining = questions.filter(q => q.id !== id);
    setQuestions(remaining);
    setActiveId(remaining[0].id);
  };

  const addOption = () => {
    if (activeQuestion.options.length >= 6) return;

    updateQuestion({
      options: [
        ...activeQuestion.options,
        { id: crypto.randomUUID(), text: "" }
      ],
    });
  };

  const deleteOption = (optionId: string) => {
    if (activeQuestion.options.length <= 2) return;

    updateQuestion({
      options: activeQuestion.options.filter(o => o.id !== optionId),
      correctOptionId:
        activeQuestion.correctOptionId === optionId
          ? null
          : activeQuestion.correctOptionId,
    });
  };

  const updateOption = (optionId: string, text: string) => {
    updateQuestion({
      options: activeQuestion.options.map(o =>
        o.id === optionId ? { ...o, text } : o
      ),
    });
  };

  return {
    questions,
    activeId,
    setActiveId,
    quizTitle,
    setQuizTitle,
    activeQuestion,
    updateQuestion,
    addQuestion,
    deleteQuestion,
    addOption,
    deleteOption,
    updateOption,
    setQuestions,
  };
}*/