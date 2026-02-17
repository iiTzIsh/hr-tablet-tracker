'use client';

import { useState, useEffect } from 'react';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [toast, setToast] = useState(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmpId, setFormEmpId] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setFormName('');
    setFormEmpId('');
    setFormPin('');
    setFormError('');
    setEditingMember(null);
    setShowForm(false);
  };

  const openEditForm = (member) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormEmpId(member.emp_id);
    setFormPin(member.pin);
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formEmpId.trim() || !formPin.trim()) {
      setFormError('All fields are required');
      return;
    }

    if (formPin.length < 4) {
      setFormError('PIN must be at least 4 digits');
      return;
    }

    setFormLoading(true);

    try {
      if (editingMember) {
        // Update
        const res = await fetch('/api/members', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingMember.id,
            name: formName.trim(),
            empId: formEmpId.trim(),
            pin: formPin,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setFormError(data.error); return; }
        showToast('Member updated successfully');
      } else {
        // Create
        const res = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            empId: formEmpId.trim(),
            pin: formPin,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setFormError(data.error); return; }
        showToast('Member created successfully');
      }

      resetForm();
      fetchMembers();
    } catch {
      setFormError('Connection error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (member) => {
    if (!confirm(`Are you sure you want to delete ${member.name}?`)) return;

    try {
      const res = await fetch(`/api/members?id=${member.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error, 'error');
        return;
      }

      showToast('Member deleted');
      fetchMembers();
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const handleToggleActive = async (member) => {
    try {
      const res = await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member.id, isActive: !member.is_active }),
      });

      if (!res.ok) {
        showToast('Failed to update', 'error');
        return;
      }

      showToast(member.is_active ? 'Member deactivated' : 'Member activated');
      fetchMembers();
    } catch {
      showToast('Connection error', 'error');
    }
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
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Members</h2>
          <p className="text-gray-500 text-sm mt-1">{members.length} team members</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-black/50 absolute inset-0" onClick={resetForm} />
          <div className="card max-w-md w-full relative z-10 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingMember ? 'Edit Member' : 'Add New Member'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. John Silva"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. EMP-001"
                  value={formEmpId}
                  onChange={(e) => setFormEmpId(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN (4+ digits)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="input-field"
                  placeholder="e.g. 1234"
                  maxLength={6}
                  value={formPin}
                  onChange={(e) => setFormPin(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              {formError && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 text-center font-medium">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {formLoading ? (
                    <><span className="spinner"></span> Saving...</>
                  ) : (
                    editingMember ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Employee ID</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">PIN</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-xs">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-xs">{member.emp_id}</td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-xs">{member.pin}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleActive(member)}
                      className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                        member.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {member.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditForm(member)}
                        className="text-blue-600 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(member)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
