import { create } from "zustand";

type QuizState = {
  title: string;
  description: string;
  difficulty: string;
  category: string;
  timePerQuestion: string;

  setQuizData: (data: Partial<QuizState>) => void;
};

export const useQuizStore = create<QuizState>((set) => ({
  title: "",
  description: "",
  difficulty: "Medium",
  category: "",
  timePerQuestion: "20",

  setQuizData: (data) => set((state) => ({ ...state, ...data })),
}));