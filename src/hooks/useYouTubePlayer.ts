import { useState, useCallback, useRef, useEffect } from 'react';

interface UseYouTubePlayerOptions {
  videoId: string;
  startTime?: number;
  onTimeUpdate?: (time: number) => void;
  onStateChange?: (state: YT.PlayerState) => void;
  onError?: (error: any) => void;
}

interface UseYouTubePlayerReturn {
  playerRef: React.RefObject<HTMLDivElement | null>;
  player: YT.Player | null;
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}



export function useYouTubePlayer({
  videoId,
  startTime = 0,
  onTimeUpdate,
  onStateChange,
  onError,
}: UseYouTubePlayerOptions): UseYouTubePlayerReturn {
  const playerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const updateIntervalRef = useRef<number | null>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onStateChangeRef = useRef(onStateChange);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
    onStateChangeRef.current = onStateChange;
    onErrorRef.current = onError;
  }, [onTimeUpdate, onStateChange, onError]);

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
    if (!playerRef.current || !videoId) return;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) {
        setTimeout(initPlayer, 100);
        return;
      }

      const newPlayer = new window.YT.Player(playerRef.current!, {
        videoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          controls: 1,
          fs: 1,
          iv_load_policy: 3,
          start: Math.floor(startTime),
        } as any,
        events: {
          onReady: (event) => {
            setIsReady(true);
            setDuration(event.target.getDuration());

            // Start time update interval
            updateIntervalRef.current = setInterval(() => {
              const time = event.target.getCurrentTime();
              setCurrentTime(time);
              onTimeUpdateRef.current?.(time);
            }, 1000);
          },
          onStateChange: (event) => {
            const state = event.data;
            setIsPlaying(state === YT.PlayerState.PLAYING);
            onStateChangeRef.current?.(state);

            // Clear interval when paused or ended
            if (state !== YT.PlayerState.PLAYING && updateIntervalRef.current) {
              clearInterval(updateIntervalRef.current);
              updateIntervalRef.current = null;
            }

            // Restart interval when playing
            if (state === YT.PlayerState.PLAYING && !updateIntervalRef.current) {
              updateIntervalRef.current = setInterval(() => {
                const time = event.target.getCurrentTime();
                setCurrentTime(time);
                onTimeUpdateRef.current?.(time);
              }, 1000);
            }
          },
          onError: (event) => {
            onErrorRef.current?.(event.data);
          },
        },
      });

      setPlayer(newPlayer);
    };

    // Wait for API to be ready
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }

    return () => {
      if (updateIntervalRef.current) {
        window.clearInterval(updateIntervalRef.current);
      }
      if (player) {
        player.destroy();
      }
    };
  }, [videoId, startTime]);

  const play = useCallback(() => {
    if (player && isReady) {
      player.playVideo();
    }
  }, [player, isReady]);

  const pause = useCallback(() => {
    if (player && isReady) {
      player.pauseVideo();
    }
  }, [player, isReady]);

  const seekTo = useCallback((time: number) => {
    if (player && isReady) {
      player.seekTo(time, true);
    }
  }, [player, isReady]);

  const getCurrentTime = useCallback(() => {
    return player && isReady ? player.getCurrentTime() : 0;
  }, [player, isReady]);

  const getDuration = useCallback(() => {
    return player && isReady ? player.getDuration() : 0;
  }, [player, isReady]);

  return {
    playerRef,
    player,
    isReady,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    seekTo,
    getCurrentTime,
    getDuration,
  };
}
