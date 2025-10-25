'use client';

import Navbar from '@/components/shared/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TrustIndicators from '@/components/landing/TrustIndicators';
import HowItWorks from '@/components/landing/HowItWorks';
import AssetCategories from '@/components/landing/AssetCategories';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import UseCases from '@/components/landing/UseCases';
import PlatformStats from '@/components/landing/PlatformStats';
import ComparisonTable from '@/components/landing/ComparisonTable';
import Testimonials from '@/components/landing/Testimonials';
import SecurityCompliance from '@/components/landing/SecurityCompliance';
import FAQ from '@/components/landing/FAQ';
import CTASection from '@/components/landing/CTASection';
import LandingFooter from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar variant="landing" />
      <HeroSection />
      <TrustIndicators />
      <HowItWorks />
      <AssetCategories />
      <FeaturesGrid />
      <UseCases />
      <PlatformStats />
      <ComparisonTable />
      <Testimonials />
      <SecurityCompliance />
      <FAQ />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
