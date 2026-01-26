import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Video, Users, MessageSquare, Bell,
  TrendingUp, UsersRound, FileCheck, AlertCircle,
  Plus, Check, X as XIcon, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { AddChannelModal } from '@/components/admin/AddChannelModal';
import { useAdminChannels } from '@/hooks/useAdmin';

interface AdminPanelProps {
  onNavigate: (page: 'landing' | 'dashboard' | 'video' | 'topic' | 'admin') => void;
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const { signOut, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'videos' | 'users' | 'requests' | 'notices'>('overview');
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const { fetchChannels, approveChannel, rejectChannel, loading } = useAdminChannels();

  // Fetch channels when tab changes to channels
  useEffect(() => {
    if (activeTab === 'channels') {
      loadChannels();
    }
  }, [activeTab]);

  const loadChannels = async () => {
    const data = await fetchChannels();
    setChannels(data);
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
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
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                    <p className="text-xs text-emerald-600 mt-1">+12% this month</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                        <Video className="w-6 h-6 text-violet-600" />
                      </div>
                      <FileCheck className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Approved Videos</p>
                    <p className="text-2xl font-bold text-gray-900">523</p>
                    <p className="text-xs text-blue-600 mt-1">+8 this week</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                      </div>
                      <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">
                        New
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Pending Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                    <p className="text-xs text-amber-600 mt-1">Requires attention</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-emerald-600" />
                      </div>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                        New
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Topic Requests</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                    <p className="text-xs text-emerald-600 mt-1">This week</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    {[
                      { action: 'User registered', user: 'john.doe@email.com', time: '2 minutes ago', type: 'user' },
                      { action: 'Video approved', user: 'Machine Learning Basics', time: '15 minutes ago', type: 'video' },
                      { action: 'Channel added', user: 'Tech Education Hub', time: '1 hour ago', type: 'channel' },
                      { action: 'Topic request submitted', user: 'Quantum Computing', time: '3 hours ago', type: 'request' },
                    ].map((activity, index) => (
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
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
                              className={`px-3 py-1 rounded-full text-xs font-medium ${channel.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                                }`}
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
                    <Input placeholder="Search videos..." className="w-64" />
                    <Button variant="outline">
                      Filter
                    </Button>
                  </div>
                </div>
                <div className="text-center py-12">
                  <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Video management coming soon</p>
                </div>
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
                  <Input placeholder="Search users..." className="w-64" />
                </div>
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">User management coming soon</p>
                </div>
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
    </div>
  );
}
