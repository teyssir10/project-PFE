"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QuizFull, PlayOption } from "@/types/quiz";
import QuizHeader from "@/components/PlayQuiz/QuizHeader";
import QuizSidebar from "@/components/PlayQuiz/QuizSidebar";
import OptionCard from "@/components/PlayQuiz/OptionCard";
import { useTranslations } from "next-intl";

const isCorrect = (val: any): boolean => val === true || val === "true";

export default function QuizPlayer({ quiz }: { quiz: QuizFull }) {
  const t = useTranslations("quizPlay");
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.time_per_question ?? 30);
  const [showHint, setShowHint] = useState(false);
  const [shortInput, setShortInput] = useState("");
  const [statuses, setStatuses] = useState<("unanswered" | "correct" | "wrong" | "skipped")[]>(
    Array(quiz.questions.length).fill("unanswered")
  );

  const question = quiz.questions[currentIndex];
  const isLast   = currentIndex === quiz.questions.length - 1;

  if (!question) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        {t("noQuestions")}
      </div>
    );
  }

  const hint      = question.indice;
  const isLocked  = statuses[currentIndex] !== "unanswered";
  const isShort   = question.type === "short" || question.type === "short_answer";
  const isTrueFalse = question.type === "tf" || question.type === "true_false";

  const goNext = useCallback(() => {
    if (isLast) {
      router.push(`/play-quiz/${quiz.id}/results?score=${score}&total=${quiz.questions.length}`);
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelected(null);
    setConfirmed(false);
    setShortInput("");
    setTimeLeft(quiz.time_per_question ?? 30);
    setShowHint(false);
  }, [isLast, router, quiz.id, quiz.questions.length, quiz.time_per_question, score]);

  const handleSkip = useCallback(() => {
    if (isLocked) return;
    const newStatuses = [...statuses];
    newStatuses[currentIndex] = "skipped";
    setStatuses(newStatuses);
    goNext();
  }, [isLocked, statuses, currentIndex, goNext]);

  useEffect(() => {
    if (isLocked) return;
    if (timeLeft === 0) {
      const newStatuses = [...statuses];
      newStatuses[currentIndex] = "wrong";
      setStatuses(newStatuses);
      setSelected("__timeout__");
      setConfirmed(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isLocked]);

  const handleSelect = (opt: PlayOption) => {
    if (isLocked || confirmed) return;
    setSelected(prev => prev === opt.id ? null : opt.id);
  };

  const handleConfirm = () => {
    if (isLocked || confirmed) return;
    if (isShort) {
      if (!shortInput.trim()) return;
      const correct = shortInput.trim().toLowerCase() === (question.correct_answer ?? "").trim().toLowerCase();
      const newStatuses = [...statuses];
      newStatuses[currentIndex] = correct ? "correct" : "wrong";
      setStatuses(newStatuses);
      if (correct) setScore(s => s + 1);
      setSelected("__short__");
      setConfirmed(true);
      return;
    }
    if (!selected) return;
    const opt = question.options.find(o => o.id === selected);
    if (!opt) return;
    const correct = isCorrect(opt.is_correct);
    const newStatuses = [...statuses];
    newStatuses[currentIndex] = correct ? "correct" : "wrong";
    setStatuses(newStatuses);
    if (correct) setScore(s => s + 1);
    setConfirmed(true);
  };

  const answeredCount = statuses.filter(s => s === "correct" || s === "wrong").length;
  const skippedCount  = statuses.filter(s => s === "skipped").length;
  const remaining     = statuses.filter(s => s === "unanswered").length;
  const isTimeout     = selected === "__timeout__";
  const wasAnswered   = confirmed;
  const canConfirm    = isShort ? shortInput.trim().length > 0 : !!selected;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      <QuizSidebar
        questions={quiz?.questions}
        currentIndex={currentIndex}
        statuses={statuses}
        onJump={(i) => {
          setCurrentIndex(i);
          const s = statuses[i];
          if (s !== "unanswered") {
            setSelected("__locked__");
            setConfirmed(true);
          } else {
            setSelected(null);
            setConfirmed(false);
            setShortInput("");
          }
          setTimeLeft(quiz.time_per_question ?? 30);
          setShowHint(false);
        }}
        answered={answeredCount}
        skipped={skippedCount}
        remaining={remaining}
      />

      <div className="flex-1 flex flex-col overflow-y-auto relative z-10">
        <QuizHeader
          title={quiz.title}
          category={quiz.category}
          difficulty={quiz.difficulty}
          timeLeft={isLocked ? 0 : timeLeft}
          totalTime={quiz.time_per_question ?? 30}
          onExit={() => router.push("/dashboard")}
        />

        {/* ✅ padding réduit sur mobile */}
        <div className="flex-1 px-4 md:px-10 py-5 md:py-8 max-w-3xl w-full mx-auto relative z-10">

          {/* Question counter + score */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <span className="px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 text-xs font-bold tracking-widest uppercase">
              {t("question")} {currentIndex + 1} / {quiz.questions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">{t("score")}</span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                {score} / {quiz.questions.length}
              </span>
            </div>
          </div>

          {/* Question card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 md:p-8 mb-4 md:mb-6">
            <h2 className="text-base md:text-xl font-bold text-gray-900 dark:text-white leading-snug">
              {question.text}
            </h2>

            {!isLocked && showHint && hint && (
              <div className="mt-4 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                <span className="text-base mt-0.5">💡</span>
                <p>{hint}</p>
              </div>
            )}

            {isTimeout && (
              <div className="mt-4 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300">
                <span className="text-base mt-0.5">⏱</span>
                <p>{t("timeExpired")}</p>
              </div>
            )}
          </div>

          {/* Short answer */}
          {isShort ? (
            <div className="space-y-3 mb-4 md:mb-6">
              <input
                type="text"
                value={shortInput}
                onChange={(e) => { if (!confirmed && !isLocked) setShortInput(e.target.value); }}
                onKeyDown={(e) => { if (e.key === "Enter" && canConfirm && !confirmed && !isLocked) handleConfirm(); }}
                disabled={confirmed || isLocked}
                placeholder={t("typePlaceholder")}
                className="w-full px-4 md:px-5 py-3 md:py-4 rounded-2xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white text-sm focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 transition-all disabled:opacity-60 placeholder-gray-300 dark:placeholder-slate-600"
              />
              {confirmed && !isTimeout && (
                <div className={`flex items-start gap-3 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm font-medium border ${
                  statuses[currentIndex] === "correct"
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"
                }`}>
                  <span className="text-lg shrink-0">{statuses[currentIndex] === "correct" ? "✅" : "❌"}</span>
                  <div>
                    {statuses[currentIndex] === "correct"
                      ? <p>{t("correctAnswer")} <strong>{shortInput}</strong></p>
                      : <p>{t("wrongAnswer")} <strong>{question.correct_answer}</strong></p>
                    }
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* MCQ + True/False */
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
              {question.options.map((opt, i) => {
                let state: "default" | "correct" | "wrong" | "selected" | "reveal" = "default";
                if (!confirmed && selected === opt.id) {
                  state = "selected";
                } else if (confirmed && !isTimeout) {
                  if (opt.id === selected) {
                    state = isCorrect(opt.is_correct) ? "correct" : "wrong";
                  } else if (isCorrect(opt.is_correct)) {
                    state = "reveal";
                  }
                }
                return (
                  <OptionCard
                    key={opt.id}
                    label={isTrueFalse ? (i === 0 ? "✓" : "✗") : String.fromCharCode(65 + i)}
                    text={opt.text}
                    state={state}
                    onClick={() => handleSelect(opt)}
                    disabled={isLocked || confirmed}
                  />
                );
              })}
            </div>
          )}

          {/* ✅ Footer — stacked on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Status text */}
            <p className="text-sm text-gray-400 dark:text-slate-500">
              {confirmed || isLocked ? (
                statuses[currentIndex] === "correct" ? (
                  <span className="text-emerald-500 font-semibold">{t("correctAnswer")}</span>
                ) : statuses[currentIndex] === "skipped" ? (
                  <span className="text-amber-500 font-semibold">{t("skipped")}</span>
                ) : (
                  <span className="text-red-400 font-semibold">{t("wrongAnswer")}</span>
                )
              ) : selected ? (
                <span className="text-cyan-500">{t("changeOrConfirm") ?? "Change or confirm"}</span>
              ) : (
                <span>
                  {t("currentScore")}{" "}
                  <span className="font-bold text-gray-700 dark:text-white">
                    {score} / {answeredCount} {t("correct")}
                  </span>
                </span>
              )}
            </p>

            {/* Action buttons */}
            <div className="flex gap-2 items-center justify-end">
              {!isLocked && !confirmed && hint && !showHint && (
                <button
                  onClick={() => setShowHint(true)}
                  className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-gray-500 dark:text-slate-400 hover:border-gray-300 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {t("useHint")}
                </button>
              )}

              {!isLocked && !confirmed && !canConfirm && (
                <button
                  onClick={handleSkip}
                  className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm text-gray-500 dark:text-slate-400 hover:border-gray-400 transition font-medium"
                >
                  {t("skip")} →
                </button>
              )}

              {canConfirm && !confirmed && !isLocked && (
                <button
                  onClick={handleConfirm}
                  className="px-6 md:px-8 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-white font-bold text-sm transition shadow-lg shadow-cyan-500/25"
                >
                  {t("confirm")}
                </button>
              )}

              {(wasAnswered || isLocked) && (
                <button
                  onClick={goNext}
                  className="px-6 md:px-8 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-white font-bold text-sm transition shadow-lg shadow-cyan-500/25"
                >
                  {isLast ? t("finish") : t("next")}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}