import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import {
  DollarSign, ShoppingBag, Clock, CheckCircle2,
  Users, Store, TrendingUp, ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/kpis');
      if (res.data.success) {
        setKpis(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Gross Revenue',
      value: `₹${parseFloat(kpis?.gross_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      title: 'Total Orders',
      value: kpis?.total_orders || 0,
      icon: ShoppingBag,
      color: 'text-brand-600 bg-brand-50 border-brand-200'
    },
    {
      title: 'Active Pipeline',
      value: kpis?.active_orders || 0,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      title: 'Delivered',
      value: kpis?.delivered_orders || 0,
      icon: CheckCircle2,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">System Overview</h1>
        <p className="text-xs text-stone-500 mt-0.5">Real-time aggregate performance metrics and pipeline health</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-stone-500">{stat.title}</p>
                <p className="mt-1 text-2xl font-extrabold text-stone-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-semibold">Active Restaurants</div>
            <div className="text-lg font-bold text-stone-900">{kpis?.active_restaurants || 0} Outlets</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-semibold">Registered Customers</div>
            <div className="text-lg font-bold text-stone-900">{kpis?.total_customers || 0} Accounts</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-semibold">Cancelled Orders</div>
            <div className="text-lg font-bold text-stone-900">{kpis?.cancelled_orders || 0} Orders</div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-stone-900">Recent Platform Orders</h3>
            <p className="text-xs text-stone-500 mt-0.5">Incoming orders across all restaurants</p>
          </div>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Restaurant</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {kpis?.recent_orders?.map((ord) => (
                <tr key={ord.order_id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-stone-900">#{ord.order_id}</td>
                  <td className="py-3.5 px-6 text-stone-800">{ord.customer_name}</td>
                  <td className="py-3.5 px-6 text-stone-800">{ord.restaurant_name}</td>
                  <td className="py-3.5 px-6 text-stone-500">
                    {new Date(ord.order_date).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3.5 px-6 font-extrabold text-stone-900">
                    ₹{parseFloat(ord.total_amount).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-6">
                    <OrderStatusBadge status={ord.order_status} />
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <Link
                      to={`/orders/${ord.order_id}`}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px]"
                    >
                      Receipt
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

