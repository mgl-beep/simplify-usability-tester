import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Solution from "@/components/sections/Solution";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import Rubrics from "@/components/sections/Rubrics";
import Comparison from "@/components/sections/Comparison";
import Testimonials from "@/components/sections/Testimonials";
import Stats from "@/components/sections/Stats";
import Trust from "@/components/sections/Trust";
import FAQ from "@/components/sections/FAQ";
import CTAForm from "@/components/sections/CTAForm";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <HowItWorks />
        <Rubrics />
        <Comparison />
        <Testimonials />
        <Stats />
        <Trust />
        <FAQ />
        <CTAForm />
      </main>
      <Footer />
    </>
  );
}
