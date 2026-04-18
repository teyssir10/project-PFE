import { create } from "zustand";

type QuizMode = "ai" | "manual";

type QuizModeStore = {
  mode: QuizMode;
  setMode: (mode: QuizMode) => void;
};

export const useQuizModeStore = create<QuizModeStore>((set) => ({
  mode: "ai",
  setMode: (mode) => set({ mode }),
}));