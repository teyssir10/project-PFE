import { supabase } from "../supabase";
import { getCurrentUser } from "./user";

export const fetchFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from("favorites")
    .select("quiz_id")
    .eq("user_id", userId);

  if (error) throw error;

  return (data ?? []).map((f) => f.quiz_id);
};

export const addFavorite = async (quizId: string) => {
  const user = await getCurrentUser();

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    quiz_id: quizId,
  });

  if (error) throw error;
};

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

