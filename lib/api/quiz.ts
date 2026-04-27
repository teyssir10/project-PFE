import { supabase } from "../supabase";
import { getCurrentUser } from "./user";


// GET ALL QUIZZES
export const fetchQuizzes = async () => {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};
export const getQuizWithQuestions = async (quizId: string) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      questions (
        *,
        options (*)
      )
    `)
    .eq('id', quizId)
    .single();

  if (error) throw error;
  return data;
};
