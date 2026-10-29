import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, Plus, CreditCard, Banknote, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

const CheckoutPage = () => {
  const { cart, subtotal, tax, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Inline Add Address Form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    address_line1: '',
    address_line2: '',
    city: 'Bangalore',
    state: 'Karnataka',
    postal_code: '',
    landmark: ''
  });

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart');
      return;
    }
    fetchAddresses();
  }, [cart]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      const addrs = res.data.data || [];
      setAddresses(addrs);
      if (addrs.length > 0) {
        const def = addrs.find((a) => a.is_default) || addrs[0];
        setSelectedAddressId(def.address_id);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', { ...newAddr, is_default: addresses.length === 0 });
      if (res.data.success) {
        setShowAddressForm(false);
        await fetchAddresses();
        setSelectedAddressId(res.data.data.address_id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select or add a delivery address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        restaurant_id: cart.restaurant.restaurant_id,
        delivery_address_id: selectedAddressId,
        payment_method: paymentMethod,
        special_instructions: specialInstructions,
        items: cart.items.map((i) => ({
          item_id: i.item_id,
          quantity: i.quantity
        }))
      };

      const res = await api.post('/orders', payload);

      if (res.data.success) {
        clearCart();
        navigate(`/orders/${res.data.data.order_id}?placed=true`);
      } else {
        setError(res.data.message || 'Failed to place order.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error placing order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>

      <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight mb-8">
        Checkout & Payment
      </h1>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="md:col-span-2 space-y-6">
          {/* 1. Delivery Address Selection */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-base text-stone-900">Select Delivery Address</h3>
              </div>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> {showAddressForm ? 'Cancel' : 'Add New'}
              </button>
            </div>

            {/* Inline Add Address Form */}
            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="mb-6 p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">New Address</h4>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Flat/House No., Building, Street Line 1"
                    value={newAddr.address_line1}
                    onChange={(e) => setNewAddr({ ...newAddr, address_line1: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Area, Colony, Line 2 (Optional)"
                    value={newAddr.address_line2}
                    onChange={(e) => setNewAddr({ ...newAddr, address_line2: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                  />
                </div>
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
                <div>
                  <input
                    type="text"
                    placeholder="Nearby Landmark (Optional)"
                    value={newAddr.landmark}
                    onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800"
                >
                  Save & Use Address
                </button>
              </form>
            )}

            {/* Address List */}
            {addresses.length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-500">
                No delivery addresses found. Please add an address to proceed.
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.address_id}
                    className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.address_id
                        ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="delivery_address"
                        value={addr.address_id}
                        checked={selectedAddressId === addr.address_id}
                        onChange={() => setSelectedAddressId(addr.address_id)}
                        className="mt-1 text-brand-600 focus:ring-brand-500"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-stone-900">
                          {addr.address_line1}
                          {addr.is_default && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 font-semibold text-[10px]">
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
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 2. Special Instructions */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="font-bold text-sm text-stone-900 mb-2">Special Delivery Instructions</h3>
            <textarea
              rows="2"
              placeholder="e.g. Ring the doorbell twice, leave parcel at security desk, make it less spicy..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* 3. Payment Method Selection */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-base text-stone-900">Payment Option</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'UPI', label: 'UPI / QR Code', desc: 'GooglePay, PhonePe, Paytm' },
                { id: 'CREDIT_CARD', label: 'Credit Card', desc: 'Visa, Mastercard, Amex' },
                { id: 'DEBIT_CARD', label: 'Debit Card', desc: 'All major Indian banks' },
                { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', desc: 'Pay cash when food arrives' }
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === opt.id
                      ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-stone-900">{opt.label}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Placement */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm sticky top-24">
            <h3 className="font-extrabold text-base text-stone-900 mb-3 pb-2 border-b border-stone-100">
              Order Summary
            </h3>

            <div className="text-xs text-stone-600 mb-3">
              <strong>{cart.restaurant?.name}</strong> ({cart.items.length} items)
            </div>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
              {cart.items.map((i) => (
                <div key={i.item_id} className="flex justify-between text-xs">
                  <span className="text-stone-700 truncate max-w-[140px]">{i.name} x {i.quantity}</span>
                  <span className="font-bold text-stone-900">₹{(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-stone-200 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Taxes & GST (5%)</span>
                <span className="font-bold text-stone-900">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-stone-900">₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-extrabold text-stone-900">
                <span>Total Amount</span>
                <span className="text-brand-600 text-base">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || addresses.length === 0}
              className="mt-6 w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Processing Transaction...' : 'Confirm & Place Order'}</span>
            </button>

            <p className="mt-3 text-[10px] text-stone-400 text-center">
              Secured with MySQL ACID Transaction and Server-Side Price Verification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

