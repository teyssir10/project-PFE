"use client"
import AIQuiz from '@/components/createquiz/AIQuiz'
import ManualQuiz from '@/components/createquiz/ManualQuiz'
import Deco from '@/components/Decoration/Deco'
import { useQuizModeStore } from '@/store/useQuizModeStore'

export default function CreateQuizPage() {
  const { mode } = useQuizModeStore()

  return (
    <div className='py-4 mb-2 gap-2'>
      <Deco />
      <div>
        {mode === "ai" ? <AIQuiz /> : <ManualQuiz />}
      </div>
    </div>
  )
}