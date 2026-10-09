import SiteLayout from '../components/layout/SiteLayout.jsx'
import HeroSection from '../components/home/HeroSection.jsx'
import SubjectsSection from '../components/home/SubjectsSection.jsx'
import FeaturedTeachersCoursesSection from '../components/home/FeaturedTeachersCoursesSection.jsx'
import ChooseTeachersSection from '../components/home/ChooseTeachersSection.jsx'
import { IntroSection, StudySteps, MotivationSection, HomeCta } from '../components/home/HomeStory.jsx'
import './HomePage.css'

export default function HomePage() {
  return <SiteLayout home>
    <HeroSection />
    <IntroSection />
    <StudySteps />
    <div className="home-catalog"><ChooseTeachersSection /><SubjectsSection /></div>
    <MotivationSection />
    <div className="home-courses"><FeaturedTeachersCoursesSection /></div>
    <HomeCta />
  </SiteLayout>
}
