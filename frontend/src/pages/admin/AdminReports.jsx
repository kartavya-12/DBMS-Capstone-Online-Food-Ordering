import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { BarChart3, TrendingUp, Trophy, Star, Store, DollarSign } from 'lucide-react';

const AdminReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reports');
      if (res.data.success) {
        setReport(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-stone-400">Loading analytics...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Sales & Performance Analytics</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Real-time analytical metrics powered by MySQL views, group aggregations, and window rankings
        </p>
      </div>

      {/* Grid 1: Top Dishes & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Dishes */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-extrabold text-base text-stone-900">Most Frequently Ordered Dishes</h3>
              <p className="text-[11px] text-stone-400">Data source: vw_popular_menu_items</p>
            </div>
          </div>

          <div className="space-y-3">
            {report?.popular_dishes?.map((dish, idx) => (
              <div
                key={dish.item_name}
                className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 font-extrabold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900">{dish.item_name}</div>
                    <div className="text-[10px] text-stone-500">{dish.restaurant_name} • {dish.category_name}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-brand-600">{dish.times_ordered} ordered</div>
                  <div className="text-[10px] text-stone-500">₹{parseFloat(dish.total_revenue_generated).toFixed(2)} rev</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Spending Customers */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <Star className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-extrabold text-base text-stone-900">Highest Spending Customers (VIPs)</h3>
              <p className="text-[11px] text-stone-400">Data source: vw_customer_spending_summary</p>
            </div>
          </div>

          <div className="space-y-3">
            {report?.top_customers?.map((cust, idx) => (
              <div
                key={cust.email}
                className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-purple-700 font-extrabold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900">{cust.customer_name}</div>
                    <div className="text-[10px] text-stone-500">{cust.email} • {cust.total_orders_placed} orders</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-emerald-600">
                    ₹{parseFloat(cust.total_spent).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-stone-400">Avg ticket: ₹{parseFloat(cust.avg_ticket_size).toFixed(0)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Restaurant Performance View Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center gap-2">
          <Store className="w-5 h-5 text-brand-600" />
          <div>
            <h3 className="font-extrabold text-base text-stone-900">Restaurant Performance Matrix</h3>
            <p className="text-[11px] text-stone-400">Data source: vw_restaurant_performance</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-6">Restaurant</th>
                <th className="py-3.5 px-6">City</th>
                <th className="py-3.5 px-6">Rating</th>
                <th className="py-3.5 px-6">Total Orders</th>
                <th className="py-3.5 px-6">Gross Sales</th>
                <th className="py-3.5 px-6 text-right">Avg Ticket Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {report?.restaurant_sales?.map((r) => (
                <tr key={r.restaurant_id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-stone-900">{r.restaurant_name}</td>
                  <td className="py-3.5 px-6 text-stone-600">{r.city}</td>
                  <td className="py-3.5 px-6">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {parseFloat(r.rating_avg).toFixed(1)} ({r.total_reviews})
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-stone-800">{r.total_orders}</td>
                  <td className="py-3.5 px-6 font-extrabold text-stone-900">
                    ₹{parseFloat(r.gross_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-stone-700 text-right">
                    ₹{parseFloat(r.average_order_value).toFixed(2)}
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

export default AdminReports;

