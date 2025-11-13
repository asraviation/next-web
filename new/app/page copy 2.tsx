import Navbar from "@/components/Navbar"
import PlaneAnimation from "@/components/plane-animation"
import FeaturedDeals from "@/components/featured-deals"
import Footer from "@/components/footer"
import HeroDocking from "@/components/HeroDocking"

export default function HomePage() {
  return (
    <div className="relative">
      {/* First Section - Hero with floating plane */}
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
        style={{ backgroundImage: "url(/bg.png)" }}
      >
        <Navbar />
        <HeroDocking onSubmit={undefined}/>
        {/* Floating plane in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-float">
            <img src="/plane.png" alt="ASR Private Jet" className="w-[1500px] h-auto drop-shadow-2xl" />
          </div>
        </div>

        {/* Tagline below plane */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="mt-[32rem] text-center">
            <h1 className="text-white text-4xl md:text-5xl font-bold tracking-wide drop-shadow-lg">
              ASR Aviation – Elevating Luxury, Redefining Air Travel.
            </h1>
          </div>
        </div>
      </div>

      
      {/* Second Section — NEW plane animation  */}
      <section id="asr-experience" className="relative z-0">
        <PlaneAnimation />
      </section>

      {/* Third Section - Exclusive Services */}
      <div className="bg-gray-50 relative overflow-hidden py-20 font-sans">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-yellow-600 mb-4">Exclusive Services</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto px-4">
            Discover our premium aviation services tailored for luxury, convenience, and unforgettable experiences
          </p>
        </div>
        <div className="horizontal-scroll-container overflow-x-auto pb-8">
          <div className="flex space-x-8 px-8 min-w-max">
            {/* Service Card 1 - Luxury Travel */}
            <div className="service-card group relative w-80 h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <img
                src="/services-strip.jpeg"
                alt="Luxury Private Jet Interior"
                className="w-full h-full object-cover object-left group-hover:scale-110 transition-transform duration-700"
                style={{ objectPosition: "0% 50%" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                <h3 className="text-xl font-bold mb-2">Luxury Travel</h3>
                <p className="text-sm opacity-90">Experience ultimate comfort in our premium private jets</p>
              </div>
            </div>
            {/* Service Card 2 - Wedding Services */}
            <div className="service-card group relative w-80 h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <img
                src="/services-strip.jpeg"
                alt="Helicopter Wedding Service"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                style={{ objectPosition: "20% 50%" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                <h3 className="text-xl font-bold mb-2">Wedding Services</h3>
                <p className="text-sm opacity-90">Make your special day unforgettable with helicopter arrivals</p>
              </div>
            </div>
            {/* Service Card 3 - Sightseeing Tours */}
            <div className="service-card group relative w-80 h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <img
                src="/services-strip.jpeg"
                alt="Helicopter Sightseeing Tours"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                style={{ objectPosition: "40% 50%" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                <h3 className="text-xl font-bold mb-2">Sightseeing Tours</h3>
                <p className="text-sm opacity-90">Discover breathtaking views from above</p>
              </div>
            </div>
            {/* Service Card 4 - Mountain Adventures */}
            <div className="service-card group relative w-80 h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <img
                src="/services-strip.jpeg"
                alt="Mountain Helicopter Services"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                style={{ objectPosition: "60% 50%" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                <h3 className="text-xl font-bold mb-2">Mountain Adventures</h3>
                <p className="text-sm opacity-90">Access remote destinations with ease and style</p>
              </div>
            </div>
            {/* Service Card 5 - Medical Services */}
            <div className="service-card group relative w-80 h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <img
                src="/services-strip.jpeg"
                alt="Medical Helicopter Services"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                style={{ objectPosition: "80% 50%" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                <h3 className="text-xl font-bold mb-2">Medical Services</h3>
                <p className="text-sm opacity-90">Emergency medical transport when time matters most</p>
              </div>
            </div>
            {/* Service Card 6 - Aerial Photography */}
            <div className="service-card group relative w-80 h-64 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <img
                src="/services-strip.jpeg"
                alt="Aerial Photography Services"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                style={{ objectPosition: "100% 50%" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                <h3 className="text-xl font-bold mb-2">Aerial Photography</h3>
                <p className="text-sm opacity-90">Capture stunning aerial perspectives for any occasion</p>
              </div>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">← Scroll horizontally to explore all services →</p>
        </div>
      </div>


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

            <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg">
              Join Now
            </button>
          </div>
        </div>
      </div>

      {/* Sixth Section - Testimonials */}
      {/* Sixth Section - Testimonials */}
      <div className="min-h-screen bg-white">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Left side - Gray section with heading and CTA */}
          <div className="w-full lg:w-1/3 bg-gray-100 flex flex-col justify-center p-8 lg:p-16">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Testimonials</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-md">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad...
              </p>
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg">
                Share your Experience
              </button>
            </div>
          </div>
          {/* Right side - White section with testimonial cards */}
          <div className="w-full lg:w-2/3 bg-white p-8 lg:p-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
              {/* Testimonial Cards (4 of them) */}
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center mb-4">
                    <img src="https://placehold.co/48x48/F3F4F6/000000?text=C" alt="Customer" className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Lorem ipsum</h4>
                      <p className="text-gray-600 text-sm">Lorem ipsum ad minim</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <div className="relative">
                    <svg className="absolute -top-2 -left-2 w-8 h-8 text-gray-200 fill-current" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                    </svg>
                    <p className="text-gray-700 leading-relaxed pl-6">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco labo...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Seventh Section - Ready to explore the Future */}
      <div className="relative">
        {/* Background image section */}
        <div
          className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
          style={{ backgroundImage: "url(/futuristic-aircraft.png)" }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative z-10 h-full flex items-start justify-center pt-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-wide drop-shadow-2xl text-center">
              Ready to explore the Future
            </h2>
          </div>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-blue-500/15 rounded-full blur-2xl"></div>
          <div className="absolute top-20 right-1/4 w-48 h-48 bg-cyan-400/15 rounded-full blur-2xl"></div>
        </div>

        <div className="bg-gray-900 py-8 flex justify-center">
          <button className="border-2 border-white/80 hover:border-white text-white font-semibold px-12 py-4 rounded-full text-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 backdrop-blur-sm shadow-2xl">
            View Air taxi
          </button>
        </div>
      </div>

         {/* Footer Component */}
      <Footer />
    </div>
  )
}
