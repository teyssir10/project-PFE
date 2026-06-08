export type Difficulty = "Easy" | "Medium" | "Hard" | "Mixed";
export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "mixed";

export interface QuizFormState {
  prompt: string;
  category: string;
  customCategory: string;
  language: string;
  customLanguage: string;
  difficulty: Difficulty;
  numQuestions: string;
  customQuestions: number | null;
  title: string;
  timer: string;
  customTimer: number | null;
  questionType: QuestionType;
}

export const DEFAULT_FORM_STATE: QuizFormState = {
  prompt: "",
  category: "Technology",
  customCategory: "",
  language: "English",
  customLanguage: "",
  difficulty: "Medium",
  numQuestions: "15",
  customQuestions: null,
  title: "",
  timer: "10",
  customTimer: null,
  questionType: "multiple_choice",
};

export const SUGGESTIONS = [
  "Add code examples",
  "Common mistakes",
  "Interview-style",
  "Include explanations",
];

export const DIFFICULTY_CONFIG: Record<Difficulty, { active: string }> = {
  Easy:   { active: "bg-emerald-500 text-white shadow-emerald-200" },
  Medium: { active: "bg-amber-500 text-white shadow-amber-200" },
  Hard:   { active: "bg-red-500 text-white shadow-red-200" },
  Mixed:  { active: "bg-cyan-500 text-white shadow-cyan-200" },
};


export const CATEGORY_VALUES = [
  "Technology", "Science", "History", "Math", "Custom",
] as const;

export const LANGUAGE_VALUES = [
  "English", "French", "Spanish", "Arabic", "Custom",
] as const;

export const QUESTION_TYPE_VALUES = [
  "multiple_choice", "true_false", "short_answer", "mixed",
] as const;