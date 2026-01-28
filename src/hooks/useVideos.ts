import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { VideoWithDetails } from '@/types/database';

interface UseVideosOptions {
  topicId?: string;
  channelId?: string;
  status?: 'approved' | 'pending' | 'rejected' | 'all';
  limit?: number;
  offset?: number;
  searchQuery?: string;
}

interface UseVideosReturn {
  videos: VideoWithDetails[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  refetch: () => void;
  loadMore: () => void;
}

export function useVideos(options: UseVideosOptions = {}): UseVideosReturn {
  const {
    topicId,
    channelId,
    status = 'approved',
    limit = 20,
    offset = 0,
    searchQuery,
  } = options;

  const [videos, setVideos] = useState<VideoWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(offset);

  const fetchVideos = useCallback(async (isLoadMore = false) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('videos')
        .select(`
          *,
          channel:channels(*),
          topics:video_topics(topic:topics(*))
        `, { count: 'exact' })
        .order('published_at', { ascending: false });

      // Apply filters
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      if (topicId) {
        query = query.eq('video_topics.topic_id', topicId);
      }

      if (channelId) {
        query = query.eq('channel_id', channelId);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const startRange = isLoadMore ? videos.length : currentOffset;
      const endRange = isLoadMore ? videos.length + limit - 1 : currentOffset + limit - 1;

      const { data, count, error } = await query.range(startRange, endRange);

      if (error) throw error;

      const processedVideos = ((data || []) as any[]).map((video: any) => ({
        ...video,
        topics: (video.topics as any[])?.map((vt: any) => vt.topic).filter(Boolean) || [],
      })) as VideoWithDetails[];

      if (isLoadMore) {
        setVideos(prev => [...prev, ...processedVideos]);
      } else {
        setVideos(processedVideos);
      }

      setTotalCount(count || 0);
      setHasMore((count || 0) > (isLoadMore ? videos.length + limit : limit));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  }, [topicId, channelId, status, limit, currentOffset, searchQuery]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const refetch = useCallback(() => {
    setCurrentOffset(0);
    setVideos([]);
    fetchVideos();
  }, [fetchVideos]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchVideos(true);
    }
  }, [loading, hasMore, fetchVideos]);

  return {
    videos,
    loading,
    error,
    hasMore,
    totalCount,
    refetch,
    loadMore,
  };
}

export function useVideo(videoId: string) {
  const [video, setVideo] = useState<VideoWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('videos')
          .select(`
            *,
            channel:channels(*),
            topics:video_topics(topic:topics(*))
          `)
          .eq('id', videoId)
          .single();

        if (error) throw error;

        const processedVideo = {
          ...(data as any),
          topics: ((data as any)?.topics as any[])?.map((vt: any) => vt.topic).filter(Boolean) || [],
        } as VideoWithDetails;

        setVideo(processedVideo);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  return { video, loading, error };
}
