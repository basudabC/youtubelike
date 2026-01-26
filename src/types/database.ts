export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          bio: string | null;
          profile_image_url: string | null;
          learning_interests: string[] | null;
          role: 'user' | 'admin';
          is_active: boolean;
          total_watch_time: number;
          videos_completed: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          bio?: string | null;
          profile_image_url?: string | null;
          learning_interests?: string[] | null;
          role?: 'user' | 'admin';
          is_active?: boolean;
          total_watch_time?: number;
          videos_completed?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          bio?: string | null;
          profile_image_url?: string | null;
          learning_interests?: string[] | null;
          role?: 'user' | 'admin';
          is_active?: boolean;
          total_watch_time?: number;
          videos_completed?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      channels: {
        Row: {
          id: string;
          youtube_channel_id: string;
          name: string;
          description: string | null;
          thumbnail_url: string | null;
          banner_image_url: string | null;
          subscriber_count: number;
          video_count: number;
          status: 'pending' | 'approved' | 'rejected';
          rejection_reason: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          youtube_channel_id: string;
          name: string;
          description?: string | null;
          thumbnail_url?: string | null;
          banner_image_url?: string | null;
          subscriber_count?: number;
          video_count?: number;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          youtube_channel_id?: string;
          name?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          banner_image_url?: string | null;
          subscriber_count?: number;
          video_count?: number;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      topics: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          slug: string;
          color: string;
          icon: string | null;
          parent_topic_id: string | null;
          display_order: number;
          is_active: boolean;
          video_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          slug: string;
          color?: string;
          icon?: string | null;
          parent_topic_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          video_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          slug?: string;
          color?: string;
          icon?: string | null;
          parent_topic_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          video_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          youtube_video_id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          thumbnail_quality: string;
          duration: number;
          channel_id: string;
          status: 'pending' | 'approved' | 'rejected';
          rejection_reason: string | null;
          approved_at: string | null;
          approved_by: string | null;
          published_at: string | null;
          view_count: number;
          like_count: number;
          language: string;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          youtube_video_id: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          thumbnail_quality?: string;
          duration: number;
          channel_id: string;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          published_at?: string | null;
          view_count?: number;
          like_count?: number;
          language?: string;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          youtube_video_id?: string;
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          thumbnail_quality?: string;
          duration?: number;
          channel_id?: string;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          published_at?: string | null;
          view_count?: number;
          like_count?: number;
          language?: string;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      video_topics: {
        Row: {
          id: string;
          video_id: string;
          topic_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          topic_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string;
          topic_id?: string;
          created_at?: string;
        };
      };
      watch_progress: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          current_time: number;
          duration: number;
          percentage_watched: number;
          completed: boolean;
          completed_at: string | null;
          last_watched_at: string;
          watch_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id: string;
          current_time?: number;
          duration: number;
          percentage_watched?: number;
          completed?: boolean;
          completed_at?: string | null;
          last_watched_at?: string;
          watch_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string;
          current_time?: number;
          duration?: number;
          percentage_watched?: number;
          completed?: boolean;
          completed_at?: string | null;
          last_watched_at?: string;
          watch_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      watch_later: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string;
          added_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          parent_comment_id: string | null;
          content: string;
          is_active: boolean;
          like_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id: string;
          parent_comment_id?: string | null;
          content: string;
          is_active?: boolean;
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string;
          parent_comment_id?: string | null;
          content?: string;
          is_active?: boolean;
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      topic_requests: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: 'pending' | 'approved' | 'rejected';
          rejection_reason: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notices: {
        Row: {
          id: string;
          title: string;
          content: string;
          type: 'info' | 'update' | 'maintenance' | 'warning';
          is_active: boolean;
          is_dismissible: boolean;
          published_at: string;
          expires_at: string | null;
          priority: 'low' | 'normal' | 'high' | 'urgent';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          type?: 'info' | 'update' | 'maintenance' | 'warning';
          is_active?: boolean;
          is_dismissible?: boolean;
          published_at?: string;
          expires_at?: string | null;
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          type?: 'info' | 'update' | 'maintenance' | 'warning';
          is_active?: boolean;
          is_dismissible?: boolean;
          published_at?: string;
          expires_at?: string | null;
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token: string;
          ip_address: string | null;
          user_agent: string | null;
          last_activity: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token: string;
          ip_address?: string | null;
          user_agent?: string | null;
          last_activity?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_token?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          last_activity?: string;
          created_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          event_type: string;
          event_data: any | null;
          session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id: string;
          event_type: string;
          event_data?: any | null;
          session_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string;
          event_type?: string;
          event_data?: any | null;
          session_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      user_dashboard: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          bio: string | null;
          profile_image_url: string | null;
          total_watch_time: number;
          videos_completed: number;
          learning_interests: string[] | null;
          videos_in_progress: number;
          watch_later_count: number;
        };
      };
      admin_video_overview: {
        Row: {
          id: string;
          youtube_video_id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          duration: number;
          status: string;
          view_count: number;
          published_at: string | null;
          channel_name: string;
          youtube_channel_id: string;
          topics: string[];
          created_at: string;
          updated_at: string;
        };
      };
      user_activity_summary: {
        Row: {
          user_id: string;
          username: string | null;
          email: string;
          videos_started: number;
          videos_completed: number;
          total_seconds_watched: number;
          completed_duration: number;
          last_activity: string | null;
          sessions_count: number;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: {};
        Returns: boolean;
      };
      is_active_user: {
        Args: {};
        Returns: boolean;
      };
      current_user_id: {
        Args: {};
        Returns: string;
      };
    };
    Enums: {};
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type DatabaseUser = Tables<'users'>;
export type Channel = Tables<'channels'>;
export type Topic = Tables<'topics'>;
export type Video = Tables<'videos'>;
export type VideoTopic = Tables<'video_topics'>;
export type WatchProgress = Tables<'watch_progress'>;
export type WatchLater = Tables<'watch_later'>;
export type Comment = Tables<'comments'>;
export type TopicRequest = Tables<'topic_requests'>;
export type Notice = Tables<'notices'>;

export interface VideoWithDetails extends Video {
  channel: Channel;
  topics: Topic[];
  watch_progress?: WatchProgress | null;
}

export interface TopicWithVideos extends Topic {
  videos?: VideoWithDetails[];
  children?: Topic[];
}

export interface CommentWithUser extends Comment {
  user: Pick<DatabaseUser, 'id' | 'username' | 'profile_image_url'>;
}
