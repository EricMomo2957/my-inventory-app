import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

export default function Favorite() {
  const { isDark } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId'); // Get the logged-in user's ID

  // --- 1. FETCH FAVORITES FROM DATABASE ---
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        // Fetch only this specific user's favorites from the DB
        const res = await axios.get(`http://localhost:3000/api/favorites/${userId}`);
        setFavorites(res.data);
      } catch (error) {
        console.error("Error loading favorites from database:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

  // --- 2. REMOVE FAVORITE FROM DATABASE ---
  const removeFavorite = async (productId) => {
    try {
      // We use the toggle endpoint: if it exists, the backend deletes it
      await axios.post('http://localhost:3000/api/favorites', { userId, productId });
      
      // Update UI state immediately by filtering out the removed item
      setFavorites(prev => prev.filter(item => item.id !== productId));
    } catch (error) {
      console.error("Removal failed:", error);
      alert("Could not remove favorite. Please try again.");
    }
  };

  return (
    <div className={`p-8 min-h-screen w-full transition-colors ${isDark ? 'bg-[#0b1120]' : 'bg-slate-50'}`}> 
      {/* Header Section */}
      <header className="mb-10">
        <h1 className={`text-4xl font-black tracking-tighter italic uppercase ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          My Favorites ❤️
        </h1>
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">
          Saved items for <span className="text-[#4361ee]">{userId ? `User #${userId}` : 'Guest'}</span>
        </p>
      </header>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#4361ee]"></div>
          <p className={`font-black italic ${isDark ? 'text-white' : 'text-slate-900'}`}>SYNCING DATABASE...</p>
        </div>
      ) : favorites.length > 0 ? (
        /* Grid Display */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favorites.map((item) => (
            <div 
              key={item.id} 
              className={`group relative p-5 rounded-[2.5rem] border transition-all duration-300 hover:-translate-y-2 ${
                isDark 
                ? 'bg-slate-900 border-slate-800 text-white hover:border-red-500/30' 
                : 'bg-white border-slate-100 shadow-sm hover:shadow-2xl text-slate-900 hover:border-red-100'
              }`}
            >
              {/* Heart Button (Remove Action) */}
              <button 
                onClick={() => removeFavorite(item.id)}
                className="absolute top-6 right-6 z-10 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg bg-white text-red-500 transition-all hover:scale-110 active:scale-90"
                title="Remove from favorites"
              >
                ❤️
              </button>

              {/* Product Image */}
              <div className={`aspect-square rounded-3xl overflow-hidden mb-5 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <img 
                  src={item.image_url ? `http://localhost:3000${item.image_url}` : 'https://via.placeholder.com/300'} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Product Info */}
              <h3 className="font-black text-lg mb-1 truncate uppercase tracking-tight">{item.name}</h3>
              <p className={`text-[10px] font-black mb-5 px-3 py-1 rounded-lg inline-block ${
                item.quantity <= 0 
                ? 'bg-red-500/10 text-red-500' 
                : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
              }`}>
                {item.quantity <= 0 ? '🚫 OUT OF STOCK' : `📦 STOCK: ${item.quantity}`}
              </p>
              
              {/* Price and Add to Cart */}
              <div className="flex justify-between items-center mt-auto">
                <span className="text-[#4361ee] font-black text-2xl tracking-tighter">
                  ₱{parseFloat(item.price).toLocaleString()}
                </span>
                <button 
                   className="bg-[#4361ee] text-white p-3 rounded-2xl text-xs font-black hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                  BUY NOW
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className={`flex flex-col items-center justify-center h-125 rounded-[3rem] border-4 border-dashed transition-colors ${
          isDark ? 'border-slate-800/50 text-slate-700' : 'border-slate-200 text-slate-300'
        }`}>
          <span className="text-8xl mb-6 grayscale opacity-20">💔</span>
          <p className="text-2xl font-black italic uppercase tracking-widest">No Favorites Saved</p>
          <p className="text-sm font-bold mt-2 opacity-60">Your saved items will appear here even after you log out.</p>
        </div>
      )}
    </div>
  );
}