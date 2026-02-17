'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [tablets, setTablets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchTablets = async () => {
    try {
      const res = await fetch('/api/tablets', { cache: 'no-store' });
      const data = await res.json();
      if (data.tablets) {
        setTablets(data.tablets);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTablets();
    const interval = setInterval(fetchTablets, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const getTimeSince = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const taken = new Date(dateStr);
    const diffMs = now - taken;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const remainMins = diffMins % 60;

    if (diffHrs > 0) return `${diffHrs}h ${remainMins}m`;
    return `${diffMins}m`;
  };

  const availableCount = tablets.filter(t => t.isAvailable).length;
  const takenCount = tablets.filter(t => !t.isAvailable).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner border-blue-600 border-t-transparent w-10 h-10 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HR Tablet Tracker</h1>
                <p className="text-xs text-gray-500">Equipment Management System</p>
              </div>
            </div>
            <a href="/admin/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Admin
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-600">{tablets.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">{availableCount}</p>
            <p className="text-sm text-gray-500 mt-1">Available</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-red-600">{takenCount}</p>
            <p className="text-sm text-gray-500 mt-1">In Use</p>
          </div>
        </div>

        {/* Tablet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tablets.map((tablet) => (
            <div
              key={tablet.id}
              className={`card ${tablet.isAvailable ? 'tablet-card-available' : 'tablet-card-taken'} animate-fadeIn`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    tablet.isAvailable ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg className={`w-6 h-6 ${tablet.isAvailable ? 'text-green-600' : 'text-red-600'}`} 
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{tablet.name}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Pen included
                    </p>
                  </div>
                </div>
                <span className={tablet.isAvailable ? 'badge-available' : 'badge-taken'}>
                  <span className={`w-2 h-2 rounded-full ${
                    tablet.isAvailable ? 'bg-green-500' : 'bg-red-500 pulse-dot'
                  }`}></span>
                  {tablet.isAvailable ? 'Free' : 'In Use'}
                </span>
              </div>

              {tablet.isAvailable ? (
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-green-700 font-medium text-sm">✓ Available for use</p>
                </div>
              ) : (
                <div className="bg-red-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-semibold text-red-700 text-sm">{tablet.takenBy?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-600 text-xs">
                      Since {getTimeSince(tablet.takenAt)} ago
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Last Updated */}
        <div className="text-center mt-8 text-xs text-gray-400">
          <p>Auto-refreshes every 15 seconds</p>
          {lastUpdated && (
            <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
      </main>
    </div>
  );
}
