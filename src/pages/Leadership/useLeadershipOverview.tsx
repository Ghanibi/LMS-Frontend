import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

const API = 'http://localhost:8080/api';
export function useLeadershipOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await axios.get(`${API}/leadership/overview`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setData(response.data.data || null);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Ringkasan sekolah gagal dimuat.');
      setData(null);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}

export function LeadershipState({ loading, error, children }: { loading: boolean; error: string; children: ReactNode }) {
  if (loading) return <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">Memuat ringkasan sekolah...</div>;
  if (error) return <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{error}</div>;
  return <>{children}</>;
}
