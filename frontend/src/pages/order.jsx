import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  // Check if user is logged in to decide where the "Return" button goes
  const isLoggedIn = !!localStorage.getItem('userToken');

  const handleQuantityChange = (id, val) => {
    setQuantities(prev => ({ ...prev, [id]: parseInt(val) || 1 }));
  };

  const addToCart = (product) => {
    const qty = quantities[product.id] || 1;
    setCartTotal(prev => prev + (product.price * qty));
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-300 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <section className="from-[#4338ca] to-[#6d28d9] rounded-3xl p-10 flex justify-between items-center shadow-2xl relative overflow-hidden">
          <div className="z-10">
            <button 
              onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
              className="text-xs font-bold text-indigo-200 flex items-center gap-2 mb-4 hover:text-white transition-colors"
            >
              ← {isLoggedIn ? 'Return to Dashboard' : 'Back to Login'}
            </button>
            <h1 className="text-4xl font-black text-white mb-2">Point of Sale</h1>
            <p className="text-indigo-100 max-w-lg text-sm leading-relaxed">
              Manage customer transactions. Select a category to browse specific items or use the search bar for instant lookup.
            </p>
          </div>
          <div className="text-right z-10">
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Current Selection</p>
            <p className="text-6xl font-black text-white tracking-tighter">₱{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </section>

        {/* Filter & Search Bar */}
        <div className="bg-[#111827]/50 backdrop-blur-md p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <input 
            type="text" 
            placeholder="Search by product name..." 
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2.5 w-full md:w-96 outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
          />
          <button className="bg-[#4361ee] hover:bg-[#3751d4] text-white text-xs font-bold px-8 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95">
            Review Cart & Checkout
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 py-2">
          {['All', 'Uncategorized', 'Vegetables', 'Fruits', 'Supplies', 'Canned Goods'].map((cat) => (
            <button 
              key={cat} 
              className={`px-5 py-1.5 rounded-full text-[11px] font-bold transition-all border ${cat === 'All' ? 'bg-[#4361ee] border-[#4361ee] text-white shadow-lg shadow-blue-500/20' : 'bg-[#1e293b] border-slate-800 text-slate-400 hover:border-slate-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((item) => (
            <div key={item.id} className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:border-indigo-500/50 transition-all group flex flex-col">
              <div className="h-48 overflow-hidden bg-slate-800">
                <img 
                  src={item.img} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                />
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
      </div>
    </div>
  );
}