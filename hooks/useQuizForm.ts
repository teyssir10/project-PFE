import { useState } from "react";
import { message } from "antd";
import { DEFAULT_FORM_STATE, Difficulty, QuizFormState } from "@/types/aiquiz";

export function useQuizForm() {
  const [form, setForm] = useState<QuizFormState>(DEFAULT_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const update = (fields: Partial<QuizFormState>) =>
    setForm((prev) => ({ ...prev, ...fields }));
  const handleTagClick = (text: string) => {
    update({ prompt: form.prompt ? form.prompt + " " + text : text });
  };

  const numQuestionsValue =
    form.numQuestions === "other" ? form.customQuestions : Number(form.numQuestions);

  const timerValue =
    form.timer === "other" ? form.customTimer : Number(form.timer);

  const generateQuiz = async () => {
    if (!form.title && !form.prompt) {
      message.warning("Please enter a title or prompt.");
      return;
    }

    setLoading(true);
    setStep(2);

    try {
      const systemPrompt = `You are a quiz generator. Return ONLY JSON array.\nRules:\n- ${numQuestionsValue} questions\n- Difficulty: ${form.difficulty}\n- Category: ${form.category}\n- Language: ${form.language}\n- Each question has 4 options`;

      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          prompt: form.prompt,
          systemPrompt,
          timer: timerValue,
        }),
      });

      const data = await res.json();
      message.success("Quiz generated successfully!");
      setStep(3);
      console.log(data);
    } catch {
      message.error("Failed to generate quiz.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    update,
    loading,
    step,
    handleTagClick,
    generateQuiz,
  };
}