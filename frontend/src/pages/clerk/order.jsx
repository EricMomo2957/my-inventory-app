import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Order() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState({ date: '', trx: '' });
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  // Handle Theme (Sync with global)
  const isDarkMode = localStorage.getItem('landingTheme') === 'dark';
  const user = JSON.parse(localStorage.getItem('user')) || null;
  const isLoggedIn = !!user;

  // --- IMAGE LOGIC (FIXED) ---
  const getProductImage = (item) => {
    // 1. If your database has an image path (e.g., /uploads/image.jpg), use it
    if (item.image_url) {
      return `http://localhost:3000${item.image_url}`;
    }

    // 2. Fallback: Use the product name to find a file in /public/codepic/
    // This converts "Soap Item" to "soap-item.jpg"
    const fileName = item.name?.toLowerCase().trim().replace(/\s+/g, '-') || 'default';
    return `/codepic/${fileName}.jpg`; 
  };

  const handleImgError = (e, category) => {
    // Try to use a category-based fallback image first (e.g., vegetables.jpg)
    const categoryImg = `/codepic/${category?.toLowerCase() || 'default'}.jpg`;
    
    // Prevent infinite loops if the category image is also missing
    if (e.target.src.includes(categoryImg)) {
      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
    } else {
      e.target.src = categoryImg;
    }
  };

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
          String(item.id) === String(product.id) 
            ? { ...item, quantity: item.quantity + qty } 
            : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });

    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      alert("Please login to place an order.");
      return navigate('/login');
    }
    try {
      for (const item of cart) {
        await axios.post('http://localhost:3000/api/orders', {
          user_id: user.id,
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
      alert("Checkout failed: " + (err.response?.data?.message || err.message));
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`w-full transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
        
        {/* --- HEADER --- */}
        <div className="bg-linear-to-br from-[#4361ee] to-[#3a0ca3] text-white p-10 rounded-4xl shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="space-y-3 z-10 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Point of Sale</h1>
            <p className="text-blue-100/80 font-medium">Process orders and manage instant stock deductions</p>
          </div>
          <div className="text-center md:text-right z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Total Balance</p>
            <p className="text-5xl font-black">₱{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* --- ACTION BAR --- */}
        <header className="sticky top-4 z-40 backdrop-blur-xl bg-[#111827]/60 border border-slate-800 p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b1120] border border-slate-800 rounded-xl pl-12 pr-5 py-3.5 outline-none focus:border-[#4361ee] transition-all text-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {['All', 'Vegetables', 'Fruits', 'Supplies'].map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    activeCategory === cat 
                    ? 'bg-[#4361ee] text-white border-[#4361ee]' 
                    : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="bg-white text-black px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-2 shrink-0"
            >
              Cart <span className="bg-[#4361ee] text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px]">{cart.length}</span>
            </button>
          </div>
        </header>

        {/* --- PRODUCT GRID (UPDATED) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(item => (
            <div key={item.id} className="bg-[#111827]/40 backdrop-blur-md border border-slate-800 p-5 rounded-3xl group hover:border-[#4361ee]/50 transition-all duration-500 flex flex-col hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="relative mb-5 overflow-hidden rounded-2xl aspect-square">
                <img 
                  src={getProductImage(item)} 
                  onError={(e) => handleImgError(e, item.category)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 bg-slate-900" 
                  alt={item.name} 
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                  {item.category}
                </div>
              </div>
              
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-black text-white group-hover:text-[#4361ee] transition-colors">{item.name}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Stock: <span className={item.quantity < 5 ? 'text-red-500' : 'text-emerald-500'}>{item.quantity} available</span>
                </p>
                <div className="text-2xl font-black text-white pt-2">
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
                  className="w-14 bg-[#0b1120] border border-slate-800 rounded-xl text-center font-black text-sm text-white focus:border-[#4361ee] outline-none"
                />
                <button 
                  onClick={() => addToCart(item)}
                  disabled={item.quantity <= 0}
                  className="flex-1 bg-[#4361ee] hover:bg-[#3651d4] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all disabled:bg-slate-800 disabled:text-slate-600 shadow-xl shadow-blue-500/10 active:scale-95"
                >
                  {item.quantity > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- CART MODAL --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#111827] border border-slate-800 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <header className="p-8 border-b border-slate-800/50 flex justify-between items-center">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Current Order</h2>
              <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center transition-colors">✕</button>
            </header>
            
            <div className="p-8 max-h-100 overflow-y-auto space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-slate-500 font-bold uppercase text-xs tracking-widest">Your cart is empty</div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-[#0b1120] p-5 rounded-2xl border border-slate-800">
                    <div>
                      <p className="font-black text-white text-sm">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase">₱{item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#4361ee]">₱{(item.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-[9px] text-red-500 font-black uppercase tracking-tighter hover:underline">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-[#0b1120]/50 border-t border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Grand Total</span>
                <span className="text-3xl font-black text-white">₱{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-5 rounded-2xl bg-[#4361ee] text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-[#3651d4] transition-all shadow-2xl shadow-blue-500/20 disabled:opacity-20"
              >
                Complete Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- RECEIPT MODAL --- */}
      {showReceipt && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in">
             <div className="bg-white p-10 rounded-4xl text-black w-full max-w-sm font-mono shadow-2xl relative overflow-hidden receipt-container">
               <div className="absolute top-0 left-0 w-full h-3 bg-[#4361ee]"></div>
               
               <div className="text-center border-b-2 border-dashed border-slate-200 pb-6 mb-6">
                 <h2 className="text-2xl font-black tracking-tighter">INVENTORY PRO</h2>
                 <p className="text-[9px] uppercase font-black text-slate-400">Order ID: #{receiptData.trx}</p>
                 <p className="text-[9px] text-slate-400 mt-1">{receiptData.date}</p>
               </div>

               <div className="space-y-3 mb-6">
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between text-[11px] uppercase">
                     <span>{item.name} <span className="text-slate-400 ml-1">x{item.quantity}</span></span>
                     <span className="font-bold">₱{(item.price * item.quantity).toFixed(2)}</span>
                   </div>
                 ))}
               </div>

               <div className="border-t-2 border-dashed border-slate-200 pt-4 mb-8 flex justify-between font-black text-2xl">
                 <span>TOTAL</span>
                 <span>₱{cartTotal.toFixed(2)}</span>
               </div>

               <div className="grid grid-cols-2 gap-3 print:hidden">
                 <button 
                   onClick={printReceipt}
                   className="bg-slate-100 text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                 >
                   Print
                 </button>
                 <button 
                   onClick={() => { setShowReceipt(false); setCart([]); }} 
                   className="bg-black text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-80 transition-opacity"
                 >
                   Done
                 </button>
               </div>
             </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .receipt-container, .receipt-container * { visibility: visible; }
          .receipt-container { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            max-width: 100%; 
            box-shadow: none;
            border-radius: 0;
            padding: 20px;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}