import React, { useState, useEffect } from 'react';
import api from '../api/client';
import RestaurantCard from '../components/RestaurantCard';
import { Search, Filter, Sparkles, MapPin } from 'lucide-react';

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resRestaurants, resCategories] = await Promise.all([
        api.get('/restaurants'),
        api.get('/categories')
      ]);
      setRestaurants(resRestaurants.data.data || []);
      setCategories(resCategories.data.data || []);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let url = `/restaurants?search=${encodeURIComponent(searchTerm)}`;
      if (selectedCity) url += `&city=${encodeURIComponent(selectedCity)}`;
      const res = await api.get(url);
      setRestaurants(res.data.data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterByCity = async (city) => {
    setSelectedCity(city);
    try {
      setLoading(true);
      let url = '/restaurants?';
      if (city) url += `city=${encodeURIComponent(city)}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}`;
      const res = await api.get(url);
      setRestaurants(res.data.data || []);
    } catch (err) {
      console.error('Filter city error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl mx-4 sm:mx-6 lg:mx-8 mt-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Database-Driven Food Delivery System</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Crave it? Get it. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-amber-400">
              Delivered hot & fast.
            </span>
          </h1>
          <p className="mt-4 text-stone-300 text-sm sm:text-base leading-relaxed">
            Discover top-rated dining spots, artisanal kitchens, and local favorites with atomic order execution and real-time database tracking.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-8 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search restaurant or cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-stone-900 placeholder-stone-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-md"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-colors shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Decorative Graphic Element */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:block opacity-25 pointer-events-none">
          <div className="w-96 h-96 rounded-full bg-brand-500/30 blur-3xl absolute -bottom-10 -right-10" />
        </div>
      </section>

      {/* Cuisine Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Explore Categories</h2>
            <p className="text-xs text-stone-500">Curated cuisines from master culinary chefs</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.category_id}
              onClick={() => setSelectedCategory(selectedCategory === cat.category_id ? null : cat.category_id)}
              className={`cursor-pointer group p-3 rounded-2xl border transition-all text-center flex flex-col items-center ${
                selectedCategory === cat.category_id
                  ? 'bg-brand-50 border-brand-500 shadow-md shadow-brand-500/10'
                  : 'bg-white border-stone-200 hover:border-brand-300 hover:shadow-sm'
              }`}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-2 bg-stone-100 group-hover:scale-105 transition-transform">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=200&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-stone-800 line-clamp-1">{cat.name}</span>
              <span className="text-[10px] text-stone-400">{cat.total_items || 0} items</span>
            </div>
          ))}
        </div>
      </section>

      {/* Restaurant Listing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Featured Restaurants</h2>
            <p className="text-xs text-stone-500">Top-rated kitchens delivering to your doorstep</p>
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
            <button
              onClick={() => filterByCity('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCity === ''
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              All Cities
            </button>
            <button
              onClick={() => filterByCity('Bangalore')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedCity === 'Bangalore'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <MapPin className="w-3 h-3" /> Bangalore
            </button>
            <button
              onClick={() => filterByCity('Mumbai')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedCity === 'Mumbai'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <MapPin className="w-3 h-3" /> Mumbai
            </button>
          </div>
        </div>

        {/* Restaurant Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 max-w-md mx-auto my-8">
            <Filter className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">No Restaurants Found</h3>
            <p className="text-xs text-stone-500 mt-1">Try resetting your search query or city filter.</p>
            <button
              onClick={() => { setSearchTerm(''); filterByCity(''); }}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;

