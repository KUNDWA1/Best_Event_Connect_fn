import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import EnhancedFeatures from '../components/EnhancedFeatures'
import About from '../components/About'
import RoleCards from '../components/RoleCards'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div id="home">
        <Hero />
      </div>
      <div id="services">
        <Features />
      </div>
      <div id="features">
        <EnhancedFeatures />
      </div>
      <div id="about">
        <About />
      </div>
      <RoleCards />
      <Footer />
    </div>
  )
}
