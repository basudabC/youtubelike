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
import { supabase } from '@/lib/supabase/client';
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
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const progressIntervalRef = useRef<number | null>(null);

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
            console.log('YouTube player ready, duration:', event.target.getDuration());
          },
          onStateChange: (event: { data: number; target: any }) => {
            const isNowPlaying = event.data === 1;
            const playerInstance = event.target;
            setIsPlaying(isNowPlaying);

            if (isNowPlaying) {
              console.log('Video started playing - starting progress tracking');
              // Clear any existing interval
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
              }
              // Start new tracking interval
              progressIntervalRef.current = setInterval(() => {
                if (playerInstance && playerInstance.getCurrentTime) {
                  const time = playerInstance.getCurrentTime();
                  setCurrentTime(time);

                  console.log('Current time:', Math.floor(time), 'seconds');

                  // Check if user can skip
                  const canNowSkip = validateWatchTime(time, duration, minWatchTime);
                  setCanSkip(canNowSkip);

                  // Auto-save progress every 10 seconds (changed from 30 for testing)
                  const timeFloor = Math.floor(time);
                  if (user && timeFloor % 10 === 0 && timeFloor > 0) {
                    console.log('Triggering save at', timeFloor, 'seconds');
                    saveProgress(time);
                  }
                }
              }, 1000);
            } else {
              // Paused or stopped - clear interval
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
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
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [video]);

  // Fetch related videos from the same topics
  useEffect(() => {
    const fetchRelatedVideos = async () => {
      if (!video || !video.topics || video.topics.length === 0) {
        setRelatedVideos([]);
        return;
      }

      try {
        const topicIds = video.topics.map((t: any) => t.id);

        // Fetch videos from the same topics
        const { data, error } = await supabase
          .from('videos')
          .select(`
            *,
            channel:channels(*),
            topics:video_topics(topic:topics(*))
          `)
          .eq('status', 'approved')
          .neq('id', video.id)
          .limit(10);

        if (error) throw error;

        // Process and filter videos that share at least one topic
        const processedVideos = ((data || []) as any[]).map((v: any) => ({
          ...v,
          topics: (v.topics as any[])?.map((vt: any) => vt.topic).filter(Boolean) || [],
        })).filter((v: any) => {
          // Check if video has at least one matching topic
          return v.topics.some((t: any) => topicIds.includes(t.id));
        }).slice(0, 3);

        setRelatedVideos(processedVideos);
      } catch (error) {
        console.error('Failed to fetch related videos:', error);
        setRelatedVideos([]);
      }
    };

    fetchRelatedVideos();
  }, [video]);

  // Save progress to database
  const saveProgress = useCallback(async (time: number) => {
    if (!user || !video) return;

    // Use video.duration to ensure we have the correct duration
    const videoDuration = video.duration || duration;

    if (!videoDuration || videoDuration === 0) {
      console.warn('Cannot save progress: duration is 0');
      return;
    }

    try {
      const progressData = {
        user_id: user.id,
        video_id: video.id,
        current_time: Math.floor(time),
        duration: videoDuration,
        completed: time >= videoDuration - 5,
        last_watched_at: new Date().toISOString(),
      };

      console.log('Saving progress data:', progressData);

      // Use upsert to insert or update progress
      const { error } = await supabase
        .from('watch_progress')
        .upsert(progressData as any, {
          onConflict: 'user_id,video_id',
        });

      if (error) {
        console.error('Supabase error saving progress:', error);
      } else {
        console.log('Progress saved successfully:', Math.floor(time), 'seconds');
      }
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

  const toggleFullscreen = () => {
    if (!player) return;

    // Use YouTube iframe API for fullscreen
    const iframe = player.getIframe();
    if (!iframe) return;

    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if ((iframe as any).webkitRequestFullscreen) {
        (iframe as any).webkitRequestFullscreen();
      } else if ((iframe as any).mozRequestFullScreen) {
        (iframe as any).mozRequestFullScreen();
      } else if ((iframe as any).msRequestFullscreen) {
        (iframe as any).msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      _setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
              onClick={() => {
                window.history.pushState({}, '', '/dashboard?tab=videos');
                onNavigate('dashboard');
              }}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Videos</span>
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
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Toggle fullscreen"
                    >
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
                {relatedVideos.length > 0 ? (
                  relatedVideos.map((relatedVideo) => (
                    <div
                      key={relatedVideo.id}
                      onClick={() => {
                        if (canSkip) {
                          // Navigate to the new video by updating the URL
                          window.history.pushState({}, '', `/watch/${relatedVideo.id}`);
                          window.location.reload();
                        }
                      }}
                      className={`flex gap-3 p-3 rounded-xl transition-colors ${canSkip
                        ? 'hover:bg-gray-700 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                        }`}
                    >
                      <div className="w-20 h-14 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={relatedVideo.thumbnail_url}
                          alt={relatedVideo.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white line-clamp-2 mb-1">
                          {relatedVideo.title}
                        </h4>
                        <p className="text-xs text-gray-500">{relatedVideo.channel?.name}</p>
                      </div>
                      {!canSkip && <Lock className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No related videos available
                  </div>
                )}
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
