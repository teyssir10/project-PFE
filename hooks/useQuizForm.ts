import { useState } from "react";
import { App } from "antd";
import { DEFAULT_FORM_STATE, QuizFormState } from "@/types/aiquiz";

// ─── Type pour une question générée ──────────────────────────────────────────
export interface GeneratedQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  indice: string;
}

export function useQuizForm() {
  const [form, setForm] = useState<QuizFormState>(DEFAULT_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { message } = App.useApp();

  // ── Mettre à jour le formulaire ────────────────────────────────────────────
  const update = (fields: Partial<QuizFormState>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  // ── Ajouter un tag au prompt ───────────────────────────────────────────────
  const handleTagClick = (text: string) => {
    update({ prompt: form.prompt ? form.prompt + " " + text : text });
  };

  // ── Calculer les valeurs finales ───────────────────────────────────────────
  const numQuestionsValue =
    form.numQuestions === "other"
      ? form.customQuestions ?? 5
      : Number(form.numQuestions);

  const timerValue =
    form.timer === "other"
      ? form.customTimer ?? 30
      : Number(form.timer);

  // ── Générer le quiz via OpenAI ─────────────────────────────────────────────
  const generateQuiz = async () => {
    if (!form.title && !form.prompt) {
      message.warning("Veuillez entrer un titre ou une description.");
      return;
    }

    // ✅ Résoudre les valeurs custom
    const effectiveCategory = form.category === "Custom"
      ? form.customCategory
      : form.category;

    const effectiveLanguage = form.language === "Custom"
      ? form.customLanguage
      : form.language;

    // ✅ Validation custom
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

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:        form.title,
          prompt:       form.prompt,
          category:     effectiveCategory, // ✅
          difficulty:   form.difficulty,
          numQuestions: numQuestionsValue,
          timer:        timerValue,
          language:     effectiveLanguage, // ✅
        }),
      });

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

  // ── Reset complet ──────────────────────────────────────────────────────────
  const resetQuiz = () => {
    setForm(DEFAULT_FORM_STATE);
    setGeneratedQuestions([]);
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
    error,
  };
}