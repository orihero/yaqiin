import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import AppDownloadSection from '@/components/AppDownloadSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 transition-colors duration-200">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <WhyChooseUsSection />
      <AppDownloadSection />
      <Footer />
    </div>
  );
}