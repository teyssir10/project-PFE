import { supabase } from "../supabase";
import { getCurrentUser } from "./user";

// GET ALL QUIZZES
// GET ALL QUIZZES
export const fetchQuizzes = async () => {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};
// GET QUIZ WITH QUESTIONS
export const getQuizWithQuestions = async (quizId: string) => {
  const { data, error } = await supabase
    .from("quizzes")
    .select(`
      *,
      questions (*)
    `)           // ← supprimez ", options (*)"
    .eq("id", quizId)
    .single();

  if (error) throw error;

  if (data?.questions) {
    data.questions = data.questions.map((q: any) => ({
      ...q,
      options: q.options ?? [],  // ← déjà dans la colonne JSON
    }));
  }

  return data;
};
// UPDATE QUIZ
export const updateQuiz = async (
  id: string,
  updates: { title?: string; difficulty?: string }
) => {
  const { data, error } = await supabase
    .from("quizzes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// DELETE QUIZ
export const deleteQuiz = async (id: string) => {
  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", id);

  if (error) throw error;
};