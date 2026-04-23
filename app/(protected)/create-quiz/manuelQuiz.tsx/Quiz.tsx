"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/store/useQuizStore";
import StepperBar from "@/components/Navigation/StepperBar";
import { Difficulty } from "@/types/aiquiz";
import Image from "next/image";
import cardd from "@/public/cardd.png";

import CoverImageUpload from "@/components/createquiz/manual/quizz/Coverimageupload";
import DifficultySelector from "@/components/createquiz/manual/quizz/Difficultyselector";
import CategorySelector from "@/components/createquiz/manual/quizz/Categoryselector";
import TimerSelector from "@/components/createquiz/manual/quizz/Timerselector";
import QuizInfoFields from "@/components/createquiz/manual/quizz/quizinfofields";

export default function QuizSettingsPage() {
  const router = useRouter();
  const { setQuizData } = useQuizStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [time, setTime] = useState("20");
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const handleContinue = () => {
  if (!title.trim()) { alert("Please enter a quiz title"); return; }
  const finalCategory = isCustomCategory ? customCategory : category;
  setQuizData({
    title,
    description,
    difficulty,
    category: finalCategory,
    timePerQuestion: time,
    coverImage,
  });
  router.push("/create-quiz/manuelQuiz.tsx/question");
};
  const completionFields = [
    !!title.trim(),
    !!category || !!customCategory,
    true,
    true,
  ];
  const completionPct = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  return (
    <div className="min-h-screen pb-20 flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="h-[3px] w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500" />

      <div className="py-10 flex-1 flex items-start justify-center px-8 pb-20">
        <div className="w-full max-w-7xl">

          <div className="mb-6">
            <div className="flex items-end gap-4 mb-3">
              <div className="relative w-15 h-15 shrink-0">
                <svg className="w-15 h-15 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor"
                    className="text-gray-200 dark:text-slate-800" strokeWidth="4" />
                  <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor"
                    className="text-cyan-500 transition-all duration-500"
                    strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - completionPct / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-700 dark:text-slate-300">
                  {completionPct}%
                </span>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 text-xs font-bold tracking-widest uppercase mb-2 block">
                  Step 1 of 3
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Quiz Settings
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Set up your quiz details before adding questions
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-sm">📝</span>
                  <h2 className="text-base font-bold text-gray-700 dark:text-slate-200">Basic Info</h2>
                </div>
                <div className="p-8 space-y-5">
                  <QuizInfoFields
                    title={title}
                    description={description}
                    onTitleChange={setTitle}
                    onDescriptionChange={setDescription}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm">⚡</span>
                  <h2 className="text-base font-bold text-gray-700 dark:text-slate-200">Difficulty</h2>
                </div>
                <div className="p-8">
                  <DifficultySelector value={difficulty} onChange={setDifficulty} />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-sm">🏷️</span>
                  <h2 className="text-base font-bold text-gray-700 dark:text-slate-200">Category</h2>
                </div>
                <div className="p-8">
                  <CategorySelector
                    category={category}
                    customCategory={customCategory}
                    isCustom={isCustomCategory}
                    onSelect={(v) => { setCategory(v); setIsCustomCategory(false); }}
                    onCustomToggle={() => { setIsCustomCategory(true); setCategory(""); }}
                    onCustomChange={setCustomCategory}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6 relative overflow-visible">
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-visible">
                <div className="absolute -top-20 -right-2 pointer-events-none select-none z-10">
                  <Image src={cardd} alt="PandoMind mascot" width={140} height={140} className="object-contain drop-shadow-xl" priority />
                </div>
                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-sm">🖼️</span>
                  <h2 className="text-base font-bold text-gray-700 dark:text-slate-200">Cover Image</h2>
                  <span className="ml-auto text-[10px] text-gray-400 dark:text-slate-500 font-medium">optional</span>
                </div>
                <div className="p-8">
                  <CoverImageUpload value={coverImage} onChange={setCoverImage} />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-sm">⏱️</span>
                  <h2 className="text-base font-bold text-gray-700 dark:text-slate-200">Time per Question</h2>
                </div>
                <div className="p-8">
                  <TimerSelector
                    value={time}
                    isCustom={isCustomTime}
                    onSelect={(v) => { setTime(v); setIsCustomTime(false); }}
                    onCustomToggle={() => setIsCustomTime(true)}
                    onCustomChange={(v) => setTime(v)}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-2xl border border-cyan-100 dark:border-cyan-800/40 p-8">
                <p className="text-xs font-bold text-cyan-700 dark:text-cyan-400 tracking-widest uppercase mb-4">Summary</p>
                <div className="space-y-3">
                  {[
                    { label: "Title",      value: title || "—" },
                    { label: "Difficulty", value: difficulty },
                    { label: "Category",   value: isCustomCategory ? customCategory || "—" : category || "—" },
                    { label: "Timer",      value: `${time}s per question` },
                    { label: "Cover",      value: coverImage ? "✓ Uploaded" : "—" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center text-sm">
                      <span className="text-cyan-600 dark:text-cyan-500 font-medium">{item.label}</span>
                      <span className="text-cyan-900 dark:text-cyan-200 font-semibold truncate max-w-[160px] text-right">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border text-sm font-medium transition-all border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white dark:hover:border-slate-500"
            >
              ← Back
            </button>
            <button
              onClick={handleContinue}
              disabled={!title.trim()}
              className="px-10 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              Continue to Questions
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      <StepperBar currentStep={1} />
    </div>
  );
}