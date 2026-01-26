import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { TopicWithVideos } from '@/types/database';

export function useTopics() {
  const [topics, setTopics] = useState<TopicWithVideos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch parent topics
        const { data: parentTopics, error: parentError } = await supabase
          .from('topics')
          .select('*')
          .is('parent_topic_id', null)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (parentError) throw parentError;

        // Fetch subtopics
        const { data: subtopics, error: subError } = await supabase
          .from('topics')
          .select('*')
          .not('parent_topic_id', 'is', null)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (subError) throw subError;

        // Organize topics with their children
        const organizedTopics = (parentTopics || []).map((parent: any) => ({
          ...parent,
          children: (subtopics || []).filter((sub: any) => sub.parent_topic_id === parent.id),
        }));

        setTopics(organizedTopics as any[]);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch topics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return { topics, loading, error };
}

export function useTopic(topicId: string) {
  const [topic, setTopic] = useState<TopicWithVideos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopic = async () => {
      if (!topicId) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('topics')
          .select('*')
          .eq('id', topicId)
          .single();

        if (error) throw error;
        setTopic(data as any);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch topic');
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId]);

  return { topic, loading, error };
}

export function useTopicBySlug(slug: string) {
  const [topic, setTopic] = useState<TopicWithVideos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopic = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('topics')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setTopic(data as any);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch topic');
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [slug]);

  return { topic, loading, error };
}
