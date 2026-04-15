import React from 'react'
import AIQuiz from '@/components/createquiz/AIQuiz'
import Title from 'antd/es/typography/Title'

const page = () => {
  return (
    <div>
    <div>
      <Title className="text-2xl font-bold text-center py-10">🧠 Create Your <span className="text-cyan-500">Quiz</span> </Title>
      <p className="text-center text-gray-600 ">Create powerful quizzes in seconds using AI, or design them manually with full control. <br /> 
      Whether you want speed or flexibility, everything is designed to make quiz creation simple, fast, and enjoyable.</p>
    </div>


   <div><AIQuiz />
</div>
    </div>
  )
}

export default page
