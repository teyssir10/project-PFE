import React from 'react'
import { BulbOutlined,ThunderboltOutlined,BarChartOutlined,LockOutlined,ShareAltOutlined ,StarOutlined } from '@ant-design/icons';
import { Feature } from '@/types/landing';

const FeaturesSection = () => {
    const features: Feature[] = [
    { icon: <BulbOutlined className="w-6 h-6" />, title: 'AI-Powered Generation', description: 'Advanced AI creates perfectly tailored quizzes from any content in seconds.', color: 'from-[#00D4D0] to-cyan-400' },
    { icon: <ThunderboltOutlined className="w-6 h-6" />, title: 'Lightning Fast', description: 'Get results in milliseconds with our optimized processing engine.', color: 'from-cyan-400 to-blue-400' },
    { icon: <BarChartOutlined className="w-6 h-6" />, title: 'Detailed Analytics', description: 'Track performance and gain insights into learning patterns.', color: 'from-[#00D4D0] to-teal-400' },
    { icon: <LockOutlined className="w-6 h-6" />, title: 'Secure & Private', description: 'Your data is encrypted and never shared with third parties.', color: 'from-cyan-400 to-cyan-400' },
    { icon: <ShareAltOutlined className="w-6 h-6" />, title: 'Easy Sharing', description: 'Share quizzes with students or colleagues with a single link.', color: 'from-[#00D4D0] to-blue-400' },
    { icon: <StarOutlined className="w-6 h-6" />, title: 'Customizable Design', description: 'Personalize your quizzes with custom themes and branding.', color: 'from-cyan-400 to-teal-400' },
  ]
  return (
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
  )
}

export default FeaturesSection
