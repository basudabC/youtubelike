declare global {
  namespace YT {
    interface Player {
      playVideo(): void;
      pauseVideo(): void;
      seekTo(seconds: number, allowSeekAhead: boolean): void;
      getDuration(): number;
      getCurrentTime(): number;
      getPlayerState(): number;
      destroy(): void;
      setVolume(volume: number): void;
      mute(): void;
      unMute(): void;
    }

    interface PlayerOptions {
      videoId?: string;
      playerVars?: {
        autoplay?: number;
        modestbranding?: number;
        rel?: number;
        showinfo?: number;
        controls?: number;
        fs?: number;
        iv_load_policy?: number;
      };
      events?: {
        onReady?: (event: { target: Player }) => void;
        onStateChange?: (event: { data: number; target: Player }) => void;
        onError?: (event: { data: number }) => void;
      };
      height?: string | number;
      width?: string | number;
    }

    class Player {
      constructor(elementId: string | HTMLElement, options: PlayerOptions);
    }
  }

  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export {};
