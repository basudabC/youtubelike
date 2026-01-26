import { motion } from 'framer-motion';
import { Search, Play, BarChart3, Award } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Choose Your Topic',
    description: 'Browse our curated collection of educational topics. From computer science to philosophy, find subjects that match your learning goals.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    number: '02',
    icon: Play,
    title: 'Watch & Learn',
    description: 'Immerse yourself in distraction-free video content. Our player removes all interruptions so you can focus entirely on learning.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Track Progress',
    description: 'Monitor your advancement through each topic. See your watch time, completion rates, and learning streaks.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    number: '04',
    icon: Award,
    title: 'Master Skills',
    description: 'Complete learning paths and earn achievements. Build expertise progressively with structured content designed for mastery.',
    color: 'from-amber-500 to-amber-600',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-50 rounded-full opacity-40 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-violet-50 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 mb-6"
          >
            <span className="text-sm font-medium text-amber-700">
              Getting Started
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
          >
            Your Learning{' '}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Journey
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Four simple steps to transform your learning experience 
            and achieve your educational goals.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200 -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: 0.1 + index * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative"
              >
                {/* Step Card */}
                <div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  {/* Step Number Badge */}
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} text-white font-bold text-lg mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-gradient-to-r group-hover:from-gray-50 group-hover:to-gray-100 transition-colors">
                    <step.icon className="w-8 h-8 text-gray-600 group-hover:text-blue-600 transition-colors" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Hover Glow */}
                  <div
                    className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`}
                  />
                </div>

                {/* Arrow - Mobile */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-4 lg:hidden">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-gray-300 to-transparent" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-20"
        >
          <p className="text-gray-600 mb-6">
            Ready to start your learning journey?
          </p>
          <button
            onClick={() => window.scrollTo({ top: document.getElementById('cta')?.offsetTop || 0, behavior: 'smooth' })}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started Free
            <Award className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
