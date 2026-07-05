import { auth } from "@/auth";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/sections/Hero";
import PlatformStrip from "@/components/sections/PlatformStrip";
import TrustBar from "@/components/sections/TrustBar";
import HowItWorks from "@/components/sections/HowItWorks";
import Transformation from "@/components/sections/Transformation";
import FeedbackSplit from "@/components/sections/FeedbackSplit";
import Journey from "@/components/sections/Journey";
import Testimonials from "@/components/sections/Testimonials";
import Pricing from "@/components/sections/Pricing";
import CtaBand from "@/components/sections/CtaBand";
import SiteFooter from "@/components/sections/SiteFooter";

export default async function Home() {
  const session = await auth();

  return (
    <>
      <SiteHeader user={session?.user} />
      <main>
        <Hero />
        <PlatformStrip />
        <HowItWorks />
        <Transformation />
        <FeedbackSplit />
        <Journey />
        <TrustBar />
        <Testimonials />
        <Pricing />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}
