import { motion } from 'framer-motion';
import { 
  Eye, Shield, BarChart3, Target, Zap, Heart,
  Clock, Award
} from 'lucide-react';

const features = [
  {
    icon: Eye,
    title: 'Distraction-Free',
    description: 'No ads, no recommended videos, no comments clutter. Just pure educational content focused on your learning.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Shield,
    title: 'Curated Content',
    description: 'Every video is hand-picked and approved by educational experts. Quality over quantity, always.',
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-50',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics. See how much you have accomplished.',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Target,
    title: 'Structured Learning',
    description: 'Follow organized topic paths designed for progressive skill building from beginner to advanced.',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    icon: Zap,
    title: 'Fast & Responsive',
    description: 'Lightning-fast video loading and smooth navigation for uninterrupted learning sessions.',
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-50',
  },
  {
    icon: Heart,
    title: 'Save for Later',
    description: 'Bookmark videos to watch later and build your personal learning queue effortlessly.',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1)_0%,transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-6"
          >
            <span className="text-sm font-medium text-emerald-700">
              Why Choose Us
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
          >
            Designed for{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Focus
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Every feature is crafted to help you learn more effectively 
            by removing distractions and enhancing your focus.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.1 + index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              {/* Gradient Background on Hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Icon */}
              <div
                className={`relative w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon
                  className={`w-8 h-8 bg-gradient-to-r ${feature.color} bg-clip-text`}
                  style={{ color: feature.color.includes('blue') ? '#3b82f6' : 
                           feature.color.includes('violet') ? '#8b5cf6' : 
                           feature.color.includes('emerald') ? '#10b981' : 
                           feature.color.includes('amber') ? '#f59e0b' : 
                           feature.color.includes('rose') ? '#f43f5e' : '#ec4899' }}
                />
              </div>

              {/* Content */}
              <h3 className="relative text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="relative text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative Corner */}
              <div className="absolute top-4 right-4 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div
                  className={`w-full h-full rounded-full bg-gradient-to-br ${feature.color} blur-2xl opacity-20`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { icon: Clock, value: '3+', label: 'Min Watch Time', color: 'text-blue-600' },
            { icon: Award, value: '98%', label: 'Completion Rate', color: 'text-emerald-600' },
            { icon: Eye, value: '0', label: 'Distractions', color: 'text-violet-600' },
            { icon: Target, value: '100%', label: 'Focus Mode', color: 'text-amber-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="text-center p-6 bg-white rounded-xl shadow-md border border-gray-100"
            >
              <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
