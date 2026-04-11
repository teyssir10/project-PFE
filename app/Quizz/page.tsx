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
      <Navbar/>

      <div className="max-w-3xl mx-auto p-6">

        {/* card */}
        <div className="rounded-2xl overflow-hidden border border-cyan-400 shadow-lg bg-white">

          {/* hero */}
          <div className="bg-gradient-to-r from-cyan-500 to-[#00D4D0] p-8 flex items-center gap-4">

            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl">
              ✨
            </div>

            <div>
              <Title level={3} className="!text-white !mb-1">
                Generate Your Quiz with AI
              </Title>

              <Text className="text-sm text-cyan-100 leading-relaxed">
                Create a personalized quiz in seconds on any topic. <br />
                Just enter a topic, select the difficulty, and let AI handle the rest.
              </Text>
            </div>

          </div>

          {/* body */}
          <div className="p-8 flex flex-col gap-6">

            {/* topic */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Quiz topic
              </p>

              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="ex. Photosynthesis, Python, History..."
                className="w-full md:w-2/3"
              />
            </div>

            {/* grid */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* difficulty */}
              <div>

                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Difficulty level
                </p>

                <div className="flex gap-2">

                  {["Facile", "Moyen", "Difficile"].map((d) => (
                    <Button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 rounded-lg font-medium
                      ${difficulty === d
                          ? "!bg-cyan-500 !text-white !border-cyan-500"
                          : "!border-gray-300 !text-gray-600 hover:!bg-cyan-50"
                        }`}
                    >
                      {d}
                    </Button>
                  ))}

                </div>
              </div>

              {/* slider */}
              <div>

                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Number of questions :
                  <span className="text-cyan-600 ml-1">{questions}</span>
                </p>

                <input
                  type="range"
                  min="5"
                  max="50"
                  value={questions}
                  onChange={(e) => setQuestions(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />

                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5 min</span>
                  <span>50 max</span>
                </div>

              </div>

            </div>

            {/* button */}
            <Button
              onClick={generateQuiz}
              size="large"
              className="!h-12 !text-lg !font-semibold !bg-gradient-to-r !from-cyan-500 !to-[#00D4D0] !text-white border-0 hover:!opacity-90"
            >
              ✨ Generate my quiz
            </Button>

           

          </div>

        </div>

      </div>

    </div>
  )
}

export default Page