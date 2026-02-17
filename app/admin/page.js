'use client';

import { useState, useEffect } from 'react';

export default function AdminOverview() {
  const [tablets, setTablets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tabletsRes, logsRes] = await Promise.all([
          fetch('/api/tablets', { cache: 'no-store' }),
          fetch('/api/logs?limit=10', { cache: 'no-store' }),
        ]);
        const tabletsData = await tabletsRes.json();
        const logsData = await logsRes.json();
        setTablets(tabletsData.tablets || []);
        setLogs(logsData.logs || []);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const availableCount = tablets.filter(t => t.isAvailable).length;
  const takenCount = tablets.filter(t => !t.isAvailable).length;

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner border-blue-600 border-t-transparent w-10 h-10"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Real-time equipment status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{tablets.length}</p>
              <p className="text-sm text-gray-500">Total Tablets</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{availableCount}</p>
              <p className="text-sm text-gray-500">Available</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">{takenCount}</p>
              <p className="text-sm text-gray-500">In Use</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Current Tablet Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Tablet</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">User</th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Since</th>
              </tr>
            </thead>
            <tbody>
              {tablets.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-2 font-medium text-gray-900">{t.name}</td>
                  <td className="py-3 px-2">
                    <span className={t.isAvailable ? 'badge-available' : 'badge-taken'}>
                      <span className={`w-1.5 h-1.5 rounded-full ${t.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {t.isAvailable ? 'Available' : 'In Use'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-600">{t.takenBy?.name || '—'}</td>
                  <td className="py-3 px-2 text-gray-400 text-xs">
                    {t.takenAt ? formatTime(t.takenAt) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Recent Activity</h3>
          <a href="/admin/logs" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All →
          </a>
        </div>
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No activity yet</p>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="flex items-center gap-3 py-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  log.action === 'TAKE' ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                  {log.action === 'TAKE' ? (
                    <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{log.member_name}</span>
                    {' '}{log.action === 'TAKE' ? 'took' : 'returned'}{' '}
                    <span className="font-medium">{log.tablet_name}</span>
                  </p>
                  <p className="text-xs text-gray-400">{formatTime(log.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
