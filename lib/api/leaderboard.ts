import { supabase } from "@/lib/supabase";

export interface LeaderboardUser {
  id: string;
  firstname: string | null;
  lastname: string | null;
  country: string | null;
  region: string | null;
  total_score: number;
  quizzes_played: number;
  accuracy: number;
  avatar_url: string | null;
}

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, firstname, lastname, country, region, total_score, quizzes_played, accuracy, avatar_url"
    )
    .order("total_score", { ascending: false })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}