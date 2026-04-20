import { supabase } from "../supabase";
import { getCurrentUser } from "./user";


// 🔹 GET ALL QUIZZES
export const fetchQuizzes = async () => {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

// 🔹 GET FAVORITES


// 🔹 ADD FAVORITE
export const addFavorite = async (quizId: string) => {
  const user = await getCurrentUser();

  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    quiz_id: quizId,
  });

  if (error) throw error;
};

// 🔹 REMOVE FAVORITE
export const removeFavorite = async (quizId: string) => {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("quiz_id", quizId)
    .eq("user_id", user.id);

  if (error) throw error;
};
// 🔹 GET QUIZ WITH QUESTIONS + OPTIONS (for play page)
// 🔹 GET QUIZ WITH QUESTIONS + OPTIONS (for play page)
export const getQuizWithQuestions = async (quizId: string) => {
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (quizError) throw quizError;

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("created_at", { ascending: true });

  if (questionsError) throw questionsError;

  const questionsWithOptions = await Promise.all(
    (questions ?? []).map(async (question: Record<string, any>) => {
      const { data: options, error: optionsError } = await supabase
        .from("options")
        .select("*")
        .eq("question_id", question.id);

      if (optionsError) throw optionsError;

      return { ...question, options: options ?? [] };
    })
  );

  return { ...(quiz as Record<string, any>), questions: questionsWithOptions };
};