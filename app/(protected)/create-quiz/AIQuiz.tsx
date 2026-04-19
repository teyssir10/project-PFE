"use client";

import Image from "next/image";
import panda from "@/public/pandaquiz.png";
import StepperBar, { AI_STEPS } from "@/components/Navigation/StepperBar";

import { useQuizForm } from "@/hooks/useQuizForm";
import DescribeCard from "@/components/createquiz/AIquiz/DecribeCard";
import SettingsCard from "@/components/createquiz/AIquiz/SettingsCard";
import PreviewPanel from "@/components/createquiz/AIquiz/PreviewPanel";

export default function AIQuiz() {
  const { form, update, loading, step, handleTagClick, generateQuiz } = useQuizForm();

  return (
    <div className="min-h-screen pb-14 bg-[#F4F6FA] dark:bg-slate-900 font-sans transition-colors duration-300">

      {/* Barre accent top */}
      <div className="h-[3px] w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500" />

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-4">
          <span className="mb-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 text-xs font-semibold tracking-wide uppercase">
            ✨ AI-Powered Quiz Creator
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2">
            Create Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-400">
              Quiz
            </span>
          </h1>
          <p className="max-w-xl text-center text-gray-500 dark:text-slate-400 text-base leading-relaxed mb-3">
            Create powerful quizzes in seconds using AI, or design them manually with full control.
            Everything is designed to make quiz creation{" "}
            <span className="text-cyan-500 font-medium">simple, fast, and enjoyable.</span>
          </p>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Colonne gauche — formulaire */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <DescribeCard
              title={form.title}
              prompt={form.prompt}
              onTitleChange={(v) => update({ title: v })}
              onPromptChange={(v) => update({ prompt: v })}
              onTagClick={handleTagClick}
            />
            <SettingsCard
              form={form}
              loading={loading}
              onUpdate={update}
              onGenerate={generateQuiz}
            />
          </div>

          {/* Colonne droite — preview */}
          <div className="lg:col-span-3 relative">
            {/* Panda décoratif */}
            <div className="absolute -top-56 right-1 z-10 pointer-events-none">
              <Image
                src={panda}
                alt="panda"
                className="w-70 h-70 object-contain drop-shadow-md"
              />
            </div>
            <PreviewPanel loading={loading} />
          </div>
        </div>
      </div>

      <StepperBar currentStep={step} steps={AI_STEPS} />
    </div>
  );
}