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
  // ✅ Nouveau champ pour le mode edit
  editId?: string | null;
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

  // ✅ MODE EDIT
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

    // 2. Récupérer les anciennes questions pour supprimer leurs options
    const { data: oldQuestions } = await supabase
      .from("questions")
      .select("id")
      .eq("quiz_id", editId);

    if (oldQuestions && oldQuestions.length > 0) {
      const oldQuestionIds = oldQuestions.map((q) => q.id);

      // 3. Supprimer les options des anciennes questions
      await supabase
        .from("options")
        .delete()
        .in("question_id", oldQuestionIds);
    }

    // 4. Supprimer les anciennes questions
    await supabase
      .from("questions")
      .delete()
      .eq("quiz_id", editId);

    // 5. Insérer les nouvelles questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      const { data: insertedQ, error: qError } = await (supabase as any)
        .from("questions")
        .insert({
          quiz_id:        editId,
          text:           q.text,
          type:           q.type,
          time_limit:     getEffectiveTimeLimit(q),
          points:         q.points,
          difficulty:     q.difficulty,
          indice:         q.indice || null,
          correct_answer: q.type === "short" ? (q.correctAnswer?.trim() || null) : null,
          order_index:    i,
        } as any)
        .select()
        .single();

      if (qError) throw qError;

      // 6. Insérer les options
      if (q.type !== "short" && q.options.length > 0) {
        const optionRows = q.options.map((o) => ({
          question_id: insertedQ.id,
          text:        o.text,
          is_correct:  o.id === q.correctOptionId,
        }));

        const { data: insertedOptions, error: optError } = await (supabase as any)
          .from("options")
          .insert(optionRows as any[])
          .select();

        if (optError) throw optError;

        // 7. Mettre à jour correct_option_id
        if (insertedOptions && insertedOptions.length > 0) {
          const localIndex = q.options.findIndex((o) => o.id === q.correctOptionId);
          if (localIndex !== -1 && insertedOptions[localIndex]) {
            const correctId = insertedOptions[localIndex].id as string;
            await (supabase as any)
              .from("questions")
              .update({ correct_option_id: correctId } as any)
              .eq("id", insertedQ.id);
          }
        }
      }
    }

    return; // ✅ Fin du mode edit
  }

  // ==================== MODE CRÉATION ====================

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

  if (quizError) throw quizError;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    const { data: insertedQ, error: qError } = await (supabase as any)
      .from("questions")
      .insert({
        quiz_id:        quiz.id,
        text:           q.text,
        type:           q.type,
        time_limit:     getEffectiveTimeLimit(q),
        points:         q.points,
        difficulty:     q.difficulty,
        indice:         q.indice || null,
        correct_answer: q.type === "short" ? (q.correctAnswer?.trim() || null) : null,
        order_index:    i,
      } as any)
      .select()
      .single();

    if (qError) throw qError;

    if (q.type !== "short" && q.options.length > 0) {
      const optionRows = q.options.map((o) => ({
        question_id: insertedQ.id,
        text:        o.text,
        is_correct:  o.id === q.correctOptionId,
      }));

      const { data: insertedOptions, error: optError } = await (supabase as any)
        .from("options")
        .insert(optionRows as any[])
        .select();

      if (optError) throw optError;

      if (insertedOptions && insertedOptions.length > 0) {
        const localIndex = q.options.findIndex((o) => o.id === q.correctOptionId);
        if (localIndex !== -1 && insertedOptions[localIndex]) {
          const correctId = insertedOptions[localIndex].id as string;
          await (supabase as any)
            .from("questions")
            .update({ correct_option_id: correctId } as any)
            .eq("id", insertedQ.id);
        }
      }
    }
  }
}