import Navbar from "@/components/navbar"
import PlaneAnimation from "@/components/plane-animation"
import FeaturedDeals from "@/components/featured-deals"
import Footer from "@/components/Footer"
import HeroDocking from "@/components/HeroDocking"
import ScriptlessBookingPanel from "@/components/ScriptlessBookingPanel";
import TestimonialSection  from "@/components/testimonial-section";
import router from "next/router";
import ExclusiveServices from "@/components/ExclusiveServices";

export default function HomePage() {
  return (
    <div className="relative">
{/* First Section - Hero with floating plane */}
<div
  className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden hero-bottom-shadow"
  style={{ backgroundImage: "url(/bg.png)" }}
>
  <Navbar />

  {/* Floating plane in center */}
  <div className="absolute inset-0 flex items-center justify-center z-10">
    <div className="animate-float">
      <img
        src="/plane.png"
        alt="ASR Private Jet"
        className="
          w-[1000px]
          md:w-[1200px]
          lg:w-[1300px]
          xl:w-[1400px]
          h-auto drop-shadow-2xl
        "
      />
    </div>
  </div>

  {/* Tagline below plane */}
<div className="absolute inset-0 flex items-center justify-center z-10">
  <div className="mt-[32rem] text-center">
    <h1 className="text-white font-bold leading-[1.1] drop-shadow-lg text-[3rem]">
      ASR Aviation <br/> Elevating Luxury, Redefining Air Travel
    </h1>
  </div>
</div>


  {/* Pop-up booking panel (appears on tiny scroll/move) */}
  <ScriptlessBookingPanel />
</div>



      
      {/* Second Section — NEW plane animation  */}
      <section id="asr-experience" className="relative z-0">
        <PlaneAnimation />
      </section>
<ExclusiveServices/>




      {/* Fourth Section - Featured Deals */}
      <FeaturedDeals />

      {/* Fifth Section - Join ASR Community */}
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden flex items-center"
        style={{ backgroundImage: "url(/community-bg.jpg)" }}
      >
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 pl-8 md:pl-16 lg:pl-24 max-w-2xl">
          <div className="text-left">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 whitespace-nowrap">
              Join ASR Community
            </h2>

            <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
              Join our ASR community to get the best Flight and Airplane Joyride deals and be the first one to grab
              them. Our community offers exclusive access to limited offers, early bird discounts, and much more else.
              Don't miss out - Join the ASR Community Now!
            </p>

            <a href="https://chat.whatsapp.com/KiOiQr6pVKf44DMu8vUe6X?mode=wwc" className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg">
              Join Now
            </a>
          </div>
        </div>
      </div>

      {/* Sixth Section - Testimonials */}
<TestimonialSection/>

{/* Seventh Section - Ready to explore the Future */}
<div className="relative">
  {/* Background image section */}{/*futuristic-aircraft.png */}
  <div 
    className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
    style={{ backgroundImage: "url(/bg-hero.jpg)" }}
  >
    {/* dark overlay */}
    <div className="absolute inset-0 bg-black/40"></div>

    {/* bottom fade so the button reads well */}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 to-transparent"></div>

    {/* headline */}
    <div className="relative z-10 h-full flex items-start justify-center pt-16">
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-wide drop-shadow-2xl text-center">
        Ready to explore the Future
      </h2>
    </div>

    {/* glow blobs */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
    <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-blue-500/15 rounded-full blur-2xl"></div>
    <div className="absolute top-20 right-1/4 w-48 h-48 bg-cyan-400/15 rounded-full blur-2xl"></div>

    {/* ⬇️ Button INSIDE the image, fixed to bottom-center */}
    <div className="absolute inset-x-0 bottom-8 z-20 flex justify-center px-4">
<a href="http://localhost:3001">
      <button 
      className="border-2 border-white/80 hover:border-white text-white font-semibold px-12 py-4 rounded-full text-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 backdrop-blur-sm shadow-2xl">
        View Air taxi
      </button>
</a>
    </div>
  </div>
</div>


         {/* Footer Component */}
      <Footer />
    </div>
  )
}
