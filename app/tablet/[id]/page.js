'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
//new
export default function TabletPage() {
  const params = useParams();
  const tabletId = parseInt(params.id);

  const [tablet, setTablet] = useState(null);
  const [members, setMembers] = useState([]);
  const [savedMember, setSavedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Registration form state
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Check if device is registered
  useEffect(() => {
    const stored = localStorage.getItem('hr_tracker_member');
    if (stored) {
      try {
        setSavedMember(JSON.parse(stored));
      } catch {
        localStorage.removeItem('hr_tracker_member');
      }
    }
  }, []);

  // Fetch tablet status and members
  const fetchData = async () => {
    try {
      const [tabletsRes, membersRes] = await Promise.all([
        fetch('/api/tablets'),
        fetch('/api/members/active'),
      ]);
      const tabletsData = await tabletsRes.json();
      const membersData = await membersRes.json();

      const currentTablet = tabletsData.tablets?.find(t => t.id === tabletId);
      setTablet(currentTablet || null);
      setMembers(membersData.members || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tabletId]);

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    // Vibrate on mobile
    if (navigator.vibrate) navigator.vibrate(type === 'success' ? 100 : [100, 50, 100]);
    setTimeout(() => setToast(null), 3000);
  };

  // Verify PIN and register device
  const handleRegister = async (e) => {
    e.preventDefault();
    setPinError('');

    if (!selectedMemberId) {
      setPinError('Please select your name');
      return;
    }

    if (!pin || pin.length < 4) {
      setPinError('Enter your 4-digit PIN');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: parseInt(selectedMemberId), pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPinError(data.error || 'Verification failed');
        return;
      }

      // Save to localStorage
      localStorage.setItem('hr_tracker_member', JSON.stringify(data.member));
      setSavedMember(data.member);
      showToast(`Welcome, ${data.member.name}!`);
    } catch {
      setPinError('Connection error. Try again.');
    }
  };

  // Take tablet
  const handleTake = async () => {
    if (!savedMember) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tabletId,
          memberId: savedMember.id,
          action: 'TAKE',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to check out', 'error');
        return;
      }

      showToast(`${tablet.name} checked out!`);
      await fetchData();
    } catch {
      showToast('Connection error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Return tablet
  const handleReturn = async () => {
    setActionLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tabletId,
          action: 'RETURN',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to return', 'error');
        return;
      }

      showToast(`${tablet.name} returned!`);
      await fetchData();
    } catch {
      showToast('Connection error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Logout / switch user
  const handleLogout = () => {
    localStorage.removeItem('hr_tracker_member');
    setSavedMember(null);
    setPin('');
    setSelectedMemberId('');
  };

  const getTimeSince = (dateStr) => {
    if (!dateStr) return '';
    const diffMs = new Date() - new Date(dateStr);
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) return `${hrs}h ${remMins}m`;
    return `${mins}m`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="spinner border-blue-600 border-t-transparent w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Tablet not found
  if (!tablet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="card text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Tablet Not Found</h2>
          <p className="text-gray-500">This tablet is not registered in the system.</p>
          <a href="/" className="btn-primary inline-block mt-4">Go to Dashboard</a>
        </div>
      </div>
    );
  }

  const isMyTablet = savedMember && tablet.takenBy?.id === savedMember.id;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className={`${tablet.isAvailable ? 'bg-green-600' : 'bg-red-600'} text-white transition-colors duration-500`}>
        <div className="max-w-lg mx-auto px-4 py-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">{tablet.name}</h1>
          <p className="text-white/80 text-sm mt-1 flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            With Pen
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${tablet.isAvailable ? 'bg-white' : 'bg-white pulse-dot'}`}></span>
            <span className="font-semibold text-sm">
              {tablet.isAvailable ? 'Available' : 'In Use'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Not registered — show PIN form */}
        {!savedMember && (
          <div className="card animate-fadeIn">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Register Your Device</h2>
            <p className="text-sm text-gray-500 mb-5">First time? Select your name and enter your PIN.</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                <select
                  className="select-field"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                  <option value="">Select your name...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.emp_id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  className="input-field text-center text-2xl tracking-[0.5em]"
                  placeholder="● ● ● ●"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    setPinError('');
                  }}
                />
              </div>

              {pinError && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 text-center font-medium">
                  {pinError}
                </div>
              )}

              <button type="submit" className="btn-primary w-full text-lg py-4">
                Verify & Register
              </button>
            </form>
          </div>
        )}

        {/* Registered — show take/return interface */}
        {savedMember && (
          <div className="space-y-4 animate-fadeIn">
            {/* User info card */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {savedMember.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{savedMember.name}</p>
                    <p className="text-xs text-gray-400">{savedMember.empId}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                  Switch User
                </button>
              </div>
            </div>

            {/* Action Card */}
            {tablet.isAvailable ? (
              /* TAKE TABLET */
              <div className="card border-green-200 bg-green-50/50">
                <div className="text-center mb-5">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Ready to Take</h3>
                  <p className="text-gray-500 text-sm mt-1">This tablet is available for you</p>
                </div>
                <button
                  onClick={handleTake}
                  disabled={actionLoading}
                  className="btn-success w-full text-lg py-5 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <><span className="spinner"></span> Processing...</>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                      TAKE THIS TABLET
                    </>
                  )}
                </button>
              </div>
            ) : isMyTablet ? (
              /* RETURN TABLET (my tablet) */
              <div className="card border-blue-200 bg-blue-50/50">
                <div className="text-center mb-5">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">You Have This Tablet</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Checked out {getTimeSince(tablet.takenAt)} ago
                  </p>
                </div>
                <button
                  onClick={handleReturn}
                  disabled={actionLoading}
                  className="btn-primary w-full text-lg py-5 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <><span className="spinner"></span> Processing...</>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                      RETURN THIS TABLET
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* TAKEN BY SOMEONE ELSE */
              <div className="card border-red-200 bg-red-50/50">
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Not Available</h3>
                  <div className="mt-3 bg-white rounded-xl p-4">
                    <p className="text-sm text-gray-500">Currently with</p>
                    <p className="text-lg font-bold text-red-600">{tablet.takenBy?.name}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Since {getTimeSince(tablet.takenAt)} ago
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick link to dashboard */}
            <div className="text-center">
              <a href="/" className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
                View all tablets →
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
