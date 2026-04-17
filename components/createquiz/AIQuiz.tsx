"use client";

import { Form, Input, message, Select, InputNumber } from "antd";
import { useState } from "react";
import Image from "next/image";
import panda from '@/public/pandaquiz.png';
import pandag from '@/public/panda.png';
import StepperBar from "@/components/createquiz/StepperBar";
import { EyeOutlined } from "@ant-design/icons";


const { TextArea } = Input;

export default function QuizForm() {
  const [form] = Form.useForm();

  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("Technology");
  const [language, setLanguage] = useState("English");
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState<string>("15");
  const [customQuestions, setCustomQuestions] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [timer, setTimer] = useState<string>("10");
  const [customTimer, setCustomTimer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const numQuestionsValue = numQuestions === "other" ? customQuestions : Number(numQuestions);
  const timerValue = timer === "other" ? customTimer : Number(timer);

  const handleTagClick = (text: string) => {
    setPrompt((prev) => (prev ? prev + " " + text : text));
  };

  const suggestions = ["Add code examples", "Common mistakes", "Interview-style", "Include explanations"];

  const generateQuiz = async () => {
    if (!title && !prompt) {
      message.warning("Please enter a title or prompt.");
      return;
    }
    setLoading(true);
    try {
      const systemPrompt = `You are a quiz generator. Return ONLY JSON array.\nRules:\n- ${numQuestionsValue} questions\n- Difficulty: ${difficulty}\n- Category: ${category}\n- Language: ${language}\n- Each question has 4 options`;
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, prompt, systemPrompt, timer: timerValue }),
      });
      const data = await res.json();
      message.success("Quiz generated successfully!");
      console.log(data);
    } catch {
      message.error("Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  const difficultyConfig: Record<string, { active: string; dot: string }> = {
    Easy:   { active: "bg-emerald-500 text-white shadow-emerald-200", dot: "bg-emerald-300" },
    Medium: { active: "bg-amber-500 text-white shadow-amber-200",     dot: "bg-amber-300"   },
    Hard:   { active: "bg-red-500 text-white shadow-red-200",         dot: "bg-red-300"     },
    Mixed:  { active: "bg-violet-500 text-white shadow-violet-200",   dot: "bg-violet-300"  },
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] font-sans">

      {/* Top accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500" />

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ─── PAGE HEADER ─── */}
        <div className="mb-4">
         
             <span className="mb-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-100 text-cyan-600 text-xs font-semibold tracking-wide uppercase">
    ✨ AI-Powered Quiz Creator
      </span>
          
           <h1 className="text-2xl md:text-3xl font-extrabold  text-gray-900 leading-tight mb-2">
              Create Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-400">
                Quiz
              </span>
             
            </h1>
          <p className="max-w-xl text-center text-gray-500 text-base leading-relaxed mb-3">
    Create powerful quizzes in seconds using AI, or design them manually with full control.
    Everything is designed to make quiz creation <span className="text-cyan-500 font-medium">simple, fast, and enjoyable.</span>
  </p>
        </div>

        {/* ─── MAIN LAYOUT ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ══ LEFT: Form ══ */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* CARD 1 — Describe */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-base">
                  ✍️
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Describe Your Quiz</p>
                  <p className="text-[11px] text-gray-400">Be specific for better AI results</p>
                </div>
              </div>

              <div className="p-6">
                <Form layout="vertical" form={form}>

                  {/* TITLE */}
                  <Form.Item className="!mb-4">
                    <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">
                      Quiz Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. JavaScript ES6 Mastery"
                      className="!rounded-xl !border-gray-200 !py-2.5 !text-sm !bg-gray-50 focus:!border-cyan-400 hover:!bg-white transition-colors"
                    />
                  </Form.Item>

                  {/* PROMPT */}
                  <Form.Item className="!mb-3">
                    <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">
                      AI Prompt
                    </label>
                    <TextArea
                      rows={4}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe topics, subtopics, style..."
                      className="!rounded-xl !border-gray-200 !text-sm !bg-gray-50 focus:!border-cyan-400 hover:!bg-white transition-colors resize-none"
                    />
                  </Form.Item>

                  {/* SUGGESTION CHIPS */}
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleTagClick(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-500 hover:bg-cyan-50 hover:text-cyan-600 border border-transparent hover:border-cyan-200 transition-all"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>

                </Form>
              </div>
            </div>

            {/* CARD 2 — Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-base">
                  ⚙️
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Quiz Settings</p>
                  <p className="text-[11px] text-gray-400">Configure structure & difficulty</p>
                </div>
              </div>

              <div className="p-6 space-y-5">

                {/* CATEGORY + LANGUAGE */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">Category</label>
                    <Select
                      value={category}
                      onChange={setCategory}
                      className="w-full"
                      options={[
                        { value: "Technology", label: "Technology" },
                        { value: "Science", label: "Science" },
                        { value: "History", label: "History" },
                        { value: "Math", label: "Math" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">Language</label>
                    <Select
                      value={language}
                      onChange={setLanguage}
                      className="w-full"
                      options={[
                        { value: "English", label: "🇬🇧 English" },
                        { value: "French", label: "🇫🇷 French" },
                        { value: "Spanish", label: "🇪🇸 Spanish" },
                        { value: "Arabic", label: "🇸🇦 Arabic" },
                      ]}
                    />
                  </div>
                </div>

                {/* DIFFICULTY */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">Difficulty</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["Easy", "Medium", "Hard", "Mixed"].map((level) => {
                      const cfg = difficultyConfig[level];
                      const isActive = difficulty === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          className={`
                            py-2.5 rounded-xl text-xs font-bold border transition-all duration-150
                            ${isActive
                              ? `${cfg.active} border-transparent shadow-md`
                              : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100"
                            }
                          `}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* NUMBER OF QUESTIONS */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">Number of Questions</label>
                  <div className="flex gap-2 flex-wrap items-center">
                    {[5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNumQuestions(String(num))}
                        className={`
                          w-11 h-11 rounded-xl text-xs font-bold transition-all
                          ${numQuestions === String(num)
                            ? "bg-cyan-500 text-white shadow-md shadow-cyan-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }
                        `}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setNumQuestions("other")}
                      className={`
                        px-3 h-11 rounded-xl text-xs font-bold transition-all
                        ${numQuestions === "other"
                          ? "bg-cyan-500 text-white shadow-md shadow-cyan-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }
                      `}
                    >
                      Other
                    </button>
                    {numQuestions === "other" && (
                      <InputNumber
                        min={1}
                        className="flex-1 !rounded-xl"
                        placeholder="Custom..."
                        onChange={(v) => setCustomQuestions(v)}
                      />
                    )}
                  </div>
                </div>

                {/* TIMER */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">Timer (minutes)</label>
                  <div className="flex gap-2 flex-wrap items-center">
                    {[5, 10, 15].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTimer(String(t))}
                        className={`
                          w-11 h-11 rounded-xl text-xs font-bold transition-all
                          ${timer === String(t)
                            ? "bg-teal-500 text-white shadow-md shadow-teal-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }
                        `}
                      >
                        {t}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setTimer("other")}
                      className={`
                        px-3 h-11 rounded-xl text-xs font-bold transition-all
                        ${timer === "other"
                          ? "bg-teal-500 text-white shadow-md shadow-teal-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }
                      `}
                    >
                      Other
                    </button>
                    {timer === "other" && (
                      <InputNumber
                        min={1}
                        className="flex-1 !rounded-xl"
                        placeholder="Custom..."
                        onChange={(v) => setCustomTimer(v)}
                      />
                    )}
                  </div>
                </div>

                {/* GENERATE BUTTON */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={generateQuiz}
                  className="
                    w-full h-12 rounded-xl mt-1
                    bg-gradient-to-r from-cyan-500 to-teal-500
                    text-white text-sm font-bold tracking-wide
                    shadow-lg shadow-cyan-200
                    hover:shadow-xl hover:shadow-cyan-300 hover:scale-[1.01]
                    active:scale-[0.99]
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all duration-200
                    flex items-center justify-center gap-2
                  "
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>✨ Generate Quiz</>
                  )}
                </button>

              </div>
            </div>
          </div>

          {/* ══ RIGHT: Preview ══ */}
        <div className="lg:col-span-3 relative">

  {/* Panda assis sur le bord de la card */}
 <div className="absolute -top-56 right-1 z-10 pointer-events-none">
  <Image
    src={panda}
    alt="panda"
    className="w-70 h-70 object-contain drop-shadow-md"
  />
</div>
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[600px] flex flex-col h-full">

    {/* Preview header */}
    <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-base">
          <EyeOutlined/>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Quiz Preview</p>
          <p className="text-[11px] text-gray-400">Generated questions appear here</p>
        </div>
      </div>

      <span className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full font-medium border ${
        loading
          ? "bg-amber-50 text-amber-600 border-amber-200"
          : "bg-gray-100 text-gray-400 border-gray-200"
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-amber-400 animate-pulse" : "bg-gray-300"}`} />
        {loading ? "Generating..." : "Waiting"}
      </span>
    </div>

    {/* Preview body */}
    <div className="flex-1 p-6 overflow-y-auto">

      {/* EMPTY STATE */}
      {!loading && (
        <div className="h-full flex flex-col items-center justify-center text-center py-12">
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100 flex items-center justify-center text-3xl shadow-sm">
              ✨
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 border-2 border-white" />
          </div>
          <p className="text-gray-700 font-semibold text-sm mb-1">No quiz generated yet</p>
          <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
            Fill in the form and click{" "}
            <span className="text-cyan-500 font-medium">Generate Quiz</span>{" "}
            to create your questions instantly.
          </p>

          {/* Ghost placeholder cards */}
          <div className="mt-8 w-full max-w-md space-y-3 opacity-[0.15] pointer-events-none select-none">
            {[75, 55, 85].map((w, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-left">
                <div className="h-3 bg-gray-300 rounded mb-3" style={{ width: `${w}%` }} />
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((o) => (
                    <div key={o} className="h-7 bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOADING SKELETON */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-gray-100 bg-gray-50 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-gray-200 rounded-lg" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-200 rounded mb-4" />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((o) => (
                  <div key={o} className="h-9 bg-gray-200 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  </div>
</div>
        </div>
      </div>
      <StepperBar currentStep={step} />
    </div>  
    
  );
}