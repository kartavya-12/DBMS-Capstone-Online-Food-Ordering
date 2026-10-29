import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { Filter, Eye, AlertCircle, RefreshCw } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Selected Order for Receipt Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      let url = '/admin/orders';
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setOrders(res.data.data || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      setErrorMsg('');
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        fetchOrders();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Status transition rejected.');
    } finally {
      setUpdatingId(null);
    }
  };

  const openReceiptModal = async (orderId) => {
    try {
      setModalLoading(true);
      const res = await api.get(`/orders/${orderId}`);
      if (res.data.success) {
        setSelectedOrder(res.data.data);
      }
    } catch (err) {
      alert('Failed to load order receipt.');
    } finally {
      setModalLoading(false);
    }
  };

  const allStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Order Management Monitor</h1>
          <p className="text-xs text-stone-500 mt-0.5">Live order workflow pipeline and state machine transitions</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-bold text-stone-700 bg-transparent focus:outline-none"
            >
              <option value="">All Statuses</option>
              {allStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-stone-600 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Restaurant</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Payment</th>
                <th className="py-3.5 px-6">Current Status</th>
                <th className="py-3.5 px-6">Advance State</th>
                <th className="py-3.5 px-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-stone-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-stone-400">No orders found matching the filter.</td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.order_id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-stone-900">#{ord.order_id}</td>
                    <td className="py-3.5 px-6 text-stone-500">
                      {new Date(ord.order_date).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-stone-800">{ord.customer_name}</div>
                      <div className="text-[10px] text-stone-400">{ord.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-6 text-stone-800 font-medium">{ord.restaurant_name}</td>
                    <td className="py-3.5 px-6 font-extrabold text-stone-900">
                      ₹{parseFloat(ord.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-semibold text-stone-700">{ord.payment_method?.replace(/_/g, ' ')}</span>
                      <span className={`block text-[10px] ${ord.payment_status === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <OrderStatusBadge status={ord.order_status} />
                    </td>
                    <td className="py-3.5 px-6">
                      {/* State transition selector */}
                      {ord.order_status !== 'DELIVERED' && ord.order_status !== 'CANCELLED' ? (
                        <select
                          disabled={updatingId === ord.order_id}
                          value={ord.order_status}
                          onChange={(e) => handleStatusChange(ord.order_id, e.target.value)}
                          className="px-2 py-1 text-xs font-bold rounded-lg border border-stone-300 bg-stone-50 text-stone-800 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
                        >
                          <option value={ord.order_status} disabled>Update Status</option>
                          {ord.order_status === 'PENDING' && <option value="CONFIRMED">Confirm Order</option>}
                          {ord.order_status === 'CONFIRMED' && <option value="PREPARING">Send to Kitchen</option>}
                          {ord.order_status === 'PREPARING' && <option value="OUT_FOR_DELIVERY">Dispatch Delivery</option>}
                          {ord.order_status === 'OUT_FOR_DELIVERY' && <option value="DELIVERED">Mark Delivered</option>}
                          <option value="CANCELLED">Cancel Order</option>
                        </select>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">Terminal State</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => openReceiptModal(ord.order_id)}
                        className="p-1.5 text-stone-500 hover:text-brand-600 rounded-lg hover:bg-stone-100 transition-colors"
                        title="View Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Receipt Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-extrabold text-lg text-stone-900">
                  Order #{selectedOrder.order_id} Receipt
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedOrder.restaurant_name} • {new Date(selectedOrder.order_date).toLocaleString()}
                </p>
              </div>
              <OrderStatusBadge status={selectedOrder.order_status} />
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Customer Info</h4>
                <div className="p-3 bg-stone-50 rounded-xl">
                  <div className="font-bold text-stone-900">{selectedOrder.customer_name}</div>
                  <div className="text-stone-500">{selectedOrder.customer_email} • {selectedOrder.customer_phone}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Delivery Destination Snapshot</h4>
                <div className="p-3 bg-stone-50 rounded-xl text-stone-700">
                  {selectedOrder.delivery_address_snapshot}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-700 uppercase tracking-wider text-[10px] mb-1">Frozen Line Items</h4>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.order_item_id} className="p-3 flex justify-between">
                      <div>
                        <span className="font-bold text-stone-900">{item.item_name_snapshot}</span>
                        <span className="text-stone-500 ml-2">x {item.quantity}</span>
                      </div>
                      <span className="font-bold text-stone-900">₹{parseFloat(item.item_subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 space-y-1.5">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-stone-900">₹{parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST (5%)</span>
                  <span className="font-bold text-stone-900">₹{parseFloat(selectedOrder.tax_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-stone-900">₹{parseFloat(selectedOrder.delivery_fee).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-extrabold text-stone-900">
                  <span>Total Amount</span>
                  <span className="text-brand-600">₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

