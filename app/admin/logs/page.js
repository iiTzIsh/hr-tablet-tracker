'use client';

import { useState, useEffect } from 'react';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs?limit=200');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredLogs = filterAction === 'ALL'
    ? logs
    : logs.filter(l => l.action === filterAction);

  // Group logs by date
  const groupedLogs = filteredLogs.reduce((groups, log) => {
    const date = formatDate(log.created_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner border-blue-600 border-t-transparent w-10 h-10"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
          <p className="text-gray-500 text-sm mt-1">{filteredLogs.length} records</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {['ALL', 'TAKE', 'RETURN'].map(action => (
            <button
              key={action}
              onClick={() => setFilterAction(action)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterAction === action
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {action === 'ALL' ? 'All' : action === 'TAKE' ? 'Check Outs' : 'Returns'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {logs.filter(l => l.action === 'TAKE').length}
              </p>
              <p className="text-xs text-gray-500">Total Check Outs</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {logs.filter(l => l.action === 'RETURN').length}
              </p>
              <p className="text-xs text-gray-500">Total Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Log List */}
      {filteredLogs.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No activity records yet</p>
          <p className="text-gray-400 text-sm mt-1">Activity will appear here when members use the system</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLogs).map(([date, dateLogs]) => (
            <div key={date}>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                {date}
              </h4>
              <div className="card p-0 overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {dateLogs.map(log => (
                    <div key={log.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 text-sm">{log.member_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            log.action === 'TAKE'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {log.action === 'TAKE' ? 'Took' : 'Returned'}
                          </span>
                          <span className="font-medium text-gray-900 text-sm">{log.tablet_name}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(log.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
