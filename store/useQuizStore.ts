import { create } from "zustand";

type QuizState = {
  title: string;
  description: string;
  difficulty: string;
  category: string;
  categoryId: string | null; // ← AJOUTER
  timePerQuestion: string;
  coverImage: string | null;
  setQuizData: (data: Partial<QuizState>) => void;
};

export const useQuizStore = create<QuizState>((set) => ({
  title: "",
  description: "",
  difficulty: "Medium",
  category: "",
  categoryId: null,          // ← AJOUTER
  timePerQuestion: "20",
  coverImage: null,
  setQuizData: (data) => set((state) => ({ ...state, ...data })),
}));