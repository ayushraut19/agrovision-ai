import { SmartAlertsSection } from "@/components/SmartAlertsSection";
import { HeroSection } from "@/components/HeroSection";
import { CropUploadSection } from "@/components/CropUploadSection";
import { WeatherSection } from "@/components/WeatherSection";
import {
  CropMonitoringReportsSection,
  FarmerDashboardSection,
  FieldManagementSupportSection,
} from "@/components/HackathonPresentationSections";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LanguageProvider } from "@/context/LanguageContext";

export default function Home() {
  return (
    <LanguageProvider>
      <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-10 sm:py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <LanguageToggle />
          <HeroSection />
          <CropUploadSection />
          <SmartAlertsSection />
          <FarmerDashboardSection />
          <CropMonitoringReportsSection />
          <FieldManagementSupportSection />
          <WeatherSection />
        </div>
      </main>
    </LanguageProvider>
  );
}
