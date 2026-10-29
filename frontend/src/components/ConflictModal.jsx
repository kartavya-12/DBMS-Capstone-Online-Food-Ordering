import React from 'react';
import { useCart } from '../context/CartContext';
import { AlertTriangle } from 'lucide-react';

const ConflictModal = () => {
  const { conflictModal, confirmResetCartWithNewItem, cancelConflict, cart } = useCart();

  if (!conflictModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-stone-900 text-center">
          Replace Cart Items?
        </h3>
        <p className="mt-2 text-sm text-stone-600 text-center">
          Your cart currently contains dishes from <strong className="text-stone-900">{cart.restaurant?.name}</strong>.
          An order can only contain items from one restaurant at a time.
        </p>
        <p className="mt-2 text-xs text-stone-500 text-center">
          Would you like to discard your current cart and start a fresh order from <strong className="text-brand-600">{conflictModal.pendingRestaurant?.name}</strong>?
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={cancelConflict}
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors"
          >
            Keep Cart
          </button>
          <button
            onClick={confirmResetCartWithNewItem}
            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors shadow-sm shadow-brand-600/30"
          >
            Start New Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;

