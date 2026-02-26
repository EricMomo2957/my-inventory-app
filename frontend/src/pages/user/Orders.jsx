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

  const fetchOrders = useCallback(async () => {
    try {
      // Ensure your backend is running the improved version we discussed
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
  }, [fetchOrders, userId]);

  // Logic: Calculate totals from the order list
  const totalItemsPurchased = orders.reduce((sum, order) => sum + (parseInt(order.quantity) || 0), 0);
  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

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
    
    // Add date to receipt
    const dateStr = new Date(order.order_date).toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Order Date: ${dateStr}`, 14, 28);

    doc.autoTable({
      startY: 35,
      head: [['Product', 'Qty', 'Unit Price', 'Total Cost', 'Status']],
      body: [[
        order.product_name, 
        order.quantity || 0, 
        `₱${parseFloat(order.unit_price).toLocaleString()}`, 
        `₱${parseFloat(order.total_amount).toLocaleString()}`, 
        order.status.toUpperCase()
      ]],
      theme: 'striped'
    });
    doc.save(`Receipt_ORD_${order.id}.pdf`);
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center font-black italic ${isDark ? 'bg-[#0b1120] text-white' : 'bg-slate-50 text-slate-900'}`}>
      LOADING HISTORY...
    </div>
  );

  return (
    <div className={`p-8 min-h-screen transition-all ${isDark ? 'bg-[#0b1120] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header & Stats Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">My Purchase History</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Session ID: <span className="text-blue-500">{userId}</span>
          </p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className={`flex-1 md:flex-none px-6 py-4 rounded-3xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
            <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Items Bought</p>
            <p className="text-2xl font-black text-blue-500 leading-none">{totalItemsPurchased}</p>
          </div>
          <div className={`flex-1 md:flex-none px-6 py-4 rounded-3xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800 hover:border-[#4361ee]/50' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
            <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Total Investment</p>
            <p className="text-2xl font-black text-[#4361ee] leading-none">₱{totalSpent.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={`text-[10px] uppercase font-black tracking-widest ${isDark ? 'bg-slate-800/50 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
              <tr>
                <th className="p-6">Reference</th>
                <th className="p-6">Product Detail</th>
                <th className="p-6 text-center">Quantity</th>
                <th className="p-6">Amount Paid</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-500/5">
              {orders.map((order) => (
                <tr key={order.id} className={`group transition-all ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'}`}>
                  <td className="p-6">
                    <span className="font-bold text-blue-500 text-sm block">#ORD-{order.id}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{new Date(order.order_date).toLocaleDateString()}</span>
                  </td>
                  <td className="p-6">
                    <p className="font-black text-sm uppercase tracking-tight">{order.product_name}</p>
                    <p className="text-[10px] font-bold text-slate-500">{order.category || 'General'}</p>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`inline-block px-4 py-1.5 rounded-xl font-black text-sm ${isDark ? 'bg-slate-800 text-blue-400' : 'bg-slate-100 text-blue-600'}`}>
                      {order.quantity || 0}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="font-black text-[#4361ee] text-lg">₱{parseFloat(order.total_amount).toLocaleString()}</span>
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => downloadReceipt(order)} 
                        className={`p-3 rounded-2xl transition-all active:scale-90 ${isDark ? 'bg-slate-800 hover:bg-blue-600 text-white' : 'bg-slate-100 hover:bg-blue-500 hover:text-white text-slate-600'}`}
                        title="Download PDF Receipt"
                      >
                        📄
                      </button>
                      <button 
                        onClick={() => handleDelete(order.id)} 
                        className={`p-3 rounded-2xl transition-all active:scale-90 ${isDark ? 'bg-slate-800 hover:bg-red-600 text-white' : 'bg-slate-100 hover:bg-red-500 hover:text-white text-slate-600'}`}
                        title="Remove Record"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {orders.length === 0 && (
          <div className="p-24 text-center flex flex-col items-center gap-4">
             <div className="w-20 h-20 rounded-full bg-slate-500/10 flex items-center justify-center text-4xl grayscale opacity-50 mb-2">🛍️</div>
             <p className="font-black text-2xl tracking-tighter uppercase opacity-20">No Transaction History Found</p>
          </div>
        )}
      </div>
    </div>
  );
}