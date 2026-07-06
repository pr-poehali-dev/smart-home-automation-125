import { Hero3DWebGL as Hero3D } from "@/components/hero-webgl"
import { FeaturesSection } from "@/components/features-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CTASection } from "@/components/cta-section"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function Index() {
  return (
    <div className="dark">
      <Navbar />
      <main>
        <Hero3D />
        <section id="technology">
          <FeaturesSection />
        </section>
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}