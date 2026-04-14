'use client'
import React from 'react'
import { Button,} from 'antd'
import { ArrowRightOutlined, ThunderboltOutlined} from '@ant-design/icons'






const Hero: React.FC = () => {
 

  

 
  

 

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

     

      

      

      

      
    </>
  )
}

export default Hero