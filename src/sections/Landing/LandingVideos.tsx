import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, TrendingUp, Filter, ChevronRight } from 'lucide-react';
import { useVideos } from '@/hooks/useVideos';
import { useTopics } from '@/hooks/useTopics';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface LandingVideosProps {
    onVideoSelect: (videoId: string) => void;
    onNavigate?: (page: 'landing' | 'dashboard' | 'video' | 'topic' | 'admin') => void;
}

export function LandingVideos({ onVideoSelect, onNavigate }: LandingVideosProps) {
    const [selectedTopic, setSelectedTopic] = useState<string>('all');
    const { videos, loading } = useVideos({ status: 'approved', topicId: selectedTopic === 'all' ? undefined : selectedTopic, limit: 12 });
    const { topics } = useTopics();

    return (
        <section id="videos" className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
                <div className="absolute top-40 right-40 w-96 h-96 bg-violet-100 rounded-full opacity-30 blur-3xl" />
                <div className="absolute bottom-40 left-40 w-80 h-80 bg-blue-100 rounded-full opacity-30 blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 mb-6"
                    >
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                            Featured Content
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
                    >
                        Start Learning{' '}
                        <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Today
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                    >
                        Explore our curated collection of educational videos. Filter by topic to find exactly what you need.
                    </motion.p>
                </div>

                {/* Topic Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Filter by Topic</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setSelectedTopic('all')}
                            className={cn(
                                'px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-sm',
                                selectedTopic === 'all'
                                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200'
                            )}
                        >
                            All Topics
                        </button>
                        {topics.slice(0, 8).map((topic: any) => (
                            <button
                                key={topic.id}
                                onClick={() => setSelectedTopic(topic.id)}
                                className={cn(
                                    'px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-sm',
                                    selectedTopic === topic.id
                                        ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg scale-105'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200'
                                )}
                                style={{
                                    backgroundColor: selectedTopic === topic.id ? undefined : `${topic.color}10`,
                                    borderColor: selectedTopic === topic.id ? undefined : `${topic.color}30`,
                                }}
                            >
                                {topic.name}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Videos Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading videos...</p>
                    </div>
                ) : videos.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        {videos.map((video: any, index: number) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 * (index % 4) }}
                                onClick={() => onVideoSelect(video.id)}
                                className="group cursor-pointer"
                            >
                                {/* Video Card */}
                                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
                                    {/* Thumbnail */}
                                    <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                        <img
                                            src={video.thumbnail_url}
                                            alt={video.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                                <Play className="w-8 h-8 text-blue-600 fill-blue-600 ml-1" />
                                            </div>
                                        </div>
                                        {/* Duration badge */}
                                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                                            <Clock className="w-3 h-3 inline mr-1" />
                                            {formatDuration(video.duration)}
                                        </div>
                                    </div>

                                    {/* Video Info */}
                                    <div className="p-5">
                                        <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors text-lg leading-tight">
                                            {video.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                                            <span className="font-medium">{video.channel?.name}</span>
                                        </p>
                                        {/* Topics */}
                                        {video.topics && video.topics.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {video.topics.slice(0, 2).map((topic: any) => (
                                                    <span
                                                        key={topic.id}
                                                        className="text-xs px-3 py-1 rounded-full font-medium"
                                                        style={{
                                                            backgroundColor: `${topic.color}15`,
                                                            color: topic.color,
                                                        }}
                                                    >
                                                        {topic.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
                        <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg mb-2">No videos found</p>
                        <p className="text-sm text-gray-400">
                            {selectedTopic === 'all'
                                ? 'No approved videos available yet'
                                : 'Try selecting a different topic'}
                        </p>
                    </div>
                )}

                {/* View All Button */}
                {videos.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="text-center mt-12"
                    >
                        <button
                            onClick={() => onNavigate?.('dashboard')}
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        >
                            Browse All Videos
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
