import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useAdminChannels() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('channels').select('*').order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message || 'Failed to fetch channels');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const approveChannel = useCallback(async (channelId: string) => {
    setLoading(true);
    setError(null);

    try {
      const user = await supabase.auth.getUser();
      const { error } = await supabase
        .from('channels')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.data.user?.id,
        } as unknown as never)
        .eq('id', channelId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to approve channel');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectChannel = useCallback(async (channelId: string, reason: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('channels')
        .update({
          status: 'rejected',
          rejection_reason: reason,
        } as unknown as never)
        .eq('id', channelId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to reject channel');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const addChannel = useCallback(async (youtubeChannelId: string, channelData?: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('channels')
        .insert({
          youtube_channel_id: youtubeChannelId,
          name: channelData?.title || youtubeChannelId,
          description: channelData?.description || '',
          thumbnail_url: channelData?.thumbnailUrl || '',
          banner_image_url: channelData?.bannerUrl || '',
          subscriber_count: channelData?.subscriberCount || 0,
          video_count: channelData?.videoCount || 0,
          status: 'approved', // Auto-approve for now
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to add channel');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchChannels,
    approveChannel,
    rejectChannel,
    addChannel,
  };
}

export function useAdminVideos() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('videos')
        .select(`*, channel:channels(*)`)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message || 'Failed to fetch videos');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const approveVideo = useCallback(async (videoId: string) => {
    setLoading(true);
    setError(null);

    try {
      const user = await supabase.auth.getUser();
      const { error } = await supabase
        .from('videos')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.data.user?.id,
        } as unknown as never)
        .eq('id', videoId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to approve video');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectVideo = useCallback(async (videoId: string, reason: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('videos')
        .update({
          status: 'rejected',
          rejection_reason: reason,
        } as unknown as never)
        .eq('id', videoId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to reject video');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchVideos,
    approveVideo,
    rejectVideo,
  };
}

export function useAdminUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserStatus = useCallback(async (userId: string, isActive: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: isActive } as unknown as never)
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetUserPassword = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const userData = await supabase.from('users').select('email').eq('id', userId).single();
      const { error } = await supabase.auth.resetPasswordForEmail(
        (userData.data as any)?.email || '',
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchUsers,
    updateUserStatus,
    resetUserPassword,
  };
}

export function useAdminTopicRequests() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopicRequests = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('topic_requests')
        .select(`*, user:users(*)`)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message || 'Failed to fetch topic requests');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const reviewTopicRequest = useCallback(async (requestId: string, status: 'approved' | 'rejected', reason?: string) => {
    setLoading(true);
    setError(null);

    try {
      const user = await supabase.auth.getUser();
      const { error } = await supabase
        .from('topic_requests')
        .update({
          status,
          rejection_reason: reason,
          reviewed_by: user.data.user?.id,
          reviewed_at: new Date().toISOString(),
        } as unknown as never)
        .eq('id', requestId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to review topic request');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchTopicRequests,
    reviewTopicRequest,
  };
}

export function useAdminNotices() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notices');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createNotice = useCallback(async (notice: any) => {
    setLoading(true);
    setError(null);

    try {
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('notices')
        .insert({
          ...notice,
          created_by: user.data.user?.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create notice');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNotice = useCallback(async (noticeId: string, updates: any) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('notices')
        .update(updates as unknown as never)
        .eq('id', noticeId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update notice');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNotice = useCallback(async (noticeId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', noticeId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete notice');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchNotices,
    createNotice,
    updateNotice,
    deleteNotice,
  };
}
