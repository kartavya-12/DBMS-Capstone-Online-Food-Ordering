import React from 'react';
import { useCart } from '../context/CartContext';
import { Plus, Minus } from 'lucide-react';

const MenuItemCard = ({ item, restaurant }) => {
  const { cart, addItem, updateQuantity } = useCart();

  const cartItem = cart.items.find((i) => i.item_id === item.item_id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addItem(item, restaurant);
  };

  const handleIncrement = () => {
    updateQuantity(item.item_id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(item.item_id, quantity - 1);
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-200 hover:border-stone-300 transition-all flex gap-4 items-center justify-between">
      {/* Dish Information */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          {/* Veg / Non-Veg Standard Indicator Badge */}
          <span
            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
              item.is_vegetarian
                ? 'border-emerald-600 bg-white'
                : 'border-rose-600 bg-white'
            }`}
            title={item.is_vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                item.is_vegetarian ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            />
          </span>
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            {item.category_name}
          </span>
        </div>

        <h4 className="font-bold text-base text-stone-900 line-clamp-1">{item.name}</h4>
        <p className="mt-1 text-xs text-stone-500 line-clamp-2">{item.description}</p>
        <div className="mt-2 text-sm font-extrabold text-stone-900">
          ₹{parseFloat(item.price).toFixed(2)}
        </div>
      </div>

      {/* Dish Thumbnail & Quantity Stepper */}
      <div className="flex flex-col items-center shrink-0 w-28">
        <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-stone-100">
          <img
            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {!item.is_available && (
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider">
              Sold Out
            </div>
          )}
        </div>

        <div className="mt-2 w-full">
          {!item.is_available ? (
            <button
              disabled
              className="w-full py-1.5 px-3 rounded-lg bg-stone-100 text-stone-400 font-bold text-xs uppercase cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="w-full py-1.5 px-3 rounded-lg bg-white border border-brand-500 text-brand-600 font-bold text-xs uppercase hover:bg-brand-50 transition-colors shadow-sm"
            >
              Add +
            </button>
          ) : (
            <div className="flex items-center justify-between w-full bg-brand-600 text-white rounded-lg p-1 shadow-sm">
              <button
                onClick={handleDecrement}
                className="w-6 h-6 flex items-center justify-center hover:bg-brand-700 rounded transition-colors"
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold px-1">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="w-6 h-6 flex items-center justify-center hover:bg-brand-700 rounded transition-colors"
                title="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;

