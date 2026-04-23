"use client";

import { useState } from "react";
import { message } from "antd";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/store/useQuizStore";
import StepperBar, { MANUAL_STEPS } from "@/components/Navigation/StepperBar";
import { useQuizEditor } from "@/hooks/useManualQuiz";
import { saveQuiz } from "@/lib/api/quizAPI";
import QuizSidebar from "@/components/createquiz/manual/question/Quizqidebar";
import QuestionEditor from "@/components/createquiz/manual/question/Quistioneditor";

export default function ManualQuiz() {
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // récupère difficulty et coverImage depuis le store
  const { difficulty, coverImage } = useQuizStore();

  const {
    questions,
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
  } = useQuizEditor();

  const handleSave = async () => {
    if (!user) return message.error("You must be logged in");

    for (const q of questions) {
      if (!q.text.trim()) {
        message.warning("Please fill in all question texts");
        setActiveId(q.id);
        return;
      }
      if (q.type !== "short" && !q.correctOptionId) {
        message.warning("Please select a correct answer for each question");
        setActiveId(q.id);
        return;
      }
    }

    setSaving(true);
    try {
      await saveQuiz({
        quizTitle,
        questions,
        userId: user.id,
        userFirstname: user.user_metadata?.firstname,
        userLastname: user.user_metadata?.lastname,
        quizDifficulty: difficulty,
        coverImage: coverImage,
        getEffectiveTimeLimit,
      });
      message.success("Quiz saved successfully! 🎉");
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { message: string };
      console.error(error);
      message.error("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="min-h-screen pb-14 bg-gray-50 dark:bg-slate-950 font-sans flex transition-colors duration-300">
        <QuizSidebar
          questions={questions}
          activeId={activeId}
          quizTitle={quizTitle}
          saving={saving}
          onSelectQuestion={setActiveId}
          onAddQuestion={addQuestion}
          onSave={handleSave}
          onTitleChange={setQuizTitle}
        />

        <main className="flex-1 ml-64 overflow-y-auto">
          <div className="h-[3px] w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500" />

          <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

            <div>
              <p className="text-xs font-bold text-cyan-500 tracking-widest uppercase mb-1">
                Step 2 of 3 — Create Questions
              </p>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
                Question {activeIndex + 1}
                <span className="text-gray-300 dark:text-slate-600 font-normal text-base ml-2">
                  of {questions.length}
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
              onExplanationChange={(explanation) => updateQuestion({ explanation })}
              onSelectCorrect={(correctOptionId) => updateQuestion({ correctOptionId })}
              onUpdateOption={updateOption}
              onDeleteOption={deleteOption}
              onAddOption={addOption}
              onDelete={() => deleteQuestion(activeId)}
            />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
              <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-4">
                Question Settings
              </h3>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">
                  🏆 Points
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "No points",     label: "No points", icon: "—" },
                    { value: "Standard (1x)", label: "Standard",  icon: "★" },
                    { value: "Double (2x)",   label: "Double",    icon: "★★" },
                  ].map((opt) => (
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

          </div>
        </main>
      </div>

      <StepperBar
        currentStep={2}
        withSidebar
        steps={MANUAL_STEPS}
        onPublish={handleSave}
      />
    </>
  );
}