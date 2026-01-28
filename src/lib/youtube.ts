// YouTube Data API v3 Integration
// Provides functions to fetch channel and video data from YouTube

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeChannel {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    bannerUrl?: string;
    subscriberCount: number;
    videoCount: number;
}

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    duration: number; // in seconds
    publishedAt: string;
    viewCount: number;
    likeCount: number;
    tags: string[];
}

/**
 * Extract channel ID from various YouTube URL formats
 */
export function extractChannelId(url: string): string | null {
    // Handle direct channel ID
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        // Assume it's a direct channel ID (starts with UC)
        if (url.startsWith('UC') && url.length === 24) {
            return url;
        }
        return null;
    }

    // Handle /channel/ URLs
    const channelMatch = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
    if (channelMatch) {
        return channelMatch[1];
    }

    // Handle /c/ or /@username URLs (need to resolve via API)
    const customMatch = url.match(/youtube\.com\/(c\/|@)([a-zA-Z0-9_-]+)/);
    if (customMatch) {
        return customMatch[2]; // Return username, will need API lookup
    }

    return null;
}

/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(url: string): string | null {
    // Handle direct video ID
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        if (url.length === 11) {
            return url;
        }
        return null;
    }

    // Handle youtube.com/watch?v=
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) {
        return watchMatch[1];
    }

    // Handle youtu.be/
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) {
        return shortMatch[1];
    }

    return null;
}

/**
 * Convert ISO 8601 duration to seconds
 * Example: PT1H2M10S -> 3730 seconds
 */
export function parseDuration(isoDuration: string): number {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, timeout: number = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - YouTube API took too long to respond');
        }
        throw error;
    }
}

/**
 * Fetch channel details by channel ID or username
 */
export async function getChannelDetails(channelIdOrUsername: string): Promise<YouTubeChannel | null> {
    console.log('[YouTube API] Fetching channel details for:', channelIdOrUsername);

    if (!YOUTUBE_API_KEY) {
        console.error('[YouTube API] API key is missing!');
        throw new Error('YouTube API key is not configured. Please add VITE_YOUTUBE_API_KEY to your .env file.');
    }

    try {
        // First try as channel ID
        let url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings&id=${channelIdOrUsername}&key=${YOUTUBE_API_KEY}`;
        console.log('[YouTube API] Trying as channel ID...');

        let response = await fetchWithTimeout(url);
        let data = await response.json();

        // Check for API errors
        if (data.error) {
            console.error('[YouTube API] Error response:', data.error);
            throw new Error(data.error.message || 'YouTube API error');
        }

        // If not found, try as username
        if (!data.items || data.items.length === 0) {
            console.log('[YouTube API] Not found as channel ID, trying as username...');
            url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings&forUsername=${channelIdOrUsername}&key=${YOUTUBE_API_KEY}`;
            response = await fetchWithTimeout(url);
            data = await response.json();

            if (data.error) {
                console.error('[YouTube API] Error response:', data.error);
                throw new Error(data.error.message || 'YouTube API error');
            }
        }

        // If still not found, try as custom URL (search)
        if (!data.items || data.items.length === 0) {
            console.log('[YouTube API] Not found as username, trying search...');
            url = `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(channelIdOrUsername)}&key=${YOUTUBE_API_KEY}`;
            response = await fetchWithTimeout(url);
            data = await response.json();

            if (data.error) {
                console.error('[YouTube API] Error response:', data.error);
                throw new Error(data.error.message || 'YouTube API error');
            }

            if (data.items && data.items.length > 0) {
                const channelId = data.items[0].snippet.channelId || data.items[0].id.channelId;
                console.log('[YouTube API] Found channel via search, fetching full details...');
                return getChannelDetails(channelId);
            }
        }

        if (!data.items || data.items.length === 0) {
            console.error('[YouTube API] Channel not found after all attempts');
            throw new Error('Channel not found. Please check the channel ID or URL and try again.');
        }

        const channel = data.items[0];
        const snippet = channel.snippet;
        const statistics = channel.statistics;
        const branding = channel.brandingSettings;

        const channelData = {
            id: channel.id,
            title: snippet.title,
            description: snippet.description,
            thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
            bannerUrl: branding?.image?.bannerExternalUrl,
            subscriberCount: parseInt(statistics.subscriberCount || '0', 10),
            videoCount: parseInt(statistics.videoCount || '0', 10),
        };

        console.log('[YouTube API] Successfully fetched channel:', channelData.title);
        return channelData;
    } catch (error: any) {
        console.error('[YouTube API] Error fetching channel details:', error);

        // Provide user-friendly error messages
        if (error.message.includes('timeout')) {
            throw new Error('Request timeout. Please check your internet connection and try again.');
        } else if (error.message.includes('API key')) {
            throw error; // Pass through API key errors
        } else if (error.message.includes('quota')) {
            throw new Error('YouTube API quota exceeded. Please try again later.');
        } else if (error.message.includes('not found')) {
            throw error; // Pass through not found errors
        } else {
            throw new Error(error.message || 'Failed to fetch channel details. Please try again.');
        }
    }
}

/**
 * Fetch videos from a channel
 */
export async function getChannelVideos(
    channelId: string,
    maxResults: number = 50
): Promise<YouTubeVideo[]> {
    console.log('[YouTube API] Fetching videos for channel:', channelId, 'maxResults:', maxResults);

    if (!YOUTUBE_API_KEY) {
        console.error('[YouTube API] API key is missing!');
        throw new Error('YouTube API key is not configured');
    }

    try {
        // First, get video IDs from channel
        const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
        console.log('[YouTube API] Searching for videos...');

        const searchResponse = await fetchWithTimeout(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.error) {
            console.error('[YouTube API] Search error:', searchData.error);
            throw new Error(searchData.error.message || 'YouTube API error');
        }

        if (!searchData.items || searchData.items.length === 0) {
            console.log('[YouTube API] No videos found for channel');
            return [];
        }

        console.log('[YouTube API] Found', searchData.items.length, 'videos');

        // Extract video IDs
        const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

        // Fetch detailed video information
        const videosUrl = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        console.log('[YouTube API] Fetching video details...');

        const videosResponse = await fetchWithTimeout(videosUrl);
        const videosData = await videosResponse.json();

        if (videosData.error) {
            console.error('[YouTube API] Videos error:', videosData.error);
            throw new Error(videosData.error.message || 'YouTube API error');
        }

        if (!videosData.items) {
            console.log('[YouTube API] No video details found');
            return [];
        }

        const videos = videosData.items.map((video: any) => ({
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url || '',
            duration: parseDuration(video.contentDetails.duration),
            publishedAt: video.snippet.publishedAt,
            viewCount: parseInt(video.statistics.viewCount || '0', 10),
            likeCount: parseInt(video.statistics.likeCount || '0', 10),
            tags: video.snippet.tags || [],
        }));

        console.log('[YouTube API] Successfully fetched', videos.length, 'video details');
        return videos;
    } catch (error: any) {
        console.error('[YouTube API] Error fetching channel videos:', error);

        if (error.message.includes('timeout')) {
            throw new Error('Request timeout while fetching videos. Please try again.');
        } else if (error.message.includes('quota')) {
            throw new Error('YouTube API quota exceeded. Please try again later.');
        } else {
            throw new Error(error.message || 'Failed to fetch videos from YouTube');
        }
    }
}

/**
 * Fetch single video details
 */
export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
    try {
        const url = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return null;
        }

        const video = data.items[0];
        return {
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url || '',
            duration: parseDuration(video.contentDetails.duration),
            publishedAt: video.snippet.publishedAt,
            viewCount: parseInt(video.statistics.viewCount || '0', 10),
            likeCount: parseInt(video.statistics.likeCount || '0', 10),
            tags: video.snippet.tags || [],
        };
    } catch (error) {
        console.error('Error fetching video details:', error);
        return null;
    }
}

/**
 * Search for channels by query
 */
export async function searchChannels(query: string, maxResults: number = 10): Promise<YouTubeChannel[]> {
    try {
        const url = `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return [];
        }

        // Fetch full details for each channel
        const channelIds = data.items.map((item: any) => item.snippet.channelId).join(',');
        const channelsUrl = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&id=${channelIds}&key=${YOUTUBE_API_KEY}`;
        const channelsResponse = await fetch(channelsUrl);
        const channelsData = await channelsResponse.json();

        if (!channelsData.items) {
            return [];
        }

        return channelsData.items.map((channel: any) => ({
            id: channel.id,
            title: channel.snippet.title,
            description: channel.snippet.description,
            thumbnailUrl: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url || '',
            subscriberCount: parseInt(channel.statistics.subscriberCount || '0', 10),
            videoCount: parseInt(channel.statistics.videoCount || '0', 10),
        }));
    } catch (error) {
        console.error('Error searching channels:', error);
        return [];
    }
}
