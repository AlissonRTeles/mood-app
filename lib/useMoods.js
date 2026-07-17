import { useCallback, useState } from 'react';
import { supabase } from './supabase';

// Hook central de persistência: insert, delete, listagem e agregações.
export function useMoods(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('moods')
      .select('id, emotion, emoji, note, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!error) setItems(data ?? []);
    setLoading(false);
    return { error };
  }, []);

  const add = useCallback(async ({ emotion, emoji, note }) => {
    const { data, error } = await supabase
      .from('moods')
      .insert({ user_id: userId, emotion, emoji, note: note || null })
      .select()
      .single();
    if (!error && data) setItems((prev) => [data, ...prev]);
    return { data, error };
  }, [userId]);

  const remove = useCallback(async (id) => {
    const { error } = await supabase.from('moods').delete().eq('id', id);
    if (!error) setItems((prev) => prev.filter((i) => i.id !== id));
    return { error };
  }, []);

  // registros dos últimos 7 dias
  const weekCount = items.filter((i) => {
    const d = new Date(i.created_at);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  // contagem por emoção
  const counts = items.reduce((acc, i) => {
    acc[i.emotion] = (acc[i.emotion] || 0) + 1;
    return acc;
  }, {});

  return { items, loading, load, add, remove, weekCount, counts, total: items.length };
}
