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
  timeLimit: string;
  customTime: string;
  points: string;
  difficulty: string;
  explanation: string;
}

export const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700",
  Medium: "text-amber-500 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700",
  Hard: "text-red-500 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700",
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

export const defaultQuestion = (): Question => ({
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
  timeLimit: "30",
  customTime: "",
  points: "Standard (1x)",
  difficulty: "Easy",
  explanation: "",
});