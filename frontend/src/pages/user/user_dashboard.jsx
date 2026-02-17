import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserSidenav from './UserSidenav'; 
import UserCalendarView from './user_calendar';

export default function UserDashboard() {
  const navigate = useNavigate();

  // --- State ---
  const [user, setUser] = useState({ name: "User", role: "Customer" });
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('userCart')) || []);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('userFavorites')) || []);
  const [currentView, setCurrentView] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDarkMode] = useState(localStorage.getItem('landingTheme') === 'dark');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Initialization ---
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    setUser({ 
      name: localStorage.getItem('userName') || "User", 
      role: localStorage.getItem('userRole') || "Customer" 
    });
    
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Load failed", err);
      }
    };

    fetchProducts();

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, navigate]);

  // --- Logic Helpers ---
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesView = currentView !== 'favorites' || favorites.includes(p.id);
    return matchesSearch && matchesCategory && matchesView;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // --- Handlers ---
  const toggleFavorite = (id) => {
    const updated = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('userFavorites', JSON.stringify(updated));
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    let updatedCart;

    if (existing) {
      if (existing.qty < product.quantity) {
        updatedCart = cart.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        alert("Stock limit reached!");
        return;
      }
    } else {
      updatedCart = [...cart, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        img: product.image_url, 
        qty: 1 
      }];
    }
    setCart(updatedCart);
    localStorage.setItem('userCart', JSON.stringify(updatedCart));
  };

  const updateCartQty = (id, delta) => {
    const product = products.find(p => p.id === id);
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty > 0 && newQty <= (product?.quantity || 999)) return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0);

    setCart(updatedCart);
    localStorage.setItem('userCart', JSON.stringify(updatedCart));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    const userId = localStorage.getItem('userId');

    try {
      for (const item of cart) {
        await axios.post('http://localhost:3000/api/orders', {
          user_id: userId,
          product_id: item.id,
          quantity: item.qty,
          price: item.price
        });
      }
      alert("Order Successful!");
      setCart([]);
      localStorage.removeItem('userCart');
      setIsCartOpen(false);
      const res = await axios.get('http://localhost:3000/api/products');
      setProducts(res.data);
    } catch {
      alert("Checkout failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={`flex min-h-screen overflow-x-hidden ${isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar Component */}
      <UserSidenav 
        user={user} 
        onLogout={logout} 
        setCurrentView={setCurrentView} 
      />

      {/* Main Content Area */}
      <main className="flex-1 p-10">
        {currentView === 'calendar' ? (
          <UserCalendarView /> 
        ) : (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-black">
                {currentView === 'all' ? 'Welcome back! 👋' : 'Your Favorites ❤️'}
              </h1>
              <p className="text-slate-500 font-medium">
                {currentView === 'all' ? 'Discover our latest inventory.' : 'Items you have saved for later.'}
              </p>
            </header>

            {/* Toolbar */}
            <div className={`flex gap-4 p-4 rounded-2xl mb-8 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="grow relative">
                <span className="absolute left-4 top-3 opacity-50">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className={`w-full pl-12 pr-4 py-2.5 rounded-xl border outline-none focus:border-[#4361ee] transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className={`px-4 py-2.5 rounded-xl border outline-none font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {filteredProducts.map(product => {
                const isOut = product.quantity <= 0;
                const isFav = favorites.includes(product.id);
                return (
                  <div key={product.id} className={`group relative p-4 rounded-3xl border transition-all hover:-translate-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl'}`}>
                    <button 
                      onClick={() => toggleFavorite(product.id)}
                      className={`absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-90 ${isFav ? 'bg-red-50 text-red-500' : 'bg-white text-slate-300'}`}
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                    
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100">
                      <img 
                        src={product.image_url || 'https://via.placeholder.com/300?text=No+Image'} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
                    <p className={`text-xs font-black mb-4 ${isOut ? 'text-red-500' : 'text-slate-400'}`}>
                      {isOut ? 'OUT OF STOCK' : `STOCK: ${product.quantity}`}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-xl font-black text-[#4361ee]">₱{parseFloat(product.price).toLocaleString()}</span>
                      <button 
                        disabled={isOut}
                        onClick={() => addToCart(product)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${isOut ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#4361ee] text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'}`}
                      >
                        {isOut ? 'Sold Out' : '+ Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Cart Button & Sidebar Logic remains below */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#4361ee] text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center text-2xl hover:scale-110 transition-transform z-40"
      >
        🛒
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-white">
            {cartCount}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-80 z-50 transition-transform duration-500 transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} ${isDarkMode ? 'bg-[#0b1120] border-l border-slate-800' : 'bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)]'}`}>
        <div className="flex flex-col h-full p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black">Your Cart</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-3xl text-slate-400 hover:text-slate-600">&times;</button>
          </div>

          <div className="grow overflow-y-auto space-y-4 pr-2">
            {cart.length === 0 ? (
              <div className="text-center py-20 opacity-40">
                <span className="text-6xl block mb-4">🛒</span>
                <p className="font-bold">Your cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className={`flex items-center gap-4 p-3 rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
                  <img src={item.img || 'https://via.placeholder.com/50'} className="w-14 h-14 rounded-xl object-cover" alt="" />
                  <div className="grow">
                    <h4 className="font-bold text-sm truncate w-24">{item.name}</h4>
                    <p className="text-[#4361ee] font-black text-sm">₱{(item.price * item.qty).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateCartQty(item.id, -1)} className="font-black text-[#4361ee] hover:bg-blue-100 w-6 h-6 rounded-lg">-</button>
                    <span className="text-xs font-black">{item.qty}</span>
                    <button onClick={() => updateCartQty(item.id, 1)} className="font-black text-[#4361ee] hover:bg-blue-100 w-6 h-6 rounded-lg">+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Total Amount</span>
              <span className="text-2xl font-black text-[#4361ee]">₱{cartTotal.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className={`w-full py-4 rounded-2xl font-black text-white transition-all ${cart.length === 0 ? 'bg-slate-700 text-slate-500' : 'bg-[#4361ee] hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95'}`}
            >
              {isProcessing ? 'Processing...' : 'Complete Purchase'}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}
    </div>
  );
}