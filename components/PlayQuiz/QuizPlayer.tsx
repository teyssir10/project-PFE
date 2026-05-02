"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QuizFull, PlayOption } from "@/types/quiz";
import QuizHeader from "@/components/PlayQuiz/QuizHeader";
import QuizSidebar from "@/components/PlayQuiz/QuizSidebar";
import OptionCard from "@/components/PlayQuiz/OptionCard";

const isCorrect = (val: any): boolean => val === true || val === "true";

export default function QuizPlayer({ quiz }: { quiz: QuizFull }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.time_per_question ?? 30);
  const [showHint, setShowHint] = useState(false);
  const [statuses, setStatuses] = useState<("unanswered" | "correct" | "wrong" | "skipped")[]>(
    Array(quiz.questions.length).fill("unanswered")
  );

  const question = quiz.questions[currentIndex];
  if (!question) return null;
  const isLast = currentIndex === quiz.questions.length - 1;
  const hint = question?.explanation;

  //  Question verrouillée si déjà répondue (correct/wrong) ou sautée
  const isLocked = statuses[currentIndex] !== "unanswered";

  const goNext = useCallback(() => {
    if (isLast) {
      router.push(`/play-quiz/${quiz.id}/results?score=${score}&total=${quiz.questions.length}`);
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelected(null);
    setTimeLeft(quiz.time_per_question ?? 30);
    setShowHint(false);
  }, [isLast, router, quiz.id, quiz.questions.length, quiz.time_per_question, score]);

  const handleSkip = useCallback(() => {
    if (isLocked) return; // Bloque si déjà répondue
    const newStatuses = [...statuses];
    newStatuses[currentIndex] = "skipped";
    setStatuses(newStatuses);
    goNext();
  }, [isLocked, statuses, currentIndex, goNext]);

  // Timer
  useEffect(() => {
    if (isLocked) return; //  Stop le timer si déjà répondue
    if (timeLeft === 0) {
      const newStatuses = [...statuses];
      newStatuses[currentIndex] = "wrong";
      setStatuses(newStatuses);
      setSelected("__timeout__");
      return;
    }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, isLocked]);

  const handleSelect = (opt: PlayOption) => {
    // Triple protection — bloque si déjà répondue via selected OU via statuses
    if (selected) return;
    if (isLocked) return;

    setSelected(opt.id);
    const correct = isCorrect(opt.is_correct);
    const newStatuses = [...statuses];
    newStatuses[currentIndex] = correct ? "correct" : "wrong";
    setStatuses(newStatuses);
    if (correct) setScore(s => s + 1);
  };

  const answeredCount = statuses.filter(s => s === "correct" || s === "wrong").length;
  const skippedCount  = statuses.filter(s => s === "skipped").length;
  const remaining     = statuses.filter(s => s === "unanswered").length;

  const isTimeout   = selected === "__timeout__";
  const wasAnswered = !!selected;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      <QuizSidebar
        questions={quiz?.questions}
        currentIndex={currentIndex}
        statuses={statuses}
        onJump={(i) => {
          setCurrentIndex(i);
          // Restaure le selected correct si la question a déjà été répondue
          const s = statuses[i];
          if (s !== "unanswered") {
            setSelected("__locked__");
          } else {
            setSelected(null);
          }
          setTimeLeft(quiz.time_per_question ?? 30);
          setShowHint(false);
        }}
        answered={answeredCount}
        skipped={skippedCount}
        remaining={remaining}
      />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <QuizHeader
          title={quiz.title}
          category={quiz.category}
          difficulty={quiz.difficulty}
          timeLeft={isLocked ? 0 : timeLeft}
          totalTime={quiz.time_per_question ?? 30}
          onExit={() => router.push("/dashboard")}
        />

        <div className="flex-1 px-10 py-8 max-w-3xl w-full mx-auto">

          {/* Question counter + score */}
          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 text-xs font-bold tracking-widest uppercase">
              Question {currentIndex + 1} / {quiz.questions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">Score</span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                {score} / {quiz.questions.length}
              </span>
            </div>
          </div>

          {/* Question card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
              {question.text}
            </h2>

            {/* Hint — avant de répondre seulement */}
            {!isLocked && showHint && hint && (
              <div className="mt-4 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                <span className="text-base mt-0.5">💡</span>
                <p>{hint}</p>
              </div>
            )}

            {/* Timeout */}
            {isTimeout && (
              <div className="mt-4 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300">
                <span className="text-base mt-0.5">⏱</span>
                <p>Temps écoulé — cette question est verrouillée.</p>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((opt, i) => {
              let state: "default" | "correct" | "wrong" = "default";

              if (wasAnswered && !isTimeout && opt.id === selected) {
                state = isCorrect(opt.is_correct) ? "correct" : "wrong";
              }

              return (
                <OptionCard
                  key={opt.id}
                  label={String.fromCharCode(65 + i)}
                  text={opt.text}
                  state={state}
                  onClick={() => handleSelect(opt)}
                  disabled={isLocked || wasAnswered}
                />
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400 dark:text-slate-500">
              Current score:{" "}
              <span className="font-bold text-gray-700 dark:text-white">{score} / {answeredCount} correct</span>
            </p>
            <div className="flex gap-3 items-center">

              {/* Use hint — avant de répondre */}
              {!isLocked && hint && !showHint && (
                <button
                  onClick={() => setShowHint(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-slate-300 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Use hint
                </button>
              )}

              {/* Skip — avant de répondre */}
              {!isLocked && (
                <button
                  onClick={handleSkip}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm text-gray-500 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-500 transition font-medium"
                >
                  Skip →
                </button>
              )}

              {/* Next / Finish — après réponse ou locked */}
              {(wasAnswered || isLocked) && (
                <button
                  onClick={goNext}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-white font-bold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center gap-2"
                >
                  {isLast ? "🎉 Finish" : "Next question →"}
                </button>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}