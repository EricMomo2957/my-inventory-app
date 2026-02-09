import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ClerkDashboard() {
  const navigate = useNavigate();

  // --- State Management ---
  const [activeView, setActiveView] = useState('stock-view');
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('landingTheme') === 'dark');
  const [lowStockThreshold, setLowStockThreshold] = useState(parseInt(localStorage.getItem('lowStockThreshold')) || 10);

  // User data from storage
  const [userData] = useState({
    id: localStorage.getItem('userId'),
    full_name: localStorage.getItem('userName') || 'Clerk User',
    role: localStorage.getItem('userRole') || 'clerk',
    username: localStorage.getItem('userName')?.toLowerCase().replace(' ', '_') || 'clerk_01'
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustment, setAdjustment] = useState('');

  // --- Functions ---

  // Wrapped in useCallback to prevent re-renders and satisfy ESLint
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/products');
      setProducts(response.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  }, []);

  // --- Initialization & Theme Sync ---
  useEffect(() => {
    // Role Guard
    const role = localStorage.getItem('userRole');
    if (role !== 'clerk' && role !== 'admin') {
      navigate('/login');
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();

    // Sync theme with document root
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, navigate, fetchData]);

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
      fetchData(); // Refresh the table
    } catch (err) {
      console.error("Update failed:", err);
      alert("Could not update stock.");
    }
  };

  // --- Stats Calculations ---
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const lowStockCount = products.filter(p => p.quantity <= lowStockThreshold).length;
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);

  return (
    <div className={`grow font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      {/* NOTE: Internal <aside> sidebar removed to fix double sidenav issue. 
          The 'ml-64' margin is removed so content flows relative to the main App sidebar.
      */}
      <main className="p-10">

        {/* VIEW: STOCK CONTROL */}
        {activeView === 'stock-view' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-black">Clerk Stock Portal</h1>
                <p className="text-slate-500 font-medium">Live database control: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveView('profile-view')}
                  className={`px-5 py-2.5 rounded-xl border font-bold flex items-center gap-2 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => setActiveView('settings-view')}
                  className={`px-5 py-2.5 rounded-xl border font-bold flex items-center gap-2 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                >
                  ⚙️ Settings
                </button>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard label="Total Products" value={products.length} color="text-blue-600" isDarkMode={isDarkMode} />
              <StatCard label="Low Stock Alerts" value={lowStockCount} color="text-red-500" isDarkMode={isDarkMode} />
              <StatCard label="Inventory Value" value={`₱${totalValue.toLocaleString()}`} color="text-emerald-500" isDarkMode={isDarkMode} />
            </div>

            <input
              type="text"
              placeholder="Filter by product name..."
              className={`w-full px-6 py-4 rounded-2xl border outline-none transition-all mb-6 ${isDarkMode ? 'bg-slate-900 border-slate-800 focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Inventory Table */}
            <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <table className="w-full text-left border-collapse">
                <thead className={isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}>
                  <tr>
                    <th className="p-4 text-[10px] uppercase font-black text-slate-400">Product Details</th>
                    <th className="p-4 text-[10px] uppercase font-black text-slate-400">Price</th>
                    <th className="p-4 text-[10px] uppercase font-black text-slate-400">Stock</th>
                    <th className="p-4 text-[10px] uppercase font-black text-slate-400">Status</th>
                    <th className="p-4 text-[10px] uppercase font-black text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/10">
                  {filteredProducts.map(p => {
                    const isLow = p.quantity <= lowStockThreshold;
                    return (
                      <tr key={p.id} className="hover:bg-blue-500/5 transition-colors">
                        <td className="p-4">
                          <div className="font-bold">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono uppercase">ID: #{p.id}</div>
                        </td>
                        <td className="p-4 font-bold">₱{parseFloat(p.price).toLocaleString()}</td>
                        <td className="p-4 font-black">{p.quantity}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black ${isLow ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {isLow ? 'LOW STOCK' : 'OK'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => openAdjustmentModal(p)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
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
        )}

        {/* VIEW: PROFILE */}
        {activeView === 'profile-view' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <button onClick={() => setActiveView('stock-view')} className="text-blue-500 font-bold mb-4 flex items-center gap-2">← Back to Stock</button>
            <h1 className="text-3xl font-black mb-8">Account Profile</h1>
            <div className={`p-10 rounded-4xl border shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-500/30">
                  {userData.full_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-black">{userData.full_name}</h2>
                  <p className="text-blue-500 font-bold uppercase tracking-widest text-xs">{userData.role}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Full Name</label>
                  <input type="text" value={userData.full_name} disabled className={`w-full px-5 py-4 rounded-2xl border outline-none opacity-60 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Username</label>
                  <input type="text" value={userData.username} disabled className={`w-full px-5 py-4 rounded-2xl border outline-none opacity-60 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: SETTINGS */}
        {activeView === 'settings-view' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <button onClick={() => setActiveView('stock-view')} className="text-blue-500 font-bold mb-4 flex items-center gap-2">← Back to Stock</button>
            <h1 className="text-3xl font-black mb-8">Dashboard Settings</h1>
            <div className={`p-10 rounded-4xl border shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="font-black text-lg">Dark Mode</h3>
                  <p className="text-sm text-slate-500 font-medium">Toggle the system appearance</p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`px-6 py-2.5 rounded-2xl font-bold transition-all ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'}`}
                >
                  {isDarkMode ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
                </button>
              </div>
              <div className="space-y-6 pt-6 border-t border-slate-800/10">
                <h3 className="font-black text-lg">Inventory Preferences</h3>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLowStockThreshold(val);
                      localStorage.setItem('lowStockThreshold', val);
                    }}
                    className={`w-full px-5 py-4 rounded-2xl border outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
                  />
                  <p className="text-[10px] text-slate-500 italic mt-2">Alerts will trigger at this quantity or below.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Adjustment Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-10 rounded-4xl shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-white'}`}>
            <h2 className="text-2xl font-black mb-1">Adjust Stock</h2>
            <p className="text-sm text-slate-500 font-medium mb-8">System ID: #{selectedProduct.id}</p>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Adjustment (+ / -)</label>
                <input
                  type="number"
                  autoFocus
                  placeholder="e.g. 10 or -5"
                  className={`w-full px-5 py-4 rounded-2xl border outline-none text-xl font-black ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={applyAdjustment}
                  className="flex-2 bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for clean Stats rendering
function StatCard({ label, value, color, isDarkMode }) {
  return (
    <div className={`p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-slate-100 shadow-sm'}`}>
      <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">{label}</h4>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}