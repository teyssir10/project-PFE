"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { supabase } from "@/lib/supabase";

export default function QuizSettingsPage() {
  const t = useTranslations("manualQuiz");
  const tStepper = useTranslations("stepper");
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { setQuizData } = useQuizStore();

  const [title, setTitle]                       = useState("");
  const [description, setDescription]           = useState("");
  const [difficulty, setDifficulty]             = useState<Difficulty>("Medium");
  const [category, setCategory]                 = useState("");
  const [categoryId, setCategoryId]             = useState<string | null>(null);
  const [customCategory, setCustomCategory]     = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [time, setTime]                         = useState("20");
  const [isCustomTime, setIsCustomTime]         = useState(false);
  const [coverImage, setCoverImage]             = useState<string | null>(null);
  const [loading, setLoading]                   = useState(false);

  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const MANUAL_STEPS = [
    { id: 1, label: tStepper("manualStep1") },
    { id: 2, label: tStepper("manualStep2") },
    { id: 3, label: tStepper("manualStep3") },
  ];

  // ── Charge le draft si ?draft=ID ─────────────────────────────────────────
  useEffect(() => {
    const draftId = searchParams.get("draft");
    if (!draftId) return;

    const loadDraft = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("quiz_drafts")
        .select("*")
        .eq("id", draftId)
        .single();

      if (!error && data) {
        if (data.title)             setTitle(data.title);
        if (data.description)       setDescription(data.description);
        if (data.difficulty)        setDifficulty(data.difficulty as Difficulty);
        if (data.cover_image)       setCoverImage(data.cover_image);
        if (data.time_per_question) setTime(String(data.time_per_question));

        if (data.current_step >= 2) {
          setQuizData({
            title:           data.title,
            description:     data.description ?? "",
            difficulty:      data.difficulty as Difficulty,
            category:        "",
            categoryId:      null,
            timePerQuestion: String(data.time_per_question ?? 20),
            coverImage:      data.cover_image ?? null,
          });
          router.push(`/${locale}/create-quiz/manuelQuiz/question?draft=${draftId}`);
          return;
        }
      }
      setLoading(false);
    };

    loadDraft();
  }, [searchParams]);

  // ── Charge le quiz existant si ?edit=ID ──────────────────────────────────
  useEffect(() => {
    if (!editId) return;

    const loadQuiz = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", editId)
        .single();

      if (!error && data) {
        if (data.title)             setTitle(data.title);
        if (data.description)       setDescription(data.description ?? "");
        if (data.difficulty)        setDifficulty(data.difficulty as Difficulty);
        if (data.cover_image)       setCoverImage(data.cover_image);
        if (data.time_per_question) setTime(String(data.time_per_question));
        if (data.category)          setCategory(data.category);
      }
      setLoading(false);
    };

    loadQuiz();
  }, [editId]);

  // ── Continue / Save ───────────────────────────────────────────────────────
  const handleContinue = async () => {
    if (!title.trim()) { alert(t("alertTitle")); return; }

    if (isEditMode) {
      const { error } = await supabase
        .from("quizzes")
        .update({
          title,
          description,
          difficulty,
          cover_image:       coverImage,
          time_per_question: Number(time),
        })
        .eq("id", editId);

      if (error) { alert(t("updateError")); return; }

      setQuizData({
        title,
        description,
        difficulty,
        category:        isCustomCategory ? customCategory : category,
        categoryId:      isCustomCategory ? null : categoryId,
        timePerQuestion: time,
        coverImage,
      });

      router.push(`/${locale}/create-quiz/manuelQuiz/question?edit=${editId}`);
      return;
    }

    setQuizData({
      title,
      description,
      difficulty,
      category:        isCustomCategory ? customCategory : category,
      categoryId:      isCustomCategory ? null : categoryId,
      timePerQuestion: time,
      coverImage,
    });
    router.push(`/${locale}/create-quiz/manuelQuiz/question`);
  };

  const completionFields = [
    !!title.trim(),
    isCustomCategory ? !!customCategory : !!categoryId,
    true,
    true,
  ];
  const completionPct = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  const summaryItems = [
    { label: t("summaryTitle"),      value: title || "—"                                               },
    { label: t("summaryDifficulty"), value: difficulty                                                 },
    { label: t("summaryCategory"),   value: isCustomCategory ? customCategory || "—" : category || "—" },
    { label: t("summaryTimer"),      value: `${time}${t("perQuestion")}`                               },
    { label: t("summaryCover"),      value: coverImage ? t("uploaded") : "—"                           },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 dark:text-slate-500 font-medium">
            {/* ✅ Traduit */}
            {isEditMode ? t("loadingQuiz") : t("loadingDraft")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="h-[3px] w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500" />

      <div className="py-10 flex-1 flex items-start justify-center px-8 pb-20">
        <div className="w-full max-w-7xl">

          {/* Header */}
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
                  {/* ✅ Traduit */}
                  {isEditMode ? `✏️ ${t("editMode")}` : t("step")}
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {/* ✅ Traduit */}
                  {isEditMode ? t("editTitle") : t("title")}
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  {/* ✅ Traduit */}
                  {isEditMode ? t("editSubtitle") : t("subtitle")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Colonne gauche */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-sm">📝</span>
                  <h2 className="text-base font-bold text-gray-700 dark:text-slate-200">{t("basicInfo")}</h2>
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
                  <h2 className="text-base font-bold text-gray-700 dark:text-slate-200">{t("difficulty")}</h2>
                </div>
                <div className="p-8">
                  <DifficultySelector value={difficulty} onChange={setDifficulty} />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-sm">🏷️</span>
                  <h2 className="text-base font-bold text-gray-700 dark:text-slate-200">{t("category")}</h2>
                </div>
                <div className="p-8">
                  <CategorySelector
                    categoryId={categoryId}
                    customCategory={customCategory}
                    isCustom={isCustomCategory}
                    onSelect={(name, id) => { setCategory(name); setCategoryId(id); setIsCustomCategory(false); }}
                    onCustomToggle={() => { setIsCustomCategory(true); setCategory(""); setCategoryId(null); }}
                    onCustomChange={setCustomCategory}
                  />
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="lg:col-span-2 space-y-6 relative overflow-visible">
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-visible">
                <div className="absolute -top-20 -right-2 pointer-events-none select-none z-10">
                  <Image src={cardd} alt="PandoMind mascot" width={140} height={140} className="object-contain drop-shadow-xl" priority />
                </div>
                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-sm">🖼️</span>
                  <h2 className="text-base font-bold text-gray-700 dark:text-slate-200">{t("coverImage")}</h2>
                  <span className="ml-auto text-[10px] text-gray-400 dark:text-slate-500 font-medium">{t("optional")}</span>
                </div>
                <div className="p-8">
                  <CoverImageUpload value={coverImage} onChange={setCoverImage} />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-sm">⏱️</span>
                  <h2 className="text-base font-bold text-gray-700 dark:text-slate-200">{t("timePerQuestion")}</h2>
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
                <p className="text-xs font-bold text-cyan-700 dark:text-cyan-400 tracking-widest uppercase mb-4">
                  {t("summary")}
                </p>
                <div className="space-y-3">
                  {summaryItems.map((item) => (
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

          {/* Footer */}
          <div className="mt-10 flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border text-sm font-medium transition-all border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white dark:hover:border-slate-500"
            >
              {t("back")}
            </button>
            <button
              onClick={handleContinue}
              disabled={!title.trim()}
              className="px-10 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              {/* ✅ Traduit */}
              {isEditMode ? t("editNext") : t("continue")}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <StepperBar currentStep={1} steps={MANUAL_STEPS} />
    </div>
  );
}