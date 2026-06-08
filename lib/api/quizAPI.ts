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
  draftId?: string | null; 
}

const capitalizeDifficulty = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "Medium";

function buildOptions(q: Question) {
  if (q.type === "short" || !q.options?.length) return null;
  return q.options.map((o) => ({
    id: o.id || crypto.randomUUID(),
    text: o.text,
    is_correct: o.id === q.correctOptionId,
  }));
}

function calcDuration(questionCount: number, timePerQuestion: string): number {
  const seconds = questionCount * (parseInt(timePerQuestion) || 30);
  return Math.ceil(seconds / 60);
}

function detectQuestionType(questions: Question[]): string {
  if (!questions || questions.length === 0) return "multiple_choice";
  const normalize = (type: string): string => {
    if (type === "short")    return "short_answer";
    if (type === "tf")       return "true_false";
    if (type === "multiple") return "multiple_choice";
    return type;
  };
  const types = new Set(questions.map((q) => normalize(q.type)));
  if (types.size > 1)               return "mixed";
  if (types.has("true_false"))      return "true_false";
  if (types.has("short_answer"))    return "short_answer";
  return "multiple_choice";
}


async function deleteDraftIfExists(draftId?: string | null) {
  if (!draftId) return;
  const { error } = await supabase
    .from("quiz_drafts")
    .delete()
    .eq("id", draftId);
  if (error) console.warn("Could not delete draft:", error.message);
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
  draftId = null,
}: SaveQuizParams): Promise<void> {

  const safeDifficulty = capitalizeDifficulty(quizDifficulty);
  const questionType   = detectQuestionType(questions);

  // ── MODE EDIT ──────────────────────────────────────────────────────────
  if (editId) {
    const { error: updateError } = await supabase
      .from("quizzes")
      .update({
        title:             quizTitle,
        difficulty:        safeDifficulty,
        cover_image:       coverImage ?? null,
        question_count:    questions.length,
        time_per_question: parseInt(timePerQuestion) || 30,
        duration:          calcDuration(questions.length, timePerQuestion),
        category_id:       categoryId,
        status,
        is_published:      status === "published",
        ai_score:          aiScore,
        ai_remarks:        aiRemarks,
        question_type:     questionType,
      })
      .eq("id", editId);

    if (updateError) throw updateError;

    await supabase.from("questions").delete().eq("quiz_id", editId);

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
          difficulty:        safeDifficulty,
          indice:            q.indice || null,
          correct_answer:    q.type === "short" ? (q.correctAnswer?.trim() || null) : null,
          order_index:       i,
          options:           buildOptions(q),
          correct_option_id: q.type !== "short" ? (q.correctOptionId ?? null) : null,
        } as any);
      if (qError) throw qError;
    }

    await deleteDraftIfExists(draftId);
    return;
  }

  // ── MODE CRÉATION ──────────────────────────────────────────────────────
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      title:             quizTitle,
      creator_id:        userId,
      creator_name:      `${userFirstname} ${userLastname}`.trim(),
      difficulty:        safeDifficulty,
      cover_image:       coverImage ?? null,
      question_count:    questions.length,
      time_per_question: parseInt(timePerQuestion) || 30,
      duration:          calcDuration(questions.length, timePerQuestion),
      category_id:       categoryId,
      featured:          false,
      is_community:      false,
      players:           0,
      source,
      status,
      is_published:      status === "published",
      ai_score:          aiScore,
      ai_remarks:        aiRemarks,
      question_type:     questionType,
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
        difficulty:        safeDifficulty,
        indice:            q.indice || null,
        correct_answer:    q.type === "short" ? (q.correctAnswer?.trim() || null) : null,
        order_index:       i,
        options:           buildOptions(q),
        correct_option_id: q.type !== "short" ? (q.correctOptionId ?? null) : null,
      } as any);
    if (qError) throw qError;
  }

  await deleteDraftIfExists(draftId);
}