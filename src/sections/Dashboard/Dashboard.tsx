import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Clock, Award, Bookmark, MessageSquare,
  Settings, LogOut, ChevronRight, Play, User,
  TrendingUp, Calendar, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useUserFeatures';
import { useWatchHistory } from '@/hooks/useUserFeatures';
import { formatDuration, formatTimeAgo } from '@/lib/utils';


interface DashboardProps {
  onNavigate: (page: 'landing' | 'dashboard' | 'video' | 'topic' | 'admin') => void;
  onVideoSelect: (videoId: string) => void;
  onTopicSelect: (topicId: string) => void;
}

export function Dashboard({ onNavigate, onVideoSelect, onTopicSelect }: DashboardProps) {
  const { user, signOut, isAdmin } = useAuth();
  const { dashboardData, recentVideos } = useDashboard();
  const { history } = useWatchHistory();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'saved' | 'settings'>('overview');

  if (!user) {
    onNavigate('landing');
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">ANTITUBEE</span>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => onNavigate('landing')}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('landing')}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Topics
              </button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Button
                  onClick={() => onNavigate('admin')}
                  variant="outline"
                  className="hidden sm:flex"
                >
                  Admin
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user.username || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <Button
                  onClick={signOut}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center">
                  <User className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.username || 'User'}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData?.videos_completed || 0}
                  </div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div className="text-center p-3 bg-violet-50 rounded-xl">
                  <div className="text-2xl font-bold text-violet-600">
                    {Math.floor((dashboardData?.total_watch_time || 0) / 3600)}
                  </div>
                  <div className="text-xs text-gray-600">Hours</div>
                </div>
              </div>

              {/* Tabs */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-50 to-violet-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Total Watch Time</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatDuration(dashboardData?.total_watch_time || 0)}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                        <Award className="w-6 h-6 text-violet-600" />
                      </div>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        +12%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Videos Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData?.videos_completed || 0}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Target className="w-6 h-6 text-emerald-600" />
                      </div>
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData?.videos_in_progress || 0}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Bookmark className="w-6 h-6 text-amber-600" />
                      </div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        New
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Watch Later</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData?.watch_later_count || 0}
                    </p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    Continue Learning
                  </h3>

                  {recentVideos.length > 0 ? (
                    <div className="space-y-4">
                      {recentVideos.slice(0, 4).map((item: any) => (
                        <div
                          key={item.video.id}
                          onClick={() => onVideoSelect(item.video.id)}
                          className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                        >
                          <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.video.thumbnail_url}
                              alt={item.video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {item.video.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {item.video.channel?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress
                                value={item.percentage_watched}
                                className="h-1 flex-1"
                              />
                              <span className="text-xs text-gray-400">
                                {Math.round(item.percentage_watched)}%
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No recent activity</p>
                      <Button
                        onClick={() => onNavigate('landing')}
                        variant="outline"
                        className="mt-4"
                      >
                        Browse Topics
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Watch History</h3>
                {history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => onVideoSelect(item.video.id)}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.video.thumbnail_url}
                            alt={item.video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.video.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {item.video.channel?.name}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Progress
                              value={item.percentage_watched}
                              className="h-1.5 w-32"
                            />
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(item.last_watched_at)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No watch history yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'saved' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-gray-400" />
                  Watch Later
                </h3>
                <div className="text-center py-12">
                  <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No saved videos yet</p>
                  <Button
                    onClick={() => onNavigate('landing')}
                    variant="outline"
                    className="mt-4"
                  >
                    Browse Videos
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Username
                      </label>
                      <input
                        type="text"
                        defaultValue={user.username || ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Bio
                      </label>
                      <textarea
                        defaultValue={user.bio || ''}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        placeholder="Tell us about yourself"
                      />
                    </div>
                    <Button className="bg-gradient-to-r from-blue-500 to-violet-500">
                      Save Changes
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Computer Science', 'Mathematics', 'Physics', 'Design'].map((interest) => (
                      <span
                        key={interest}
                        onClick={() => onTopicSelect(interest.toLowerCase().replace(' ', '-'))}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Account</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                      <LogOut className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
