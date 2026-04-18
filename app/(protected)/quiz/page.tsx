"use client"
import AIQuiz from '@/components/createquiz/AIQuiz'
import ManualQuiz from '@/components/createquiz/ManualQuiz'

import { useQuizModeStore } from '@/store/useQuizModeStore'

export default function CreateQuizPage() {
  const { mode } = useQuizModeStore()
  return (
    <div className='py-4 mb-2 gap-2'>
      <div>
        {mode === "ai" ? <AIQuiz /> : <ManualQuiz />}
      </div>
    </div>
  )
}