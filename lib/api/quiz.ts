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