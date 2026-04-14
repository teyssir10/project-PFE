'use client'
import { Button } from 'antd';
import React, { useEffect, useRef } from 'react'
import { ArrowRightOutlined } from '@ant-design/icons';

const CategoriesSection = () => {
     const categories = [
        { id: 1, title: 'History', icon: '📚', quizzes: 245, bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', bordorciolor: 'border-yellow-200 dark:border-yellow-800', hoverColor: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30' },
        { id: 2, title: 'Science', icon: '🧪', quizzes: 387, bgColor: 'bg-blue-50 dark:bg-blue-900/20', bordorciolor: 'border-blue-200 dark:border-blue-800', hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/30' },
        { id: 3, title: 'Geography', icon: '🌍', quizzes: 156, bgColor: 'bg-green-50 dark:bg-green-900/20', bordorciolor: 'border-green-200 dark:border-green-800', hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/30' },
        { id: 4, title: 'Art', icon: '🎨', quizzes: 98, bgColor: 'bg-pink-50 dark:bg-pink-900/20', bordorciolor: 'border-pink-200 dark:border-pink-800', hoverColor: 'hover:bg-pink-100 dark:hover:bg-pink-900/30' },
        { id: 5, title: 'Technology', icon: '💻', quizzes: 412, bgColor: 'bg-gray-50 dark:bg-gray-900/20', bordorciolor: 'border-gray-200 dark:border-gray-800', hoverColor: 'hover:bg-gray-100 dark:hover:bg-gray-900/30' },
        { id: 6, title: 'Sports', icon: '⚽', quizzes: 210, bgColor: 'bg-orange-50 dark:bg-orange-900/20', bordorciolor: 'border-orange-200 dark:border-orange-800', hoverColor: 'hover:bg-orange-100 dark:hover:bg-orange-900/30' },
        { id: 7, title: 'Movies', icon: '🎬', quizzes: 134, bgColor: 'bg-purple-50 dark:bg-purple-900/20', bordorciolor: 'border-purple-200 dark:border-purple-800', hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900/30' },
        { id: 8, title: 'Music', icon: '🎵', quizzes: 175, bgColor: 'bg-indigo-50 dark:bg-indigo-900/20', bordorciolor: 'border-indigo-200 dark:border-indigo-800', hoverColor: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30' },
        { id: 9, title: 'Math', icon: '➗', quizzes: 190, bgColor: 'bg-cyan-50 dark:bg-cyan-900/20', bordorciolor: 'border-cyan-200 dark:border-cyan-800', hoverColor: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/30' },
        { id: 10, title: 'Language', icon: '🗣️', quizzes: 120, bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', bordorciolor: 'border-emerald-200 dark:border-emerald-800', hoverColor: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30' },
        { id: 11, title: 'Space', icon: '🚀', quizzes: 88, bgColor: 'bg-violet-50 dark:bg-violet-900/20', bordorciolor: 'border-violet-200 dark:border-violet-800', hoverColor: 'hover:bg-violet-100 dark:hover:bg-violet-900/30' },
        { id: 12, title: 'Animals', icon: '🐾', quizzes: 142, bgColor: 'bg-lime-50 dark:bg-lime-900/20', bordorciolor: 'border-lime-200 dark:border-lime-800', hoverColor: 'hover:bg-lime-100 dark:hover:bg-lime-900/30' },
        { id: 13, title: 'Food', icon: '🍔', quizzes: 96, bgColor: 'bg-red-50 dark:bg-red-900/20', bordorciolor: 'border-red-200 dark:border-red-800', hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900/30' },
        { id: 14, title: 'Gaming', icon: '🎮', quizzes: 173, bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-900/20', bordorciolor: 'border-fuchsia-200 dark:border-fuchsia-800', hoverColor: 'hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/30' },
        { id: 15, title: 'Business', icon: '💼', quizzes: 110, bgColor: 'bg-amber-50 dark:bg-amber-900/20', bordorciolor: 'border-amber-200 dark:border-amber-800', hoverColor: 'hover:bg-amber-100 dark:hover:bg-amber-900/30' },
        { id: 16, title: 'Health', icon: '🩺', quizzes: 130, bgColor: 'bg-rose-50 dark:bg-rose-900/20', bordorciolor: 'border-rose-200 dark:border-rose-800', hoverColor: 'hover:bg-rose-100 dark:hover:bg-rose-900/30' },
        { id: 17, title: 'Culture', icon: '🏛️', quizzes: 75, bgColor: 'bg-teal-50 dark:bg-teal-900/20', bordorciolor: 'border-teal-200 dark:border-teal-800', hoverColor: 'hover:bg-teal-100 dark:hover:bg-teal-900/30' },
        { id: 18, title: 'Nature', icon: '🌿', quizzes: 92, bgColor: 'bg-green-50 dark:bg-green-900/20', bordorciolor: 'border-green-200 dark:border-green-800', hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/30' },
        { id: 19, title: 'Politics', icon: '🏛️', quizzes: 67, bgColor: 'bg-slate-50 dark:bg-slate-900/20', bordorciolor: 'border-slate-200 dark:border-slate-800', hoverColor: 'hover:bg-slate-100 dark:hover:bg-slate-900/30' },
        { id: 20, title: 'Literature', icon: '📖', quizzes: 104, bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', bordorciolor: 'border-yellow-200 dark:border-yellow-800', hoverColor: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30' },
      ]
       const scrollRef = useRef<HTMLDivElement>(null);
      
        useEffect(() => {
          const scrollContainer = scrollRef.current;
          const speed = 1;
          const interval = setInterval(() => {
            if (!scrollContainer) return;
            scrollContainer.scrollLeft += speed;
            if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
              scrollContainer.scrollLeft = 0;
            }
          }, 20);
          return () => clearInterval(interval);
        }, []);
  return (
    <section className='bg-white dark:bg-slate-950 py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-16'>
            <h2 className='text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4'>
              Explore Quiz Categories
            </h2>
            <p className='text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed'>
              Choose from our diverse collection of quiz categories and start learning <br />
              today
            </p>
          </div>

          <div ref={scrollRef} className='flex space-x-6 overflow-x-hidden pb-4 scroll-smooth'>
            {categories.map((category) => (
              <div
                key={category.id}
                className={`${category.bgColor} ${category.bordorciolor} ${category.hoverColor} border rounded-2xl p-8 flex-shrink-0 w-64 flex flex-col items-center text-center cursor-pointer transition-transform duration-300 hover:scale-105`}
              >
                <div className='text-5xl mb-4'>{category.icon}</div>
                <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
                  {category.title}
                </h3>
                <p className='text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow'>
                  {category.quizzes} Quizzes
                </p>
                <Button
                  type='text'
                  className='!text-[#00D4D0] !dark:text-cyan-400 !hover:text-cyan-500 !dark:hover:text-cyan-300 !transition-colors'
                  icon={<ArrowRightOutlined/>}
                  iconPlacement='end'
                >
                  Start Quiz
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    
  )
}

export default CategoriesSection
