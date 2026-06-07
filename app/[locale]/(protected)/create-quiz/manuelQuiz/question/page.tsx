"use client";

import { useState, useEffect } from "react";
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
import { useResumeDraft } from "@/hooks/Useresumedraft";
import { useSearchParams } from "next/navigation";
import { getQuizWithQuestions } from "@/lib/api/quiz";
import { useLocale } from "next-intl";

export default function ManualQuiz() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const t = useTranslations("manualQuizEditor");
  const tStepper = useTranslations("stepper");
  const { message } = useAntdApp();
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  const { difficulty, coverImage, timePerQuestion, categoryId } = useQuizStore();

  const MANUAL_STEPS = [
    { id: 1, label: tStepper("manualStep1") },
    { id: 2, label: tStepper("manualStep2") },
    { id: 3, label: tStepper("manualStep3") },
  ];

  const {
    questions, setQuestions, activeId, setActiveId,
    quizTitle, setQuizTitle,
    activeQuestion, activeIndex, updateQuestion, addQuestion, deleteQuestion,
    addOption, deleteOption, updateOption, handleTypeChange, getEffectiveTimeLimit,
  } = useQuizEditor();

  const { draftId: urlDraftId, loadingDraft } = useResumeDraft({
    setQuizTitle,
    setQuestions,
    setActiveId,
  });

  useState(() => {
    if (urlDraftId) setDraftId(urlDraftId);
  });

  useEffect(() => {
    if (!editId) return;
    const loadQuizQuestions = async () => {
      const data = await getQuizWithQuestions(editId);
      if (!data) return;
      setQuizTitle(data.title);
      if (data.questions && data.questions.length > 0) {
        const formatted = data.questions.map((q: any) => ({
          id:              q.id,
          text:            q.question_text ?? q.text ?? "",
          indice:          q.indice ?? "",
          type:            q.question_type ?? q.type ?? "multiple",
          points:          q.points ?? "Standard (1x)",
          correctAnswer:   q.correct_answer ?? "",
          timeLimit:       q.time_limit ?? null,
          correctOptionId: q.options?.find((o: any) => o.is_correct)?.id ?? null,
          options: q.options?.map((o: any) => ({
            id:   o.id,
            text: o.option_text ?? o.text ?? "",
          })) ?? [],
        }));
        setQuestions(formatted);
        setActiveId(formatted[0].id);
      }
    };
    loadQuizQuestions();
  }, [editId]);

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
        status:    publishResult?.status    ?? "published",
        aiScore:   publishResult?.aiScore   ?? null,
        aiRemarks: publishResult?.aiRemarks ?? null,
        editId:    editId ?? null,
      });

      if (publishResult?.status === "pending_admin") {
        router.push(`/${locale}/settings`);
      } else {
        message.success(editId ? "✅ Quiz mis à jour avec succès !" : t("saveSuccess"));
        router.push(`/${locale}/browse-quiz`);
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

  if (loadingDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-slate-400">{t("loadingDraft")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Conteneur principal : hauteur écran fixe ── */}
      <div className="h-screen pb-14 bg-gray-50 dark:bg-slate-950 font-sans flex overflow-hidden transition-colors duration-300">

        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <QuizSidebar
          questions={questions}
          activeId={activeId}
          quizTitle={quizTitle}
          saving={saving}
          isOpen={sidebarOpen}
          onSelectQuestion={(id) => { setActiveId(id); setSidebarOpen(false); }}
          onAddQuestion={() => { addQuestion(); setSidebarOpen(false); }}
          onSave={() => handleSave()}
          onTitleChange={setQuizTitle}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="h-[3px] w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500" />
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">

            {/* Bouton hamburger — mobile uniquement */}
            <button
              className="md:hidden flex items-center justify-between w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-sm"
              onClick={() => setSidebarOpen(true)}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-white">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Toutes les questions ({questions.length})
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400">{activeIndex + 1}/{questions.length}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* En-tête question */}
            <div>
              <p className="text-xs font-bold text-cyan-500 tracking-widest uppercase mb-1">
                {t("step")}
              </p>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
                {t("question")} {activeIndex + 1}
                <span className="text-gray-300 dark:text-slate-600 font-normal text-base ms-2">
                  {t("of")} {questions.length}
                </span>
              </h1>
            </div>

            <QuestionEditor
              question={activeQuestion}
              questionIndex={activeIndex}
              totalQuestions={questions.length}
              canDelete={questions.length > 1}
              onTypeChange={handleTypeChange}
              onTextChange={(text) => updateQuestion({ text })}
              onExplanationChange={(indice) => updateQuestion({ indice })}
              onCorrectAnswerChange={(correctAnswer) => updateQuestion({ correctAnswer })}
              onSelectCorrect={(correctOptionId) => updateQuestion({ correctOptionId })}
              onUpdateOption={updateOption}
              onDeleteOption={deleteOption}
              onAddOption={addOption}
              onDelete={() => deleteQuestion(activeId)}
            />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
              <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-4">
                Points
              </h3>
              <div className="flex gap-2">
                {POINTS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateQuestion({ points: opt.value })}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      activeQuestion.points === opt.value
                        ? "bg-cyan-500 text-white border-transparent shadow-md shadow-cyan-500/20"
                        : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 hover:border-cyan-300 hover:text-cyan-500"
                    }`}
                  >
                    <span className="block text-base mb-0.5">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Bouton flottant Ajouter — mobile uniquement */}
      <button
        onClick={addQuestion}
        className="md:hidden fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-white text-sm font-bold px-4 py-3 rounded-full shadow-lg shadow-cyan-500/30 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Ajouter
      </button>

      <StepperBar
        currentStep={2}
        withSidebar
        steps={MANUAL_STEPS}
        onPublish={handleSave}
        draftData={{
          draftId: draftId ?? urlDraftId,
          title: quizTitle,
          description: "",
          difficulty,
          questions,
          timePerQuestion: Number(timePerQuestion),
          coverImage: coverImage ?? undefined,
        }}
        onDraftSaved={(id) => setDraftId(id)}
      />
    </>
  );
}