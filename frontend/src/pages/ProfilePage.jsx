import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Plus, Trash2, Check, Phone, Mail, Shield } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [addresses, setAddresses] = useState([]);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Add Address State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    address_line1: '',
    address_line2: '',
    city: 'Bangalore',
    state: 'Karnataka',
    postal_code: '',
    landmark: '',
    is_default: false
  });

  useEffect(() => {
    fetchProfileAndAddresses();
  }, []);

  const fetchProfileAndAddresses = async () => {
    try {
      const [profileRes, addrRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/addresses')
      ]);

      if (profileRes.data.success) {
        updateUser(profileRes.data.data);
        setProfileData({
          name: profileRes.data.data.name,
          phone: profileRes.data.data.phone
        });
      }

      if (addrRes.data.success) {
        setAddresses(addrRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');

    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        updateUser(res.data.data);
        setProfileMsg('Profile updated successfully.');
      }
    } catch (err) {
      setProfileMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddr);
      if (res.data.success) {
        setShowAddModal(false);
        setNewAddr({
          address_line1: '',
          address_line2: '',
          city: 'Bangalore',
          state: 'Karnataka',
          postal_code: '',
          landmark: '',
          is_default: false
        });
        fetchProfileAndAddresses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      fetchProfileAndAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete address.');
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      await api.put(`/addresses/${addr.address_id}`, {
        ...addr,
        is_default: true
      });
      fetchProfileAndAddresses();
    } catch (err) {
      alert('Failed to update default address.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Account & Addresses</h1>
        <p className="text-xs text-stone-500 mt-0.5">Manage your personal information and delivery destinations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
              <User className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="font-extrabold text-lg text-stone-900">{user?.name}</h3>
              <p className="text-xs text-stone-500">{user?.email}</p>
              <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-wider">
                {user?.role?.replace('_', ' ')}
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3 pt-4 border-t border-stone-100">
              {profileMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                  {profileMsg}
                </div>
              )}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors"
              >
                {profileSaving ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>

        {/* Addresses Management */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-base text-stone-900">Saved Delivery Addresses</h3>
              </div>
              <button
                onClick={() => setShowAddModal(!showAddModal)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 text-xs font-bold hover:bg-brand-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            </div>

            {/* Add Address Inline Form */}
            {showAddModal && (
              <form onSubmit={handleAddAddress} className="mb-6 p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">New Delivery Destination</h4>
                <input
                  type="text"
                  required
                  placeholder="Address Line 1 (Flat, House No, Street)"
                  value={newAddr.address_line1}
                  onChange={(e) => setNewAddr({ ...newAddr, address_line1: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Area, Landmark)"
                  value={newAddr.address_line2}
                  onChange={(e) => setNewAddr({ ...newAddr, address_line2: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="PIN Code"
                    value={newAddr.postal_code}
                    onChange={(e) => setNewAddr({ ...newAddr, postal_code: e.target.value })}
                    className="px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddr.is_default}
                      onChange={(e) => setNewAddr({ ...newAddr, is_default: e.target.checked })}
                      className="rounded text-brand-600"
                    />
                    <span>Make this my default address</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-stone-300 text-stone-600 rounded-xl text-xs font-bold hover:bg-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Addresses List */}
            {addresses.length === 0 ? (
              <div className="text-center py-8 text-xs text-stone-500">
                You have not added any delivery addresses yet.
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.address_id}
                    className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="text-xs">
                      <div className="font-bold text-stone-900 flex items-center gap-2">
                        <span>{addr.address_line1}</span>
                        {addr.is_default && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      {addr.address_line2 && <div className="text-stone-600 mt-0.5">{addr.address_line2}</div>}
                      <div className="text-stone-500 mt-0.5">
                        {addr.city}, {addr.state} - {addr.postal_code}
                        {addr.landmark && ` (Landmark: ${addr.landmark})`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!addr.is_default && (
                        <button
                          onClick={() => handleSetDefault(addr)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.address_id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

