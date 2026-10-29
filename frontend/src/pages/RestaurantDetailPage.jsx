import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import MenuItemCard from '../components/MenuItemCard';
import { useCart } from '../context/CartContext';
import { Star, MapPin, Clock, Phone, Mail, ArrowLeft, ShoppingBag } from 'lucide-react';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [menuSearch, setMenuSearch] = useState('');
  const { itemCount, total, cart } = useCart();

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/restaurants/${id}`);
      if (res.data.success) {
        setRestaurant(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-64 bg-stone-200 rounded-3xl animate-pulse mb-8" />
        <div className="space-y-4">
          <div className="h-10 bg-stone-200 rounded-xl w-1/3 animate-pulse" />
          <div className="h-4 bg-stone-200 rounded-lg w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-md mx-auto my-20 text-center p-8 bg-white rounded-2xl border border-stone-200">
        <h2 className="text-lg font-bold text-stone-800">Restaurant Not Found</h2>
        <Link to="/" className="mt-4 inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold">
          Back to Restaurants
        </Link>
      </div>
    );
  }

  // Group menu items by category
  const categoriesList = Array.from(new Set(restaurant.menu_items?.map((item) => item.category_name) || []));

  const filteredItems = (restaurant.menu_items || []).filter((item) => {
    if (vegOnly && !item.is_vegetarian) return false;
    if (selectedCategory !== 'ALL' && item.category_name !== selectedCategory) return false;
    if (menuSearch && !item.name.toLowerCase().includes(menuSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to all restaurants
      </Link>

      {/* Restaurant Header Banner */}
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm mb-8">
        <div className="relative h-64 sm:h-80 w-full bg-stone-900">
          <img
            src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{restaurant.name}</h1>
              <p className="mt-2 text-stone-300 text-xs sm:text-sm max-w-xl">{restaurant.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-stone-300">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-400" /> {restaurant.address}, {restaurant.city}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-brand-400" /> {restaurant.opening_time?.slice(0, 5)} - {restaurant.closing_time?.slice(0, 5)}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-brand-400" /> {restaurant.phone}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 flex items-center gap-2 self-start sm:self-auto">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <div>
                <div className="text-base font-extrabold leading-none">{parseFloat(restaurant.rating_avg).toFixed(1)}</div>
                <div className="text-[10px] text-stone-300">{restaurant.total_reviews} ratings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Filters Bar */}
      <div className="sticky top-16 z-30 bg-stone-50/95 backdrop-blur-md py-4 mb-6 border-b border-stone-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              All Items ({restaurant.menu_items?.length || 0})
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search in Menu & Veg Toggle */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <input
              type="text"
              placeholder="Filter dishes..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 w-36 sm:w-44"
            />
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                vegOnly
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${vegOnly ? 'bg-emerald-600' : 'bg-stone-400'}`} />
              Pure Veg
            </button>
          </div>
        </div>
      </div>

      {/* Menu Dishes Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
          <p className="text-sm font-semibold text-stone-600">No dishes match your selected filters.</p>
          <button
            onClick={() => { setSelectedCategory('ALL'); setVegOnly(false); setMenuSearch(''); }}
            className="mt-3 px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.item_id} item={item} restaurant={restaurant} />
          ))}
        </div>
      )}

      {/* Verified Reviews Section */}
      <section className="mt-16 pt-10 border-t border-stone-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-stone-900">Verified Customer Reviews</h3>
            <p className="text-xs text-stone-500">Real ratings from customers who ordered from this kitchen</p>
          </div>
        </div>

        {restaurant.reviews?.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-xs text-stone-500">
            No reviews yet for this restaurant. Place an order to leave the first review!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurant.reviews?.map((rev) => (
              <div key={rev.review_id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-stone-900">{rev.customer_name}</span>
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-amber-700 text-xs font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {rev.rating}.0
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 italic">"{rev.comment || 'No written feedback.'}"</p>
                </div>
                <div className="mt-3 text-[10px] text-stone-400">
                  {new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating Cart Pill on bottom if cart has items */}
      {itemCount > 0 && cart.restaurant?.restaurant_id === restaurant.restaurant_id && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-lg">
          <Link
            to="/cart"
            className="flex items-center justify-between bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-stone-900/30 hover:bg-stone-800 transition-transform active:scale-95"
          >
            <div className="flex items-center gap-2.5">
              <div className="bg-brand-600 text-white font-bold text-xs px-2 py-1 rounded-lg">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </div>
              <span className="font-bold text-sm">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-400">
              <span>View Cart</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;

