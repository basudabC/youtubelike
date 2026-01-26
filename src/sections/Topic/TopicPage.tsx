import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Play, Grid3X3, List, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTopic } from '@/hooks/useTopics';
import { useVideos } from '@/hooks/useVideos';
import { formatDuration, formatNumber, formatTimeAgo } from '@/lib/utils';


interface TopicPageProps {
  topicId: string;
  onNavigate: (page: 'landing' | 'dashboard' | 'video' | 'topic' | 'admin') => void;
  onVideoSelect: (videoId: string) => void;
  onTopicSelect: (topicId: string) => void;
}

export function TopicPage({ topicId, onNavigate, onVideoSelect, onTopicSelect }: TopicPageProps) {
  const { topic, loading: topicLoading } = useTopic(topicId);
  const { videos, loading: videosLoading, hasMore, loadMore } = useVideos({ topicId, limit: 12 });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'duration'>('newest');

  if (topicLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Topic not found</p>
          <Button onClick={() => onNavigate('landing')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const sortedVideos = [...(videos || [])].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.view_count || 0) - (a.view_count || 0);
      case 'duration':
        return b.duration - a.duration;
      default:
        return new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime();
    }
  });

  const filteredVideos = sortedVideos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Topics</span>
            </button>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-violet-500/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                style={{ backgroundColor: `${topic.color}20`, color: topic.color }}
              >
                <span className="text-2xl font-bold">{topic.name.charAt(0)}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                {topic.name}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {topic.description || `Explore ${topic.name.toLowerCase()} courses and tutorials curated for your learning journey.`}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium text-gray-900">{topic.video_count}</span>
                  videos
                </div>
                {topic.children && topic.children.length > 0 && (
                  <>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-medium text-gray-900">{topic.children.length}</span>
                      subtopics
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Subtopics */}
      {topic.children && topic.children.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            {topic.children.map((child) => (
              <button
                key={child.id}
                onClick={() => onTopicSelect(child.id)}
                className="px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-sm font-medium text-gray-700"
              >
                {child.name}
              </button>
            ))}
          </motion.div>
        </div>
      )}

      {/* Videos Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredVideos.length} Videos
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="duration">Longest</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Videos Grid/List */}
        {videosLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }
          >
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onClick={() => onVideoSelect(video.id)}
                className={viewMode === 'grid'
                  ? 'group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer'
                  : 'group flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer'
                }
              >
                {/* Thumbnail */}
                <div className={viewMode === 'grid' ? 'relative aspect-video overflow-hidden' : 'relative w-48 h-28 rounded-lg overflow-hidden flex-shrink-0'}>
                  <img
                    src={video.thumbnail_url || undefined}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Content */}
                <div className={viewMode === 'grid' ? 'p-4' : 'flex-1 min-w-0'}>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{video.channel?.name}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{formatNumber(video.view_count || 0)} views</span>
                    <span>{formatTimeAgo(video.published_at || '')}</span>
                  </div>
                  {viewMode === 'list' && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-8">
            <Button
              onClick={loadMore}
              disabled={videosLoading}
              variant="outline"
              className="px-8"
            >
              {videosLoading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredVideos.length === 0 && !videosLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No videos found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'No videos available in this topic yet'}
            </p>
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery('')}
                variant="outline"
              >
                Clear Search
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
