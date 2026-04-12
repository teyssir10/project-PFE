"use client"

import React, { useState } from "react"
import { Deco } from "@/components/Decoration/Deco"
import Title from "antd/es/typography/Title"
import Text from "antd/es/typography/Text"
import { Button, Input } from "antd"
import Navbar from "@/components/Navbar/Navbar"

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
      <Navbar />

      <div className="max-w-2xl mx-auto p-6 pt-16">

        {/* card */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-xl bg-white/10">

          {/* hero */}
          <div className="bg-gradient-to-r from-cyan-500 to-[#00D4D0] p-8 relative overflow-hidden">

            {/* cercles décoratifs */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-lg" />

            <div className="relative flex items-center gap-5">
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

          </div>

          {/* body */}
          <div className="p-8 flex flex-col gap-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">

            {/* topic */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Quiz Topic
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="ex. Photosynthesis, Python, History..."
                size="large"
                className="!rounded-xl !border-gray-200 dark:!border-slate-700 !h-12 !text-base focus:!border-cyan-400 !bg-white/50 dark:!bg-slate-800/50 backdrop-blur"
              />
            </div>

            {/* difficulty */}
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
                        : "bg-white/50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-cyan-300 hover:scale-102"
                      }`}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* slider */}
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

            {/* button */}
            <button
              onClick={generateQuiz}
              className="w-full h-14 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-cyan-500 to-[#00D4D0] shadow-lg shadow-cyan-400/40 hover:shadow-cyan-400/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-0"
            >
              ✨ Generate my quiz
            </button>

          </div>

        </div>

      </div>
    </div>
  )
}

export default Page