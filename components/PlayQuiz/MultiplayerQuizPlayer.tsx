"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import { PlayOption, Props, Player, Phase } from "@/types/quiz";
import QuizHeader from "@/components/PlayQuiz/QuizHeader";
import OptionCard from "@/components/PlayQuiz/OptionCard";
import FinalLeaderboard from "@/components/PlayQuiz/FinalLeaderboard";
import { LeaderboardPhase } from "@/components/PlayQuiz/LeaderboardPhase";
import { checkAllAnswered, fetchLeaderboardWithMe, setGameStatus, advanceQuestion, finishGame } from "@/lib/api/multiplayer";

const isCorrect = (val: any): boolean => val === true || val === "true";
const calcScore = (correct: boolean): number => correct ? 10 : 0;

export default function MultiplayerQuizPlayer({ quiz, roomId }: Props) {
  const t = useTranslations("multiquizPlay");
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("countdown");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(quiz.time_per_question ?? 30);
  const [isHost, setIsHost] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [myRank, setMyRank] = useState(0);
  const [lastScoreEarned, setLastScoreEarned] = useState(0);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [allAnswered, setAllAnswered] = useState(false);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const scoreRef = useRef(score);
  const currentUserRef  = useRef(currentUser);
  const currentIndexRef = useRef(currentIndex);
  const isLastRef = useRef(false);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  const questionTotalTime = quiz.time_per_question ?? 30;
  const question = quiz.questions[currentIndex];
  const isLast = currentIndex === quiz.questions.length - 1;
  const isTimeout = selected === "__timeout__";

  useEffect(() => { isLastRef.current = isLast; }, [isLast]);

  const refreshLeaderboard = useCallback(async (userId?: string) => {
    const board = await fetchLeaderboardWithMe(roomId, userId);
    setLeaderboard(board);
    setMyRank(board.find(b => b.isMe)?.rank ?? 1);
  }, [roomId]);

  const refreshAnswerCount = useCallback(async () => {
    if (!question) return;
    const { allAnswered: done, totalPlayers: total } = await checkAllAnswered(roomId, question.id);
    setTotalPlayers(total);
    if (done) setAllAnswered(true);
  }, [roomId, question]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      const { data: room } = await supabase.from("rooms").select("host_id").eq("id", roomId).single();
      setIsHost(room?.host_id === user.id);

      const { data: gs } = await supabase.from("game_state").select("*").eq("room_id", roomId).single();

      if (gs?.status === "finished" || gs?.status === "leaderboard") {
        await refreshLeaderboard(user.id);
        setPhase(gs.status);
        return;
      }

      if (gs) {
        setCurrentIndex(gs.current_question_index ?? 0);
        setQuestionStartTime(gs.question_start_time);
      }
      setPhase("countdown");
    };
    init();
  }, [roomId, refreshLeaderboard]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown === 0) {
      const timer = setTimeout(() => { setPhase("playing"); setTimeLeft(questionTotalTime); }, 1000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown, questionTotalTime]);

  useEffect(() => {
    if (phase !== "playing" || confirmed) return;
    if (timeLeft === 0) { handleTimeout(); return; }
    const timer = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft, confirmed]);

  useEffect(() => {
    if (phase === "playing" && timeLeft === 0) setAllAnswered(true);
  }, [phase, timeLeft]);

  useEffect(() => {
    if (!isHost || !confirmed || allAnswered || phase !== "playing") return;
    const interval = setInterval(refreshAnswerCount, 2000);
    refreshAnswerCount();
    return () => clearInterval(interval);
  }, [isHost, confirmed, allAnswered, phase, refreshAnswerCount]);

  useEffect(() => {
    if (!currentUser || !isHost) return;
    const channel = supabase
      .channel(`answers-watch-${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "answers", filter: `room_id=eq.${roomId}` }, refreshAnswerCount)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "answers", filter: `room_id=eq.${roomId}` }, refreshAnswerCount)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId, currentUser, isHost, refreshAnswerCount]);

  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel(`multi-gs-${roomId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "game_state", filter: `room_id=eq.${roomId}`,
      }, async ({ new: gs }) => {
        if (gs.status === "leaderboard" || gs.status === "finished") {
          await refreshLeaderboard(currentUserRef.current?.id);
          setPhase(gs.status);
          return;
        }
        if (gs.status === "playing" && gs.current_question_index !== currentIndexRef.current) {
          setCurrentIndex(gs.current_question_index);
          setQuestionStartTime(gs.question_start_time);
          setSelected(null); setConfirmed(false); setWasCorrect(null);
          setLastScoreEarned(0); setAllAnswered(false);
          setTimeLeft(questionTotalTime);
          setPhase("playing");
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId, currentUser, refreshLeaderboard, questionTotalTime]);

  const handleTimeout = useCallback(async () => {
    if (confirmed) return;
    setSelected("__timeout__"); setConfirmed(true); setWasCorrect(false); setLastScoreEarned(0);
    if (currentUser && question) {
      await supabase.from("answers").upsert({
        user_id: currentUser.id, room_id: roomId, question_id: question.id,
        option_id: null, is_correct: false, time_taken: questionTotalTime, score_earned: 0,
      }, { onConflict: "user_id,room_id,question_id" });
    }
  }, [confirmed, currentUser, question, roomId, questionTotalTime]);

  const handleSelect = (opt: PlayOption) => {
    if (confirmed) return;
    setSelected(prev => prev === opt.id ? null : opt.id);
  };

  const handleConfirm = useCallback(async () => {
    if (confirmed || !selected || !currentUser || !question) return;
    const opt = question.options.find(o => o.id === selected);
    if (!opt) return;

    const timeTaken = questionStartTime
      ? (Date.now() - new Date(questionStartTime).getTime()) / 500
      : questionTotalTime;
    const correct = isCorrect(opt.is_correct);
    const earned = calcScore(correct);

    setConfirmed(true); setWasCorrect(correct); setLastScoreEarned(earned); setScore(s => s + earned);

    await Promise.all([
      supabase.from("answers").upsert({
        user_id: currentUser.id, room_id: roomId, question_id: question.id,
        option_id: selected, is_correct: correct, time_taken: timeTaken, score_earned: earned,
      }, { onConflict: "user_id,room_id,question_id" }),
      supabase.rpc("increment_player_score", { p_room_id: roomId, p_user_id: currentUser.id, p_score: earned }),
    ]);
  }, [confirmed, selected, currentUser, question, roomId, questionStartTime, questionTotalTime]);

  const handleNextQuestion = useCallback(async () => {
    const userId = currentUserRef.current?.id;
    await setGameStatus(roomId, "leaderboard");
    await refreshLeaderboard(userId);
    setPhase("leaderboard");

    setTimeout(async () => {
      if (isLastRef.current) {
        await finishGame(roomId);
        await refreshLeaderboard(userId);
        setPhase("finished");
      } else {
        const nextIndex = currentIndexRef.current + 1;
        await advanceQuestion(roomId, nextIndex);
        setSelected(null); setConfirmed(false); setWasCorrect(null);
        setLastScoreEarned(0); setAllAnswered(false);
        setCurrentIndex(nextIndex);
        setTimeLeft(questionTotalTime);
        setPhase("playing");
      }
    }, 5000);
  }, [roomId, refreshLeaderboard, questionTotalTime]);

  if (phase === "countdown") {
    const strokeColor =
      countdown === 3 ? "#22d3ee" :
      countdown === 2 ? "#34d399" :
      countdown === 1 ? "#f59e0b" : "#4ade80";

    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-cyan-900 dark:text-white text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            {t("question")} {currentIndex + 1} / {quiz.questions.length}
          </p>
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg width="160" height="160" className="absolute inset-0">
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle cx="80" cy="80" r="70" fill="none"
                stroke={strokeColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={2 * Math.PI * 70 * (1 - countdown / 3)}
                transform="rotate(-90 80 80)"
                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span key={countdown}
                className="font-black leading-none animate-in zoom-in-50 duration-150"
                style={{ fontSize: countdown === 0 ? "2.5rem" : "4.5rem", color: strokeColor }}>
                {countdown === 0 ? t("go") : countdown}
              </span>
            </div>
          </div>
          <p className="text-cyan-900 dark:text-white text-sm">{quiz.title}</p>
        </div>
      </div>
    );
  }

  if (phase === "leaderboard") return (
    <LeaderboardPhase
      wasCorrect={wasCorrect}
      lastScoreEarned={lastScoreEarned}
      myRank={myRank}
      leaderboard={leaderboard}
      isLast={isLast}
    />
  );

  if (phase === "finished") return (
    <FinalLeaderboard leaderboard={leaderboard} myRank={myRank} totalScore={scoreRef.current} quizTitle={quiz.title} />
  );

  if (!question) return null;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto relative z-10">

        <QuizHeader
          title={quiz.title}
          category={quiz.category}
          difficulty={quiz.difficulty}
          timeLeft={confirmed ? 0 : timeLeft}
          totalTime={questionTotalTime}
          onExit={() => router.push("/dashboard")}
        />

        <div className="flex-1 px-10 py-8 max-w-3xl w-full mx-auto">

          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 text-xs font-bold tracking-widest uppercase">
              {t("question")} {currentIndex + 1} / {quiz.questions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-xs font-bold">
                🎮 {t("multiplayer")}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                {score} {t("pts")}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
              {question.text}
            </h2>
            {isTimeout && (
              <div className="mt-4 flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300">
                <span>⏱</span><p>{t("timeExpired")}</p>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-6">
            {question.options.map((opt, i) => {
              let state: "default" | "correct" | "wrong" | "selected" | "reveal" = "default";
              if (!confirmed && selected === opt.id) state = "selected";
              else if (confirmed && !isTimeout) {
                if (opt.id === selected) state = isCorrect(opt.is_correct) ? "correct" : "wrong";
                else if (isCorrect(opt.is_correct)) state = "reveal";
              }
              return (
                <OptionCard
                  key={opt.id}
                  label={String.fromCharCode(65 + i)}
                  text={opt.text}
                  state={state}
                  onClick={() => handleSelect(opt)}
                  disabled={confirmed}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            {confirmed && wasCorrect !== null && (
              <span className={`text-sm font-bold ${wasCorrect ? "text-emerald-500" : "text-red-400"}`}>
                {wasCorrect ? `+${lastScoreEarned} ${t("pts")} ✅` : `${t("wrongAnswer")} ❌`}
              </span>
            )}

            <div className="flex items-center">
              {!confirmed && selected && (
                <button onClick={handleConfirm}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/25">
                  {t("confirm")}
                </button>
              )}

              {confirmed && !isHost && (
                <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-slate-500">
                  <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  {t("waitingForHost")}
                </div>
              )}

              {confirmed && isHost && (
                allAnswered ? (
                  <button onClick={handleNextQuestion}
                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/25">
                    {isLast ? t("finish") : t("nextQuestion")}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-slate-500">
                    <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    {t("waitingForPlayers", { count: totalPlayers > 0 ? totalPlayers : "..." })}
                  </div>
                )
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}