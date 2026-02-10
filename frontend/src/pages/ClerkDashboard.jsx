import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ClerkDashboard() {
  const navigate = useNavigate();

  // --- State Management ---
  const [activeView, setActiveView] = useState('stock-view');
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('landingTheme') === 'dark');
  const [lowStockThreshold, setLowStockThreshold] = useState(() => parseInt(localStorage.getItem('lowStockThreshold') || '10'));

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
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, []);

  // Export to CSV Function
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

  // Auth check and initial fetch
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'clerk' && role !== 'admin') {
      navigate('/login');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
  }, [navigate, fetchData]);

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
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('landingTheme', newMode ? 'dark' : 'light');
  };

  const openAdjustmentModal = (product) => {
    setSelectedProduct({ ...product });
    setAdjustment('');
    setIsModalOpen(true);
  };

  const applyAdjustment = async () => {
    if (!selectedProduct || !adjustment) return;
    const adjValue = parseInt(adjustment);
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
        
        {/* VIEW: STOCK CONTROL */}
        {activeView === 'stock-view' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight">Clerk Stock Portal</h1>
                <p className="text-slate-500 font-medium mt-1">Live database control: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={downloadCSV}
                  className={`px-5 py-2.5 rounded-xl border font-bold flex items-center gap-2 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={() => setActiveView('profile-view')}
                  className={`px-5 py-2.5 rounded-xl border font-bold flex items-center gap-2 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => setActiveView('settings-view')}
                  className={`px-5 py-2.5 rounded-xl border font-bold flex items-center gap-2 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}
                >
                  ⚙️ Settings
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
              <div className="overflow-x-auto">
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
                    {filteredProducts.map(p => {
                      const isLow = p.quantity <= lowStockThreshold;
                      return (
                        <tr key={p.id} className="hover:bg-blue-500/5 transition-colors group">
                          <td className="p-5">
                            <div className="font-bold text-lg">{p.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">ID: #{p.id}</div>
                          </td>
                          <td className="p-5 font-bold">₱{parseFloat(p.price).toLocaleString()}</td>
                          <td className="p-5 font-black text-lg">{p.quantity}</td>
                          <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${isLow ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                              {isLow ? 'LOW STOCK' : 'OK'}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            <button
                              onClick={() => openAdjustmentModal(p)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                            >
                              Update
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PROFILE */}
        {activeView === 'profile-view' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <button onClick={() => setActiveView('stock-view')} className="text-blue-500 font-bold mb-6 flex items-center gap-2 group hover:-translate-x-1 transition-transform">
              <span>←</span> Back to Dashboard
            </button>
            <h1 className="text-3xl font-black mb-8">User Profile</h1>
            <div className={`p-10 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
               <div className="flex items-center gap-6 mb-8">
                 <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                   {userData.full_name.split(' ').map(n => n[0]).join('')}
                 </div>
                 <div>
                   <h2 className="text-2xl font-black">{userData.full_name}</h2>
                   <p className="text-blue-500 font-bold uppercase tracking-tighter text-xs">{userData.role}</p>
                 </div>
               </div>
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <ProfileField label="Full Name" value={userData.full_name} isDark={isDarkMode} />
                   <ProfileField label="Username" value={userData.username} isDark={isDarkMode} />
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* VIEW: SETTINGS */}
        {activeView === 'settings-view' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <button onClick={() => setActiveView('stock-view')} className="text-blue-500 font-bold mb-6 flex items-center gap-2 group hover:-translate-x-1 transition-transform">
              <span>←</span> Back to Dashboard
            </button>
            <h1 className="text-3xl font-black mb-8">System Settings</h1>
            <div className={`p-10 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-8 pb-8 border-b border-slate-800/10">
                <div>
                  <h3 className="font-bold text-lg">Appearance</h3>
                  <p className="text-sm text-slate-500">Switch between light and dark themes</p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'}`}
                >
                  {isDarkMode ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
                </button>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Inventory Threshold</h3>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLowStockThreshold(val);
                    localStorage.setItem('lowStockThreshold', val);
                  }}
                  className={`w-full px-5 py-4 rounded-xl border outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                />
                <p className="text-xs text-slate-500">Low stock labels will appear when a product reaches this quantity.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Adjustment Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className={`w-full max-w-md p-10 rounded-3xl shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-white'}`}>
            <h2 className="text-2xl font-black mb-1">Update Inventory</h2>
            <p className="text-sm text-slate-400 mb-8">{selectedProduct.name} (ID: #{selectedProduct.id})</p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Stock Adjustment (+ or -)</label>
                <input
                  type="number"
                  autoFocus
                  placeholder="e.g. 10 or -5"
                  className={`w-full px-6 py-5 rounded-2xl border outline-none text-2xl font-black ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={applyAdjustment}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper Components ---
function StatCard({ label, value, color, isDarkMode }) {
  return (
    <div className={`p-8 rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-slate-100 shadow-sm'}`}>
      <h4 className="text-[11px] uppercase tracking-widest font-black text-slate-400 mb-2">{label}</h4>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function ProfileField({ label, value, isDark }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</label>
      <div className={`px-5 py-3.5 rounded-xl border font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
        {value}
      </div>
    </div>
  );
}