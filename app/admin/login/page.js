'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/admin');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Singer" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">HR Tablet Tracker</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="spinner"></span> Logging in...</>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
