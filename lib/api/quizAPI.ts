import { supabase } from "@/lib/supabase";
import { Question } from "@/types/quiz";

interface SaveQuizParams {
  quizTitle: string;
  questions: Question[];
  userId: string;
  userFirstname?: string;
  userLastname?: string;
  quizDifficulty: string;
  coverImage?: string | null;
  timePerQuestion: string;
  categoryId: string | null;
  getEffectiveTimeLimit: (q: Question) => string;
  source?: "manual" | "ai";
  status?: "published" | "pending_admin" | "draft";
  aiScore?: number | null;
  aiRemarks?: string[] | null;
  editId?: string | null;
}

// ✅ Construit les options en jsonb (plus de table séparée)
function buildOptions(q: Question) {
  if (q.type === "short" || !q.options?.length) return null;
  return q.options.map((o) => ({
    id: o.id || crypto.randomUUID(),
    text: o.text,
    is_correct: o.id === q.correctOptionId,
  }));
}

export async function saveQuiz({
  quizTitle,
  questions,
  userId,
  userFirstname = "",
  userLastname = "",
  quizDifficulty,
  coverImage,
  timePerQuestion,
  categoryId,
  getEffectiveTimeLimit,
  source = "manual",
  status = "published",
  aiScore = null,
  aiRemarks = null,
  editId = null,
}: SaveQuizParams): Promise<void> {

  // ── MODE EDIT ──────────────────────────────────────────────────────────
  if (editId) {
    // 1. Mettre à jour les infos du quiz
    const { error: updateError } = await supabase
      .from("quizzes")
      .update({
        title:             quizTitle,
        difficulty:        quizDifficulty,
        cover_image:       coverImage ?? null,
        question_count:    questions.length,
        time_per_question: parseInt(timePerQuestion) || 30,
        category_id:       categoryId,
        status,
        is_published:      status === "published",
        ai_score:          aiScore,
        ai_remarks:        aiRemarks,
      })
      .eq("id", editId);

    if (updateError) throw updateError;

    // 2. Supprimer les anciennes questions
    await supabase
      .from("questions")
      .delete()
      .eq("quiz_id", editId);

    // 3. Insérer les nouvelles questions avec options en jsonb
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      const { error: qError } = await (supabase as any)
        .from("questions")
        .insert({
          quiz_id:           editId,
          text:              q.text,
          type:              q.type,
          time_limit:        getEffectiveTimeLimit(q),
          points:            q.points,
          difficulty:        q.difficulty,
          indice:            q.indice || null,
          correct_answer:    q.type === "short" ? (q.correctAnswer?.trim() || null) : null,
          order_index:       i,
          // ✅ Options stockées directement en jsonb
          options:           buildOptions(q),
          correct_option_id: q.type !== "short" ? (q.correctOptionId ?? null) : null,
        } as any);

      if (qError) throw qError;
    }

    return; // ✅ Fin du mode edit
  }

  // ── MODE CRÉATION ──────────────────────────────────────────────────────
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      title:             quizTitle,
      creator_id:        userId,
      creator_name:      `${userFirstname} ${userLastname}`.trim(),
      difficulty:        quizDifficulty,
      cover_image:       coverImage ?? null,
      question_count:    questions.length,
      time_per_question: parseInt(timePerQuestion) || 30,
      category_id:       categoryId,
      featured:          false,
      is_community:      false,
      players:           0,
      duration:          0,
      source,
      status,
      is_published:      status === "published",
      ai_score:          aiScore,
      ai_remarks:        aiRemarks,
    })
    .select()
    .single();

  if (quizError) {
    console.error("Quiz insert error:", quizError);
    throw quizError;
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    const { error: qError } = await (supabase as any)
      .from("questions")
      .insert({
        quiz_id:           quiz.id,
        text:              q.text,
        type:              q.type,
        time_limit:        getEffectiveTimeLimit(q),
        points:            q.points,
        difficulty:        q.difficulty,
        indice:            q.indice || null,
        correct_answer:    q.type === "short" ? (q.correctAnswer?.trim() || null) : null,
        order_index:       i,
        // ✅ Options stockées directement en jsonb
        options:           buildOptions(q),
        correct_option_id: q.type !== "short" ? (q.correctOptionId ?? null) : null,
      } as any);

    if (qError) throw qError;
  }
}