import React from 'react'
import { CheckCircleOutlined } from '@ant-design/icons';
 

const stepsSection = () => {
    const steps = [
    { Number: 1, title: 'Choose a Topic', description: 'Select from hunderds of quiz categories across different subjects and difficulty levels.' },
    { Number: 2, title: 'Take the Quiz', description: 'Answer AI-generated questions that adapt to your level . Get instant feedback on each answer. ' },
    { Number: 3, title: 'Track Progress', description: 'View detailed analytics,earn badges, and compete on leaderboards with other learners.' },
  ]

  return (
    <section className='bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900 py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4'>
              How It Works
            </h2>
            <p className='text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto'>
              Get started in 3 simple steps and begin your learning journey
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 relative'>
            <div className='hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent'></div>
            {steps.map((step) => (
              <div key={step.Number} className='relative'>
                <div className='bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 h-full flex flex-col relative z-10 p-6 bg-white rounded-xl shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:-translate-y-1 cursor-pointer'>
                  <div className='w-14 h-14 rounded-full bg-gradient-to-r from-[#00D4D0] to-cyan-500 flex items-center justify-center text-white font-blod text-xl mb-6 -mt-20 mx-auto'>
                    {step.Number}
                  </div>
                  <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-4 text-center'>
                    {step.title}
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400 text-base leading-relaxed flex-grow text-center mb-6'>
                    {step.description}
                  </p>
                  <div className='flex justify-center'>
                    <CheckCircleOutlined className='!text-3xl !text-green-500' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  )
}

export default stepsSection
