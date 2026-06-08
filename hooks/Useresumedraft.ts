"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useQuizStore } from "@/store/useQuizStore";
import { Question } from "@/types/quiz";

// ── Normalise les types sauvegardés vers le format interne ────────────────
const normalizeType = (type: string): string => {
  if (type === "multiple_choice") return "multiple";
  if (type === "true_false")      return "truefalse";
  if (type === "short_answer")    return "short";
  return type ?? "multiple";
};

export function useResumeDraft({
  setQuizTitle,
  setQuestions,
  setActiveId,
}: {
  setQuizTitle: (title: string) => void;
  setQuestions?: (questions: Question[]) => void;
  setActiveId?: (id: string) => void;
}) {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft") ?? undefined;
  const [loadingDraft, setLoadingDraft] = useState(!!draftId);
  const { setQuizData } = useQuizStore();

  useEffect(() => {
    if (!draftId) return;

    const load = async () => {
      setLoadingDraft(true);
      try {
        const { data, error } = await supabase
          .from("quiz_drafts")
          .select("*")
          .eq("id", draftId)
          .single();

        if (!error && data) {
          // ── Restore store fields ───────────────────────────────────────
          setQuizData({
            title:           data.title            ?? "",
            difficulty:      data.difficulty       ?? "Medium",
            coverImage:      data.cover_image      ?? null,
            timePerQuestion: data.time_per_question?.toString() ?? "20",
          });

          // ── Restore title ──────────────────────────────────────────────
          if (data.title) setQuizTitle(data.title);

          // ── Restore questions ──────────────────────────────────────────
          if (
            setQuestions &&
            data.questions &&
            Array.isArray(data.questions) &&
            data.questions.length > 0
          ) {
            const restoredQuestions: Question[] = data.questions.map((q: any) => ({
              id:   q.id ?? crypto.randomUUID(),

              text: q.text ?? q.question_text ?? "",

              type: normalizeType(q.type),

              options: q.options?.map((o: any) => ({
                id:   o.id   ?? crypto.randomUUID(),
                text: o.text ?? o.option_text ?? "",
              })) ?? [],

              correctOptionId:
                q.correctOptionId ??
                q.options?.find((o: any) => o.is_correct)?.id ??
                null,

              correctAnswer: q.correctAnswer ?? q.correct_answer ?? "",
              indice:        q.indice        ?? "",
              timeLimit:     q.timeLimit     ?? "30",
              customTime:    q.customTime    ?? "",
              points:        q.points        ?? "Standard (1x)",
            }));

            setQuestions(restoredQuestions);

            if (setActiveId && restoredQuestions.length > 0) {
              setActiveId(restoredQuestions[0].id);
            }
          }
        } else {
          console.error("Draft load error:", error);
        }
      } catch (err) {
        console.error("Draft load failed:", err);
      } finally {
        setLoadingDraft(false);
      }
    };

    load();
  }, [draftId]);

  return { draftId, loadingDraft };
}