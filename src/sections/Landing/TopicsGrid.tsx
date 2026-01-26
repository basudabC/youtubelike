import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTopics } from '@/hooks/useTopics';
import { 
  Code, Calculator, Atom, Dna, FlaskConical, Scroll, 
  Brain, TrendingUp, Palette, Languages, Briefcase, ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  Code: <Code className="w-6 h-6" />,
  Calculator: <Calculator className="w-6 h-6" />,
  Atom: <Atom className="w-6 h-6" />,
  Dna: <Dna className="w-6 h-6" />,
  FlaskConical: <FlaskConical className="w-6 h-6" />,
  Scroll: <Scroll className="w-6 h-6" />,
  Brain: <Brain className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  Palette: <Palette className="w-6 h-6" />,
  Languages: <Languages className="w-6 h-6" />,
  Briefcase: <Briefcase className="w-6 h-6" />,
};

interface TopicsGridProps {
  onTopicSelect: (topicId: string) => void;
}

export function TopicsGrid({ onTopicSelect }: TopicsGridProps) {
  const { topics, loading } = useTopics();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (loading) {
    return (
      <section id="topics" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Loading Topics...</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="topics" className="py-24 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-50 rounded-full opacity-50 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-violet-50 rounded-full opacity-50 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 mb-6"
          >
            <span className="text-sm font-medium text-violet-700">
              Explore Subjects
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
          >
            Explore Learning{' '}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Topics
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Curated educational content organized for your learning journey. 
            Choose from expert-approved subjects and start mastering new skills.
          </motion.p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, rotateY: -90 }}
              whileInView={{ opacity: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.1 + (index % 8) * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => onTopicSelect(topic.id)}
              onMouseEnter={() => setHoveredId(topic.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                'group relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer transition-all duration-300',
                'hover:shadow-xl hover:-translate-y-3',
                hoveredId === topic.id && 'scale-[1.02]'
              )}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
              }}
            >
              {/* Gradient Border on Hover */}
              <div
                className={cn(
                  'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                  'bg-gradient-to-br from-blue-500/10 to-violet-500/10'
                )}
              />

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${topic.color}20`, color: topic.color }}
              >
                {iconMap[topic.icon || 'Code'] || <Code className="w-6 h-6" />}
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {topic.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {topic.description || `Explore ${topic.name.toLowerCase()} courses and tutorials.`}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {topic.video_count} videos
                </span>
                <motion.div
                  animate={{ x: hoveredId === topic.id ? 5 : 0 }}
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Explore
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </div>

              {/* Children Topics */}
              {topic.children && topic.children.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {topic.children.slice(0, 3).map((child) => (
                      <span
                        key={child.id}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                      >
                        {child.name}
                      </span>
                    ))}
                    {topic.children.length > 3 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        +{topic.children.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => window.scrollTo({ top: document.getElementById('features')?.offsetTop || 0, behavior: 'smooth' })}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Browse All Topics
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
