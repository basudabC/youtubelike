import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, User, LogOut, Filter, Search, Grid3x3, List,
  TrendingUp, Sparkles, ChevronDown,
  LayoutGrid, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useVideos } from '@/hooks/useVideos';
import { useTopics } from '@/hooks/useTopics';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { UserOverview } from './UserOverview';

interface DashboardProps {
  onNavigate: (page: 'landing' | 'dashboard' | 'video' | 'topic' | 'admin') => void;
  onVideoSelect: (videoId: string) => void;
  onTopicSelect: (topicId: string) => void;
}

export function Dashboard({ onNavigate, onVideoSelect }: DashboardProps) {
  const { user, signOut, isAdmin } = useAuth();

  // Check URL for tab parameter, default to 'videos' if coming from video player
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = (urlParams.get('tab') as 'overview' | 'videos') || 'videos';

  const [activeTab, setActiveTab] = useState<'overview' | 'videos'>(initialTab);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'duration'>('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch videos and topics
  const { videos, loading: videosLoading } = useVideos({
    status: 'approved',
    topicId: selectedTopic === 'all' ? undefined : selectedTopic,
    limit: 100
  });
  const { topics } = useTopics();

  // Filter videos by search query
  const filteredVideos = videos.filter((video: any) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.channel?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort videos
  const sortedVideos = [...filteredVideos].sort((a: any, b: any) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'popular') {
      return (b.view_count || 0) - (a.view_count || 0);
    } else {
      return a.duration - b.duration;
    }
  });

  if (!user) {
    onNavigate('landing');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  ANTITUBEE
                </h1>
                <p className="text-xs text-gray-500">Learning Platform</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                  activeTab === 'overview'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                  activeTab === 'videos'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Videos</span>
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Button
                  onClick={() => onNavigate('admin')}
                  variant="outline"
                  className="hidden sm:flex border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  Admin Panel
                </Button>
              )}
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl border border-blue-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user.username || 'User'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <Button
                onClick={signOut}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UserOverview onVideoSelect={onVideoSelect} />
            </motion.div>
          ) : (
            <motion.div
              key="videos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Filters & Controls */}
              <div className="mb-8">
                {/* Mobile Search */}
                <div className="md:hidden mb-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search videos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <Filter className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Filters</span>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        showFilters && "rotate-180"
                      )} />
                    </button>

                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                        )}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                        )}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                      <option value="duration">Shortest First</option>
                    </select>

                    <div className="text-sm text-gray-500">
                      <span className="font-semibold text-gray-900">{sortedVideos.length}</span> videos
                    </div>
                  </div>
                </div>

                {/* Topic Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-5 h-5 text-violet-600" />
                          <h3 className="text-sm font-semibold text-gray-900">Filter by Topic</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedTopic('all')}
                            className={cn(
                              'px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm',
                              selectedTopic === 'all'
                                ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                            )}
                          >
                            All Topics
                          </button>
                          {topics.map((topic: any) => (
                            <button
                              key={topic.id}
                              onClick={() => setSelectedTopic(topic.id)}
                              className={cn(
                                'px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm',
                                selectedTopic === topic.id
                                  ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg scale-105'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Videos Grid/List */}
              {videosLoading ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Loading videos...</p>
                </div>
              ) : sortedVideos.length > 0 ? (
                <motion.div
                  layout
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'
                      : 'space-y-4'
                  )}
                >
                  {sortedVideos.map((video: any, index: number) => (
                    <motion.div
                      key={video.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => onVideoSelect(video.id)}
                      className={cn(
                        'group cursor-pointer',
                        viewMode === 'list' && 'flex gap-4 bg-white rounded-2xl p-4 border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all'
                      )}
                    >
                      {viewMode === 'grid' ? (
                        /* Grid View */
                        <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
                          {/* Thumbnail */}
                          <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                                <Play className="w-8 h-8 text-blue-600 fill-blue-600 ml-1" />
                              </div>
                            </div>
                            {/* Duration */}
                            <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
                              {formatDuration(video.duration)}
                            </div>
                            {/* View Count */}
                            {video.view_count > 0 && (
                              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {video.view_count} views
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-4">
                            <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors text-base leading-tight">
                              {video.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 font-medium">
                              {video.channel?.name}
                            </p>
                            {/* Topics */}
                            {video.topics && video.topics.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {video.topics.slice(0, 2).map((topic: any) => (
                                  <span
                                    key={topic.id}
                                    className="text-xs px-3 py-1 rounded-full font-semibold"
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
                      ) : (
                        /* List View */
                        <>
                          <div className="relative w-80 aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all">
                                <Play className="w-6 h-6 text-blue-600 fill-blue-600 ml-0.5" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                              {formatDuration(video.duration)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-lg">
                              {video.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{video.channel?.name}</p>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{video.description}</p>
                            {video.topics && video.topics.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {video.topics.map((topic: any) => (
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
                        </>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center mx-auto mb-6">
                    <Play className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No videos found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : selectedTopic === 'all'
                        ? 'No approved videos available yet'
                        : 'Try selecting a different topic or clear filters'}
                  </p>
                  {(searchQuery || selectedTopic !== 'all') && (
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTopic('all');
                      }}
                      className="bg-gradient-to-r from-blue-600 to-violet-600"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
