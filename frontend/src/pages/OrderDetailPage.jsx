import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import OrderStatusBadge from '../components/OrderStatusBadge';
import {
  Clock, CheckCircle2, ChefHat, Bike, XCircle, ArrowLeft,
  MapPin, CreditCard, Star, AlertTriangle, ShieldCheck
} from 'lucide-react';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    setCancelError('');

    try {
      const res = await api.post(`/orders/${id}/cancel`);
      if (res.data.success) {
        fetchOrder();
      }
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError('');

    try {
      const res = await api.post('/reviews', {
        order_id: parseInt(id, 10),
        rating: parseInt(rating, 10),
        comment
      });

      if (res.data.success) {
        setReviewSuccess(true);
        fetchOrder();
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-48 bg-stone-200 rounded-3xl animate-pulse mb-6" />
        <div className="h-64 bg-stone-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-stone-200">
        <h2 className="text-base font-bold text-stone-800">Order Not Found</h2>
        <Link to="/orders" className="mt-4 inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold">
          View All Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'In Kitchen', icon: ChefHat },
    { key: 'OUT_FOR_DELIVERY', label: 'On the Way', icon: Bike },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 }
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.order_status);
  const isCancelled = order.order_status === 'CANCELLED';
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.order_status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My Orders
      </Link>

      {/* Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Order #{order.order_id}</span>
              <OrderStatusBadge status={order.order_status} />
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {order.restaurant_name}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Placed on {new Date(order.order_date).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
            </p>
          </div>

          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors disabled:opacity-50 self-start sm:self-auto"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>

        {cancelError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{cancelError}</span>
          </div>
        )}

        {/* Visual Progress Timeline (if not cancelled) */}
        {!isCancelled ? (
          <div className="pt-8 pb-4">
            <div className="grid grid-cols-4 relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-stone-200 -z-0" />
              <div
                className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-brand-600 transition-all duration-500 -z-0"
                style={{
                  width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`
                }}
              />

              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-4 ring-white'
                          : 'bg-white text-stone-400 border-2 border-stone-300 ring-4 ring-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`mt-2 text-xs font-bold text-center ${
                        isCurrent
                          ? 'text-brand-600'
                          : isCompleted
                          ? 'text-stone-800'
                          : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
            <XCircle className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-bold">This order was cancelled.</div>
              <div>Refund has been processed back to your payment account.</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Receipt Line Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="font-extrabold text-base text-stone-900 mb-4 pb-3 border-b border-stone-100">
              Ordered Items (Frozen Historical Snapshot)
            </h3>

            <div className="divide-y divide-stone-100">
              {order.items?.map((item) => (
                <div key={item.order_item_id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-stone-900">{item.item_name_snapshot}</span>
                    <span className="text-stone-500 ml-2">x {item.quantity}</span>
                    {item.notes && <div className="text-[11px] text-stone-400 italic">Note: {item.notes}</div>}
                  </div>
                  <div className="font-extrabold text-stone-900">
                    ₹{parseFloat(item.item_subtotal).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="mt-4 pt-4 border-t border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">₹{parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>GST & Taxes (5%)</span>
                <span className="font-bold text-stone-900">₹{parseFloat(order.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Logistics Fee</span>
                <span className="font-bold text-stone-900">₹{parseFloat(order.delivery_fee).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-extrabold text-stone-900">
                <span>Grand Total</span>
                <span className="text-brand-600 text-base">₹{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Review Submission Card (if delivered) */}
          {order.order_status === 'DELIVERED' && (
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="font-extrabold text-base text-stone-900 mb-1">
                Rate & Review Your Experience
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Your feedback automatically triggers recalculation of restaurant average ratings.
              </p>

              {order.review_rating ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
                  <div className="flex items-center gap-1 font-bold text-amber-800 mb-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>You rated this order {order.review_rating}.0 stars</span>
                  </div>
                  <p className="text-stone-700 italic">"{order.review_comment || 'No comment provided.'}"</p>
                </div>
              ) : reviewSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  Thank you! Your verified review has been posted successfully.
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {reviewError && (
                    <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                      {reviewError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Rating (1 to 5 Stars)</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-stone-300 hover:text-amber-400 transition-colors"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-stone-700 ml-2">{rating}.0 / 5.0</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Your Review</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="How was the food quality, taste, and packaging?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Post Verified Review'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Destination Snapshot & Payment Record */}
        <div className="space-y-6">
          {/* Delivery Destination Snapshot */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm mb-3">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Delivery Address</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
              {order.delivery_address_snapshot}
            </p>
            {order.special_instructions && (
              <div className="mt-3 text-[11px] text-stone-500">
                <strong>Instructions:</strong> {order.special_instructions}
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm mb-3">
              <CreditCard className="w-4 h-4 text-brand-600" />
              <span>Payment Details</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Method:</span>
                <span className="font-bold text-stone-900">{order.payment_method?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment Status:</span>
                <span className={`font-bold ${order.payment_status === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order.payment_status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Transaction Ref:</span>
                <span className="font-mono text-[10px] text-stone-600 truncate max-w-[140px]">{order.transaction_reference}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

