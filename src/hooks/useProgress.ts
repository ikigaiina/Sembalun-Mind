import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from './useAuth';

interface CourseProgress {
  course_id: string;
  progress_percentage: number;
  completed_at: string | null;
}

export const useProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching progress:', error);
      } else {
        setProgress(data || []);
      }
      setLoading(false);
    };

    fetchProgress();

    const subscription = supabase
      .channel('public:user_course_progress')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_course_progress', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Progress change received!', payload);
          fetchProgress();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { progress, loading };
};