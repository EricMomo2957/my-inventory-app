import { useEffect, useState } from 'react'

/**
 * Reusable StatCard component for the top grid
 */
function StatCard({ title, val, icon, color = "text-white" }) {
  return (
    <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center text-xl">{icon}</div>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
          <h3 className={`text-2xl font-black ${color}`}>{val}</h3>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustment, setAdjustment] = useState(0);

  // --- Fetch Data from Backend ---
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Derived Logic for Stats ---
  const totalItems = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const inventoryValue = products.reduce((sum, p) => sum + ((Number(p.quantity) || 0) * (Number(p.price) || 0)), 0);
  const lowStock = products.filter(p => p.quantity < 5).length;
  
  // Get unique categories for the filter pills
  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  // --- Filtering Logic ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // --- Update Stock Handler ---
  const handleSaveAdjustment = async () => {
    if (!selectedProduct) return;
    const adjInt = parseInt(adjustment || 0);
    const newQuantity = (selectedProduct.quantity || 0) + adjInt;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          quantity: newQuantity, 
          adjustment: adjInt, 
          clerk_name: "Admin", 
          name: selectedProduct.name 
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setAdjustment(0);
        fetchProducts(); // Refresh the list
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0b1120] text-slate-200 font-sans overflow-hidden">
      
      {/* --- SIDEBAR (Fixed Width) --- */}
      <aside className="w-72 bg-[#111827] border-r border-slate-800 flex flex-col p-6 space-y-8 shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-black text-white">IP</span>
          </div>
          <span className="text-xl font-black tracking-tight">Inventory Pro</span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          <button className="w-full flex items-center gap-4 px-4 py-3 bg-indigo-600/10 text-indigo-400 rounded-xl font-bold text-left">
            <span>📊</span> Dashboard
          </button>
          {['Orders', 'Calendar', 'FAQ', 'Profile', 'Settings'].map(item => (
            <button key={item} className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-slate-300 transition-colors font-medium text-left">
              <span>📁</span> {item}
            </button>
          ))}
        </nav>

        <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 text-center">
          <div className="text-xs font-black text-slate-500 uppercase mb-2">System Theme</div>
          <button className="w-full py-2 bg-[#0b1120] rounded-lg text-sm font-bold shadow-inner text-slate-300">🌙 Dark Mode</button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="flex justify-between items-center p-8 border-b border-slate-800/50">
          <div>
            <h1 className="text-3xl font-black text-white">Welcome back, Admin! 👋</h1>
            <p className="text-slate-500 font-medium text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
              + Add New Product
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* --- STATS GRID --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-10">
            <StatCard title="Total Items" val={totalItems} icon="📦" />
            <StatCard title="Value" val={`₱${inventoryValue.toLocaleString()}`} icon="💰" />
            <StatCard title="Low Stock" val={lowStock} icon="⚠️" color="text-red-500" />
            <StatCard title="Vegetables" val={products.filter(p => p.category === 'Vegetables').length} icon="🥦" />
            <StatCard title="Fruits" val={products.filter(p => p.category === 'Fruits').length} icon="🍎" />
            <StatCard title="Supplies" val={products.filter(p => p.category === 'Supplies').length} icon="🛠️" />
          </div>

          {/* --- SEARCH & FILTERS --- */}
          <div className="bg-[#111827]/50 p-6 rounded-3xl border border-slate-800 mb-8">
            <div className="flex flex-col md:flex-row gap-6 justify-between">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Search product name..." 
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-2xl px-12 py-3.5 focus:border-indigo-500 outline-none transition-all text-white"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-4 top-4 opacity-30">🔍</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                      activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* --- DATA TABLE --- */}
          <div className="bg-[#111827] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl mb-10">
            <table className="w-full text-left">
              <thead className="bg-slate-900/80 sticky top-0 z-10">
                <tr className="text-slate-500 text-xs font-black uppercase tracking-widest border-b border-slate-800">
                  <th className="p-6">Photo</th>
                  <th className="p-6">Name</th>
                  <th className="p-6">Category</th>
                  <th className="p-6 text-center">Quantity</th>
                  <th className="p-6">Price</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredProducts.map((item) => (
                  <tr key={item.id} className={`group hover:bg-slate-800/40 transition-colors ${item.quantity < 5 ? 'bg-red-500/5' : ''}`}>
                    <td className="p-6">
                      <div className="w-12 h-12 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center font-bold text-indigo-400">
                        {item.name ? item.name.substring(0,2).toUpperCase() : "??"}
                      </div>
                    </td>
                    <td className="p-6 font-bold text-white text-lg">{item.name}</td>
                    <td className="p-6 text-slate-500 font-semibold">{item.category || 'N/A'}</td>
                    <td className="p-6 text-center">
                      <span className={`px-4 py-1.5 rounded-lg font-black text-xl ${item.quantity < 5 ? 'text-red-500 bg-red-500/10' : 'text-slate-100'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="p-6 text-slate-400 font-mono">₱{Number(item.price || 0).toLocaleString()}</td>
                    <td className="p-6 text-right space-x-3">
                      <button 
                        onClick={() => { setSelectedProduct(item); setIsModalOpen(true); }} 
                        className="p-3 bg-slate-800 rounded-xl hover:bg-indigo-600 transition-all"
                      >✏️</button>
                      <button className="p-3 bg-slate-800 rounded-xl hover:bg-red-600 transition-all">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="p-20 text-center text-slate-500 font-bold">No products found matching your criteria.</div>
            )}
          </div>
        </div>
      </main>

      {/* --- ADJUSTMENT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
             <h2 className="text-2xl font-black mb-1">Adjust Stock</h2>
             <p className="text-slate-500 mb-6 font-medium">Product: <span className="text-indigo-400">{selectedProduct?.name}</span></p>
             <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Quantity Change (+ or -)</label>
                  <input 
                    type="number" 
                    value={adjustment} 
                    onChange={e => setAdjustment(e.target.value)} 
                    className="w-full bg-[#0b1120] border border-slate-800 rounded-2xl p-5 text-2xl font-black focus:border-indigo-500 outline-none text-white"
                    placeholder="e.g. 10 or -5"
                    autoFocus
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500 hover:text-white transition-colors">Cancel</button>
                  <button onClick={handleSaveAdjustment} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all">Save Changes</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App