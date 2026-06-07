"use client";

import Image from "next/image";
import panda from "@/public/pandaquiz.png";
import StepperBar from "@/components/Navigation/StepperBar";
import { useQuizForm } from "@/hooks/useQuizForm";
import DescribeCard from "@/components/createquiz/AIquiz/DecribeCard";
import SettingsCard from "@/components/createquiz/AIquiz/SettingsCard";
import PreviewPanel from "@/components/createquiz/AIquiz/PreviewPanel";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { App } from "antd";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AIQuiz() {
  const { message } = App.useApp();
  const t = useTranslations("aiQuiz");
  const tStepper = useTranslations("stepper");
  const { user } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [publishing, setPublishing] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const {
    form, update, loading, step, handleTagClick,
    generateQuiz, generatedQuestions, resetQuiz,
    numQuestionsValue, timerValue,
    categoryId,
  } = useQuizForm();

  const AI_STEPS = [
    { id: 1, label: tStepper("aiStep1") },
    { id: 2, label: tStepper("aiStep2") },
    { id: 3, label: tStepper("aiStep3") },
  ];

  // ✅ FIX 1 : Convertit les questions IA → format interne avant de sauvegarder le brouillon.
  // Sans cette conversion, le brouillon sauvegarde { question: "...", options: ["A","B"] }
  // mais useResumeDraft attend { text: "...", options: [{ id, text }], correctOptionId }.
  const buildDraftQuestions = () =>
    generatedQuestions.map((q) => {
      const isTrueFalse   = q.type === "true_false";
      const isShortAnswer = q.type === "short_answer";
      const isMCQ         = !isTrueFalse && !isShortAnswer;

      const options = (isMCQ || isTrueFalse)
        ? q.options.map((opt: string) => ({
            id:         crypto.randomUUID(),
            text:       opt,
            is_correct: opt === q.correct_answer,
          }))
        : [];

      const correctOption = options.find((o: any) => o.is_correct);

      return {
        id:              crypto.randomUUID(),
        text:            q.question,        // ✅ "question" → "text"
        type:            isTrueFalse   ? "truefalse"
                       : isShortAnswer ? "short"
                       : "multiple",        // ✅ type normalisé pour useResumeDraft
        options,                            // ✅ format [{ id, text, is_correct }]
        correctOptionId: correctOption?.id ?? null,
        correctAnswer:   isShortAnswer ? q.correct_answer : "",
        indice:          q.indice ?? "",
        timeLimit:       String(timerValue),
        points:          "Standard (1x)",
      };
    });

  const handlePublish = async () => {
    if (!user) { message.error("Vous devez être connecté."); return; }
    if (generatedQuestions.length === 0) { message.warning("Générez d'abord les questions."); return; }

    setPublishing(true);
    try {
      // ✅ FIX 2 : La BDD attend "Easy" | "Medium" | "Hard" | "Mixed" (avec majuscule).
      // On utilise form.difficulty directement — pas de toLowerCase().
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          title:             form.title,
          difficulty:        form.difficulty,   // ✅ "Easy" | "Medium" | "Hard" | "Mixed"
          question_count:    generatedQuestions.length,
          time_per_question: timerValue,
          is_published:      true,
          status:            "published",
          players:           0,
          creator_id:        user.id,
          creator_name:      user.user_metadata?.firstname ?? user.email?.split("@")[0],
          cover_image:       generatedImageUrl ?? null,
          source:            "ai",
          category_id:       categoryId ?? null,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      const questionsToInsert = generatedQuestions.map((q, index) => {
        const isShortAnswer = q.type === "short_answer";
        const isTrueFalse   = q.type === "true_false";
        const isMCQ         = !isShortAnswer && !isTrueFalse;

        const optionsJsonb = isMCQ || isTrueFalse
          ? q.options.map((opt) => ({
              id:         crypto.randomUUID(),
              text:       opt,
              is_correct: opt === q.correct_answer,
            }))
          : [];

        const correctOption = optionsJsonb.find((o) => o.is_correct);

        return {
          quiz_id:           quiz.id,
          text:              q.question,
          indice:            q.indice,
          order_index:       index,
          type:              q.type ?? "multiple_choice",
          time_limit:        String(timerValue),
          points:            "Standard (1x)",
          difficulty:        form.difficulty,   // ✅ idem, pas de toLowerCase()
          options:           optionsJsonb,
          correct_option_id: correctOption?.id ?? null,
          correct_answer:    isShortAnswer ? q.correct_answer : null,
        };
      });

      const { error: questionsError } = await supabase
        .from("questions")
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      message.success("✅ Quiz publié avec succès !");
      router.push(`/${locale}/browse-quiz`);

    } catch (err: any) {
      console.error(err);
      message.error(err.message ?? "Erreur lors de la publication.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen pb-14 bg-[#F4F6FA] dark:bg-slate-900 font-sans transition-colors duration-300">
      <div className="h-[3px] w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-4">
          <span className="mb-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 text-xs font-semibold tracking-wide uppercase">
            {t("badge")}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2">
            {t("title1")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-400">
              {t("title2")}
            </span>
          </h1>
          <p className="max-w-xl text-gray-500 dark:text-slate-400 text-base leading-relaxed mb-3">
            {t("description")}{" "}
            <span className="text-cyan-500 font-medium">{t("descriptionHighlight")}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <DescribeCard
              title={form.title}
              prompt={form.prompt}
              onTitleChange={(v) => update({ title: v })}
              onPromptChange={(v) => update({ prompt: v })}
              onTagClick={handleTagClick}
            />
            <SettingsCard
              form={form}
              loading={loading}
              onUpdate={update}
              onGenerate={generateQuiz}
            />
          </div>

          <div className="lg:col-span-3 relative">
            <div className="absolute -top-56 right-1 z-10 pointer-events-none hidden lg:block">
              <Image src={panda} alt="panda" className="w-70 h-70 object-contain drop-shadow-md" />
            </div>
            <PreviewPanel
              loading={loading}
              questions={generatedQuestions}
              onReset={resetQuiz}
              quizTitle={form.title}
              onImageGenerated={(url) => setGeneratedImageUrl(url)}
            />
          </div>
        </div>
      </div>

     <StepperBar
  currentStep={step}
  steps={AI_STEPS}
  skipAIReview
  onPublish={handlePublish}
  draftData={{
    title:           form.title,
    difficulty:      form.difficulty,
    questions:       buildDraftQuestions(),
    timePerQuestion: timerValue,
    coverImage:      generatedImageUrl ?? null,
    source:          "ai",                      
  }}
/>
    </div>
  );
}