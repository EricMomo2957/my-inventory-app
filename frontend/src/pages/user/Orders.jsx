import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext'; // Adjust path if necessary

export default function Orders() {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  // Keep your existing data
  const [orders, setOrders] = useState([
    { id: "#ORD-57", product: "Logos", category: "supplies", qty: 8, unitPrice: 50, total: 400, date: "1/24/2026, 9:39:13 PM", status: "COMPLETED" },
    { id: "#ORD-42", product: "Logos", category: "supplies", qty: 100, unitPrice: 50, total: 5000, date: "1/22/2026, 10:21:17 PM", status: "COMPLETED" },
    { id: "#ORD-41", product: "pinetree", category: "Supplies", qty: 15, unitPrice: 150, total: 2250, date: "1/22/2026, 10:20:50 PM", status: "COMPLETED" },
    { id: "#ORD-41", product: "pinya", category: "Fruits", qty: 9, unitPrice: 15, total: 135, date: "1/22/2026, 10:20:50 PM", status: "COMPLETED" },
    { id: "#ORD-41", product: "make-up", category: "Supplies", qty: 10, unitPrice: 150, total: 1500, date: "1/22/2026, 10:20:50 PM", status: "COMPLETED" },
    { id: "#ORD-41", product: "Meme pictures", category: "Supplies", qty: 70, unitPrice: 50, total: 3500, date: "1/22/2026, 10:20:50 PM", status: "COMPLETED" },
    { id: "#ORD-41", product: "Soap", category: "Supplies", qty: 1, unitPrice: 15, total: 15, date: "1/22/2026, 10:20:50 PM", status: "COMPLETED" },
    { id: "#ORD-41", product: "Petchay", category: "Vegetables", qty: 4, unitPrice: 10, total: 40, date: "1/22/2026, 10:20:50 PM", status: "COMPLETED" },
  ]);

  const handleDelete = (orderId, productName) => {
    if(window.confirm(`Delete order for ${productName}?`)) {
      setOrders(orders.filter(o => !(o.id === orderId && o.product === productName)));
    }
  };

  return (
    <div className={`p-8 flex flex-col h-screen transition-colors duration-500 ${
      isDark ? 'bg-[#0b1120]' : 'bg-slate-50'
    }`}>
      {/* Header Area */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-3xl">🛒</span>
          <div>
            <h1 className={`text-3xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>Customer Orders</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">View and manage all outgoing customer transactions.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search Order ID or Product..." 
              className={`border rounded-lg px-4 py-2 text-sm outline-none w-64 transition-all ${
                isDark 
                ? 'bg-[#1e293b]/50 border-slate-700/50 text-white focus:border-[#4361ee]' 
                : 'bg-white border-slate-300 text-slate-900 focus:border-[#4361ee] shadow-sm'
              }`}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-[#10b981] hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-black transition-all shadow-lg shadow-emerald-500/10">
            📊 Export CSV
          </button>
        </div>
      </header>

      {/* Main Table Card */}
      <div className={`flex-1 rounded-3xl border overflow-hidden shadow-2xl flex flex-col transition-all duration-500 ${
        isDark ? 'bg-[#111827]/50 border-slate-800/50' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={`text-[11px] font-black uppercase tracking-widest border-b transition-colors ${
              isDark 
              ? 'bg-[#0b1120] text-slate-400 border-slate-800' 
              : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              <tr>
                <th className="p-5 px-6">Order ID</th>
                <th className="p-5 px-6">Product</th>
                <th className="p-5 px-6">Category</th>
                <th className="p-5 px-6 text-center">Qty</th>
                <th className="p-5 px-6">Unit Price</th>
                <th className="p-5 px-6">Total</th>
                <th className="p-5 px-6">Date</th>
                <th className="p-5 px-6 text-center">Status</th>
                <th className="p-5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/30' : 'divide-slate-100'}`}>
              {orders.filter(o => o.product.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.includes(searchTerm)).map((order, idx) => (
                <tr key={`${order.id}-${idx}`} className={`transition-colors group ${
                  isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/80'
                }`}>
                  <td className="p-5 px-6 font-bold text-[#4361ee] text-sm cursor-pointer hover:underline">{order.id}</td>
                  <td className={`p-5 px-6 font-black text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.product}</td>
                  <td className="p-5 px-6">
                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase border shadow-inner ${
                      isDark 
                      ? 'bg-[#1e293b] text-slate-300 border-slate-700/50' 
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {order.category || 'null'}
                    </span>
                  </td>
                  <td className={`p-5 px-6 text-center font-black text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.qty}</td>
                  <td className="p-5 px-6 text-slate-400 font-bold text-xs">₱{order.unitPrice}</td>
                  <td className={`p-5 px-6 font-black text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>₱{order.total.toLocaleString()}</td>
                  <td className="p-5 px-6 text-slate-500 text-[11px] font-medium leading-tight">{order.date}</td>
                  <td className="p-5 px-6 text-center">
                    <span className={`border px-4 py-1 rounded-full text-[9px] font-black tracking-tighter shadow-sm ${
                      isDark 
                      ? 'bg-emerald-500/10 text-[#a7f3d0] border-emerald-500/20' 
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-5 px-6 text-center">
                    <button 
                      onClick={() => handleDelete(order.id, order.product)}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 px-3 rounded-lg text-[10px] font-black flex items-center gap-1 mx-auto transition-all active:scale-95 border border-red-500/20"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}