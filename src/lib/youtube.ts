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
 * Fetch channel details by channel ID or username
 */
export async function getChannelDetails(channelIdOrUsername: string): Promise<YouTubeChannel | null> {
    try {
        // First try as channel ID
        let url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings&id=${channelIdOrUsername}&key=${YOUTUBE_API_KEY}`;

        let response = await fetch(url);
        let data = await response.json();

        // If not found, try as username
        if (!data.items || data.items.length === 0) {
            url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings&forUsername=${channelIdOrUsername}&key=${YOUTUBE_API_KEY}`;
            response = await fetch(url);
            data = await response.json();
        }

        // If still not found, try as custom URL
        if (!data.items || data.items.length === 0) {
            url = `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${channelIdOrUsername}&key=${YOUTUBE_API_KEY}`;
            response = await fetch(url);
            data = await response.json();

            if (data.items && data.items.length > 0) {
                const channelId = data.items[0].snippet.channelId;
                return getChannelDetails(channelId);
            }
        }

        if (!data.items || data.items.length === 0) {
            throw new Error('Channel not found');
        }

        const channel = data.items[0];
        const snippet = channel.snippet;
        const statistics = channel.statistics;
        const branding = channel.brandingSettings;

        return {
            id: channel.id,
            title: snippet.title,
            description: snippet.description,
            thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
            bannerUrl: branding?.image?.bannerExternalUrl,
            subscriberCount: parseInt(statistics.subscriberCount || '0', 10),
            videoCount: parseInt(statistics.videoCount || '0', 10),
        };
    } catch (error) {
        console.error('Error fetching channel details:', error);
        return null;
    }
}

/**
 * Fetch videos from a channel
 */
export async function getChannelVideos(
    channelId: string,
    maxResults: number = 50
): Promise<YouTubeVideo[]> {
    try {
        // First, get video IDs from channel
        const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (!searchData.items || searchData.items.length === 0) {
            return [];
        }

        // Extract video IDs
        const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

        // Fetch detailed video information
        const videosUrl = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        const videosResponse = await fetch(videosUrl);
        const videosData = await videosResponse.json();

        if (!videosData.items) {
            return [];
        }

        return videosData.items.map((video: any) => ({
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
    } catch (error) {
        console.error('Error fetching channel videos:', error);
        return [];
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
