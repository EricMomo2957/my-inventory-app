import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function Favorite() {
  const { isDark } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterFavorites = async () => {
      try {
        // 1. Get the IDs you saved in UserDashboard.jsx
        const savedFavoriteIds = JSON.parse(localStorage.getItem('userFavorites')) || [];
        
        // 2. Fetch all products from your API
        const response = await fetch('http://localhost:3000/api/products');
        const allProducts = await response.json();
        
        // 3. Filter products: Only keep those whose ID is in our saved list
        const filtered = allProducts.filter(product => 
          savedFavoriteIds.includes(product.id)
        );
        
        setFavorites(filtered);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterFavorites();
  }, []);

  // Function to remove a favorite directly from this page
  const removeFavorite = (id) => {
    const savedIds = JSON.parse(localStorage.getItem('userFavorites')) || [];
    const updatedIds = savedIds.filter(favId => favId !== id);
    
    // Update Local Storage
    localStorage.setItem('userFavorites', JSON.stringify(updatedIds));
    
    // Update UI State
    setFavorites(favorites.filter(item => item.id !== id));
  };

  return (
    <div className="p-8 w-full"> 
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
              className={`group relative p-4 rounded-3xl border transition-all hover:-translate-y-2 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl text-slate-900'
              }`}
            >
              {/* Heart Button (Remove) */}
              <button 
                onClick={() => removeFavorite(item.id)}
                className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-md bg-red-50 text-red-500 transition-transform active:scale-90"
              >
                ❤️
              </button>

              <div className={`aspect-square rounded-2xl overflow-hidden mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <img 
                  src={item.image_url ? `http://localhost:3000${item.image_url}` : 'https://via.placeholder.com/300'} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <h3 className="font-bold text-lg mb-1 truncate">{item.name}</h3>
              <p className={`text-xs font-black mb-4 ${item.quantity <= 0 ? 'text-red-500' : 'text-slate-400'}`}>
                {item.quantity <= 0 ? 'OUT OF STOCK' : `STOCK: ${item.quantity}`}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-[#4361ee] font-black text-xl">
                  ₱{parseFloat(item.price).toLocaleString()}
                </span>
                <button 
                   className="bg-[#4361ee] text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  + Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center h-96 rounded-3xl border-2 border-dashed ${
          isDark ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-400'
        }`}>
          <span className="text-6xl mb-4">💔</span>
          <p className="text-xl font-black italic">No favorites found yet.</p>
          <p className="text-sm font-bold">Tap the heart icon on products to see them here.</p>
        </div>
      )}
    </div>
  );
}