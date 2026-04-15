"use client"

import React, { useState } from "react"
import { Deco } from "@/components/Decoration/Deco"
import Title from "antd/es/typography/Title"
import Text from "antd/es/typography/Text"
import Image from "next/image"
import panda from "@/public/panda.png"
import {Input } from "antd"

const Page = () => {
  const [difficulty, setDifficulty] = useState("Moyen")
  const [questions, setQuestions] = useState(10)
  const [topic, setTopic] = useState("")

  const generateQuiz = () => {
    if (!topic) {
      alert("Please enter a topic")
      return
    }
    alert(`Quiz: ${topic} - ${difficulty} - ${questions} questions`)
  }

  return (
    <div className="relative min-h-screen">
      <Deco />

      <div className="max-w-5xl mx-auto p-6 pt-16">

        {/* Card unique */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-xl">

          {/* Hero banner */}
          <div className="bg-gradient-to-r from-cyan-500 to-[#00D4D0] p-8 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-28 h-28 bg-white/10 rounded-full blur-lg" />

            <div className="relative flex items-center justify-between">
              {/* Texte gauche */}
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl border border-white/30 shadow-lg">
                  ✨
                </div>
                <div>
                  <Title level={3} className="!text-white !mb-1 !font-bold">
                    Generate Your Quiz with AI
                  </Title>
                  <Text className="text-cyan-100 text-sm leading-relaxed">
                    Create a personalized quiz in seconds on any topic. <br />
                    Just enter a topic, select the difficulty, and let AI handle the rest.
                  </Text>
                </div>
              </div>

              {/* Panda dans le hero — coin droit */}
              <div className="hidden md:block relative shrink-0">
                
                <Image
                  src={panda}
                  alt="Panda illustration"
                  width={160}
                  height={160}
                  className="drop-shadow-2xl hover:scale-105 transition-transform duration-500 mt-4"
                />
              </div>
            </div>
          </div>  

        
          {/* Body */}
<div className="p-8 flex gap-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">

  {/* Formulaire gauche */}
  <div className="flex-1 flex flex-col gap-8">

    {/* Topic */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        Quiz Topic
      </label>
      <Input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="ex. Photosynthesis, Python, History..."
        size="large"
        className="!rounded-xl !border-gray-200 dark:!border-slate-700 !h-12 !text-base focus:!border-cyan-400 !bg-white/50 dark:!bg-slate-800/50"
      />
    </div>

    {/* Difficulty */}
    <div className="flex flex-col gap-3">
      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        Difficulty Level
      </label>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Facile", emoji: "🟢" },
          { label: "Moyen", emoji: "🟡" },
          { label: "Difficile", emoji: "🔴" },
        ].map(({ label, emoji }) => (
          <button
            key={label}
            onClick={() => setDifficulty(label)}
            className={`py-3 rounded-xl font-semibold text-sm transition-all duration-200 border
              ${difficulty === label
                ? "bg-gradient-to-r from-cyan-500 to-[#00D4D0] text-white border-transparent shadow-lg shadow-cyan-400/30 scale-105"
                : "bg-white/50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-cyan-300"
              }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>
    </div>

    {/* Slider */}
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Number of Questions
        </label>
        <span className="text-lg font-bold text-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 px-3 py-1 rounded-lg">
          {questions}
        </span>
      </div>
      <input
        type="range"
        min="5"
        max="50"
        value={questions}
        onChange={(e) => setQuestions(Number(e.target.value))}
        className="w-full accent-cyan-500 h-2 rounded-full cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 font-medium">
        <span>5 min</span>
        <span>50 max</span>
      </div>
    </div>

    {/* Button */}
    <button
      onClick={generateQuiz}
      className="w-full h-14 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-cyan-500 to-[#00D4D0] shadow-lg shadow-cyan-400/40 hover:shadow-cyan-400/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-0"
    >
      ✨ Generate my quiz
    </button>

  </div>

  {/* Panel résumé — colonne droite */}
  <div className="hidden lg:flex flex-col gap-3 w-48 shrink-0">

    <div className="rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 p-4 flex flex-col gap-1 h-24">
      <span className="text-xs text-cyan-400 uppercase font-bold tracking-widest">Topic</span>
      <span className="text-gray-700 dark:text-white font-semibold text-sm truncate">
        {topic || "—"}
      </span>
    </div>

    <div className="rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 p-4 flex flex-col gap-1 h-24">
      <span className="text-xs text-cyan-400 uppercase font-bold tracking-widest">Difficulty</span>
      <span className="text-gray-700 dark:text-white font-semibold text-sm">
        {difficulty === "Facile" ? "🟢" : difficulty === "Moyen" ? "🟡" : "🔴"} {difficulty}
      </span>
    </div>

    <div className="rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 p-4 flex flex-col gap-1 h-24">
      <span className="text-xs text-cyan-400 uppercase font-bold tracking-widest">Questions</span>
      <span className="text-gray-700 dark:text-white font-bold text-2xl">
        {questions}
      </span>
    </div>

    <div className="rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 p-4 flex flex-col gap-1 h-24">
      <span className="text-xs text-cyan-400 uppercase font-bold tracking-widest">⏱ Estimated time</span>
      <p className="text-cyan-500 font-bold text-lg mt-1">
        ~{Math.round(questions * 1.5)} min
      </p>
    </div>

  </div>

</div>

            {/* Button */}
            <button
              onClick={generateQuiz}
              className="w-full h-14 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-cyan-500 to-[#00D4D0] shadow-lg shadow-cyan-400/40 hover:shadow-cyan-400/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-0"
            >
              ✨ Generate my quiz
            </button>

          </div>
        </div>

      </div>
    
  )
}

export default Page