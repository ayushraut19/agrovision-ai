import { SmartAlertsSection } from "@/components/SmartAlertsSection";
import { HeroSection } from "@/components/HeroSection";
import { CropUploadSection } from "@/components/CropUploadSection";
import { WeatherSection } from "@/components/WeatherSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-10 sm:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <HeroSection />
        <CropUploadSection />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
          <SmartAlertsSection />
          <WeatherSection />
        </div>
      </div>
    </main>
  );
}
