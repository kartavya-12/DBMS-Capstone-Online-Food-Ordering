import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Users, Power, AlertCircle, Shield } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = '/admin/users';
      if (roleFilter) url += `?role=${roleFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (targetUser) => {
    try {
      setErrorMsg('');
      const res = await api.patch(`/admin/users/${targetUser.user_id}/status`, {
        is_active: !targetUser.is_active
      });
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">User Account Governance</h1>
          <p className="text-xs text-stone-500 mt-0.5">Manage customer credentials, manager roles, and platform permissions</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-700">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-semibold text-stone-800 bg-white border border-stone-200 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="customer">Customers</option>
            <option value="restaurant_manager">Restaurant Managers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-6">User ID</th>
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Phone</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Orders Placed</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Account Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-stone-400">Loading accounts...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-stone-400">No user accounts found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.user_id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-stone-900">#{u.user_id}</td>
                    <td className="py-3.5 px-6 font-bold text-stone-800">{u.name}</td>
                    <td className="py-3.5 px-6 text-stone-600">{u.email}</td>
                    <td className="py-3.5 px-6 text-stone-600">{u.phone}</td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : u.role === 'restaurant_manager'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-stone-800">{u.order_count || 0}</td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                            u.is_active
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

