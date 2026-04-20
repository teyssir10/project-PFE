export type Difficulty = "Easy" | "Medium" | "Hard" | "Mixed";

export interface QuizFormState {
  prompt: string;
  category: string;
  language: string;
  difficulty: Difficulty;
  numQuestions: string;
  customQuestions: number | null;
  title: string;
  timer: string;
  customTimer: number | null;
}

export const DEFAULT_FORM_STATE: QuizFormState = {
  prompt: "",
  category: "Technology",
  language: "English",
  difficulty: "Medium",
  numQuestions: "15",
  customQuestions: null,
  title: "",
  timer: "10",
  customTimer: null,
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

export const CATEGORIES = [
  { value: "Technology", label: "Technology" },
  { value: "Science",    label: "Science" },
  { value: "History",    label: "History" },
  { value: "Math",       label: "Math" },
];

export const LANGUAGES = [
  { value: "English", label: "🇬🇧 English" },
  { value: "French",  label: "🇫🇷 French" },
  { value: "Spanish", label: "🇪🇸 Spanish" },
  { value: "Arabic",  label: "🇸🇦 Arabic" },
];