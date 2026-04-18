"use client";

import { useState } from "react";
import { Select, message } from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import StepperBar from "@/components/createquiz/StepperBar";

type QuestionType = "multiple" | "truefalse" | "short";

interface Option {
  id: string;
  text: string;
}

interface Question {
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

const defaultQuestion = (): Question => ({
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

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700",
  Medium: "text-amber-500 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700",
  Hard: "text-red-500 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700",
};

export default function ManualQuiz() {
  const [questions, setQuestions] = useState<Question[]>([defaultQuestion()]);
  const [activeId, setActiveId] = useState<string>(questions[0].id);
  const [quizTitle, setQuizTitle] = useState("Untitled Quiz");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const activeQuestion = questions.find((q) => q.id === activeId)!;
  const activeIndex = questions.findIndex((q) => q.id === activeId);

  const updateQuestion = (updated: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === activeId ? { ...q, ...updated } : q))
    );
  };

  const addQuestion = () => {
    const newQ = defaultQuestion();
    setQuestions((prev) => [...prev, newQ]);
    setActiveId(newQ.id);
  };

  const deleteQuestion = (id: string) => {
    if (questions.length === 1) return;
    const remaining = questions.filter((q) => q.id !== id);
    setQuestions(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
  };

  const addOption = () => {
    if (activeQuestion.options.length >= 6) return;
    updateQuestion({
      options: [...activeQuestion.options, { id: crypto.randomUUID(), text: "" }],
    });
  };

  const deleteOption = (optionId: string) => {
    if (activeQuestion.options.length <= 2) return;
    updateQuestion({
      options: activeQuestion.options.filter((o) => o.id !== optionId),
      correctOptionId:
        activeQuestion.correctOptionId === optionId ? null : activeQuestion.correctOptionId,
    });
  };

  const updateOption = (optionId: string, text: string) => {
    updateQuestion({
      options: activeQuestion.options.map((o) =>
        o.id === optionId ? { ...o, text } : o
      ),
    });
  };

  const handleTypeChange = (type: QuestionType) => {
    if (type === "truefalse") {
      updateQuestion({
        type,
        options: [
          { id: crypto.randomUUID(), text: "True" },
          { id: crypto.randomUUID(), text: "False" },
        ],
        correctOptionId: null,
      });
    } else if (type === "multiple") {
      updateQuestion({
        type,
        options: [
          { id: crypto.randomUUID(), text: "" },
          { id: crypto.randomUUID(), text: "" },
          { id: crypto.randomUUID(), text: "" },
          { id: crypto.randomUUID(), text: "" },
        ],
        correctOptionId: null,
      });
    } else {
      updateQuestion({ type, options: [], correctOptionId: null });
    }
  };

  const getEffectiveTimeLimit = (q: Question): string => {
    if (q.timeLimit === "custom") return q.customTime || "60";
    return q.timeLimit;
  };

  const saveQuiz = async () => {
    if (!user) return message.error("You must be logged in");

    // Validation
    for (const q of questions) {
      if (!q.text.trim()) {
        message.warning("Please fill in all question texts");
        setActiveId(q.id);
        return;
      }
      if (q.type !== "short" && !q.correctOptionId) {
        message.warning("Please select a correct answer for each question");
        setActiveId(q.id);
        return;
      }
    }

    setSaving(true);
    try {
      // 1. Créer le quiz
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          title: quizTitle,
          creator_id: user.id,
          creator_name: `${user.user_metadata?.firstname ?? ""} ${user.user_metadata?.lastname ?? ""}`.trim(),
          difficulty: questions[0]?.difficulty ?? "Easy",
          question_count: questions.length,
          featured: false,
          is_community: false,
          players: 0,
          duration: 0,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // 2. Insérer chaque question
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        const { data: insertedQ, error: qError } = await (supabase as any)
          .from("questions")
          .insert({
            quiz_id: quiz.id,
            text: q.text,
            type: q.type,
            time_limit: getEffectiveTimeLimit(q),
            points: q.points,
            difficulty: q.difficulty,
            explanation: q.explanation || null,
            order_index: i,
          } as any)
          .select()
          .single();

        if (qError) throw qError;

        // 3. Insérer les options
        if (q.type !== "short" && q.options.length > 0) {
          const optionRows = q.options.map((o) => ({
            question_id: insertedQ.id,
            text: o.text,
          }));

          const { data: insertedOptions, error: optError } = await (supabase as any)
            .from("options")
            .insert(optionRows as any[])
            .select();

          if (optError) throw optError;

          // 4. Mettre à jour correct_option_id
          if (insertedOptions && insertedOptions.length > 0) {
            const localIndex = q.options.findIndex(
              (o) => o.id === q.correctOptionId
            );
            if (localIndex !== -1 && insertedOptions[localIndex]) {
              const correctId = insertedOptions[localIndex].id as string;
              await (supabase as any)
                .from("questions")
                .update({ correct_option_id: correctId } as any)
                .eq("id", insertedQ.id);
            }
          }
        }
      }

      message.success("Quiz saved successfully! 🎉");
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { message: string };
      console.error(error);
      message.error("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const typeLabels: Record<QuestionType, string> = {
    multiple: "Multiple Choice",
    truefalse: "True / False",
    short: "Short Answer",
  };

  const typeIcons: Record<QuestionType, string> = {
    multiple: "☰",
    truefalse: "⇄",
    short: "✏️",
  };

  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans flex transition-colors duration-300">

 
<aside className="w-64 h-screen sticky top-0 flex flex-col bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 shadow-sm ">

  {/* ── HEADER ── */}
  <div className=" px-4 py-4 border-b border-gray-100 dark:border-slate-800 space-y-3 shrink-0">
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
    >
      <ArrowLeftOutlined /> Back
    </button>

    <div>
      <input
        type="text"
        value={quizTitle}
        onChange={(e) => setQuizTitle(e.target.value)}
        placeholder="Quiz title..."
        className="w-full text-sm font-bold bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-300 dark:placeholder-slate-600 border-b border-gray-200 dark:border-slate-700 focus:border-cyan-400 dark:focus:border-cyan-500 pb-1 transition-colors"
      />
      <p className="text-[10px] text-gray-400 dark:text-slate-600 mt-1">
        {questions.length} question{questions.length > 1 ? "s" : ""}
      </p>
    </div>
  </div>

  {/* ── QUESTIONS (SCROLLABLE) ── */}
  <div className="flex-1 min-h-0 relative">

    {/* gradient bas (optionnel, effet pro) */}
    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />

    <div
      className="h-full overflow-y-auto py-2 px-2 space-y-1"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>

      {questions.map((q, idx) => (
        <div
          key={q.id}
          onClick={() => setActiveId(q.id)}
          className={`group flex items-start gap-2.5 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
            activeId === q.id
              ? "bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800"
              : "hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent"
          }`}
        >
          <span
            className={`text-[10px] font-bold w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
              activeId === q.id
                ? "bg-cyan-500 text-white"
                : "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500"
            }`}
          >
            {idx + 1}
          </span>

          <div className="flex-1 min-w-0">
            <p
              className={`text-xs leading-snug line-clamp-2 ${
                activeId === q.id
                  ? "text-cyan-700 dark:text-cyan-300 font-semibold"
                  : "text-gray-600 dark:text-slate-400"
              }`}
            >
              {q.text || "Untitled question"}
            </p>

            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] text-gray-300 dark:text-slate-600 uppercase tracking-wide">
                {typeLabels[q.type]}
              </span>

              {q.correctOptionId && (
                <CheckCircleOutlined className="text-emerald-400 text-[9px]" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* ── FOOTER (FIXE) ── */}
  <div className=" sticky p-1 border-t border-gray-100 dark:border-slate-800 space-y-2 shrink-0 bg-white dark:bg-slate-900 ">
    
    <button
      onClick={addQuestion}
      className=" w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-gray-500 dark:text-slate-400 border border-dashed border-gray-200 dark:border-slate-700 hover:border-cyan-400 hover:text-cyan-500 dark:hover:border-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-all"
    >
      <PlusOutlined />
      Add question
    </button>

    <button
      onClick={saveQuiz}
      disabled={saving}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-md shadow-cyan-200 dark:shadow-cyan-900/40 transition-all disabled:opacity-60"
    >
      <SaveOutlined />
      {saving ? "Saving..." : "Save Quiz"}
    </button>
  </div>

</aside>

      {/* ── MAIN EDITOR ── */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${((activeIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-slate-500 font-medium shrink-0">
              {activeIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Question card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">

            {/* Type tabs */}
            <div className="flex items-center gap-1 p-4 border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
              {(["multiple", "truefalse", "short"] as QuestionType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeQuestion.type === type
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-300"
                  }`}
                >
                  <span>{typeIcons[type]}</span>
                  {typeLabels[type]}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-6">

              {/* Question text */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-2">
                  Question
                </label>
                <textarea
                  rows={3}
                  value={activeQuestion.text}
                  onChange={(e) => updateQuestion({ text: e.target.value })}
                  placeholder="Type your question here..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-white text-sm placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-900 resize-none transition-all"
                />
              </div>

              {/* Answers */}
              {activeQuestion.type !== "short" && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-3">
                    Answers — <span className="normal-case font-normal">click the circle to mark correct</span>
                  </label>
                  <div className="space-y-2">
                    {activeQuestion.options.map((opt, optIdx) => {
                      const isCorrect = activeQuestion.correctOptionId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 ${
                            isCorrect
                              ? "border-cyan-400 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 shadow-sm"
                              : "border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-gray-200 dark:hover:border-slate-600"
                          }`}
                        >
                          <span className={`text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                            isCorrect
                              ? "bg-cyan-500 text-white"
                              : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500"
                          }`}>
                            {optionLetters[optIdx]}
                          </span>
                          <button
                            onClick={() => updateQuestion({ correctOptionId: opt.id })}
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              isCorrect
                                ? "border-cyan-500 bg-cyan-500"
                                : "border-gray-300 dark:border-slate-600 hover:border-cyan-400"
                            }`}
                          >
                            {isCorrect && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </button>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => updateOption(opt.id, e.target.value)}
                            placeholder={`Option ${optionLetters[optIdx]}...`}
                            className="flex-1 text-sm bg-transparent outline-none text-gray-700 dark:text-slate-300 placeholder-gray-300 dark:placeholder-slate-600"
                          />
                          {activeQuestion.type !== "truefalse" && (
                            <button
                              onClick={() => deleteOption(opt.id)}
                              className="text-gray-200 dark:text-slate-700 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <DeleteOutlined className="text-xs" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {activeQuestion.type === "multiple" && activeQuestion.options.length < 6 && (
                    <button
                      onClick={addOption}
                      className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors px-2 py-1 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/10"
                    >
                      <PlusOutlined />
                      Add option
                    </button>
                  )}
                </div>
              )}

              {/* Short answer */}
              {activeQuestion.type === "short" && (
                <div className="p-5 rounded-xl border-2 border-dashed border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-center">
                  <p className="text-2xl mb-2">✏️</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                    Students will type their own answer
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Settings card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-4">
              Question Settings
            </h3>
            <div className="grid grid-cols-3 gap-4">

              {/* Time limit */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">
                  ⏱ Time limit
                </label>
                <Select
                  value={activeQuestion.timeLimit}
                  onChange={(v) => updateQuestion({ timeLimit: v })}
                  className="w-full"
                  options={[
                    { value: "10", label: "10 seconds" },
                    { value: "15", label: "15 seconds" },
                    { value: "20", label: "20 seconds" },
                    { value: "30", label: "30 seconds" },
                    { value: "45", label: "45 seconds" },
                    { value: "60", label: "1 minute" },
                    { value: "90", label: "1m 30s" },
                    { value: "120", label: "2 minutes" },
                    { value: "0", label: "No limit" },
                    { value: "custom", label: "⚙️ Custom..." },
                  ]}
                />
                {activeQuestion.timeLimit === "custom" && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={3600}
                      value={activeQuestion.customTime}
                      onChange={(e) => updateQuestion({ customTime: e.target.value })}
                      placeholder="ex: 75"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 outline-none focus:border-cyan-400 dark:focus:border-cyan-500 transition-colors"
                    />
                    <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0">sec</span>
                  </div>
                )}
              </div>

              {/* Points */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">
                  🏆 Points
                </label>
                <Select
                  value={activeQuestion.points}
                  onChange={(v) => updateQuestion({ points: v })}
                  className="w-full"
                  options={[
                    { value: "Standard (1x)", label: "Standard (1x)" },
                    { value: "Double (2x)", label: "Double (2x)" },
                    { value: "No points", label: "No points" },
                  ]}
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">
                  📊 Difficulty
                </label>
                <div className="flex gap-1.5">
                  {["Easy", "Medium", "Hard"].map((d) => (
                    <button
                      key={d}
                      onClick={() => updateQuestion({ difficulty: d })}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                        activeQuestion.difficulty === d
                          ? DIFFICULTY_COLORS[d]
                          : "border-gray-100 dark:border-slate-700 text-gray-300 dark:text-slate-600 hover:border-gray-200 dark:hover:border-slate-600"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Explanation card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-3">
              Explanation{" "}
              <span className="normal-case font-normal text-gray-300 dark:text-slate-600">
                (optional)
              </span>
            </label>
            <textarea
              rows={3}
              value={activeQuestion.explanation}
              onChange={(e) => updateQuestion({ explanation: e.target.value })}
              placeholder="Explain why the correct answer is right..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-white text-sm placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 resize-none transition-all"
            />
          </div>

          {/* Delete question */}
          {questions.length > 1 && (
            <div className="flex justify-end pb-8">
              <button
                onClick={() => deleteQuestion(activeId)}
                className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-500 transition-colors px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
              >
                <DeleteOutlined />
                Delete this question
              </button>
            </div>
          )}

        </div>
      </main>
      
    </div>
    <StepperBar currentStep={2} />
    </>
  );
}