"use client"
import AIQuiz from '@/app/(protected)/create-quiz/AIQuiz'
import Question from '@/app/(protected)/create-quiz/manuelQuiz.tsx/Quiz'

import { useQuizModeStore } from '@/store/useQuizModeStore'

export default function CreateQuizPage() {
  const { mode } = useQuizModeStore()
  return (
    <div className='py-4 mb-2 gap-2'>
      <div>
        {mode === "ai" ? <AIQuiz /> : <Question />}
      </div>
    </div>
  )
}