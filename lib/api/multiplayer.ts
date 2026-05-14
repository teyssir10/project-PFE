import { supabase } from "@/lib/supabase";
import { Player , LobbyPlayer } from "@/types/quiz";

const generateCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createRoom = async (quizId: string): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let code = generateCode();
  let exists = true;
  while (exists) {
    const { data } = await supabase.from("rooms").select("id").eq("code", code).single();
    if (!data) exists = false;
    else code = generateCode();
  }

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({ code, host_id: user.id, quiz_id: quizId, status: "waiting" })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("players").insert({ user_id: user.id, room_id: room.id, score: 0 });

  return code;
};

export const joinRoom = async (code: string): Promise<{ roomId: string; quizId: string }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: room, error } = await supabase
    .from("rooms").select("*").eq("code", code.toUpperCase()).single();

  if (error || !room) throw new Error("Room introuvable");
  if (room.status !== "waiting") throw new Error("La partie a déjà commencé");

  await supabase.from("players").upsert(
    { user_id: user.id, room_id: room.id, score: 0 },
    { onConflict: "user_id,room_id" }
  );

  return { roomId: room.id, quizId: room.quiz_id };
};

export const insertGameState = async (roomId: string): Promise<void> => {
  const { error } = await supabase.from("game_state").insert({
    room_id: roomId,
    current_question_index: 0,
    question_start_time: new Date().toISOString(),
    status: "playing",
  });
  if (error) throw new Error(error.message);
};

export const nextQuestion = async (roomId: string, nextIndex: number): Promise<void> => {
  await supabase.from("game_state")
    .update({ current_question_index: nextIndex, question_start_time: new Date().toISOString() })
    .eq("room_id", roomId);
};

export const finishGame = async (roomId: string): Promise<void> => {
  await supabase.from("game_state").update({ status: "finished" }).eq("room_id", roomId);
  await supabase.from("rooms").update({ status: "finished" }).eq("id", roomId);
};

export const submitAnswer = async ({
  userId, roomId, questionId, optionId, isCorrect, timeTaken, scoreEarned,
}: {
  userId: string; roomId: string; questionId: string;
  optionId: string | null; isCorrect: boolean; timeTaken: number; scoreEarned: number;
}): Promise<void> => {
  await supabase.from("answers").upsert({
    user_id: userId, room_id: roomId, question_id: questionId,
    option_id: optionId, is_correct: isCorrect, time_taken: timeTaken, score_earned: scoreEarned,
  }, { onConflict: "user_id,room_id,question_id" });

  const { data: player } = await supabase
    .from("players").select("score").eq("room_id", roomId).eq("user_id", userId).single();

  if (player) {
    await supabase.from("players")
      .update({ score: player.score + scoreEarned })
      .eq("room_id", roomId).eq("user_id", userId);
  }
};

// ── Leaderboard ────────────────────────────────────────────────────────────

export const fetchLeaderboard = async (roomId: string): Promise<Omit<Player, "isMe">[]> => {
  const { data: players } = await supabase
    .from("players").select("user_id, score")
    .eq("room_id", roomId).order("score", { ascending: false });

  if (!players) return [];

  const { data: users } = await supabase
    .from("users").select("id, firstname, lastname")
    .in("id", players.map(p => p.user_id));

  let rank = 1;
  return players.map((p, idx) => {
    if (idx > 0 && p.score < players[idx - 1].score) rank = idx + 1;
    const u = (users || []).find(u => u.id === p.user_id);
    return {
      rank,
      userId: p.user_id,
      name: u ? `${u.firstname} ${u.lastname || ""}`.trim() : "???",
      score: p.score,
    };
  });
};

export const fetchLeaderboardWithMe = async (roomId: string, currentUserId?: string): Promise<Player[]> => {
  const raw = await fetchLeaderboard(roomId);
  return raw.map(p => ({ ...p, isMe: p.userId === currentUserId }));
};

export const checkAllAnswered = async (roomId: string, questionId: string): Promise<{ allAnswered: boolean; totalPlayers: number }> => {
  const { count: answersCount } = await supabase
    .from("answers").select("*", { count: "exact", head: true })
    .eq("room_id", roomId).eq("question_id", questionId);

  const { count: playersCount } = await supabase
    .from("players").select("*", { count: "exact", head: true })
    .eq("room_id", roomId);

  const total = playersCount ?? 0;
  const answered = answersCount ?? 0;

  return { allAnswered: total > 0 && answered >= total, totalPlayers: total };
};

export const setGameStatus = async (roomId: string, status: string): Promise<void> => {
  await supabase.from("game_state").update({ status }).eq("room_id", roomId);
};

export const advanceQuestion = async (roomId: string, nextIndex: number): Promise<void> => {
  await supabase.from("game_state").update({
    status: "playing",
    current_question_index: nextIndex,
    question_start_time: new Date().toISOString(),
  }).eq("room_id", roomId);
};

// ── Lobby helpers ──────────────────────────────────────────────────────────


export const fetchPlayersWithNames = async (roomId: string): Promise<LobbyPlayer[]> => {
  const { data, error } = await supabase
    .from("players").select("*").eq("room_id", roomId).order("joined_at", { ascending: true });

  if (error || !data) return [];

  const { data: usersData } = await supabase
    .from("users").select("id, firstname, lastname")
    .in("id", data.map(p => p.user_id));

  return data.map(player => {
    const user = (usersData || []).find(u => u.id === player.user_id);
    return {
      ...player,
      displayName:    user ? `${user.firstname} ${user.lastname || ""}`.trim() : player.user_id?.slice(0, 8) + "...",
      displayInitial: user ? user.firstname.charAt(0).toUpperCase() : "?",
    };
  });
};

export const leaveRoom = async (userId: string, roomId: string): Promise<void> => {
  const { error } = await supabase.from("players").delete().eq("user_id", userId).eq("room_id", roomId);
  if (error) throw new Error(error.message);
};

export const closeRoom = async (roomId: string): Promise<void> => {
  const { error } = await supabase.from("rooms").update({ status: "finished" }).eq("id", roomId);
  if (error) throw new Error(error.message);
};

export const upsertPlayer = async (userId: string, roomId: string): Promise<void> => {
  await supabase.from("players").upsert(
    { user_id: userId, room_id: roomId },
    { onConflict: "user_id,room_id" }
  );
};