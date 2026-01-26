import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    quote: "ANTITUBEE has completely transformed how I learn online. No more falling into rabbit holes of unrelated videos. I can actually focus and complete courses.",
    author: "Sarah Chen",
    role: "Computer Science Student",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    quote: "The progress tracking feature is incredible. I can see exactly how much time I have spent learning and which topics I have mastered. Highly recommend!",
    author: "Michael Rodriguez",
    role: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 3,
    quote: "Finally, a platform that respects my time and attention. The curated content is top-notch, and I love how clean the interface is. No distractions, just learning.",
    author: "Emily Watson",
    role: "Data Scientist",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 4,
    quote: "I have completed more courses in 3 months on ANTITUBEE than in a year on other platforms. The focus mode really makes a difference.",
    author: "David Kim",
    role: "Product Manager",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 5,
    quote: "The topic organization is brilliant. I can follow structured learning paths without getting overwhelmed. Perfect for self-paced learning.",
    author: "Lisa Thompson",
    role: "UX Designer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const goToPrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-50 to-violet-50 rounded-full opacity-50 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6"
          >
            <span className="text-sm font-medium text-blue-700">
              Testimonials
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
          >
            Loved by{' '}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Learners
            </span>
          </motion.h2>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial Card */}
          <div className="relative min-h-[400px] flex items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
                  {/* Quote Icon */}
                  <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center">
                      <Quote className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  {/* Quote Text */}
                  <blockquote className="text-center mb-8">
                    <p className="text-xl md:text-2xl text-gray-700 leading-relaxed italic">
                      "{testimonials[activeIndex].quote}"
                    </p>
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={testimonials[activeIndex].avatar}
                      alt={testimonials[activeIndex].author}
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-200"
                    />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        {testimonials[activeIndex].author}
                      </p>
                      <p className="text-sm text-gray-500">
                        {testimonials[activeIndex].role}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToPrev}
              className="w-12 h-12 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </motion.button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? 'w-8 bg-gradient-to-r from-blue-500 to-violet-500'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToNext}
              className="w-12 h-12 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>

        {/* Side Cards - Desktop */}
        <div className="hidden lg:block">
          {/* Left Preview */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 0.5, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute left-8 top-1/2 -translate-y-1/2 w-64 h-48 bg-white rounded-2xl shadow-lg border border-gray-100 transform -rotate-6 scale-90 blur-sm"
          >
            <div className="p-6">
              <div className="w-10 h-10 rounded-full bg-gray-200 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </motion.div>

          {/* Right Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 0.5, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute right-8 top-1/2 -translate-y-1/2 w-64 h-48 bg-white rounded-2xl shadow-lg border border-gray-100 transform rotate-6 scale-90 blur-sm"
          >
            <div className="p-6">
              <div className="w-10 h-10 rounded-full bg-gray-200 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
