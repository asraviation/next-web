"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ✅ Static imports like your example
import kajalAndAshima from "../testimonials/Kajal&Ashima.png";
import vladimir from "../testimonials/vladimir.jpg";
import rajAndSneha from "../testimonials/raj.jpg";
import ashima from "../testimonials/ashima.jpg";
import kajal from "../testimonials/kajal.jpg";
import alex from "../testimonials/alex-rabb.jpg";
import gajSingh from "../testimonials/gaj.jpg";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    id: 1,
    name: "Kajal & Ashima",
    quote: "Flying with ASR was a luxury experience from start to finish",
    content:
      "Flying with ASR was a luxury experience from start to finish. Impeccable service, punctuality, and premium comfort in the sky. ASR Aviation delivers unmatched luxury and precision that exceeds all expectations!",
    image: kajalAndAshima,
    rating: 5,
  },
  {
    id: 2,
    name: "Vladimir",
    quote: "Such a great experience!",
    content:
      "Such a great experience! The crew was super warm and helicopter was awesome. From the moment we took off, everything was handled with professionalism and care. The flight was smooth and the views were incredible.",
    image: vladimir,
    rating: 5,
  },
  {
    id: 3,
    name: "Raj & Sneha",
    quote: "We chartered a jet for our anniversary, and it felt like a dream",
    content:
      "We chartered a jet for our anniversary, and it felt like a dream. The team went above and beyond to make it special. Every detail was perfectly arranged, and the service made our celebration truly unforgettable.",
    image: rajAndSneha,
    rating: 5,
  },
  {
    id: 4,
    name: "Ashima",
    quote: "The best time of my life",
    content:
      "The best time of my life. I feel this is a real luxury and this has become my permanent travel partner now.",
    image: ashima,
    rating: 5,
  },
  {
    id: 5,
    name: "Kajal",
    quote: "I must say this is the best experience I ever had",
    content:
      "I must say this is the best experience I ever had. I am so overwhelmed to fly with ASR Aviation and hope to fly soon. The level of service and attention to detail was remarkable, creating a game-changing partnership that delivered amazing results!",
    image: kajal,
    rating: 5,
  },
  {
    id: 6,
    name: "Alex Rabb",
    quote: "What really stood out was the customer service",
    content:
      "What really stood out was the customer service. Every question I had was answered quickly and clearly. It felt like they genuinely cared about making my experience perfect. This partnership has been game-changing and delivered amazing results beyond my expectations.",
    image: alex,
    rating: 5,
  },
  {
    id: 7,
    name: "Gaj Singh",
    quote: "It was a great and thrilling experience",
    content:
      "It was a great and thrilling experience. I am hoping for the best and soon ASR Aviation will soar to the top of the aviation world. The professionalism, safety standards, and luxury service they provide is unmatched in the industry.",
    image: gajSingh,
    rating: 5,
  },
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(1); // start at first real slide
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  // Create extended array for smooth infinite scrolling
  const extendedTestimonials = [
    testimonials[testimonials.length - 1],
    ...testimonials,
    testimonials[0],
  ];

  const minSwipeDistance = 50;
  const slideDurationMs = 500; // keep in sync with CSS transition

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index + 1); // +1 for the head clone
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) < minSwipeDistance) return;
    if (distance > 0) nextSlide();
    else prevSlide();
  };

  // Seamless infinite loop reset
  useEffect(() => {
    if (!isTransitioning) return;
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      if (currentIndex === 0) setCurrentIndex(testimonials.length);
      else if (currentIndex === extendedTestimonials.length - 1) setCurrentIndex(1);
    }, slideDurationMs + 20);
    return () => clearTimeout(timer);
  }, [isTransitioning, currentIndex, extendedTestimonials.length]);

  // GSAP header entrance
  useEffect(() => {
    if (!sectionRef.current || !headerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "center 50%",
          toggleActions: "play none none reverse",
        },
      });
      tl.fromTo(
        headerRef.current!.children,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.18 }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const getActualIndex = (index: number) => {
    if (index === 0) return testimonials.length - 1;
    if (index === extendedTestimonials.length - 1) return 0;
    return index - 1;
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
  StarRating.propTypes = { rating: PropTypes.number.isRequired };

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-white via-yellow-50/30 to-white py-20 px-4 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-20">
          <p className="text-yellow-600 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
            <span className="w-8 h-[2px] bg-yellow-500" />
            TESTIMONIALS
            <span className="w-8 h-[2px] bg-yellow-500" />
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-6 leading-tight">
            What our clients <em className="italic font-light text-gray-700">say about us</em>
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Discover the exceptional experiences our valued clients have had with ASR
            Aviation&apos;s premium services
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            className="overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className={`flex ${isTransitioning ? "transition-transform duration-500 ease-out" : ""}`}
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {extendedTestimonials.map((testimonial, index) => {
                const isActive = index === currentIndex;
                return (
                  <div key={`${testimonial.id}-${index}`} className="w-full flex-shrink-0">
                    <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center px-6 md:px-8 pt-10 md:pt-12">
                      {/* Image */}
                      <div className="lg:col-span-5 order-1">
                        <div
                          className={`relative transform transition-all duration-700 ease-out ${
                            isActive
                              ? "scale-100 opacity-100 translate-y-0"
                              : "scale-95 opacity-60 translate-y-4"
                          }`}
                        >
                          <div className="relative overflow-hidden rounded-3xl shadow-2xl mx-auto w-full max-w-[620px] bg-gray-100">
                            <img
                              src={typeof testimonial.image === "string" ? testimonial.image : (testimonial.image as any).src}
                              alt={testimonial.name}
                              className="block w-full h-80 md:h-[420px] lg:h-[540px] object-cover object-center transition-transform duration-700 hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                          </div>
                        </div>
                      </div>

                      {/* Text */}
                      <div className="lg:col-span-7 order-2 space-y-8">
                        <div
                          className={`transform transition-all duration-700 ease-out delay-150 ${
                            isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                          }`}
                        >
                          <div className="pl-6 md:pl-8">
                            <StarRating rating={testimonial.rating} />
                          </div>

                          <div className="relative">
                            <div className="absolute -top-2 -left-0 md:-left-2 text-yellow-400/30 text-6xl leading-none font-serif">
                              &ldquo;
                            </div>
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-tight mb-6 pl-6 md:pl-8">
                              {testimonial.quote}
                            </h3>
                          </div>

                          <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-8 pl-6 md:pl-8">
                            {testimonial.content}
                          </p>

                          <div className="flex items-center gap-4 pl-6 md:pl-8">
                            <div className="w-1 h-16 bg-gradient-to-b from-yellow-500 to-yellow-300 rounded-full" />
                            <p className="text-yellow-600 font-bold text-xl">{testimonial.name}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex justify-center gap-4 md:mt-12 mt-8">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 hover:border-yellow-400 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-40"
              disabled={isTransitioning}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center transition-all duration-200 text-white shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-40"
              disabled={isTransitioning}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center mt-14 gap-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  getActualIndex(currentIndex) === index
                    ? "w-10 h-3 bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-lg"
                    : "w-3 h-3 bg-gray-300 hover:bg-yellow-400 hover:scale-125"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
