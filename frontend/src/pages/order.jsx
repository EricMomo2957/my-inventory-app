import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PRODUCTS = [
  { id: 1, name: 'Sample Item', category: 'GENERAL', price: 0.00, stock: 32, img: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=300' },
  { id: 2, name: 'batong', category: 'VEGETABLES', price: 5.00, stock: 2, img: 'https://images.unsplash.com/photo-1567375638346-e630b3d56a23?auto=format&fit=crop&w=300' },
  { id: 3, name: 'Petchay', category: 'VEGETABLES', price: 10.00, stock: 6, img: 'https://images.unsplash.com/photo-1590779033100-9f60705a2f3b?auto=format&fit=crop&w=300' },
  { id: 4, name: 'kalabasa', category: 'VEGETABLES', price: 12.00, stock: 11, img: 'https://images.unsplash.com/photo-1506484334402-40f2269bd54d?auto=format&fit=crop&w=300' },
  { id: 5, name: 'labanusnos', category: 'VEGETABLES', price: 15.00, stock: 11, img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300' },
  { id: 6, name: 'pinya', category: 'FRUITS', price: 15.00, stock: 23, img: 'https://images.unsplash.com/photo-1550258114-b0d2475b5394?auto=format&fit=crop&w=300' },
  { id: 7, name: 'perfume', category: 'SUPPLIES', price: 290.00, stock: 6, img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=300' },
  { id: 8, name: 't-shirt', category: 'SUPPLIES', price: 299.00, stock: 15, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300' },
];

export default function Order() {
  const [cartTotal, setCartTotal] = useState(0.00);
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  // Security Check
  const isLoggedIn = !!localStorage.getItem('userToken');

  const handleQuantityChange = (id, val) => {
    const value = parseInt(val);
    setQuantities(prev => ({ ...prev, [id]: value > 0 ? value : 1 }));
  };

  const addToCart = (product) => {
    const qty = quantities[product.id] || 1;
    setCartTotal(prev => prev + (product.price * qty));
  };

  // Filter Logic
  const filteredProducts = PRODUCTS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-300 overflow-y-auto font-sans">
      
      {/* 1. GUEST MODE BANNER */}
      {!isLoggedIn && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-6 flex justify-center items-center gap-3 sticky top-0 z-50 backdrop-blur-md">
          <span className="text-amber-500 text-xs">⚠️</span>
          <p className="text-[11px] font-bold text-amber-200 uppercase tracking-widest">
            Guest Mode: Viewing catalog only. 
            <button 
              onClick={() => navigate('/login')} 
              className="ml-3 text-white underline decoration-amber-500 hover:text-amber-400 transition-colors"
            >
              Staff Login
            </button>
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* 2. HEADER BANNER */}
        <section className="bg-gradient-to-r from-[#4338ca] to-[#6d28d9] rounded-3xl p-10 flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden">
          <div className="z-10">
            <button 
              onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
              className="text-xs font-bold text-indigo-200 flex items-center gap-2 mb-4 hover:text-white transition-colors"
            >
              ← {isLoggedIn ? 'Return to Dashboard' : 'Back to Login'}
            </button>
            <h1 className="text-4xl font-black text-white mb-2">Point of Sale</h1>
            <p className="text-indigo-100 max-w-lg text-sm leading-relaxed">
              {isLoggedIn 
                ? "Process transactions and manage stock levels in real-time." 
                : "Welcome to our catalog! Please sign in to process orders."}
            </p>
          </div>

          <div className="text-right z-10 mt-6 md:mt-0">
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Current Selection</p>
            <p className="text-6xl font-black text-white tracking-tighter">
              ₱{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </section>

        {/* 3. SEARCH & ACTION BAR */}
        <div className="bg-[#111827]/50 backdrop-blur-md p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <input 
            type="text" 
            placeholder="Search by product name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2.5 w-full md:w-96 outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all text-white"
          />
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => setCartTotal(0)}
              className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
            <button className="flex-1 md:flex-none bg-[#4361ee] hover:bg-[#3751d4] text-white text-xs font-bold px-8 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95">
              Review Cart & Checkout
            </button>
          </div>
        </div>

        {/* 4. CATEGORY TABS */}
        <div className="flex flex-wrap gap-2 py-2">
          {['All', 'Vegetables', 'Fruits', 'Supplies', 'Canned Goods'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                activeCategory === cat 
                ? 'bg-[#4361ee] border-[#4361ee] text-white shadow-lg shadow-blue-500/20' 
                : 'bg-[#1e293b] border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 5. PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
          {filteredProducts.map((item) => (
            <div key={item.id} className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:border-indigo-500/50 transition-all group flex flex-col">
              <div className="h-48 overflow-hidden bg-slate-800 relative">
                <img 
                  src={item.img} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                />
                {item.stock < 5 && (
                  <span className="absolute top-3 right-3 bg-red-500 text-[9px] font-black text-white px-2 py-1 rounded uppercase">
                    Low Stock
                  </span>
                )}
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.category}</p>
                  <h3 className="font-bold text-white text-lg leading-tight mt-1">{item.name}</h3>
                  <div className="mt-2">
                    <span className="bg-[#1e293b] text-[10px] text-slate-400 px-2.5 py-1 rounded-md border border-slate-800/50">
                      📦 Stock: {item.stock}
                    </span>
                  </div>
                </div>

                <div className="text-3xl font-black text-white">₱{item.price.toFixed(2)}</div>

                <div className="flex gap-2 items-center">
                  <input 
                    type="number" 
                    min="1"
                    value={quantities[item.id] || 1}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className="w-16 bg-[#0b1120] border border-slate-700 rounded-lg px-2 py-2.5 text-center text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={() => addToCart(item)}
                    className="flex-1 bg-[#4361ee] hover:bg-[#3751d4] text-white text-[11px] font-black uppercase tracking-wider py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-[#111827] rounded-3xl border border-dashed border-slate-800">
            <p className="text-slate-500 font-medium">No products found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}