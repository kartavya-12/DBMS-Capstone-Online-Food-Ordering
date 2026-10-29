import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Plus, Edit2, Trash2, Power, Filter, AlertCircle } from 'lucide-react';

const AdminMenu = () => {
  const [items, setItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    restaurant_id: '',
    category_id: '',
    name: '',
    description: '',
    price: '',
    is_vegetarian: false,
    is_available: true,
    image_url: ''
  });

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [selectedRestaurant, selectedCategory]);

  const fetchMetadata = async () => {
    try {
      const [restRes, catRes] = await Promise.all([
        api.get('/restaurants?is_active=all'),
        api.get('/categories')
      ]);
      setRestaurants(restRes.data.data || []);
      setCategories(catRes.data.data || []);
      if (restRes.data.data?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          restaurant_id: restRes.data.data[0].restaurant_id,
          category_id: catRes.data.data?.[0]?.category_id || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      let url = '/menu-items?is_available=all';
      if (selectedRestaurant) url += `&restaurant_id=${selectedRestaurant}`;
      if (selectedCategory) url += `&category_id=${selectedCategory}`;
      const res = await api.get(url);
      setItems(res.data.data || []);
    } catch (err) {
      console.error('Failed to load menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      restaurant_id: selectedRestaurant || restaurants[0]?.restaurant_id || '',
      category_id: selectedCategory || categories[0]?.category_id || '',
      name: '',
      description: '',
      price: '',
      is_vegetarian: false,
      is_available: true,
      image_url: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      restaurant_id: item.restaurant_id,
      category_id: item.category_id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      is_vegetarian: Boolean(item.is_vegetarian),
      is_available: Boolean(item.is_available),
      image_url: item.image_url || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (editingItem) {
        await api.put(`/menu-items/${editingItem.item_id}`, formData);
      } else {
        await api.post('/menu-items', formData);
      }
      setModalOpen(false);
      fetchMenuItems();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save menu item.');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await api.put(`/menu-items/${item.item_id}`, { is_available: !item.is_available });
      fetchMenuItems();
    } catch (err) {
      alert('Failed to update stock status.');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this dish?')) return;
    try {
      const res = await api.delete(`/menu-items/${itemId}`);
      alert(res.data.message);
      fetchMenuItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Menu Catalog Management</h1>
          <p className="text-xs text-stone-500 mt-0.5">Manage dish pricing, availability, and dietary tags</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dish</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <span className="text-xs font-bold text-stone-700">Filter by Restaurant:</span>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="text-xs font-semibold text-stone-800 bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="">All Restaurants</option>
            {restaurants.map((r) => (
              <option key={r.restaurant_id} value={r.restaurant_id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-700">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold text-stone-800 bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dishes Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-6">Dish</th>
                <th className="py-3.5 px-6">Restaurant</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Price</th>
                <th className="py-3.5 px-6">Dietary</th>
                <th className="py-3.5 px-6">Stock Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-stone-400">Loading dishes...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-stone-400">No dishes found matching filters.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.item_id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80'}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover bg-stone-100 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{item.name}</div>
                          <div className="text-[11px] text-stone-500 max-w-xs truncate">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-stone-800">{item.restaurant_name}</td>
                    <td className="py-3.5 px-6 text-stone-600">{item.category_name}</td>
                    <td className="py-3.5 px-6 font-extrabold text-stone-900">
                      ₹{parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.is_vegetarian ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {item.is_vegetarian ? 'Vegetarian' : 'Non-Veg'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                          item.is_available
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-stone-100 border-stone-200 text-stone-500'
                        }`}
                      >
                        {item.is_available ? 'In Stock' : 'Sold Out'}
                      </button>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                          title="Edit Dish"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.item_id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dish Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-lg text-stone-900 mb-4 pb-2 border-b border-stone-100">
              {editingItem ? 'Edit Dish' : 'Add New Dish to Menu'}
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Restaurant</label>
                  <select
                    disabled={!!editingItem}
                    value={formData.restaurant_id}
                    onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                  >
                    {restaurants.map((r) => (
                      <option key={r.restaurant_id} value={r.restaurant_id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Dietary Flag</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs font-semibold text-stone-800">
                    <input
                      type="checkbox"
                      checked={formData.is_vegetarian}
                      onChange={(e) => setFormData({ ...formData, is_vegetarian: e.target.checked })}
                      className="rounded text-brand-600"
                    />
                    <span>Pure Vegetarian</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Photo Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;

