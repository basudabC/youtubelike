import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Video, Users, MessageSquare, Bell,
  TrendingUp, UsersRound, FileCheck, AlertCircle,
  Plus, Check, X as XIcon, Loader2, Download, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AddChannelModal } from '@/components/admin/AddChannelModal';
import { VideoImportModal } from '@/components/admin/VideoImportModal';
import { VideoPreviewModal } from '@/components/admin/VideoPreviewModal';
import { useAdminChannels, useAdminVideos, useAdminStats, useAdminUsers } from '@/hooks/useAdmin';

interface AdminPanelProps {
  onNavigate: (page: 'landing' | 'dashboard' | 'video' | 'topic' | 'admin') => void;
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const { signOut, isAdmin, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'videos' | 'users' | 'requests' | 'notices'>('overview');
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);
  const [showVideoImportModal, setShowVideoImportModal] = useState(false);
  const [showVideoPreviewModal, setShowVideoPreviewModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [videoFilter, setVideoFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);

  const { fetchChannels, approveChannel, rejectChannel, loading } = useAdminChannels();
  const { fetchVideos, approveVideo, rejectVideo, loading: videosLoading } = useAdminVideos();
  const { fetchStats, loading: statsLoading } = useAdminStats();
  const { fetchUsers, approveUser, rejectUser, loading: usersLoading } = useAdminUsers();

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'overview') {
      loadStats();
    } else if (activeTab === 'channels') {
      loadChannels();
    } else if (activeTab === 'videos') {
      loadVideos();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  // Reload videos when filter changes
  useEffect(() => {
    if (activeTab === 'videos') {
      loadVideos();
    }
  }, [videoFilter]);

  // Reload users when filter changes
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [userFilter]);

  const loadStats = async () => {
    const data = await fetchStats();
    setStats(data);
  };

  const loadChannels = async () => {
    const data = await fetchChannels();
    setChannels(data);
  };

  const loadVideos = async () => {
    const status = videoFilter === 'all' ? undefined : videoFilter;
    const data = await fetchVideos(status);
    setVideos(data);
  };

  const loadUsers = async () => {
    const status = userFilter === 'all' ? undefined : userFilter;
    const data = await fetchUsers(status);
    setUsers(data);
  };

  const handleApproveChannel = async (channelId: string) => {
    const success = await approveChannel(channelId);
    if (success) {
      loadChannels();
    }
  };

  const handleRejectChannel = async (channelId: string) => {
    const success = await rejectChannel(channelId, 'Not suitable for educational content');
    if (success) {
      loadChannels();
    }
  };

  const handleImportVideos = (channel: any) => {
    setSelectedChannel(channel);
    setShowVideoImportModal(true);
  };

  const handleApproveVideo = async (videoId: string) => {
    const success = await approveVideo(videoId);
    if (success) {
      loadVideos();
    }
  };

  const handleRejectVideo = async (videoId: string) => {
    const success = await rejectVideo(videoId, 'Not suitable for platform');
    if (success) {
      loadVideos();
    }
  };

  const handleApproveUser = async (userId: string) => {
    if (!currentUser) return;
    const success = await approveUser(userId, currentUser.id);
    if (success) {
      loadUsers();
      loadStats(); // Refresh stats after user approval
    }
  };

  const handleRejectUser = async (userId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    const success = await rejectUser(userId, reason);
    if (success) {
      loadUsers();
      loadStats(); // Refresh stats after user rejection
    }
  };

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setShowVideoPreviewModal(true);
  };

  if (!isAdmin) {
    onNavigate('landing');
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'channels', label: 'Channels', icon: UsersRound },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'requests', label: 'Requests', icon: MessageSquare },
    { id: 'notices', label: 'Notices', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">Admin</span>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                Admin Panel
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => onNavigate('landing')}
                variant="outline"
                size="sm"
              >
                View Site
              </Button>
              <Button
                onClick={() => onNavigate('dashboard')}
                variant="outline"
                size="sm"
              >
                Dashboard
              </Button>
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w - full flex items - center gap - 3 px - 4 py - 3 rounded - lg text - sm font - medium transition - all ${activeTab === tab.id
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:bg-gray-50'
                      } `}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="hidden lg:inline">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {statsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading statistics...</p>
                  </div>
                ) : (
                  <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                            <UsersRound className="w-6 h-6 text-blue-600" />
                          </div>
                          <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                        {stats?.pendingUsers > 0 && (
                          <p className="text-xs text-amber-600 mt-1">{stats.pendingUsers} pending approval</p>
                        )}
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                            <Video className="w-6 h-6 text-violet-600" />
                          </div>
                          <FileCheck className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Approved Videos</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.approvedVideos || 0}</p>
                        <p className="text-xs text-blue-600 mt-1">Ready for users</p>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                          </div>
                          {stats?.pendingReviews > 0 && (
                            <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Pending Reviews</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.pendingReviews || 0}</p>
                        <p className="text-xs text-amber-600 mt-1">Requires attention</p>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-emerald-600" />
                          </div>
                          {stats?.topicRequests > 0 && (
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Topic Requests</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.topicRequests || 0}</p>
                        <p className="text-xs text-emerald-600 mt-1">From users</p>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                      <div className="space-y-4">
                        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                          stats.recentActivity.map((activity: any, index: number) => (
                            <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.type === 'user' ? 'bg-blue-50 text-blue-600' :
                                activity.type === 'video' ? 'bg-violet-50 text-violet-600' :
                                  activity.type === 'channel' ? 'bg-emerald-50 text-emerald-600' :
                                    'bg-amber-50 text-amber-600'
                                }`}>
                                {activity.type === 'user' ? <Users className="w-5 h-5" /> :
                                  activity.type === 'video' ? <Video className="w-5 h-5" /> :
                                    activity.type === 'channel' ? <UsersRound className="w-5 h-5" /> :
                                      <MessageSquare className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                <p className="text-sm text-gray-500">{activity.user}</p>
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(activity.time).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500">No recent activity</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'channels' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Channels</h3>
                  <Button
                    onClick={() => setShowAddChannelModal(true)}
                    className="bg-gradient-to-r from-blue-500 to-violet-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Channel
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading channels...</p>
                  </div>
                ) : channels.length > 0 ? (
                  <div className="space-y-4">
                    {channels.map((channel) => (
                      <div
                        key={channel.id}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={channel.thumbnail_url || 'https://via.placeholder.com/80'}
                          alt={channel.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">{channel.name}</h4>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {channel.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>{channel.subscriber_count?.toLocaleString() || 0} subscribers</span>
                            <span>•</span>
                            <span>{channel.video_count || 0} videos</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {channel.status === 'approved' && (
                            <Button
                              onClick={() => handleImportVideos(channel)}
                              size="sm"
                              variant="outline"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Import Videos
                            </Button>
                          )}
                          {channel.status === 'pending' ? (
                            <>
                              <Button
                                onClick={() => handleApproveChannel(channel.id)}
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleRejectChannel(channel.id)}
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XIcon className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span
                              className={`px - 3 py - 1 rounded - full text - xs font - medium ${channel.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                                } `}
                            >
                              {channel.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UsersRound className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No channels added yet</p>
                    <Button
                      onClick={() => setShowAddChannelModal(true)}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Channel
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'videos' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Videos</h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={videoFilter}
                      onChange={(e) => setVideoFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="all">All Videos</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {videosLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading videos...</p>
                  </div>
                ) : videos.length > 0 ? (
                  <div className="space-y-4">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                        onClick={() => handleVideoClick(video)}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={video.thumbnail_url || 'https://via.placeholder.com/160x90'}
                            alt={video.title}
                            className="w-40 h-24 rounded-lg object-cover"
                          />
                          {/* Play icon overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-red-600/0 group-hover:bg-red-600 transition-all flex items-center justify-center">
                              <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                            {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                            {video.title}
                          </h4>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                            {video.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{video.channel?.name || 'Unknown Channel'}</span>
                            <span>•</span>
                            <span>{video.view_count?.toLocaleString() || 0} views</span>
                            <span>•</span>
                            <span>{new Date(video.published_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {video.status === 'pending' ? (
                            <>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveVideo(video.id);
                                }}
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectVideo(video.id);
                                }}
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XIcon className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${video.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                                }`}
                            >
                              {video.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      {videoFilter === 'all' ? 'No videos imported yet' : `No ${videoFilter} videos`}
                    </p>
                    <p className="text-sm text-gray-400">
                      Import videos from approved channels to get started
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="all">All Users</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {usersLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading users...</p>
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user: any) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        {/* User Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {user.username || 'No username'}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : user.status === 'pending'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                                }`}
                            >
                              {user.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                            {user.approved_at && (
                              <span>Approved: {new Date(user.approved_at).toLocaleDateString()}</span>
                            )}
                            {user.rejection_reason && (
                              <span className="text-red-600">Reason: {user.rejection_reason}</span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {user.status === 'pending' ? (
                            <>
                              <Button
                                onClick={() => handleApproveUser(user.id)}
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleRejectUser(user.id)}
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XIcon className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">
                              {user.status === 'approved' ? '✓ Active' : '✗ Rejected'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      {userFilter === 'all' ? 'No users found' : `No ${userFilter} users`}
                    </p>
                    <p className="text-sm text-gray-400">
                      Users will appear here once they sign up
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'requests' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Topic Requests</h3>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    12 pending
                  </span>
                </div>
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Topic requests coming soon</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'notices' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Notices</h3>
                  <Button className="bg-gradient-to-r from-blue-500 to-violet-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Notice
                  </Button>
                </div>
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Notice management coming soon</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Add Channel Modal */}
      <AddChannelModal
        isOpen={showAddChannelModal}
        onClose={() => setShowAddChannelModal(false)}
        onSuccess={loadChannels}
      />

      {/* Video Import Modal */}
      <VideoImportModal
        isOpen={showVideoImportModal}
        onClose={() => {
          setShowVideoImportModal(false);
          setSelectedChannel(null);
        }}
        onSuccess={() => {
          loadVideos();
          loadChannels();
        }}
        channel={selectedChannel}
      />

      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={showVideoPreviewModal}
        onClose={() => {
          setShowVideoPreviewModal(false);
          setSelectedVideo(null);
        }}
        video={selectedVideo}
        onApprove={handleApproveVideo}
        onReject={handleRejectVideo}
      />
    </div>
  );
}
