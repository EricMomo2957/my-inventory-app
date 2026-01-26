export default function Orders() {
  const orders = [
    { id: "#1254", customer: "Juan Dela Cruz", status: "Pending", total: "₱1,200" },
    { id: "#1255", customer: "Maria Clara", status: "Completed", total: "₱3,500" },
  ];

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-black text-white">Customer Orders</h1>
        <p className="text-slate-500 text-sm font-medium">Manage and track incoming sales</p>
      </header>
      <div className="bg-[#111827] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-[10px] text-slate-500 font-black uppercase tracking-widest border-b border-slate-800">
            <tr>
              <th className="p-6">Order ID</th>
              <th className="p-6">Customer</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-6 font-bold text-[#4361ee]">{order.id}</td>
                <td className="p-6 text-white font-bold">{order.customer}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${order.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-6 text-right font-black text-white">{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}