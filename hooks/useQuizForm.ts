import { useState } from "react";
import { App } from "antd";
import { DEFAULT_FORM_STATE, QuizFormState } from "@/types/aiquiz";
import { supabase } from "@/lib/supabase";

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  indice: string;
  type: string;
}

const capitalizeDifficulty = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "Medium";

export function useQuizForm() {
  const [form, setForm] = useState<QuizFormState>(DEFAULT_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const { message } = App.useApp();

  const update = (fields: Partial<QuizFormState>) =>
    setForm((prev) => ({
      ...prev,
      ...fields,
      ...(fields.difficulty
        ? { difficulty: capitalizeDifficulty(fields.difficulty) as any }
        : {}),
    }));

  const handleTagClick = (text: string) => {
    update({ prompt: form.prompt ? form.prompt + " " + text : text });
  };

  const numQuestionsValue =
    form.numQuestions === "other"
      ? form.customQuestions ?? 5
      : Number(form.numQuestions);

  const timerValue =
    form.timer === "other"
      ? form.customTimer ?? 30
      : Number(form.timer);

  const resolveCategoryId = async (name: string): Promise<string | null> => {
    if (!name.trim()) return null;
    try {
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", name.trim())
        .maybeSingle();

      if (existing) return existing.id;

      const { data: inserted, error } = await supabase
        .from("categories")
        .insert({ name: name.trim(), icon: "🏷️" })
        .select("id")
        .single();

      if (error) throw error;
      return inserted.id;
    } catch (err) {
      console.error("resolveCategoryId error:", err);
      return null;
    }
  };

  const generateQuiz = async () => {
    if (!form.title && !form.prompt) {
      message.warning("Veuillez entrer un titre ou une description.");
      return;
    }

    const effectiveCategory =
      form.category === "Custom" ? form.customCategory : form.category;

    const effectiveLanguage =
      form.language === "Custom" ? form.customLanguage : form.language;

    if (form.category === "Custom" && !form.customCategory.trim()) {
      message.warning("Veuillez entrer une catégorie personnalisée.");
      return;
    }
    if (form.language === "Custom" && !form.customLanguage.trim()) {
      message.warning("Veuillez entrer une langue personnalisée.");
      return;
    }

    setLoading(true);
    setStep(2);
    setError(null);
    setGeneratedQuestions([]);
    setCategoryId(null);

    try {
      const [resolvedId, res] = await Promise.all([
        resolveCategoryId(effectiveCategory),
        fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title:        form.title,
            prompt:       form.prompt,
            category:     effectiveCategory,
            difficulty:   capitalizeDifficulty(form.difficulty), // ✅ normalisé
            numQuestions: numQuestionsValue,
            timer:        timerValue,
            language:     effectiveLanguage,
            questionType: form.questionType,
          }),
        }),
      ]);

      setCategoryId(resolvedId);

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Erreur lors de la génération.");
      }

      const questions: GeneratedQuestion[] = data.data?.questions ?? [];

      if (questions.length === 0) {
        throw new Error("Aucune question générée. Réessayez.");
      }

      setGeneratedQuestions(questions);
      setStep(3);
      message.success(`✅ ${questions.length} questions générées avec succès !`);
    } catch (err: any) {
      const errorMessage = err.message ?? "Échec de la génération du quiz.";
      setError(errorMessage);
      message.error(errorMessage);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setForm(DEFAULT_FORM_STATE);
    setGeneratedQuestions([]);
    setCategoryId(null);
    setStep(1);
    setError(null);
  };

  return {
    form,
    update,
    loading,
    step,
    handleTagClick,
    generateQuiz,
    resetQuiz,
    generatedQuestions,
    numQuestionsValue,
    timerValue,
    categoryId,
    error,
  };
}