import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useTheme } from '../../context/ThemeContext';

export default function Orders() {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetching history for THIS specific user
        const res = await axios.get(`http://localhost:3000/api/orders/${userId}`);
        setOrders(res.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchOrders();
  }, [userId]);

  const downloadReceipt = (order) => {
    const doc = new jsPDF();
    doc.text(`Official Receipt - Order #${order.id}`, 10, 10);
    doc.autoTable({
      head: [['Product', 'Price', 'Status']],
      body: [[order.product_name, `P${order.total_amount}`, order.status]],
    });
    doc.save(`Receipt_${order.id}.pdf`);
  };

  if (loading) return <div className="p-10 text-center">Loading your orders...</div>;

  return (
    <div className={`p-8 min-h-screen transition-all ${isDark ? 'bg-[#0b1120] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">My Purchase History</h1>
      </div>

      <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <table className="w-full text-left">
          <thead className="bg-slate-500/10 text-[11px] uppercase">
            <tr>
              <th className="p-5">Ref ID</th>
              <th className="p-5">Product</th>
              <th className="p-5 text-center">Qty</th>
              <th className="p-5">Total</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-slate-500/10">
                <td className="p-5 font-bold text-blue-500">#{order.id}</td>
                <td className="p-5 font-bold">{order.product_name}</td>
                <td className="p-5 text-center">{order.quantity || 1}</td>
                <td className="p-5 font-black">₱{parseFloat(order.total_amount).toLocaleString()}</td>
                <td className="p-5">
                   <span className="px-3 py-1 rounded-full text-[10px] bg-green-500/10 text-green-500 uppercase">
                    {order.status}
                   </span>
                </td>
                <td className="p-5 text-center">
                  <button onClick={() => downloadReceipt(order)} className="p-2 hover:bg-blue-500 hover:text-white rounded-lg transition-all">📄</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-20 text-center opacity-40">No orders found yet. Start shopping!</div>
        )}
      </div>
    </div>
  );
}