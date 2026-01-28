import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideoImport } from '@/hooks/useVideoImport';

interface VideoImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    channel: {
        id: string;
        youtube_channel_id: string;
        name: string;
        thumbnail_url: string;
    } | null;
}

export function VideoImportModal({ isOpen, onClose, onSuccess, channel }: VideoImportModalProps) {
    const [maxVideos, setMaxVideos] = useState(25);
    const { loading, error, progress, importVideosFromChannel, resetProgress } = useVideoImport();
    const [importComplete, setImportComplete] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            resetProgress();
            setImportComplete(false);
        }
    }, [isOpen, resetProgress]);

    const handleImport = async () => {
        if (!channel) return;

        const result = await importVideosFromChannel(
            channel.id,
            channel.youtube_channel_id,
            maxVideos
        );

        if (result.success) {
            setImportComplete(true);
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 2000);
        }
    };

    const handleClose = () => {
        if (!loading) {
            resetProgress();
            setImportComplete(false);
            onClose();
        }
    };

    if (!isOpen || !channel) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                                <Download className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Import Videos</h2>
                                <p className="text-sm text-gray-500">From {channel.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {!loading && !importComplete && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <img
                                        src={channel.thumbnail_url || 'https://via.placeholder.com/80'}
                                        alt={channel.name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                                        <p className="text-sm text-gray-500">Channel ID: {channel.youtube_channel_id}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of videos to import
                                    </label>
                                    <div className="flex gap-2">
                                        {[10, 25, 50, 100].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setMaxVideos(num)}
                                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${maxVideos === num
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Latest videos will be imported from this channel
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleClose}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleImport}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-violet-500"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Import Videos
                                    </Button>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="space-y-6">
                                <div className="text-center py-8">
                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Importing Videos...
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {progress.currentVideo || 'Fetching videos from YouTube...'}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Progress</span>
                                        <span className="font-semibold text-gray-900">
                                            {progress.imported + progress.failed} / {progress.total}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300"
                                            style={{
                                                width: `${progress.total > 0 ? ((progress.imported + progress.failed) / progress.total) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>✓ {progress.imported} imported</span>
                                        {progress.failed > 0 && <span>✗ {progress.failed} failed</span>}
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {importComplete && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Import Complete!</h3>
                                <p className="text-gray-600 mb-4">
                                    Successfully imported {progress.imported} videos
                                    {progress.failed > 0 && ` (${progress.failed} failed)`}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Videos are pending approval in the Videos tab
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
