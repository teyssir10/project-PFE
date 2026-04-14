import { Button } from 'antd'
import React from 'react'
import { ArrowRightOutlined, StarOutlined } from '@ant-design/icons'

const CTASection = () => {
  return (
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
  )
}

export default CTASection
