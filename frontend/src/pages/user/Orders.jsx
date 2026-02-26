import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useTheme } from '../../context/ThemeContext';

export default function Orders() {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Modal States ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newQty, setNewQty] = useState(1);

  const userId = localStorage.getItem('userId');

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/orders/${userId}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchOrders();
  }, [userId]);

  // --- Handlers ---
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to cancel/delete this order record?")) {
      try {
        await axios.delete(`http://localhost:3000/api/orders/${id}`);
        setOrders(orders.filter(o => o.id !== id));
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        alert("Failed to delete order.");
      }
    }
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setNewQty(order.quantity || 1);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      // Logic: New total = unit price * new quantity
      const updatedTotal = editingOrder.unit_price * newQty;
      
      await axios.put(`http://localhost:3000/api/orders/${editingOrder.id}`, {
        quantity: newQty,
        total_amount: updatedTotal
      });

      alert("Order updated successfully!");
      setIsEditModalOpen(false);
      fetchOrders(); // Refresh data
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Error updating order.");
    }
  };

  const downloadReceipt = (order) => {
    const doc = new jsPDF();
    doc.text(`Official Receipt - Order #${order.id}`, 10, 10);
    doc.autoTable({
      head: [['Product', 'Qty', 'Total', 'Status']],
      body: [[order.product_name, order.quantity, `P${order.total_amount}`, order.status]],
    });
    doc.save(`Receipt_${order.id}.pdf`);
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading your orders...</div>;

  return (
    <div className={`p-8 min-h-screen transition-all ${isDark ? 'bg-[#0b1120] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black italic">My Purchase History</h1>
        <div className="text-xs font-bold opacity-50 uppercase tracking-widest">User ID: {userId}</div>
      </div>

      <div className={`rounded-3xl border overflow-hidden shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <table className="w-full text-left">
          <thead className={`text-[11px] uppercase tracking-tighter ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
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
              <tr key={order.id} className={`group transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                <td className="p-5 font-bold text-blue-500 text-sm">#ORD-{order.id}</td>
                <td className="p-5 font-black text-sm">{order.product_name}</td>
                <td className="p-5 text-center font-bold">{order.quantity || 1}</td>
                <td className="p-5 font-black text-[#4361ee]">₱{parseFloat(order.total_amount).toLocaleString()}</td>
                <td className="p-5">
                   <span className="px-3 py-1 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-500 uppercase border border-emerald-500/20">
                    {order.status}
                   </span>
                </td>
                <td className="p-5 text-center flex justify-center gap-2">
                  <button onClick={() => downloadReceipt(order)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all">📄</button>
                  <button onClick={() => openEditModal(order)} className="p-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all">✏️</button>
                  <button onClick={() => handleDelete(order.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-4 opacity-30">
             <span className="text-6xl">🛒</span>
             <p className="font-black text-xl">No transactions found.</p>
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl transform transition-all ${isDark ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white text-slate-900'}`}>
            <h2 className="text-2xl font-black mb-2">Edit Order Quantity</h2>
            <p className="text-slate-500 text-sm mb-6">Update your order for <span className="text-[#4361ee] font-bold">{editingOrder?.product_name}</span></p>
            
            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Adjust Quantity</label>
              <div className="flex items-center gap-4">
                <button onClick={() => setNewQty(Math.max(1, newQty - 1))} className="w-12 h-12 rounded-xl bg-slate-500/10 font-black text-xl">-</button>
                <span className="text-2xl font-black w-12 text-center">{newQty}</span>
                <button onClick={() => setNewQty(newQty + 1)} className="w-12 h-12 rounded-xl bg-[#4361ee] text-white font-black text-xl">+</button>
              </div>
            </div>

            <div className={`p-4 rounded-2xl mb-8 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium opacity-60">Unit Price:</span>
                <span className="font-bold">₱{editingOrder?.unit_price}</span>
              </div>
              <div className="flex justify-between text-lg font-black">
                <span>New Total:</span>
                <span className="text-[#4361ee]">₱{(editingOrder?.unit_price * newQty).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3 rounded-2xl font-bold bg-slate-500/10 hover:bg-slate-500/20 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                className="flex-1 py-3 rounded-2xl font-bold bg-[#4361ee] text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}