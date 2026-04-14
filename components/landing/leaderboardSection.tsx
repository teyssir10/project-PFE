import { learner } from '@/types/landing'
import { Avatar } from 'antd'
import React from 'react'

const leaderboard = () => {
     const learners: learner[] = [
    { rank: 1, name: 'Alice Johnson', initials: 'AJ', score: 9850, quizzes: 120, color: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { rank: 2, name: 'Bob Smith', initials: 'BS', score: 9420, quizzes: 110, color: 'bg-blue-100 dark:bg-blue-900/30' },
    { rank: 3, name: 'Charlie Lee', initials: 'CL', score: 9100, quizzes: 105, color: 'bg-green-100 dark:bg-green-900/30' },
    { rank: 4, name: 'Emma Davis', initials: 'ED', score: 8750, quizzes: 125, color: 'bg-white dark:bg-slate-950' },
    { rank: 5, name: 'James Wilson', initials: 'JW', score: 8320, quizzes: 118, color: 'bg-white dark:bg-slate-950' },
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <span className='text-2xl'>🥇</span>
      case 2: return <span className='text-2xl'>🥈</span>
      case 3: return <span className='text-2xl'>🥉</span>
      default: return <span className='text-gray-400 font-semibold'>#{rank}</span>
    }
  }
  return (
    <section className='bg-white dark:bg-slate-950 py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4'>
              Top Learners Leaderboard
            </h2>
            <p className='text-gray-600 dark:text-gray-400 text-lg'>
              join the top performers and see how you rank against other learners
            </p>
          </div>
          <div className='overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg'>
            <div className='bg-gradient-to-r from-[#00D4D0] to-cyan-500 text-white grid grid-cols-4 gap-4 px-6 py-4 font-semibold'>
              <span>Rank</span>
              <span>User</span>
              <div className='text-right'>Score</div>
              <div className='text-right'>Quizzes</div>
            </div>
            {learners.map(l => (
              <div key={l.rank} className='grid grid-cols-4 p-4 border-b hover:bg-cyan-50'>
                <span>{getRankIcon(l.rank)}</span>
                <div className='flex items-center gap-2'>
                  <Avatar>{l.initials}</Avatar>
                  {l.name}
                </div>
                <span className='text-right font-bold'>{l.score}</span>
                <span className='text-right'>{l.quizzes}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
  )
}

export default leaderboard
