import React, { useState, useEffect } from 'react';
import UserSidenav from '../components/UserSidenav';
import { useTheme } from '../../context/ThemeContext';

export default function Favorite() {
  const { isDark } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        // We removed the unused 'savedUser' variable to fix the ESLint error
        const response = await fetch('http://localhost:3000/api/products');
        const data = await response.json();
        
        // Filter items that are marked as favorite
        const heartedItems = data.filter(item => item.isFavorite === true);
        setFavorites(heartedItems);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-500 ${
      isDark ? 'bg-[#0b1120]' : 'bg-slate-50'
    }`}>
      {/* SIDEBAR */}
      <UserSidenav onLogout={handleLogout} />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        <header className="mb-10">
          <h1 className={`text-3xl font-black tracking-tighter ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            MY FAVORITES ❤️
          </h1>
          <p className="text-slate-500 font-black">Items you've saved for later.</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4361ee]"></div>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((item) => (
              <div 
                key={item.id} 
                className={`group rounded-3xl p-4 transition-all duration-300 border ${
                  isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-lg'
                }`}
              >
                {/* Product Image Container */}
                <div className={`relative aspect-square rounded-2xl mb-4 overflow-hidden ${
                  isDark ? 'bg-slate-800' : 'bg-slate-100'
                }`}>
                  <img 
                    src={`http://localhost:3000${item.image_url}`} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-red-500">
                      ❤️
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <h3 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {item.name}
                </h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                  STOCK: {item.stock}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-[#4361ee] font-black text-xl">
                    ₱{item.price}
                  </span>
                  <button className="bg-[#4361ee] text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-[#3752d5] transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                    + Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className={`flex flex-col items-center justify-center h-96 rounded-3xl border-2 border-dashed ${
            isDark ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-400'
          }`}>
            <span className="text-6xl mb-4">💔</span>
            <p className="text-xl font-black italic">No favorites found yet.</p>
            <p className="text-sm font-bold">Tap the heart icon on products to see them here.</p>
          </div>
        )}
      </main>
    </div>
  );
}