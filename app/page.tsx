import Hero  from '@/components/Hero/page'
import Deco from '@/components/Decoration/Deco'

import Navbar from '@/components/Navbar/Navbar'
import Footer from '@/components/Footer/Footer'
export default function Home() {
  return (
    <div className="w-full relative z-10">
      <Deco />
        <div className="relative z-10">
          <Navbar />
      <div className="relative z-10">
        <Hero />
         <Footer/>
      </div>

      </div>
    </div>
  )
}
