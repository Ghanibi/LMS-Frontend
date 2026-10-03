import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      const role = String(user.Role || '').toUpperCase();
      const roleRoutes: Record<string, string> = {
        ADMIN: '/admin/dashboard',
        TEACHER: '/teacher/dashboard',
        GURU: '/teacher/dashboard',
        STUDENT: '/student/dashboard',
        SISWA: '/student/dashboard',
        CURRICULUM: '/curriculum/dashboard',
        KURIKULUM: '/curriculum/dashboard',
        PRINCIPAL: '/principal/dashboard',
        KEPSEK: '/principal/dashboard',
        KEPALA_SEKOLAH: '/principal/dashboard',
      };
      const destination = roleRoutes[role];

      if (!destination) {
        setError(`Role akun (${user.Role || 'tidak diketahui'}) belum didukung.`);
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Terjadi kesalahan pada server');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-800">Login LMS SMK</h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          Satu akun untuk siswa, guru, kurikulum, dan kepala sekolah
        </p>
        
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:outline-none text-xs"
              placeholder="admin@school.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-2.5 pr-10 focus:border-indigo-500 focus:outline-none text-xs"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 transition disabled:bg-indigo-300 text-sm shadow-sm"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
