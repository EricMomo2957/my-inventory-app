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

  const user = JSON.parse(localStorage.getItem('user')) || null;
  const isLoggedIn = !!user;

  // --- IMAGE LOGIC ---
  const getLocalImage = (item) => {
    // Converts "Red Apple" to "red-apple.jpg"
    const fileName = item.name.toLowerCase().replace(/\s+/g, '-');
    return `/codepic/${fileName}.jpg`; 
  };

  const handleImgError = (e, category) => {
    // Fallback to category image (e.g., vegetables.jpg)
    e.target.src = `/codepic/${category.toLowerCase()}.jpg`;
    e.target.onerror = () => {
      // Final fallback if category image is also missing
      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
    };
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

  // --- CALCULATIONS ---
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // --- HANDLERS ---
  const handleQuantityChange = (id, val) => {
    const value = parseInt(val);
    setQuantities(prev => ({ ...prev, [id]: value > 0 ? value : 1 }));
  };

  const addToCart = (product) => {
    const qty = quantities[product.id] || 1;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { ...product, quantity: qty }];
    });
    // Reset quantity input for that item after adding
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] text-[#1e293b] dark:text-[#f8fafc] transition-colors duration-300 font-sans pb-10">
      <div className="max-w-[1400px] mx-auto p-5 md:p-8 space-y-6">
        
        {/* --- UPPER HEADER --- */}
        <div className="bg-gradient-to-br from-[#4361ee] to-[#3a0ca3] text-white p-10 rounded-[24px] shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-3 text-center md:text-left">
            <Link to="/" className="text-white/80 hover:text-white flex items-center gap-2 text-sm font-semibold transition-all">
              ← Return to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Point of Sale</h1>
            <p className="opacity-90 max-w-xl text-lg leading-relaxed">
              Serving local images from <code className="bg-black/20 px-2 py-1 rounded">/public/codepic/</code>
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-1">Current Selection</p>
            <p className="text-5xl md:text-6xl font-black drop-shadow-md">₱{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* --- STICKY ACTION BAR --- */}
        <header className="sticky top-5 z-40 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-5 rounded-[20px] shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-[400px]">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f1f5f9] dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-[#4361ee] transition-all"
            />
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full md:w-auto bg-[#4361ee] hover:bg-[#3a0ca3] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
          >
            Review Cart ({cart.length})
          </button>
        </header>

        {/* --- CATEGORY BAR --- */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {['All', 'Vegetables', 'Fruits', 'Supplies'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold border transition-all ${
                activeCategory === cat 
                ? 'bg-[#4361ee] text-white border-[#4361ee]' 
                : 'bg-white dark:bg-[#1e293b] text-slate-500 border-slate-200 dark:border-slate-700 hover:border-[#4361ee]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(item => (
            <div key={item.id} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-5 rounded-[24px] group hover:-translate-y-2 hover:border-[#4361ee] transition-all duration-300 flex flex-col">
              <div className="relative mb-4 overflow-hidden rounded-2xl">
                <img 
                  src={getLocalImage(item)} 
                  onError={(e) => handleImgError(e, item.category)}
                  className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500 bg-slate-100" 
                  alt={item.name} 
                />
                <span className="absolute top-3 left-3 bg-[#4361ee]/20 backdrop-blur-md text-[#4361ee] px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                  {item.category}
                </span>
              </div>
              
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{item.name}</h3>
                <div className="inline-block bg-[#4361ee]/10 text-[#4361ee] px-3 py-1 rounded-md text-xs font-bold">
                  Stock: {item.quantity}
                </div>
                <div className="text-3xl font-black text-[#4361ee] pt-2">
                  ₱{item.price.toFixed(2)}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <input 
                  type="number" 
                  min="1" 
                  value={quantities[item.id] || 1}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  className="w-16 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold"
                />
                <button 
                  onClick={() => addToCart(item)}
                  disabled={item.quantity <= 0}
                  className="flex-1 bg-[#4361ee] hover:bg-[#3a0ca3] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest transition-all disabled:bg-slate-300 shadow-lg shadow-indigo-500/10"
                >
                  {item.quantity > 0 ? "Add Item" : "Sold Out"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- CART MODAL --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1e293b] rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <header className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-black">Order Summary</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-3xl text-slate-400 hover:text-red-500 transition-colors">✕</button>
            </header>
            
            <div className="p-8 max-h-[400px] overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-10 opacity-50 font-bold">Your cart is empty</div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-[#f8fafc] dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-black text-slate-800 dark:text-white">{item.name}</p>
                      <p className="text-xs text-slate-500 font-bold">₱{item.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#4361ee]">₱{(item.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-[10px] text-red-500 font-bold uppercase underline">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-[#f8fafc] dark:bg-[#162033] border-t border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total Amount</span>
                <span className="text-3xl font-black text-[#4361ee]">₱{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsCartOpen(false)} className="py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-bold hover:bg-white transition-colors">Edit Cart</button>
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="py-4 rounded-2xl bg-[#4361ee] text-white font-black hover:bg-[#3a0ca3] transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                >
                  Complete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- RECEIPT MODAL --- */}
      {showReceipt && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-md animate-in fade-in">
           <div className="bg-white p-10 rounded-xl text-black w-full max-w-md font-mono shadow-2xl relative overflow-hidden">
              {/* Receipt Decoration */}
              <div className="absolute top-0 left-0 w-full h-2 bg-[#4361ee]"></div>
              
              <div className="text-center border-b-2 border-dashed border-slate-200 pb-6 mb-6">
                <h2 className="text-2xl font-black tracking-tighter">INVENTORY PRO</h2>
                <p className="text-xs uppercase font-bold text-slate-500">Official Order Receipt</p>
                <p className="text-[10px] text-slate-400 mt-1">{receiptData.date}</p>
              </div>

              <div className="space-y-3 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="uppercase">{item.name} <span className="text-slate-400 text-xs">x{item.quantity}</span></span>
                    <span className="font-bold">₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-slate-200 pt-4 mb-6 flex justify-between font-black text-2xl">
                <span>TOTAL</span>
                <span>₱{cartTotal.toFixed(2)}</span>
              </div>

              <div className="text-center text-[10px] text-slate-400 mb-8">
                TRANSACTION ID: #{receiptData.trx}<br/>
                THANK YOU FOR YOUR PURCHASE!
              </div>

              <div className="grid grid-cols-2 gap-3 print:hidden">
                <button 
                  onClick={printReceipt} 
                  className="bg-slate-100 text-slate-800 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                >
                  PRINT
                </button>
                <button 
                  onClick={() => { setShowReceipt(false); setCart([]); }} 
                  className="bg-black text-white py-3 rounded-lg font-bold hover:opacity-80 transition-opacity"
                >
                  CLOSE
                </button>
              </div>
           </div>
        </div>
      )}
      
      {/* Styles for Printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .fixed.inset-0.z-\\[110\\] { position: absolute; left: 0; top: 0; width: 100%; visibility: visible; }
          .fixed.inset-0.z-\\[110\\] * { visibility: visible; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}