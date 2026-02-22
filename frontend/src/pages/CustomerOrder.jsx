import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function CustomerOrder() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Removed setActiveCategory as it was unused in the logic
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);

  // Removed navigate and isDarkMode as they were unused
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await axios.get('http://localhost:3000/api/products');
        setProducts(prodRes.data.map(p => ({ ...p, price: parseFloat(p.price) || 0 })));
        
        if(userId) {
            const orderRes = await axios.get(`http://localhost:3000/api/orders?user_id=${userId}`);
            setOrderHistory(orderRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [userId]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleCheckout = async () => {
    if (!userId) return alert("Please login first!");
    if (cart.length === 0) return alert("Cart is empty!");

    setIsSubmitting(true);
    try {
      for (const item of cart) {
        await axios.post('http://localhost:3000/api/orders', {
          user_id: userId,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        });
      }
      alert("Order Successful!");
      window.location.reload(); 
    } catch (checkoutError) { // Renamed 'err' to 'checkoutError' and used it
      console.error(checkoutError);
      alert("Checkout failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 flex flex-col min-h-screen bg-[#0b1120] text-white font-sans">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-4xl bg-[#1e293b] p-3 rounded-2xl shadow-inner">🛒</span>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Marketplace</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Select products to place your order directly.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="bg-[#1e293b]/50 border border-slate-700/50 rounded-xl px-5 py-3 text-sm text-white w-72 outline-none focus:border-[#4361ee] transition-all shadow-lg"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleCheckout}
            disabled={isSubmitting || cart.length === 0}
            className="bg-[#4361ee] hover:bg-[#3a56d4] disabled:opacity-50 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20"
          >
            {isSubmitting ? 'Processing...' : `Place Order (${cart.length})`}
          </button>
        </div>
      </header>

      {/* PRODUCT GRID SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-[#111827]/50 border border-slate-800/50 p-4 rounded-3xl hover:border-[#4361ee]/50 transition-all group">
            <div className="h-40 bg-slate-800 rounded-2xl mb-4 overflow-hidden">
               <img 
                 src={`/codepic/${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`} 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                 alt={product.name}
                 onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
               />
            </div>
            <h3 className="font-bold text-lg mb-1">{product.name}</h3>
            <div className="flex justify-between items-center">
              <span className="text-[#4361ee] font-black text-xl">₱{product.price}</span>
              <button 
                onClick={() => addToCart(product)}
                className="bg-[#1e293b] hover:bg-[#4361ee] p-2 px-4 rounded-xl text-[10px] font-black uppercase transition-all"
              >
                + Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ORDER HISTORY TABLE */}
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-black tracking-tight">Your Recent Orders</h2>
        {/* Fixed: h-[1px] changed to h-px per error console */}
        <div className="h-px flex-1 bg-slate-800 ml-4"></div>
      </div>

      <div className="bg-[#111827]/50 rounded-3xl border border-slate-800/50 overflow-hidden shadow-2xl flex flex-col mb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0b1120] text-[11px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-800">
              <tr>
                <th className="p-5 px-6">Order ID</th>
                <th className="p-5 px-6">Product</th>
                <th className="p-5 px-6">Category</th>
                <th className="p-5 px-6 text-center">Qty</th>
                <th className="p-5 px-6">Total</th>
                <th className="p-5 px-6">Date</th>
                <th className="p-5 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {orderHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-500 font-bold uppercase text-xs">No orders placed yet</td>
                </tr>
              ) : (
                orderHistory.map((order, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-5 px-6 font-bold text-[#4361ee] text-sm">#ORD-{order.id}</td>
                    <td className="p-5 px-6 text-white font-black text-sm">{order.product_name || "Product"}</td>
                    <td className="p-5 px-6">
                      <span className="bg-[#1e293b] text-slate-300 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase border border-slate-700/50">
                        {order.category || 'General'}
                      </span>
                    </td>
                    <td className="p-5 px-6 text-center text-white font-black text-base">{order.quantity}</td>
                    <td className="p-5 px-6 text-white font-black text-sm">₱{parseFloat(order.total_amount).toLocaleString()}</td>
                    <td className="p-5 px-6 text-slate-500 text-[11px] font-medium">{new Date(order.order_date).toLocaleString()}</td>
                    <td className="p-5 px-6 text-center">
                      <span className="bg-emerald-500/10 text-[#a7f3d0] border border-emerald-500/20 px-4 py-1 rounded-full text-[9px] font-black tracking-tighter">
                        {order.status || 'COMPLETED'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}