import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

export const STUDENT_API = '/api';
export const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export function useStudentLearning() {
  const [learning, setLearning] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await axios.get(`${STUDENT_API}/student/me/learning`, { headers: authHeaders() });
      setLearning(response.data.data || null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Data belajar gagal dimuat.'); setLearning(null);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { learning, loading, error, refresh };
}

export function StudentPageState({ loading, error, children }: { loading: boolean; error?: string; children?: ReactNode }) {
  if (loading) return <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">Memuat ruang belajarmu...</div>;
  if (error) return <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{error}</div>;
  return <>{children}</>;
}
