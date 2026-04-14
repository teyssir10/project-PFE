'use client'
import HeroSection from '@/components/landing/HeroSection'
import Deco from '@/components/Decoration/Deco'

import Navbar from '@/components/Navbar/Navbar'
import Footer from '@/components/Footer/Footer'
import CategoriesSection from '@/components/landing/CategoriesSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import StepsSection from '@/components/landing/stepsSection'
import CTASection from '@/components/landing/CTASection'
import LeaderboardSection from '@/components/landing/leaderboardSection'  

export default function Home() {
  return (
    <div className="w-full relative z-10">
      <Deco />
        <div className="relative z-10">
          <Navbar />
      <div className="relative z-10">
        <HeroSection />
        <FeaturesSection/>
        <StepsSection/>
        <CategoriesSection/>
        <LeaderboardSection/>
        <CTASection/>
         <Footer/>
      </div>

      </div>
    </div>
  )
}
