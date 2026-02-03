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
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState({ date: '', trx: '' });
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('userToken');
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // FIXED: Transaction ID is now generated inside an event handler, making it pure.
  const handleCheckout = () => {
    setReceiptData({
      date: new Date().toLocaleString(),
      trx: Math.floor(Math.random() * 1000000)
    });
    setIsCartOpen(false);
    setShowReceipt(true);
  };

  const filteredProducts = PRODUCTS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen bg-[#0b1120] text-slate-300 overflow-x-hidden font-sans">
      
      {!isLoggedIn && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-6 flex justify-center items-center gap-3 sticky top-0 z-50 backdrop-blur-md">
          <p className="text-[11px] font-bold text-amber-200 uppercase tracking-widest">
            Guest Mode: Sign in to finalize transactions. 
            <button onClick={() => navigate('/login')} className="ml-3 text-white underline">Staff Login</button>
          </p>
        </div>
      )}

      {/* LINT FIX: z-90 instead of z-[90] */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-[#111827] shadow-2xl z-90 transform transition-transform duration-300 ease-in-out border-l border-slate-800 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#1e293b]">
          <h2 className="text-xl font-black text-white">Review Cart</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white text-2xl">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-500">Your cart is empty</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 bg-[#0b1120] p-3 rounded-xl border border-slate-800">
                <img src={item.img} className="w-16 h-16 rounded-lg object-cover" alt="" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">{item.name}</h4>
                  <p className="text-xs text-slate-500">₱{item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-2">🗑️</button>
              </div>
            ))
          )}
        </div>
        <div className="p-6 bg-[#1e293b] border-t border-slate-800 space-y-4">
          <div className="flex justify-between items-center text-white">
            <span className="font-bold uppercase text-xs">Total</span>
            <span className="text-2xl font-black">₱{cartTotal.toLocaleString()}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl disabled:opacity-50"
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>

      {/* LINT FIX: z-150 instead of z-[150] */}
      {showReceipt && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl overflow-hidden flex flex-col text-slate-800 font-mono">
            <div className="h-2 bg-[repeating-linear-gradient(45deg,#e2e8f0,#e2e8f0_10px,#fff_10px,#fff_20px)] w-full"></div>
            <div className="p-8 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-black uppercase tracking-tighter">InventoryPro</h2>
                <p className="text-[10px] text-slate-500">Official Transaction Record</p>
                <p className="text-[10px] text-slate-400 mt-1">{receiptData.date}</p>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-4 space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="flex-1">{item.name} x{item.quantity}</span>
                    <span className="font-bold">₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-800 pt-4">
                <div className="flex justify-between text-sm font-black">
                  <span>TOTAL</span>
                  <span>₱{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="text-center pt-4">
                <div className="h-8 w-32 mx-auto bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px)]"></div>
                {/* LINT FIX: receiptData.trx is now stable */}
                <p className="text-[8px] mt-2 font-bold text-slate-400">#TRX-{receiptData.trx}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 flex gap-2">
              <button onClick={() => { setShowReceipt(false); setCart([]); }} className="flex-1 bg-slate-800 text-white text-xs font-bold py-3 rounded">Close</button>
              <button onClick={() => window.print()} className="bg-indigo-600 text-white text-xs font-bold px-4 py-3 rounded">Print</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* LINT FIX: bg-linear-to-r instead of bg-gradient-to-r */}
        <section className="bg-linear-to-r from-[#4338ca] to-[#6d28d9] rounded-3xl p-10 flex flex-col md:flex-row justify-between items-center shadow-2xl">
          <div className="z-10">
            <button onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')} className="text-xs font-bold text-indigo-200 mb-4 hover:text-white">← Back</button>
            <h1 className="text-4xl font-black text-white mb-2">Point of Sale</h1>
            <p className="text-indigo-100 text-sm">Select items to build an order.</p>
          </div>
          <div className="text-right z-10">
            <p className="text-xs font-bold text-indigo-200 uppercase mb-1">Subtotal</p>
            <p className="text-6xl font-black text-white tracking-tighter">₱{cartTotal.toLocaleString()}</p>
          </div>
        </section>

        {/* Search and Review */}
        <div className="bg-[#111827]/50 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <input 
            type="text" placeholder="Search products..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2.5 w-full md:w-96 text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={() => setIsCartOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-8 py-3 rounded-lg shadow-lg">
            Review Cart ({cart.length})
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 py-2">
          {['All', 'Vegetables', 'Fruits', 'Supplies'].map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-1.5 rounded-full text-[11px] font-bold border ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-[#1e293b] text-slate-400'}`}>{cat}</button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(item => (
            <div key={item.id} className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden flex flex-col p-4">
              <img src={item.img} className="h-40 w-full object-cover rounded-xl mb-4" alt="" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-indigo-500 uppercase">{item.category}</p>
                <h3 className="font-bold text-white text-lg">{item.name}</h3>
                <p className="text-2xl font-black text-white mt-2">₱{item.price.toFixed(2)}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <input type="number" min="1" value={quantities[item.id] || 1} onChange={(e) => handleQuantityChange(item.id, e.target.value)} className="w-12 bg-slate-900 border border-slate-700 rounded p-2 text-center text-white" />
                <button onClick={() => addToCart(item)} className="flex-1 bg-indigo-600 text-white text-[10px] font-bold py-3 rounded-lg">Add Item</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LINT FIX: z-80 instead of z-[80] */}
      {isCartOpen && <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-80" />}
    </div>
  );
}