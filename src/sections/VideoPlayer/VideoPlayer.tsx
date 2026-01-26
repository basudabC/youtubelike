import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Pause, Maximize, Volume2, VolumeX,
  Clock, Bookmark, BookmarkCheck, MessageSquare,
  SkipForward, Lock, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useVideo } from '@/hooks/useVideos';
// import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useWatchLater } from '@/hooks/useUserFeatures';
import { useComments } from '@/hooks/useUserFeatures';
import { formatDuration, calculateProgress, validateWatchTime, formatTimeAgo } from '@/lib/utils';
// import type { VideoWithDetails } from '@/types/database';

interface VideoPlayerProps {
  videoId: string;
  onNavigate: (page: 'landing' | 'dashboard' | 'video' | 'topic' | 'admin') => void;
  onTopicSelect?: (topicId: string) => void;
}

export function VideoPlayer({ videoId, onNavigate, onTopicSelect }: VideoPlayerProps) {
  const { user } = useAuth();
  const { video, loading: videoLoading } = useVideo(videoId);
  const { addToWatchLater, removeFromWatchLater } = useWatchLater();
  const { comments, addComment } = useComments(videoId);
  const [newComment, setNewComment] = useState('');

  const playerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [_volume, _setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [_isFullscreen, _setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [canSkip, setCanSkip] = useState(false);
  const [showSkipNotice, setShowSkipNotice] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Video progress management
  const progress = calculateProgress(currentTime, duration);
  const minWatchTime = 180; // 3 minutes

  // Load YouTube API
  useEffect(() => {
    if (window.YT) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }, []);

  // Initialize player
  useEffect(() => {
    if (!video || !playerRef.current || !window.YT) return;

    const initPlayer = () => {
      if (!window.YT.Player) {
        setTimeout(initPlayer, 100);
        return;
      }

      new window.YT.Player(playerRef.current!, {
        videoId: video.youtube_video_id,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          controls: 0,
          fs: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event: { target: any }) => {
            setPlayer(event.target);
            setDuration(event.target.getDuration());
          },
          onStateChange: (event: { data: number }) => {
            setIsPlaying(event.data === 1);
            if (event.data === 1) {
              // Playing - start tracking progress
              startProgressTracking();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [video]);

  // Progress tracking
  const startProgressTracking = useCallback(() => {
    const interval = setInterval(() => {
      if (player && player.getCurrentTime) {
        const time = player.getCurrentTime();
        setCurrentTime(time);

        // Check if user can skip
        const canNowSkip = validateWatchTime(time, duration, minWatchTime);
        setCanSkip(canNowSkip);

        // Auto-save progress
        if (user && Math.floor(time) % 30 === 0) {
          saveProgress(time);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player, duration, user]);

  // Save progress to database
  const saveProgress = useCallback(async (time: number) => {
    if (!user || !video) return;

    try {
      await fetch('/api/video/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          video_id: video.id,
          current_time: Math.floor(time),
          duration: duration,
          completed: time >= duration - 5,
        }),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [user, video, duration]);

  // Player controls
  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const seekTo = (time: number) => {
    if (!player) return;
    // Prevent skipping if not allowed
    if (time > currentTime + 10 && !canSkip) {
      setShowSkipNotice(true);
      setTimeout(() => setShowSkipNotice(false), 3000);
      return;
    }
    player.seekTo(time, true);
  };

  const toggleBookmark = async () => {
    if (!video) return;
    if (isBookmarked) {
      await removeFromWatchLater(video.id);
      setIsBookmarked(false);
    } else {
      await addToWatchLater(video.id);
      setIsBookmarked(true);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const result = await addComment(newComment);
    if (!result.error) {
      setNewComment('');
    }
  };

  if (videoLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p>Video not found</p>
          <button
            onClick={() => onNavigate('landing')}
            className="mt-4 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleBookmark}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-amber-500" />
                ) : (
                  <Bookmark className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            {/* Video Container */}
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-video group">
              <div ref={playerRef} className="w-full h-full" />

              {/* Custom Controls Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
                  }`}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
              >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 px-6 pt-4">
                  <div className="relative">
                    <Progress
                      value={progress}
                      className="h-1 bg-white/20"
                    />
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={(e) => seekTo(parseFloat(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6 ml-1" />
                      )}
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setIsMuted(!isMuted);
                          if (player) {
                            if (isMuted) {
                              player.unMute();
                            } else {
                              player.mute();
                            }
                          }
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </button>

                      <span className="text-sm text-white/80">
                        {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!canSkip && (
                      <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-900/50 px-3 py-1 rounded-full">
                        <Lock className="w-4 h-4" />
                        <span>Watch {Math.max(0, Math.ceil((minWatchTime - currentTime) / 60))}m more</span>
                      </div>
                    )}
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Skip Notice */}
              <AnimatePresence>
                {showSkipNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-6 py-3 rounded-lg shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>Please watch at least 3 minutes before skipping</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Video Info */}
            <div className="mt-6">
              <h1 className="text-2xl font-bold text-white mb-2">{video.title}</h1>
              <div className="flex items-center gap-4 text-gray-400">
                <span>{video.channel?.name}</span>
                <span>•</span>
                <span>{formatDuration(video.duration)}</span>
                <span>•</span>
                <span>{video.view_count} views</span>
              </div>

              {/* Topics */}
              {video.topics && video.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {video.topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => onTopicSelect?.(topic.id)}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-sm transition-colors"
                    >
                      {topic.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Video */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <SkipForward className="w-5 h-5 text-gray-400" />
                Up Next
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex gap-3 p-3 rounded-xl transition-colors ${canSkip
                      ? 'hover:bg-gray-700 cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                      }`}
                  >
                    <div className="w-20 h-14 bg-gray-700 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">
                        Related Video {i}
                      </h4>
                      <p className="text-xs text-gray-500">Channel Name</p>
                    </div>
                    {!canSkip && <Lock className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                Comments ({comments.length})
              </h3>

              {/* Add Comment */}
              <div className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                  rows={3}
                />
                <Button
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim()}
                  className="mt-2 w-full bg-gradient-to-r from-blue-500 to-violet-500"
                >
                  Post Comment
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {comment.user?.username || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
