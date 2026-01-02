import { motion } from 'motion/react'
import BlogList from '../components/BlogList'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Newsletter from '../components/Newsletter'
const Home = () => {
  const MotionDiv = motion.div
  return (
    <MotionDiv className='bg-white min-h-screen' initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
      <Navbar />
      <Header />
      <BlogList />
      <Newsletter />
      <Footer />
    </MotionDiv>
  )
}

export default Home
