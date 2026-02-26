import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useTheme } from '../../context/ThemeContext';

export default function Orders() {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  // Stable fetch function to prevent dependency warnings
  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/orders/${userId}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchOrders();
  }, [fetchOrders]);

  // UI Helper for Status Badges
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order record? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:3000/api/orders/${id}`);
        setOrders(prev => prev.filter(o => o.id !== id));
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        alert("Failed to delete order.");
      }
    }
  };

  const downloadReceipt = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("INVENTORY PRO RECEIPT", 14, 20);
    doc.autoTable({
      startY: 30,
      head: [['Product', 'Qty', 'Total', 'Status']],
      body: [[order.product_name, order.quantity, `₱${order.total_amount}`, order.status]],
      theme: 'striped'
    });
    doc.save(`Receipt_ORD_${order.id}.pdf`);
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading your orders...</div>;

  return (
    <div className={`p-8 min-h-screen transition-all ${isDark ? 'bg-[#0b1120] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black italic">My Purchase History</h1>
        <div className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black border border-blue-500/20 uppercase tracking-widest">
           User ID: {userId}
        </div>
      </div>

      <div className={`rounded-3xl border overflow-hidden shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <table className="w-full text-left border-collapse">
          <thead className={`text-[10px] uppercase font-black tracking-widest ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
            <tr>
              <th className="p-5">Ref ID</th>
              <th className="p-5">Product</th>
              <th className="p-5 text-center">Qty</th>
              <th className="p-5">Total Cost</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-500/10">
            {orders.map((order) => (
              <tr key={order.id} className={`group transition-all ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                <td className="p-5 font-bold text-blue-500 text-sm">#ORD-{order.id}</td>
                <td className="p-5 font-black text-sm">{order.product_name}</td>
                <td className="p-5 text-center font-bold">{order.quantity}</td>
                <td className="p-5 font-black text-[#4361ee]">₱{parseFloat(order.total_amount).toLocaleString()}</td>
                <td className="p-5">
                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(order.status)}`}>
                    {order.status}
                   </span>
                </td>
                <td className="p-5 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => downloadReceipt(order)} 
                      className="p-2 hover:bg-blue-500 hover:text-white rounded-xl transition-all" 
                      title="Download PDF"
                    >
                      📄
                    </button>
                    <button 
                      onClick={() => handleDelete(order.id)} 
                      className="p-2 hover:bg-red-500 hover:text-white rounded-xl transition-all" 
                      title="Delete Order"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {orders.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-4 opacity-30">
             <span className="text-6xl">🛍️</span>
             <p className="font-black text-xl">You haven't ordered anything yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}