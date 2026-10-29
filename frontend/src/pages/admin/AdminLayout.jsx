import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, Store, UtensilsCrossed,
  Tag, Users, BarChart3, ArrowLeft, ShieldAlert
} from 'lucide-react';

const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Guard: Admin or Manager only
  if (!user || (user.role !== 'admin' && user.role !== 'restaurant_manager')) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-stone-200 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-stone-900">Access Denied</h2>
        <p className="mt-1 text-xs text-stone-500">
          This portal requires Administrator or Restaurant Manager privileges.
        </p>
        <Link to="/" className="mt-6 inline-block px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold">
          Return to Customer Site
        </Link>
      </div>
    );
  }

  const navItems = [
    { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/orders', label: 'Order Monitor', icon: ShoppingBag },
    { to: '/admin/restaurants', label: 'Restaurants', icon: Store },
    { to: '/admin/menu', label: 'Menu Catalog', icon: UtensilsCrossed },
    { to: '/admin/categories', label: 'Categories', icon: Tag },
    ...(user.role === 'admin'
      ? [
          { to: '/admin/users', label: 'User Accounts', icon: Users },
          { to: '/admin/reports', label: 'Sales Analytics', icon: BarChart3 }
        ]
      : [])
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-extrabold text-sm">
              FE
            </div>
            <div>
              <div className="font-extrabold text-sm text-white tracking-tight">Admin Suite</div>
              <div className="text-[10px] text-brand-400 font-semibold uppercase tracking-wider">
                {user.role.replace('_', ' ')}
              </div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-stone-400 hover:text-white hover:bg-stone-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-stone-800 mt-6 md:mt-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to FoodExpress</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

