import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClerkSetting from './clerkSetting'; 

export default function ClerkDashboard() {
  const navigate = useNavigate();

  // --- State Management ---
  const [activeView, setActiveView] = useState('stock-view');
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // FIXED: Removed direct setIsDarkMode call to satisfy "unused var" linter error
  const [isDarkMode] = useState(() => localStorage.getItem('landingTheme') === 'dark');
  const [lowStockThreshold] = useState(() => parseInt(localStorage.getItem('lowStockThreshold') || '10', 10));

  // Use useMemo or simple state for constant data to keep render "pure"
  const [userData] = useState({
    id: localStorage.getItem('userId'),
    full_name: localStorage.getItem('userName') || 'Clerk User',
    role: localStorage.getItem('userRole') || 'clerk',
    username: localStorage.getItem('userName')?.toLowerCase().replace(' ', '_') || 'clerk_01'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustment, setAdjustment] = useState('');

  // --- Functions ---
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/products');
      if (response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, []);

  // FIXED: Auth check separated from data fetching to resolve "synchronous setState" error
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'clerk' && role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  // Initial Data Load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  // Theme handling logic
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Handlers ---
  const downloadCSV = () => {
    if (products.length === 0) return;
    const headers = ["ID", "Name", "Category", "Price", "Quantity", "Status"];
    const rows = products.map(p => [
      p.id,
      `"${p.name}"`, 
      `"${p.category || 'General'}"`,
      p.price,
      p.quantity,
      p.quantity <= lowStockThreshold ? "LOW STOCK" : "OK"
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAdjustmentModal = (product) => {
    setSelectedProduct({ ...product });
    setAdjustment('');
    setIsModalOpen(true);
  };

  const applyAdjustment = async () => {
    if (!selectedProduct || !adjustment) return;
    const adjValue = parseInt(adjustment, 10);
    const newQuantity = Math.max(0, selectedProduct.quantity + adjValue);

    try {
      await axios.put(`http://localhost:3000/api/products/${selectedProduct.id}`, {
        name: selectedProduct.name,
        quantity: newQuantity,
        adjustment: adjValue,
        clerk_name: userData.full_name
      });
      setIsModalOpen(false);
      fetchData(); 
    } catch (error) {
      console.error("Update failed:", error);
      alert("Could not update stock.");
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const lowStockCount = products.filter(p => p.quantity <= lowStockThreshold).length;
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <main className="p-8 lg:p-12">
        {activeView === 'stock-view' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight">Clerk Stock Portal</h1>
                <p className="text-slate-500 font-medium mt-1">Live database control: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={downloadCSV} className={`px-5 py-2.5 rounded-xl border font-bold flex items-center gap-2 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}>
                  📥 Export CSV
                </button>
                <button onClick={() => setActiveView('settings-view')} className="px-5 py-2.5 rounded-xl border border-blue-500/20 bg-blue-500 text-white font-bold flex items-center gap-2 transition-all hover:bg-blue-600 active:scale-95 shadow-lg shadow-blue-500/20">
                  ⚙️ Terminal Settings
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard label="Total Products" value={products.length} color="text-blue-500" isDarkMode={isDarkMode} />
              <StatCard label="Low Stock Alerts" value={lowStockCount} color="text-red-500" isDarkMode={isDarkMode} />
              <StatCard label="Inventory Value" value={`₱${totalValue.toLocaleString()}`} color="text-emerald-500" isDarkMode={isDarkMode} />
            </div>

            <div className="relative mb-8">
              <span className="absolute inset-y-0 left-0 flex items-center pl-6 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Filter by product name..."
                className={`w-full pl-14 pr-6 py-4 rounded-2xl border outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500 shadow-sm'}`}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'}`}>
               <table className="w-full text-left border-collapse">
                  <thead className={isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50/80'}>
                    <tr>
                      <th className="p-5 text-[11px] uppercase font-black text-slate-400">Product Details</th>
                      <th className="p-5 text-[11px] uppercase font-black text-slate-400">Price</th>
                      <th className="p-5 text-[11px] uppercase font-black text-slate-400">Stock</th>
                      <th className="p-5 text-[11px] uppercase font-black text-slate-400">Status</th>
                      <th className="p-5 text-[11px] uppercase font-black text-slate-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/10">
                    {filteredProducts.map(p => (
                      <tr key={p.id} className="hover:bg-blue-500/5 transition-colors group">
                        <td className="p-5">
                          <div className="font-bold text-lg">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono uppercase">ID: #{p.id}</div>
                        </td>
                        <td className="p-5 font-bold">₱{parseFloat(p.price).toLocaleString()}</td>
                        <td className="p-5 font-black text-lg">{p.quantity}</td>
                        <td className="p-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${p.quantity <= lowStockThreshold ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {p.quantity <= lowStockThreshold ? 'LOW STOCK' : 'OK'}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <button onClick={() => openAdjustmentModal(p)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeView === 'settings-view' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <button 
              onClick={() => setActiveView('stock-view')} 
              className="mb-6 flex items-center gap-2 text-blue-500 font-bold hover:-translate-x-1 transition-transform"
            >
              <span>←</span> Back to Dashboard
            </button>
            <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
                <ClerkSetting />
            </div>
          </div>
        )}
      </main>

      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className={`w-full max-w-md p-10 rounded-3xl shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-white'}`}>
             <h2 className="text-2xl font-black mb-1">Update Inventory</h2>
             <p className="text-sm text-slate-400 mb-8">{selectedProduct.name}</p>
             <input
                type="number"
                autoFocus
                className={`w-full px-6 py-5 rounded-2xl border outline-none text-2xl font-black mb-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
              />
              <div className="flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                <button onClick={applyAdjustment} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Save Changes</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, isDarkMode }) {
  return (
    <div className={`p-8 rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-slate-100 shadow-sm'}`}>
      <h4 className="text-[11px] uppercase tracking-widest font-black text-slate-400 mb-2">{label}</h4>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}