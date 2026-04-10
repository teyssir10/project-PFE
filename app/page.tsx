import Hero  from './Hero/page'
import Deco from './components/Decoration/Deco'
import Login from './login/page'
import Navbar from './components/Navbar/Navbar'
export default function Home() {
  return (
    <div className="w-full relative z-10">
      <Deco />
        <div className="relative z-10">
          <Navbar></Navbar>
      <div className="relative z-10">
        <Hero />
      </div>
      </div>
    </div>
  )
}
