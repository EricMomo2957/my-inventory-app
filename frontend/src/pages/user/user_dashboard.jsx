import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // --- State ---
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('userCart')) || []);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('userFavorites')) || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // NEW STATE: Tracks chosen quantity for each product card
  const [selectedQtys, setSelectedQtys] = useState({});

  // --- Initialization ---
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }
    
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/products');
        setProducts(res.data);
        
        // Initialize default qty of 1 for all products
        const initialQtys = {};
        res.data.forEach(p => initialQtys[p.id] = 1);
        setSelectedQtys(initialQtys);
      } catch (err) {
        console.error("Load failed", err);
      }
    };

    fetchProducts();
  }, [navigate]);

  // --- Logic Helpers ---
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // --- Handlers ---
  const handleLocalQtyChange = (productId, delta, maxStock) => {
    setSelectedQtys(prev => {
      const current = prev[productId] || 1;
      const next = current + delta;
      if (next >= 1 && next <= maxStock) {
        return { ...prev, [productId]: next };
      }
      return prev;
    });
  };

  const toggleFavorite = (id) => {
    const updated = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('userFavorites', JSON.stringify(updated));
  };

  const addToCart = (product) => {
    const chosenQty = selectedQtys[product.id] || 1;
    const existing = cart.find(item => item.id === product.id);
    let updatedCart;

    if (existing) {
      const newTotalQty = existing.qty + chosenQty;
      if (newTotalQty <= product.quantity) {
        updatedCart = cart.map(item => 
          item.id === product.id ? { ...item, qty: newTotalQty } : item
        );
      } else {
        alert(`Stock limit reached! You already have ${existing.qty} in cart.`);
        return;
      }
    } else {
      updatedCart = [...cart, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        img: product.image_url, 
        qty: chosenQty 
      }];
    }
    setCart(updatedCart);
    localStorage.setItem('userCart', JSON.stringify(updatedCart));
    
    // Reset the card qty back to 1 after adding
    setSelectedQtys(prev => ({ ...prev, [product.id]: 1 }));
  };

  const updateCartQty = (id, delta) => {
    const product = products.find(p => p.id === id);
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty > 0 && (newQty <= (product?.quantity || 999))) return { ...item, qty: newQty };
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
    setCart([]);
    localStorage.removeItem('userCart');
    setIsCartOpen(false);
    navigate('/Orders'); 
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Checkout failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-10 transition-colors duration-500 ${
      isDark ? 'bg-[#0b1120]' : 'bg-slate-50'
    }`}>
      <header className="mb-8">
        <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Welcome back! 👋
        </h1>
        <p className="text-slate-500 font-medium">Discover our latest inventory.</p>
      </header>

      {/* Toolbar */}
      <div className={`flex gap-4 p-4 rounded-2xl mb-8 border transition-all ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="grow relative">
          <span className="absolute left-4 top-3 opacity-50">🔍</span>
          <input 
            type="text" 
            placeholder="Search products..." 
            className={`w-full pl-12 pr-4 py-2.5 rounded-xl border outline-none focus:border-[#4361ee] transition-all ${
              isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'
            }`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className={`px-4 py-2.5 rounded-xl border outline-none font-bold transition-all ${
            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat} className={isDark ? 'bg-slate-900' : 'bg-white'}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {filteredProducts.map(product => {
          const isOut = product.quantity <= 0;
          const isFav = favorites.includes(product.id);
          const currentQty = selectedQtys[product.id] || 1;

          return (
            <div key={product.id} className={`group relative p-4 rounded-3xl border transition-all hover:-translate-y-2 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl text-slate-900'
            }`}>
              <button 
                onClick={() => toggleFavorite(product.id)}
                className={`absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-90 ${
                  isFav ? 'bg-red-50 text-red-500' : 'bg-white text-slate-300'
                }`}
              >
                {isFav ? '❤️' : '🤍'}
              </button>
              
              <div className={`aspect-square rounded-2xl overflow-hidden mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <img 
                  src={product.image_url ? `http://localhost:3000${product.image_url}` : 'https://via.placeholder.com/300?text=No+Image'} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
              <p className={`text-xs font-black mb-4 ${isOut ? 'text-red-500' : 'text-slate-400'}`}>
                {isOut ? 'OUT OF STOCK' : `STOCK: ${product.quantity}`}
              </p>

              {/* NEW QUANTITY SELECTOR UI */}
              {!isOut && (
                <div className={`flex items-center justify-between mb-4 p-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                   <span className="text-[10px] font-black uppercase opacity-50 ml-2">Qty</span>
                   <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleLocalQtyChange(product.id, -1, product.quantity)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-[#4361ee] font-black hover:bg-blue-50"
                      >
                        -
                      </button>
                      <span className="font-bold min-w-5 text-center">{currentQty}</span>
                      <button 
                        onClick={() => handleLocalQtyChange(product.id, 1, product.quantity)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#4361ee] text-white font-black hover:bg-blue-600 shadow-md"
                      >
                        +
                      </button>
                   </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold opacity-40">Subtotal</span>
                  <span className="text-xl font-black text-[#4361ee]">₱{(product.price * currentQty).toLocaleString()}</span>
                </div>
                <button 
                  disabled={isOut}
                  onClick={() => addToCart(product)}
                  className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    isOut 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-[#4361ee] text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95'
                  }`}
                >
                  {isOut ? 'Sold Out' : '+ Cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Button */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#4361ee] text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center text-2xl hover:scale-110 transition-transform z-40"
      >
        🛒
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-50 text-red-500 text-[10px] font-black px-2 py-1 rounded-full border-2 border-[#4361ee]">
            {cartCount}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-80 z-50 transition-transform duration-500 transform ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      } ${
        isDark 
        ? 'bg-[#0b1120] border-l border-slate-800 text-white' 
        : 'bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] text-slate-900'
      }`}>
        <div className="flex flex-col h-full p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black">Your Cart</h2>
            <button 
              onClick={() => setIsCartOpen(false)} 
              className={`text-3xl transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
            >
              &times;
            </button>
          </div>

          <div className="grow overflow-y-auto space-y-4 pr-2">
            {cart.length === 0 ? (
              <div className="text-center py-20 opacity-40">
                <span className="text-6xl block mb-4">🛒</span>
                <p className="font-bold">Your cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className={`flex items-center gap-4 p-3 rounded-2xl border transition-colors ${
                  isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'
                }`}>
                  <img src={item.img ? `http://localhost:3000${item.img}` : 'https://via.placeholder.com/50'} className="w-14 h-14 rounded-xl object-cover" alt="" />
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

          <div className={`mt-8 pt-8 border-t-2 border-dashed ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Total Amount</span>
              <span className="text-2xl font-black text-[#4361ee]">₱{cartTotal.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className={`w-full py-4 rounded-2xl font-black text-white transition-all ${
                cart.length === 0 ? 'bg-slate-700 text-slate-500' : 'bg-[#4361ee] hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95'
              }`}
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