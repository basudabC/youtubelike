import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { WatchLater, CommentWithUser, TopicRequest, WatchProgress } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export function useWatchLater() {
  const { user } = useAuth();
  const [watchLaterVideos, setWatchLaterVideos] = useState<WatchLater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setWatchLaterVideos([]);
      setLoading(false);
      return;
    }

    const fetchWatchLater = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('watch_later')
          .select(`*, video:videos(*, channel:channels(*))`)
          .eq('user_id', user.id)
          .order('added_at', { ascending: false });

        if (error) throw error;
        setWatchLaterVideos(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch watch later videos');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchLater();
  }, [user]);

  const addToWatchLater = useCallback(async (videoId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('watch_later')
        .insert({
          user_id: user.id,
          video_id: videoId,
        } as any);

      if (error) throw error;

      // Refetch watch later videos
      const { data } = await supabase
        .from('watch_later')
        .select(`*, video:videos(*, channel:channels(*))`)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      setWatchLaterVideos(data || []);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to add to watch later' };
    }
  }, [user]);

  const removeFromWatchLater = useCallback(async (videoId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('watch_later')
        .delete()
        .eq('user_id', user.id)
        .eq('video_id', videoId);

      if (error) throw error;

      setWatchLaterVideos(prev => prev.filter(item => item.video_id !== videoId));
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to remove from watch later' };
    }
  }, [user]);

  const isInWatchLater = useCallback((videoId: string) => {
    return watchLaterVideos.some(item => item.video_id === videoId);
  }, [watchLaterVideos]);

  return {
    watchLaterVideos,
    loading,
    error,
    addToWatchLater,
    removeFromWatchLater,
    isInWatchLater,
  };
}

export function useComments(videoId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      if (!videoId) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`*, user:users(id, username, profile_image_url)`)
          .eq('video_id', videoId)
          .eq('is_active', true)
          .is('parent_comment_id', null)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setComments(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [videoId]);

  const addComment = useCallback(async (content: string, parentCommentId?: string) => {
    if (!user || !videoId) return { error: 'Not authenticated or no video' };

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          video_id: videoId,
          content,
          parent_comment_id: parentCommentId,
        } as any)
        .select(`*, user:users(id, username, profile_image_url)`)
        .single();

      if (error) throw error;

      setComments(prev => [data, ...prev]);
      return { error: null, comment: data };
    } catch (err: any) {
      return { error: err.message || 'Failed to add comment' };
    }
  }, [user, videoId]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_active: false } as unknown as never)
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to delete comment' };
    }
  }, [user]);

  return {
    comments,
    loading,
    error,
    addComment,
    deleteComment,
  };
}

export function useTopicRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<TopicRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitRequest = useCallback(async (title: string, description: string) => {
    if (!user) return { error: 'Not authenticated' };

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('topic_requests')
        .insert({
          user_id: user.id,
          title,
          description,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setRequests(prev => [data, ...prev]);
      return { error: null, request: data };
    } catch (err: any) {
      return { error: err.message || 'Failed to submit request' };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUserRequests = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('topic_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch requests');
    }
  }, [user]);

  useEffect(() => {
    fetchUserRequests();
  }, [fetchUserRequests]);

  return {
    requests,
    loading,
    error,
    submitRequest,
    refetch: fetchUserRequests,
  };
}

export function useDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch from user_dashboard view first
        let dashboard = null;
        try {
          const { data, error: viewError } = await supabase
            .from('user_dashboard')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!viewError) {
            dashboard = data;
          }
        } catch (viewErr) {
          console.warn('user_dashboard view not available, using fallback');
        }

        // Fallback: Calculate dashboard data manually
        if (!dashboard) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          const { count: inProgressCount } = await supabase
            .from('watch_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('completed', false);

          const { count: watchLaterCount } = await supabase
            .from('watch_later')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          dashboard = {
            id: user.id,
            email: (userData as any)?.email || user.email,
            username: (userData as any)?.username || user.username,
            bio: (userData as any)?.bio,
            profile_image_url: (userData as any)?.profile_image_url,
            total_watch_time: (userData as any)?.total_watch_time || 0,
            videos_completed: (userData as any)?.videos_completed || 0,
            learning_interests: (userData as any)?.learning_interests || [],
            videos_in_progress: inProgressCount || 0,
            watch_later_count: watchLaterCount || 0,
          };
        }

        setDashboardData(dashboard);

        // Fetch recent watch progress
        const { data: recent, error: recentError } = await supabase
          .from('watch_progress')
          .select(`*, video:videos(*, channel:channels(*))`)
          .eq('user_id', user.id)
          .order('last_watched_at', { ascending: false })
          .limit(5);

        if (recentError) {
          console.error('Error fetching recent videos:', recentError);
          setRecentVideos([]);
        } else {
          setRecentVideos(recent || []);
        }
      } catch (err: any) {
        console.error('Dashboard error:', err);
        setError(err.message || 'Failed to fetch dashboard data');
        // Set default dashboard data even on error
        setDashboardData({
          id: user.id,
          email: user.email,
          username: user.username,
          total_watch_time: 0,
          videos_completed: 0,
          videos_in_progress: 0,
          watch_later_count: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return {
    dashboardData,
    recentVideos,
    loading,
    error,
  };
}

export function useWatchHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<WatchProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('watch_progress')
          .select(`*, video:videos(*, channel:channels(*))`)
          .eq('user_id', user.id)
          .order('last_watched_at', { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch watch history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return { history, loading, error, refetch: () => { } };
}

export function useNotices() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('notices')
          .select('*')
          .eq('is_active', true)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
          .order('priority', { ascending: false })
          .order('published_at', { ascending: false });

        if (error) throw error;
        setNotices(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch notices');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  return { notices, loading, error };
}
