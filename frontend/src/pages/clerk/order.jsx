import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'; 
import axios from 'axios';

export default function Order() {
  const { isDark } = useTheme(); 
  const navigate = useNavigate();

  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState({ date: '', trx: '' });
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/products');
        const formattedData = res.data.map(p => ({
          ...p,
          price: parseFloat(p.price) || 0
        }));
        setProducts(formattedData);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };
    fetchProducts();
  }, []);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // --- HANDLERS ---
  const handleQuantityChange = (id, val) => {
    const value = val === '' ? '' : parseInt(val, 10);
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const addToCart = (product) => {
    const qty = parseInt(quantities[product.id]) || 1;
    if (qty <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => String(item.id) === String(product.id));
      if (existing) {
        return prev.map(item => 
          String(item.id) === String(product.id) ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const handleCheckout = async () => {
    // 1. Get the most recent user data from storage
    const storedUser = JSON.parse(localStorage.getItem('user'));

    // 2. Validate that the user exists AND has an ID from the database
    if (!storedUser || !storedUser.id) {
      console.warn("Checkout blocked: No valid User ID found in session.");
      alert("Session expired or invalid. Please log in again.");
      return navigate('/login');
    }

    try {
      // 3. Process the orders using the validated storedUser.id
      for (const item of cart) {
        await axios.post('http://localhost:3000/api/orders', {
          user_id: storedUser.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        });
      }

      setReceiptData({
        date: new Date().toLocaleString(),
        trx: Math.floor(100000 + Math.random() * 900000)
      });
      setIsCartOpen(false);
      setShowReceipt(true);
    } catch (err) {
      console.error("Checkout API Error:", err);
      alert("Checkout failed. Please check your connection.");
    }
  };

  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
        
        {/* --- HEADER --- */}
        <div className="bg-linear-to-br from-[#4361ee] to-[#3a0ca3] text-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="space-y-3 z-10 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Point of Sale</h1>
            <p className="text-blue-100/80 font-medium">Process orders and manage instant stock deductions</p>
          </div>
          <div className="text-center md:text-right z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Cart Total</p>
            <p className="text-5xl font-black">₱{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* --- ACTION BAR --- */}
        <header className={`sticky top-4 z-40 backdrop-blur-xl border p-4 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 transition-all ${
          isDark ? 'bg-[#111827]/60 border-slate-800' : 'bg-white/80 border-slate-200'
        }`}>
          <div className="relative w-full md:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl pl-12 pr-5 py-3.5 outline-none focus:border-[#4361ee] transition-all text-sm ${
                isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex gap-2 shrink-0">
              {['All', 'Vegetables', 'Fruits', 'Supplies'].map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    activeCategory === cat 
                    ? 'bg-[#4361ee] text-white border-[#4361ee]' 
                    : isDark 
                      ? 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-600'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${
                isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
              }`}
            >
              Cart <span className="bg-[#4361ee] text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px]">{cart.length}</span>
            </button>
          </div>
        </header>

        {/* --- PRODUCT GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(item => (
            <div key={item.id} className={`p-5 rounded-3xl group border transition-all duration-500 flex flex-col hover:shadow-2xl ${
              isDark ? 'bg-[#111827]/40 border-slate-800 hover:border-[#4361ee]/50' : 'bg-white border-slate-200 hover:border-[#4361ee]/30'
            }`}>
              <div className={`relative mb-5 overflow-hidden rounded-2xl aspect-square ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                <img 
                  src={`http://localhost:3000${item.image_url}`} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Product' }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={item.name} 
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                  {item.category}
                </div>
              </div>
              
              <div className="flex-1 space-y-1">
                <h3 className={`text-lg font-black transition-colors ${isDark ? 'text-white group-hover:text-[#4361ee]' : 'text-slate-900 group-hover:text-[#4361ee]'}`}>{item.name}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Stock: <span className={item.quantity < 5 ? 'text-red-500' : 'text-emerald-500'}>{item.quantity} available</span>
                </p>
                <div className={`text-2xl font-black pt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₱{item.price.toFixed(2)}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <input 
                  type="number" 
                  min="1" 
                  value={quantities[item.id] ?? ''} 
                  placeholder="1"
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  className={`w-14 border rounded-xl text-center font-black text-sm focus:border-[#4361ee] outline-none ${
                    isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
                <button 
                  onClick={() => addToCart(item)}
                  disabled={item.quantity <= 0}
                  className="flex-1 bg-[#4361ee] hover:bg-[#3651d4] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all disabled:opacity-30 active:scale-95 shadow-lg shadow-blue-500/10"
                >
                  {item.quantity > 0 ? "Add to Cart" : "Empty"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- CART MODAL --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-1100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`border rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <header className="p-8 border-b border-slate-200 dark:border-slate-800/50 flex justify-between items-center">
              <h2 className={`text-xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Current Order</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">✕</button>
            </header>
            
            <div className="p-8 max-h-100 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-slate-500 font-bold uppercase text-xs">Your cart is empty</div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className={`flex justify-between items-center p-5 rounded-2xl border ${
                    isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <p className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-black">₱{item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#4361ee]">₱{(item.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-[9px] text-red-500 font-black uppercase hover:underline">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={`p-8 border-t ${isDark ? 'bg-[#0b1120]/50 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 font-black uppercase text-[10px]">Total</span>
                <span className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₱{cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-5 rounded-2xl bg-[#4361ee] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 disabled:opacity-50 hover:bg-[#3651d4] transition-all"
              >
                Checkout Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- RECEIPT MODAL --- */}
      {showReceipt && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/80 backdrop-blur-xl">
           <div className="bg-white p-10 rounded-3xl text-black w-full max-w-sm font-mono shadow-2xl relative">
             <div className="absolute top-0 left-0 w-full h-2 bg-[#4361ee]"></div>
             <div className="text-center border-b-2 border-dashed border-slate-200 pb-6 mb-6">
               <h2 className="text-xl font-black">INVENTORY PRO</h2>
               <p className="text-[9px] text-slate-400">TRX: #{receiptData.trx}</p>
               <p className="text-[9px] text-slate-400">{receiptData.date}</p>
             </div>
             <div className="space-y-3 mb-6">
               {cart.map(item => (
                 <div key={item.id} className="flex justify-between text-[11px] uppercase">
                   <span>{item.name} x{item.quantity}</span>
                   <span className="font-bold">₱{(item.price * item.quantity).toFixed(2)}</span>
                 </div>
               ))}
             </div>
             <div className="border-t-2 border-dashed border-slate-200 pt-4 mb-8 flex justify-between font-black text-xl">
               <span>TOTAL</span>
               <span>₱{cartTotal.toFixed(2)}</span>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <button onClick={() => window.print()} className="bg-slate-100 py-3 rounded-lg font-black text-[10px] uppercase hover:bg-slate-200 transition-colors">Print</button>
               <button onClick={() => { setShowReceipt(false); setCart([]); }} className="bg-black text-white py-3 rounded-lg font-black text-[10px] uppercase hover:opacity-80 transition-opacity">Done</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}