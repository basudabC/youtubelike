import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Play, Clock, TrendingUp, Award, Target, Calendar,
    BarChart3, PieChart, Activity, Zap, BookOpen, Video
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useUserFeatures';
import { useWatchHistory } from '@/hooks/useUserFeatures';
import { Progress } from '@/components/ui/progress';
import { formatDuration, formatTimeAgo } from '@/lib/utils';

interface UserOverviewProps {
    onVideoSelect: (videoId: string) => void;
}

export function UserOverview({ onVideoSelect }: UserOverviewProps) {
    const { user } = useAuth();
    const { dashboardData } = useDashboard();
    const { history } = useWatchHistory();

    // Calculate statistics from watch history
    const stats = {
        totalWatchTime: history.reduce((acc: number, item: any) => acc + (item.watch_time || 0), 0),
        videosCompleted: history.filter((item: any) => item.progress >= 90).length,
        videosInProgress: history.filter((item: any) => item.progress > 0 && item.progress < 90).length,
        currentStreak: dashboardData?.streak || 0,
    };

    // Calculate time by category/topic
    const timeByTopic: Record<string, { name: string; time: number; color: string; count: number }> = {};
    history.forEach((item: any) => {
        if (item.video?.topics) {
            item.video.topics.forEach((topic: any) => {
                if (!timeByTopic[topic.id]) {
                    timeByTopic[topic.id] = {
                        name: topic.name,
                        time: 0,
                        color: topic.color || '#3B82F6',
                        count: 0,
                    };
                }
                timeByTopic[topic.id].time += item.watch_time || 0;
                timeByTopic[topic.id].count += 1;
            });
        }
    });

    const topicStats = Object.values(timeByTopic).sort((a, b) => b.time - a.time);
    const totalTopicTime = topicStats.reduce((acc, topic) => acc + topic.time, 0);

    // Recent activity
    const recentVideos = history.slice(0, 5);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">
                            Welcome back, {user?.username || 'Learner'}! 👋
                        </h2>
                        <p className="text-blue-100 text-lg">
                            Continue your learning journey
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Zap className="w-12 h-12 text-yellow-300" />
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-blue-200" />
                            <span className="text-sm text-blue-100">Watch Time</span>
                        </div>
                        <p className="text-2xl font-bold">{formatDuration(stats.totalWatchTime)}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5 text-yellow-200" />
                            <span className="text-sm text-blue-100">Completed</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.videosCompleted}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-5 h-5 text-green-200" />
                            <span className="text-sm text-blue-100">In Progress</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.videosInProgress}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-5 h-5 text-orange-200" />
                            <span className="text-sm text-blue-100">Day Streak</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.currentStreak} 🔥</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Time by Category */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                                <PieChart className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Time by Category</h3>
                                <p className="text-sm text-gray-500">Your learning focus areas</p>
                            </div>
                        </div>
                    </div>

                    {topicStats.length > 0 ? (
                        <div className="space-y-4">
                            {topicStats.map((topic, index) => {
                                const percentage = totalTopicTime > 0 ? (topic.time / totalTopicTime) * 100 : 0;
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: topic.color }}
                                                />
                                                <span className="font-medium text-gray-900">{topic.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {formatDuration(topic.time)}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    ({topic.count} videos)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                                className="absolute top-0 left-0 h-full rounded-full"
                                                style={{
                                                    backgroundColor: topic.color,
                                                    boxShadow: `0 0 10px ${topic.color}40`,
                                                }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-400 text-right">
                                            {percentage.toFixed(1)}% of total time
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Start watching videos to see your learning statistics</p>
                        </div>
                    )}
                </motion.div>

                {/* Learning Goals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                            <Target className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Weekly Goals</h3>
                            <p className="text-sm text-gray-500">Keep it up!</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Watch Time Goal */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Watch 5 hours</span>
                                <span className="text-sm font-semibold text-blue-600">
                                    {Math.min(100, Math.round((stats.totalWatchTime / (5 * 3600)) * 100))}%
                                </span>
                            </div>
                            <Progress
                                value={Math.min(100, (stats.totalWatchTime / (5 * 3600)) * 100)}
                                className="h-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formatDuration(Math.max(0, 5 * 3600 - stats.totalWatchTime))} remaining
                            </p>
                        </div>

                        {/* Complete Videos Goal */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Complete 10 videos</span>
                                <span className="text-sm font-semibold text-emerald-600">
                                    {Math.min(100, Math.round((stats.videosCompleted / 10) * 100))}%
                                </span>
                            </div>
                            <Progress
                                value={Math.min(100, (stats.videosCompleted / 10) * 100)}
                                className="h-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {Math.max(0, 10 - stats.videosCompleted)} videos to go
                            </p>
                        </div>

                        {/* Streak Goal */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">7-day streak</span>
                                <span className="text-sm font-semibold text-orange-600">
                                    {Math.min(100, Math.round((stats.currentStreak / 7) * 100))}%
                                </span>
                            </div>
                            <Progress
                                value={Math.min(100, (stats.currentStreak / 7) * 100)}
                                className="h-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {Math.max(0, 7 - stats.currentStreak)} days to go
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Continue Learning */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center">
                        <Play className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Continue Learning</h3>
                        <p className="text-sm text-gray-500">Pick up where you left off</p>
                    </div>
                </div>

                {recentVideos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {recentVideos.map((item: any) => (
                            <div
                                key={item.id}
                                onClick={() => onVideoSelect(item.video_id)}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-3">
                                    <img
                                        src={item.video?.thumbnail_url}
                                        alt={item.video?.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                            <Play className="w-6 h-6 text-blue-600 fill-blue-600 ml-0.5" />
                                        </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/50">
                                        <div
                                            className="h-full bg-blue-600"
                                            style={{ width: `${item.progress || 0}%` }}
                                        />
                                    </div>
                                </div>
                                <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                                    {item.video?.title}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    {item.progress >= 90 ? 'Completed' : `${Math.round(item.progress || 0)}% watched`}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No recent activity</p>
                        <p className="text-sm text-gray-400">Start watching videos to see them here</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
