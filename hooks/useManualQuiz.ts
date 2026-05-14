import { useState } from "react";
import { Question, QuestionType, defaultQuestion } from "@/types/quiz";
import { useQuizStore } from "@/store/useQuizStore";

export function useQuizEditor() {
  const { title: savedTitle, timePerQuestion } = useQuizStore();

  const [questions, setQuestions] = useState<Question[]>([
    defaultQuestion(timePerQuestion)
  ]);
  const [activeId, setActiveId] = useState<string>(questions[0].id);
  const [quizTitle, setQuizTitle] = useState(savedTitle || "Untitled Quiz");

  const activeQuestion = questions.find((q) => q.id === activeId)!;
  const activeIndex = questions.findIndex((q) => q.id === activeId);

  const updateQuestion = (updated: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === activeId ? { ...q, ...updated } : q))
    );
  };

  const addQuestion = () => {
    const newQ = defaultQuestion(timePerQuestion);
    setQuestions((prev) => [...prev, newQ]);
    setActiveId(newQ.id);
  };

  const deleteQuestion = (id: string) => {
    if (questions.length === 1) return;
    const remaining = questions.filter((q) => q.id !== id);
    setQuestions(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
  };

  const addOption = () => {
    if (activeQuestion.options.length >= 6) return;
    updateQuestion({
      options: [...activeQuestion.options, { id: crypto.randomUUID(), text: "" }],
    });
  };

  const deleteOption = (optionId: string) => {
    if (activeQuestion.options.length <= 2) return;
    updateQuestion({
      options: activeQuestion.options.filter((o) => o.id !== optionId),
      correctOptionId:
        activeQuestion.correctOptionId === optionId
          ? null
          : activeQuestion.correctOptionId,
    });
  };

  const updateOption = (optionId: string, text: string) => {
    updateQuestion({
      options: activeQuestion.options.map((o) =>
        o.id === optionId ? { ...o, text } : o
      ),
    });
  };

  const handleTypeChange = (type: QuestionType) => {
    if (type === "truefalse") {
      updateQuestion({
        type,
        options: [
          { id: crypto.randomUUID(), text: "True" },
          { id: crypto.randomUUID(), text: "False" },
        ],
        correctOptionId: null,
      });
    } else if (type === "multiple") {
      updateQuestion({
        type,
        options: [
          { id: crypto.randomUUID(), text: "" },
          { id: crypto.randomUUID(), text: "" },
          { id: crypto.randomUUID(), text: "" },
          { id: crypto.randomUUID(), text: "" },
        ],
        correctOptionId: null,
      });
    } else {
      updateQuestion({ type, options: [], correctOptionId: null });
    }
  };

  const getEffectiveTimeLimit = (q: Question): string => {
    if (q.timeLimit === "custom") return q.customTime || "60";
    return q.timeLimit;
  };

  return {
    questions,
    setQuestions,   // ← exporté
    activeId,
    setActiveId,
    quizTitle,
    setQuizTitle,
    activeQuestion,
    activeIndex,
    updateQuestion,
    addQuestion,
    deleteQuestion,
    addOption,
    deleteOption,
    updateOption,
    handleTypeChange,
    getEffectiveTimeLimit,
  };
}