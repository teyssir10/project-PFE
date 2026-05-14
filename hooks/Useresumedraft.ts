"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useQuizStore } from "@/store/useQuizStore";

/**
 * Appelle ce hook dans ta page quiz-info (step 1).
 * Si l'URL contient ?draft=<id>, il charge le draft depuis Supabase
 * et pré-remplit le store + retourne le titre et l'id du draft.
 *
 * Usage:
 *   const { draftId, loadingDraft } = useResumeDraft({ setQuizTitle });
 */
export function useResumeDraft({
  setQuizTitle,
}: {
  setQuizTitle: (title: string) => void;
}) {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft") ?? undefined;
  const [loadingDraft, setLoadingDraft] = useState(!!draftId);

  const { setDifficulty, setCoverImage, setTimePerQuestion } = useQuizStore();

  useEffect(() => {
    if (!draftId) return;

    const load = async () => {
      setLoadingDraft(true);
      const { data, error } = await supabase
        .from("quiz_drafts")
        .select("*")
        .eq("id", draftId)
        .single();

      if (!error && data) {
        // Restore quiz store fields
        if (data.title)             setQuizTitle(data.title);
        if (data.difficulty)        setDifficulty(data.difficulty);
        if (data.cover_image)       setCoverImage(data.cover_image);
        if (data.time_per_question) setTimePerQuestion(data.time_per_question);
      }
      setLoadingDraft(false);
    };

    load();
  }, [draftId]);

  return { draftId, loadingDraft };
}