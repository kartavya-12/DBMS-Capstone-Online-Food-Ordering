import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Store, ArrowLeft } from 'lucide-react';

const CartPage = () => {
  const { cart, updateQuantity, removeItem, clearCart, subtotal, tax, deliveryFee, total, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-stone-200 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">Your Cart is Empty</h2>
        <p className="mt-1 text-xs text-stone-500">Looks like you haven't added anything to your cart yet.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-brand-600/30"
        >
          Explore Restaurants <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Your Order Cart</h1>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-500">
            <Store className="w-3.5 h-3.5 text-brand-600" />
            <span>Ordering from: <strong className="text-stone-800">{cart.restaurant?.name}</strong></span>
          </div>
        </div>

        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="md:col-span-2 space-y-3">
          {cart.items.map((item) => (
            <div
              key={item.item_id}
              className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&q=80'}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 bg-stone-100"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-stone-900 truncate">{item.name}</h4>
                  <div className="text-xs font-semibold text-stone-500 mt-0.5">₹{item.price.toFixed(2)} each</div>
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
                  <button
                    onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-stone-700 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold w-6 text-center text-stone-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-stone-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-16 text-right font-extrabold text-sm text-stone-900">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>

                <button
                  onClick={() => removeItem(item.item_id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <Link
            to={`/restaurant/${cart.restaurant?.restaurant_id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Add more items from {cart.restaurant?.name}
          </Link>
        </div>

        {/* Bill Summary Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm sticky top-24">
            <h3 className="font-extrabold text-base text-stone-900 mb-4 pb-3 border-b border-stone-100">
              Bill Details
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Item Subtotal ({itemCount} items)</span>
                <span className="font-bold text-stone-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Taxes & GST (5%)</span>
                <span className="font-bold text-stone-900">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Partner Fee</span>
                <span className="font-bold text-stone-900">₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between text-sm font-extrabold text-stone-900">
                <span>To Pay</span>
                <span className="text-brand-600 text-base">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-6 w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-brand-600/30 flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

