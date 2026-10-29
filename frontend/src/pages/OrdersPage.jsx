import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { ShoppingBag, ChevronRight, ArrowRight, Utensils } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Your Order History</h1>
          <p className="text-xs text-stone-500 mt-0.5">Real-time status tracking and past receipts</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl h-36 animate-pulse border border-stone-200" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-stone-900">No Orders Yet</h3>
          <p className="text-xs text-stone-500 mt-1">You haven't placed any food orders on FoodExpress yet.</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700"
          >
            Start Ordering <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-brand-300 transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={order.restaurant_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&q=80'}
                  alt={order.restaurant_name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 bg-stone-100"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-stone-900">{order.restaurant_name}</h3>
                    <OrderStatusBadge status={order.order_status} />
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    Order #{order.order_id} • {new Date(order.order_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div className="text-xs font-extrabold text-stone-900 mt-2">
                    Total: ₹{parseFloat(order.total_amount).toFixed(2)}{' '}
                    <span className="font-normal text-stone-500 text-[11px]">
                      via {order.payment_method?.replace(/_/g, ' ')} ({order.payment_status})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <Link
                  to={`/orders/${order.order_id}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

