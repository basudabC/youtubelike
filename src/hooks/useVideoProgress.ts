import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { validateWatchTime, calculateProgress } from '@/lib/utils';

interface UseVideoProgressOptions {
  videoId: string;
  userId: string;
  duration: number;
  minWatchTime?: number;
}

interface UseVideoProgressReturn {
  currentTime: number;
  progress: number;
  isCompleted: boolean;
  canSkip: boolean;
  isLoading: boolean;
  updateProgress: (time: number) => void;
  markCompleted: () => void;
  saveProgress: () => Promise<void>;
}

export function useVideoProgress({
  videoId,
  userId,
  duration,
  minWatchTime = 180,
}: UseVideoProgressOptions): UseVideoProgressReturn {
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [watchProgressId, setWatchProgressId] = useState<string | null>(null);

  const lastSaveTime = useRef<number>(0);
  const hasUnsavedChanges = useRef<boolean>(false);

  // Load existing progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!userId || !videoId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('watch_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('video_id', videoId)
          .single();

        if (data && !error) {
          const progressData = data as any;
          setCurrentTime(progressData.current_time);
          setProgress(calculateProgress(progressData.current_time, duration));
          setIsCompleted(progressData.completed);
          setWatchProgressId(progressData.id);
          setCanSkip(validateWatchTime(progressData.current_time, duration, minWatchTime));
        } else {
          // Initialize new progress record
          const { data: newProgress, error: insertError } = await supabase
            .from('watch_progress')
            .insert({
              user_id: userId,
              video_id: videoId,
              current_time: 0,
              duration: duration,
            } as unknown as never)
            .select()
            .single();

          if (newProgress && !insertError) {
            setWatchProgressId((newProgress as any).id);
          }
        }
      } catch (error) {
        console.error('Error loading video progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [videoId, userId, duration, minWatchTime]);

  // Auto-save progress every 30 seconds or when user pauses
  useEffect(() => {
    const saveInterval = setInterval(async () => {
      if (hasUnsavedChanges.current && Date.now() - lastSaveTime.current > 30000) {
        await saveProgress();
      }
    }, 10000);

    return () => clearInterval(saveInterval);
  }, []);

  // Save progress when component unmounts
  useEffect(() => {
    return () => {
      if (hasUnsavedChanges.current) {
        saveProgress();
      }
    };
  }, []);

  const updateProgress = useCallback((time: number) => {
    const clampedTime = Math.min(time, duration);
    const newProgress = calculateProgress(clampedTime, duration);
    const canNowSkip = validateWatchTime(clampedTime, duration, minWatchTime);

    setCurrentTime(clampedTime);
    setProgress(newProgress);
    setCanSkip(canNowSkip);
    hasUnsavedChanges.current = true;
  }, [duration, minWatchTime]);

  const markCompleted = useCallback(async () => {
    setIsCompleted(true);
    hasUnsavedChanges.current = true;
    await saveProgress();
  }, []);

  const saveProgress = useCallback(async () => {
    if (!watchProgressId || !userId) return;

    try {
      const { error } = await supabase
        .from('watch_progress')
        .update({
          current_time: Math.floor(currentTime),
          percentage_watched: progress,
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          last_watched_at: new Date().toISOString(),
        } as unknown as never)
        .eq('id', watchProgressId);

      if (error) throw error;

      hasUnsavedChanges.current = false;
      lastSaveTime.current = Date.now();
    } catch (error) {
      console.error('Error saving video progress:', error);
    }
  }, [watchProgressId, userId, currentTime, progress, isCompleted]);

  return {
    currentTime,
    progress,
    isCompleted,
    canSkip,
    isLoading,
    updateProgress,
    markCompleted,
    saveProgress,
  };
}
