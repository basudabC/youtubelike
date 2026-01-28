import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getChannelVideos } from '@/lib/youtube';

export interface VideoImportProgress {
    total: number;
    imported: number;
    failed: number;
    currentVideo: string | null;
}

export function useVideoImport() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<VideoImportProgress>({
        total: 0,
        imported: 0,
        failed: 0,
        currentVideo: null,
    });

    const importVideosFromChannel = useCallback(async (
        channelId: string,
        youtubeChannelId: string,
        maxResults: number = 50
    ) => {
        setLoading(true);
        setError(null);
        setProgress({ total: 0, imported: 0, failed: 0, currentVideo: null });

        try {
            console.log('[VideoImport] Fetching videos from YouTube channel:', youtubeChannelId);

            // Fetch videos from YouTube API
            const youtubeVideos = await getChannelVideos(youtubeChannelId, maxResults);

            if (youtubeVideos.length === 0) {
                setError('No videos found in this channel');
                setLoading(false);
                return { success: false, imported: 0, failed: 0 };
            }

            console.log('[VideoImport] Found', youtubeVideos.length, 'videos');
            setProgress(prev => ({ ...prev, total: youtubeVideos.length }));

            let imported = 0;
            let failed = 0;

            // Import videos one by one
            for (const video of youtubeVideos) {
                setProgress(prev => ({ ...prev, currentVideo: video.title }));

                try {
                    // Check if video already exists
                    const { data: existing } = await supabase
                        .from('videos')
                        .select('id')
                        .eq('youtube_video_id', video.id)
                        .single();

                    if (existing) {
                        console.log('[VideoImport] Video already exists:', video.title);
                        imported++;
                        setProgress(prev => ({ ...prev, imported: prev.imported + 1 }));
                        continue;
                    }

                    // Insert video into database
                    const { error: insertError } = await supabase
                        .from('videos')
                        .insert({
                            youtube_video_id: video.id,
                            title: video.title,
                            description: video.description,
                            thumbnail_url: video.thumbnailUrl,
                            duration: video.duration,
                            channel_id: channelId,
                            status: 'pending', // Videos need approval
                            published_at: video.publishedAt,
                            view_count: video.viewCount,
                            like_count: video.likeCount,
                            tags: video.tags,
                        } as any);

                    if (insertError) {
                        console.error('[VideoImport] Failed to import video:', video.title, insertError);
                        failed++;
                        setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
                    } else {
                        console.log('[VideoImport] Successfully imported:', video.title);
                        imported++;
                        setProgress(prev => ({ ...prev, imported: prev.imported + 1 }));
                    }
                } catch (err) {
                    console.error('[VideoImport] Error importing video:', err);
                    failed++;
                    setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
                }

                // Small delay to avoid overwhelming the database
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log('[VideoImport] Import complete. Imported:', imported, 'Failed:', failed);
            setProgress(prev => ({ ...prev, currentVideo: null }));

            return { success: true, imported, failed };
        } catch (err: any) {
            console.error('[VideoImport] Error:', err);
            setError(err.message || 'Failed to import videos');
            return { success: false, imported: 0, failed: 0 };
        } finally {
            setLoading(false);
        }
    }, []);

    const resetProgress = useCallback(() => {
        setProgress({ total: 0, imported: 0, failed: 0, currentVideo: null });
        setError(null);
    }, []);

    return {
        loading,
        error,
        progress,
        importVideosFromChannel,
        resetProgress,
    };
}
