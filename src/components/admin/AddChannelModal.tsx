import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2, CheckCircle, AlertCircle, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getChannelDetails, extractChannelId, type YouTubeChannel } from '@/lib/youtube';
import { useAdminChannels } from '@/hooks/useAdmin';

interface AddChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddChannelModal({ isOpen, onClose, onSuccess }: AddChannelModalProps) {
    const [channelInput, setChannelInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [channelData, setChannelData] = useState<YouTubeChannel | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');

    const { addChannel } = useAdminChannels();

    const handleSearch = async () => {
        if (!channelInput.trim()) {
            setError('Please enter a channel ID or URL');
            return;
        }

        setLoading(true);
        setError(null);
        setChannelData(null);

        try {
            // Extract channel ID from input
            const channelId = extractChannelId(channelInput) || channelInput.trim();
            console.log('[AddChannelModal] Extracted channel ID:', channelId);

            // Fetch channel details from YouTube
            const data = await getChannelDetails(channelId);

            if (!data) {
                setError('Channel not found. Please check the ID or URL and try again.');
                setLoading(false);
                return;
            }

            console.log('[AddChannelModal] Channel data received:', data);
            setChannelData(data);
            setStep('preview');
        } catch (err: any) {
            console.error('[AddChannelModal] Error:', err);
            setError(err.message || 'Failed to fetch channel details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddChannel = async () => {
        if (!channelData) return;

        setLoading(true);
        setError(null);

        try {
            const result = await addChannel(channelData.id, channelData);

            if (!result) {
                setError('Failed to add channel to database');
                setLoading(false);
                return;
            }

            setStep('success');
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to add channel');
            setLoading(false);
        }
    };

    const handleClose = () => {
        setChannelInput('');
        setChannelData(null);
        setError(null);
        setStep('input');
        onClose();
    };

    if (!isOpen) return null;

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
                    className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                                <Youtube className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Add YouTube Channel</h2>
                                <p className="text-sm text-gray-500">Import educational content from YouTube</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                        {step === 'input' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Channel ID or URL
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={channelInput}
                                            onChange={(e) => setChannelInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            placeholder="UCxxxxx... or https://youtube.com/@channel"
                                            className="flex-1"
                                            disabled={loading}
                                        />
                                        <Button
                                            onClick={handleSearch}
                                            disabled={loading || !channelInput.trim()}
                                            className="bg-gradient-to-r from-blue-500 to-violet-500"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Search className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Enter a YouTube channel ID (starts with UC) or paste a channel URL
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">How to find a channel ID:</h4>
                                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                                        <li>Go to the YouTube channel page</li>
                                        <li>Copy the URL from your browser</li>
                                        <li>Paste it here - we'll extract the channel ID automatically</li>
                                    </ol>
                                </div>
                            </div>
                        )}

                        {step === 'preview' && channelData && (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                                    <div className="flex gap-4">
                                        <img
                                            src={channelData.thumbnailUrl}
                                            alt={channelData.title}
                                            className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {channelData.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                                {channelData.description}
                                            </p>
                                            <div className="flex gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Subscribers:</span>
                                                    <span className="ml-1 font-semibold text-gray-900">
                                                        {channelData.subscriberCount.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Videos:</span>
                                                    <span className="ml-1 font-semibold text-gray-900">
                                                        {channelData.videoCount.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => {
                                            setStep('input');
                                            setChannelData(null);
                                            setError(null);
                                        }}
                                        variant="outline"
                                        className="flex-1"
                                        disabled={loading}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleAddChannel}
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-violet-500"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Adding Channel...
                                            </>
                                        ) : (
                                            'Add Channel'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Channel Added Successfully!</h3>
                                <p className="text-gray-600">
                                    The channel has been added to your platform. You can now import videos from this channel.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
