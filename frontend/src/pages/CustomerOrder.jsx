import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function CustomerOrder() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const isDarkMode = localStorage.getItem('landingTheme') === 'dark';

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/products');
        setProducts(res.data.map(p => ({ ...p, price: parseFloat(p.price) || 0 })));
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleQuantityChange = (id, val) => {
    const value = val === '' ? '' : parseInt(val, 10);
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const addToCart = (product) => {
    const qty = parseInt(quantities[product.id]) || 1;
    setCart(prev => {
      const existing = prev.find(item => String(item.id) === String(product.id));
      if (existing) {
        return prev.map(item => String(item.id) === String(product.id) 
          ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { ...product, quantity: qty }];
    });
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#0b1120] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Navigation Header */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md border-b ${isDarkMode ? 'bg-[#0b1120]/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black tracking-tighter">
            Inventory<span className="text-blue-600">Pro</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-bold hover:text-blue-600 transition-colors">Login</Link>
            <div className="relative group">
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
                🛒 Cart <span>({cart.length})</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 lg:p-10 flex flex-col lg:flex-row gap-10">
        
        {/* Main Product Section */}
        <div className="flex-1 space-y-8">
          <header>
            <h1 className="text-4xl font-black mb-2">Our Products</h1>
            <p className="opacity-60 font-medium">Fresh items available for order today.</p>
          </header>

          {/* Search & Categories */}
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text"
              placeholder="Search items..."
              className={`flex-1 px-6 py-4 rounded-2xl border outline-none focus:border-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['All', 'Vegetables', 'Fruits', 'Supplies'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${activeCategory === cat ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map(item => (
              <div key={item.id} className={`p-4 rounded-3xl border transition-all hover:shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="aspect-square rounded-2xl bg-slate-200 mb-4 overflow-hidden">
                  <img src={`/codepic/${item.name.toLowerCase().replace(/\s+/g, '-')}.jpg`} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-2xl font-black text-blue-600 mb-4">₱{item.price.toFixed(2)}</p>
                
                <div className="flex gap-2">
                  <input 
                    type="number" min="1" value={quantities[item.id] ?? ''} placeholder="1"
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className="w-16 rounded-xl text-center font-bold bg-slate-100 text-black"
                  />
                  <button 
                    onClick={() => addToCart(item)}
                    className="flex-1 bg-slate-900 text-white dark:bg-blue-600 py-3 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Cart Summary */}
        <aside className={`w-full lg:w-96 h-fit sticky top-28 p-8 rounded-4xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h2 className="text-xl font-black mb-6 flex justify-between">
            Your Order
            <span className="text-blue-600">₱{cartTotal.toFixed(2)}</span>
          </h2>
          
          <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2">
            {cart.length === 0 ? (
              <p className="text-center py-10 opacity-40 text-sm font-bold">Your cart is empty</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="opacity-50">x{item.quantity}</p>
                  </div>
                  <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-red-500 text-xs font-bold">Remove</button>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors"
          >
            Checkout Now
          </button>
        </aside>

      </div>
    </div>
  );
}