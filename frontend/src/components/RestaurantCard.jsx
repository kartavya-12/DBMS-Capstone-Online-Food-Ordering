import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock } from 'lucide-react';

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link
      to={`/restaurant/${restaurant.restaurant_id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col"
    >
      {/* Restaurant Image */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        <img
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80'}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-stone-900">{parseFloat(restaurant.rating_avg).toFixed(1)}</span>
          <span className="text-[10px] text-stone-500">({restaurant.total_reviews})</span>
        </div>
        {!restaurant.is_active && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Currently Closed
            </span>
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-stone-900 group-hover:text-brand-600 transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
          <p className="mt-1 text-xs text-stone-500 line-clamp-2">
            {restaurant.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1 truncate max-w-[140px]">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{restaurant.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{restaurant.opening_time?.slice(0, 5)} - {restaurant.closing_time?.slice(0, 5)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;

