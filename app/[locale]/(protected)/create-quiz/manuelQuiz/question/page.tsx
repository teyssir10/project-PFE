"use client";

import { useState } from "react";
import { useAntdApp } from "@/hooks/useAntdApp";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/store/useQuizStore";
import StepperBar, { PublishResult } from "@/components/Navigation/StepperBar";
import { useQuizEditor } from "@/hooks/useManualQuiz";
import { saveQuiz } from "@/lib/api/quizAPI";
import QuizSidebar from "@/components/createquiz/manual/question/Quizqidebar";
import QuestionEditor from "@/components/createquiz/manual/question/Quistioneditor";
import { useTranslations } from "next-intl";

export default function ManualQuiz() {
  const t = useTranslations("manualQuizEditor");
  const tStepper = useTranslations("stepper");
  const { message } = useAntdApp();
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | undefined>();
  const { user } = useAuth();
  const router = useRouter();

  const { difficulty, coverImage, timePerQuestion, categoryId } = useQuizStore();

  const MANUAL_STEPS = [
    { id: 1, label: tStepper("manualStep1") },
    { id: 2, label: tStepper("manualStep2") },
    { id: 3, label: tStepper("manualStep3") },
  ];

  const {
    questions, activeId, setActiveId, quizTitle, setQuizTitle,
    activeQuestion, activeIndex, updateQuestion, addQuestion, deleteQuestion,
    addOption, deleteOption, updateOption, handleTypeChange, getEffectiveTimeLimit,
  } = useQuizEditor();

  // ✅ Reçoit PublishResult avec status + données IA depuis StepperBar
  const handleSave = async (publishResult?: PublishResult) => {
    if (!user) return message.error(t("mustLogin"));

    for (const q of questions) {
      if (!q.text.trim()) { message.warning(t("fillTexts")); setActiveId(q.id); return; }
      if (q.type !== "short" && !q.correctOptionId) { message.warning(t("selectCorrect")); setActiveId(q.id); return; }
      if (q.type === "short" && !q.correctAnswer?.trim()) { message.warning(t("enterShortAnswer")); setActiveId(q.id); return; }
    }

    setSaving(true);
    try {
      await saveQuiz({
        quizTitle,
        questions,
        userId:          user.id,
        userFirstname:   user.user_metadata?.firstname,
        userLastname:    user.user_metadata?.lastname,
        quizDifficulty:  difficulty,
        coverImage,
        timePerQuestion,
        categoryId,
        getEffectiveTimeLimit,
        source:    "manual",
        // ✅ status vient du résultat IA — "published" ou "pending_admin"
        status:    publishResult?.status    ?? "published",
        aiScore:   publishResult?.aiScore   ?? null,
        aiRemarks: publishResult?.aiRemarks ?? null,
      });

      if (publishResult?.status === "pending_admin") {
        // ✅ Quiz en attente → redirige vers Settings > Mes Quiz
        router.push("/settings");
      } else {
        message.success(t("saveSuccess"));
        router.push("/browse-quiz");
      }
    } catch (err: unknown) {
      const error = err as { message: string };
      message.error(t("saveError") + error.message);
    } finally {
      setSaving(false);
    }
  };

  const POINTS_OPTIONS = [
    { value: "No points",     label: "No points", icon: "—"  },
    { value: "Standard (1x)", label: "Standard",  icon: "★"  },
    { value: "Double (2x)",   label: "Double",    icon: "★★" },
  ];

  return (
    <>
      <div className="min-h-screen pb-14 bg-gray-50 dark:bg-slate-950 font-sans flex transition-colors duration-300">
        <QuizSidebar
          questions={questions} activeId={activeId} quizTitle={quizTitle} saving={saving}
          onSelectQuestion={setActiveId} onAddQuestion={addQuestion}
          onSave={() => handleSave()} onTitleChange={setQuizTitle}
        />

        <main className="flex-1 ml-64 overflow-y-auto">
          <div className="h-[3px] w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500" />
          <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
            <div>
              <p className="text-xs font-bold text-cyan-500 tracking-widest uppercase mb-1">{t("step")}</p>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
                {t("question")} {activeIndex + 1}
                <span className="text-gray-300 dark:text-slate-600 font-normal text-base ml-2">{t("of")} {questions.length}</span>
              </h1>
            </div>

            <QuestionEditor
              question={activeQuestion} questionIndex={activeIndex} totalQuestions={questions.length}
              canDelete={questions.length > 1} onTypeChange={handleTypeChange}
              onTextChange={(text) => updateQuestion({ text })}
              onExplanationChange={(explanation) => updateQuestion({ explanation })}
              onCorrectAnswerChange={(correctAnswer) => updateQuestion({ correctAnswer })}
              onSelectCorrect={(correctOptionId) => updateQuestion({ correctOptionId })}
              onUpdateOption={updateOption} onDeleteOption={deleteOption} onAddOption={addOption}
              onDelete={() => deleteQuestion(activeId)}
            />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
              <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-4">Points</h3>
              <div className="flex gap-2">
                {POINTS_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => updateQuestion({ points: opt.value })}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      activeQuestion.points === opt.value
                        ? "bg-cyan-500 text-white border-transparent shadow-md shadow-cyan-500/20"
                        : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 hover:border-cyan-300 hover:text-cyan-500"
                    }`}>
                    <span className="block text-base mb-0.5">{opt.icon}</span>{opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <StepperBar
        currentStep={2}
        withSidebar
        steps={MANUAL_STEPS}
        onPublish={handleSave}
        draftData={{
          draftId, title: quizTitle, description: "",
          difficulty, questions, timePerQuestion,
          coverImage: coverImage ?? undefined,
        }}
        onDraftSaved={(id) => setDraftId(id)}
      />
    </>
  );
}