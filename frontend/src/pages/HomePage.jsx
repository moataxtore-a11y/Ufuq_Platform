import SiteLayout from '../components/layout/SiteLayout.jsx'
import HeroSection from '../components/home/HeroSection.jsx'
import AboutSection from '../components/home/AboutSection.jsx'
import ServicesSection from '../components/home/ServicesSection.jsx'
import SubjectsSection from '../components/home/SubjectsSection.jsx'
import PartnersSection from '../components/home/PartnersSection.jsx'
import FeaturedTeachersCoursesSection from '../components/home/FeaturedTeachersCoursesSection.jsx'
import ChooseTeachersSection from '../components/home/ChooseTeachersSection.jsx'
import LandingCtaSection from '../components/home/LandingCtaSection.jsx'

export default function HomePage() {
  return (
    <SiteLayout>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <SubjectsSection />
      <ChooseTeachersSection />
      <FeaturedTeachersCoursesSection />
      <PartnersSection />
      <LandingCtaSection />
    </SiteLayout>
  )
}
