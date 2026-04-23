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
  getEffectiveTimeLimit: (q: Question) => string;
}

export async function saveQuiz({
  quizTitle,
  questions,
  userId,
  userFirstname = "",
  userLastname = "",
  quizDifficulty, 
  coverImage,
  getEffectiveTimeLimit,
}: SaveQuizParams): Promise<void> {

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      title: quizTitle,
      creator_id: userId,
      creator_name: `${userFirstname} ${userLastname}`.trim(),
      difficulty: quizDifficulty, 
      cover_image: coverImage ?? null,
      question_count: questions.length,
      featured: false,
      is_community: false,
      players: 0,
      duration: 0,
    })
    .select()
    .single();

  if (quizError) throw quizError;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    const { data: insertedQ, error: qError } = await (supabase as any)
      .from("questions")
      .insert({
        quiz_id: quiz.id,
        text: q.text,
        type: q.type,
        time_limit: getEffectiveTimeLimit(q),
        points: q.points,
        difficulty: q.difficulty,
        explanation: q.explanation || null,
        order_index: i,
      } as any)
      .select()
      .single();

    if (qError) throw qError;

    if (q.type !== "short" && q.options.length > 0) {
      const optionRows = q.options.map((o) => ({
        question_id: insertedQ.id,
        text: o.text,
        is_correct: o.id === q.correctOptionId,
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