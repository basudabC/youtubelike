import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ThumbsUp, Eye, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    video: {
        id: string;
        youtube_video_id: string;
        title: string;
        description: string;
        thumbnail_url: string;
        duration: number;
        channel?: {
            name: string;
            thumbnail_url: string;
        };
        view_count?: number;
        like_count?: number;
        published_at: string;
        status: string;
        tags?: string[];
    } | null;
    onApprove?: (videoId: string) => void;
    onReject?: (videoId: string) => void;
}

export function VideoPreviewModal({
    isOpen,
    onClose,
    video,
    onApprove,
    onReject,
}: VideoPreviewModalProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsPlaying(false);
        }
    }, [isOpen]);

    if (!isOpen || !video) return null;

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleApprove = () => {
        if (onApprove) {
            onApprove(video.id);
            onClose();
        }
    };

    const handleReject = () => {
        if (onReject) {
            onReject(video.id);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                                <Play className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Video Preview</h2>
                                <p className="text-sm text-gray-500">
                                    {video.channel?.name || 'Unknown Channel'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Video Player */}
                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                            {isPlaying ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${video.youtube_video_id}?autoplay=1`}
                                    title={video.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                />
                            ) : (
                                <div
                                    onClick={() => setIsPlaying(true)}
                                    className="relative w-full h-full cursor-pointer group"
                                >
                                    <img
                                        src={video.thumbnail_url || 'https://via.placeholder.com/1280x720'}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                        <div className="w-20 h-20 rounded-full bg-red-600 group-hover:bg-red-700 transition-colors flex items-center justify-center">
                                            <Play className="w-10 h-10 text-white ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-black/80 text-white text-sm px-2 py-1 rounded">
                                        {formatDuration(video.duration)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Video Info */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {video.title}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        <span>{video.view_count?.toLocaleString() || 0} views</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ThumbsUp className="w-4 h-4" />
                                        <span>{video.like_count?.toLocaleString() || 0} likes</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(video.published_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{formatDuration(video.duration)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Status:</span>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${video.status === 'approved'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : video.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}
                                >
                                    {video.status}
                                </span>
                            </div>

                            {/* Channel Info */}
                            {video.channel && (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <img
                                        src={video.channel.thumbnail_url || 'https://via.placeholder.com/48'}
                                        alt={video.channel.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">{video.channel.name}</p>
                                        <p className="text-sm text-gray-500">Channel</p>
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {video.description || 'No description available'}
                                </p>
                            </div>

                            {/* Tags */}
                            {video.tags && video.tags.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {video.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {video.status === 'pending' && (onApprove || onReject) && (
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                {onApprove && (
                                    <Button
                                        onClick={handleApprove}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve Video
                                    </Button>
                                )}
                                {onReject && (
                                    <Button
                                        onClick={handleReject}
                                        variant="outline"
                                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject Video
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
