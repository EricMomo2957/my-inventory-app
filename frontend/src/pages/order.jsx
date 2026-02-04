import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Get user info from localStorage (Make sure your login stores the 'user' object)
  const user = JSON.parse(localStorage.getItem('user')) || null;
  const isLoggedIn = !!user;

  // 1. Fetch Products from your App.js route
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };
    fetchProducts();
  }, []);

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

  // 2. Modified Checkout to hit your POST /api/orders route
  const handleCheckout = async () => {
    if (!isLoggedIn) {
      alert("Please login to place an order.");
      return navigate('/login');
    }

    try {
      // Loop through cart and send each item to the backend
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
        trx: Math.floor(Math.random() * 1000000)
      });
      setIsCartOpen(false);
      setShowReceipt(true);
    } catch (err) {
      alert("Error placing order: " + err.message);
    }
  };

  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen bg-[#0b1120] text-slate-300 overflow-x-hidden font-sans">
      
      {/* Top Banner for Guests */}
      {!isLoggedIn && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-6 flex justify-center items-center gap-3 sticky top-0 z-50 backdrop-blur-md">
          <p className="text-[11px] font-bold text-amber-200 uppercase tracking-widest">
            Guest Mode: Sign in to finalize transactions. 
            <button onClick={() => navigate('/login')} className="ml-3 text-white underline">Staff Login</button>
          </p>
        </div>
      )}

      {/* Cart Sidebar */}
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
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">{item.name}</h4>
                  <p className="text-xs text-slate-500">₱{item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-red-500 p-2">🗑️</button>
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

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl overflow-hidden flex flex-col text-slate-800 font-mono">
            <div className="p-8 space-y-6">
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-black uppercase">InventoryPro</h2>
                <p className="text-[10px] text-slate-500">{receiptData.date}</p>
              </div>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span>{item.name} x{item.quantity}</span>
                    <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 flex justify-between font-black">
                <span>TOTAL</span>
                <span>₱{cartTotal.toFixed(2)}</span>
              </div>
              <p className="text-center text-[8px] text-slate-400">#TRX-{receiptData.trx}</p>
            </div>
            <button onClick={() => { setShowReceipt(false); setCart([]); }} className="m-4 bg-slate-800 text-white py-3 rounded">Close</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <header className="bg-linear-to-r from-[#4338ca] to-[#6d28d9] rounded-3xl p-10 flex flex-col md:flex-row justify-between items-center shadow-2xl">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Point of Sale</h1>
            <p className="text-indigo-100 text-sm">Select items to build an order.</p>
          </div>
          <div className="text-right">
            <p className="text-6xl font-black text-white tracking-tighter">₱{cartTotal.toLocaleString()}</p>
          </div>
        </header>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <input 
            type="text" placeholder="Search products..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2.5 w-full md:w-96 text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={() => setIsCartOpen(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold">
            Cart ({cart.length})
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2">
          {['All', 'Vegetables', 'Fruits', 'Supplies'].map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-1.5 rounded-full text-[11px] font-bold border ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-[#1e293b] text-slate-400'}`}>{cat}</button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(item => (
            <div key={item.id} className="bg-[#111827] rounded-2xl border border-slate-800 p-4 flex flex-col">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-indigo-500 uppercase">{item.category}</p>
                <h3 className="font-bold text-white text-lg">{item.name}</h3>
                <p className="text-slate-400 text-xs mb-2">Stock: {item.quantity}</p>
                <p className="text-2xl font-black text-white">₱{item.price.toFixed(2)}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <input type="number" min="1" value={quantities[item.id] || 1} onChange={(e) => handleQuantityChange(item.id, e.target.value)} className="w-12 bg-slate-900 border border-slate-700 rounded p-2 text-center text-white" />
                <button onClick={() => addToCart(item)} className="flex-1 bg-indigo-600 text-white text-[10px] font-bold py-3 rounded-lg hover:bg-indigo-500">Add Item</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}