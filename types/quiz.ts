export type QuestionType = "multiple" | "truefalse" | "short";

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: Option[];
  correctOptionId: string | null;
  correctAnswer: string;       
  timeLimit: string;
  customTime: string;
  points: string;
  difficulty: string;
  indice: string;
}

export const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700",
  Medium: "text-amber-500 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700",
  Hard: "text-red-500 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700",
  Mixed: "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-700",
};

export const TYPE_LABELS: Record<QuestionType, string> = {
  multiple: "Multiple Choice",
  truefalse: "True / False",
  short: "Short Answer",
};

export const TYPE_ICONS: Record<QuestionType, string> = {
  multiple: "☰",
  truefalse: "⇄",
  short: "✏️",
};

export const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export const defaultQuestion = (defaultTime=30): Question => ({
  id: crypto.randomUUID(),
  text: "",
  type: "multiple",
  options: [
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" },
    { id: crypto.randomUUID(), text: "" },
  ],
  correctOptionId: null,
  correctAnswer: "",             
  timeLimit: "30",
  customTime: "",
  points: "Standard (1x)",
  difficulty: "Easy",
  indice: "",
});

// ─── PLAY PAGE TYPES ───────────────────────────────────

export interface PlayOption {
  id: string;
  text: string;
  is_correct: boolean;
  question_id: string;
}

export interface PlayQuestion {
  id: string;
  text: string;
  type: string;                  
  indice?: string | null;
  
  correct_answer?: string | null;
  quiz_id: string;
  options: PlayOption[];
}

export interface QuizFull {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  time_per_question: number;
  questions: PlayQuestion[];
}
//Multiplayer Page Types
export interface Player {
  userId: string;
  name: string;
  score: number;
  rank: number;
  isMe: boolean;
}

export interface Props {
  quiz: QuizFull;
  roomId: string;
}
export interface leaderProps {
  leaderboard: Player[];
  myRank: number;
  totalScore: number;
  quizTitle: string;
}
export type Phase = "countdown" | "playing" | "leaderboard" | "finished";
export interface LeaderboardPhaseProps {
  wasCorrect: boolean | null;
  lastScoreEarned: number;
  myRank: number;
  leaderboard: Player[];
  isLast: boolean;
}
export type Rank = {
  avatar:    string;
  score:     string;
  bar:       string;
  track:     string;
  rowAccent: string;
  rowBg:     string;
  rankNum:   string;
};
export type LobbyPlayer = {
  id: string;
  user_id: string;
  room_id: string;
  score: number;
  joined_at: string;
  displayName: string;
  displayInitial: string;
};