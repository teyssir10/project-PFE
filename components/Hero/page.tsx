'use client'
import React from 'react'
import { Button, Avatar } from 'antd'
import { ArrowRightOutlined, ThunderboltOutlined, CheckCircleOutlined, BarChartOutlined, LockOutlined, ShareAltOutlined, StarOutlined, BulbOutlined } from '@ant-design/icons'
import { useRef, useEffect } from 'react';

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}

interface learner {
  rank: number
  name: string
  initials: string
  score: number
  quizzes: number
  color: string
}

const Hero: React.FC = () => {
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

  const steps = [
    { Number: 1, title: 'Choose a Topic', description: 'Select from hunderds of quiz categories across different subjects and difficulty levels.' },
    { Number: 2, title: 'Take the Quiz', description: 'Answer AI-generated questions that adapt to your level . Get instant feedback on each answer. ' },
    { Number: 3, title: 'Track Progress', description: 'View detailed analytics,earn badges, and compete on leaderboards with other learners.' },
  ]

  const features: Feature[] = [
    { icon: <BulbOutlined className="w-6 h-6" />, title: 'AI-Powered Generation', description: 'Advanced AI creates perfectly tailored quizzes from any content in seconds.', color: 'from-[#00D4D0] to-cyan-400' },
    { icon: <ThunderboltOutlined className="w-6 h-6" />, title: 'Lightning Fast', description: 'Get results in milliseconds with our optimized processing engine.', color: 'from-cyan-400 to-blue-400' },
    { icon: <BarChartOutlined className="w-6 h-6" />, title: 'Detailed Analytics', description: 'Track performance and gain insights into learning patterns.', color: 'from-[#00D4D0] to-teal-400' },
    { icon: <LockOutlined className="w-6 h-6" />, title: 'Secure & Private', description: 'Your data is encrypted and never shared with third parties.', color: 'from-cyan-400 to-cyan-400' },
    { icon: <ShareAltOutlined className="w-6 h-6" />, title: 'Easy Sharing', description: 'Share quizzes with students or colleagues with a single link.', color: 'from-[#00D4D0] to-blue-400' },
    { icon: <StarOutlined className="w-6 h-6" />, title: 'Customizable Design', description: 'Personalize your quizzes with custom themes and branding.', color: 'from-cyan-400 to-teal-400' },
  ]

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
    <>
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  <ThunderboltOutlined className="!w-4 !h-4 !text-[#00D4D0]" />
                  <span className="text-sm font-semibold text-[#00D4D0]">AI-Powered Learning</span>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance">
                  Create Amazing{' '}
                  <span className="bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
                    Quizzes
                  </span>{' '}
                  in Seconds
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground text-balance text-gray-500">
                  Let artificial intelligence generate engaging, personalized quizzes tailored to any topic. Perfect for educators, students, and lifelong learners.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="large" className="!bg-[#00D4D0] !hover:bg-[#00B3A9] !text-white !rounded-xl !px-8 !font-semibold">
                  Get Started
                  <ArrowRightOutlined className="w-5 h-5 ml-2" />
                </Button>
                <Button size="large" variant="outlined" className="!rounded-xl !px-8 !font-semibold !border-2 !text-[#00D4D0] !border-[#00D4D0] !hover:bg-cyan-500/10 !hover:border-[#00B3A9] !transition-colors">
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-[#00D4D0]">50K+</p>
                  <p className="text-sm text-muted-foreground text-gray-500">Quizzes Created</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-[#0F596E]">10K+</p>
                  <p className="text-sm text-muted-foreground text-gray-500">Active Users</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-[#00D4D0]">99%</p>
                  <p className="text-sm text-muted-foreground text-gray-500">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative h-96 sm:h-[500px] lg:h-[600px]">

              <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-br from-[#D6EEF5] to-cyan-200  dark:from-slate-800 dark:to-slate-900 border border-cyan-100">

                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className="w-full max-w-sm space-y-4 p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-cyan-500/10">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#00D4D0] ">Question 1 of 10</p>
                      <h3 className="text-lg font-bold text-foreground ">Où vivent la plupart des pandas dans le monde ?</h3>
                    </div>

                    <div className="space-y-2">
                      {['Chine', 'Afrique', 'Amérique', 'Europe'].map((option, i) => (
                        <button
                          key={i}
                          className={`w-full p-3 rounded-lg text-left font-medium transition-all ${i === 0
                            ? 'bg-cyan-500/20 text-[ #00D4D0] border-2 border-[ #00D4D0]'
                            : 'bg-muted text-foreground hover:bg-muted/80 border-2 border-transparent'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    <button className="!w-full !py-2 !rounded-lg !bg-[#0F596E] !text-white !font-semibold !hover:bg-secondary/90 !transition-colors">
                      Next Question
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, manage, and analyze engaging quizzes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-white dark:bg-slate-900 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                <div className="relative space-y-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} text-white flex items-center justify-center`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground mt-2">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                  icon={<ArrowRightOutlined />}
                  iconPlacement='end'
                >
                  Start Quiz
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00D4D0] to-cyan-500 p-8 sm:p-12 lg:p-24">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
            </div>

            <div className="relative space-y-6 text-center text-white">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30">
                  <StarOutlined className="w-4 h-4" />
                  <span className="text-sm font-semibold">Get Started Today</span>
                </div>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-balance">
                Ready to Transform Your Learning Experience?
              </h2>

              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Join thousands of educators and students using QuizAI to create engaging, intelligent quizzes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="large" className="bg-white !text-[#00D4D0] hover:bg-white/90 rounded-xl px-8 font-semibold">
                  Create Your First Quiz
                  <ArrowRightOutlined className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Hero