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

/**
 * LOGIN SCREEN COMPONENT
 */
function Login({ onLogin }) {
  return (
    <div className="h-screen w-full bg-[#0b1120] flex items-center justify-center p-6">
      <div className="bg-[#111827] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl text-center">
        <div className="w-16 h-16 bg-[#4361ee] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-3xl mx-auto mb-6">📦</div>
        <h2 className="text-3xl font-black text-white mb-2">Inventory Pro</h2>
        <p className="text-slate-500 mb-8 font-medium">Please sign in to continue</p>
        <div className="space-y-4">
          <input type="text" placeholder="Username" className="w-full bg-[#0b1120] border border-slate-800 rounded-2xl p-4 outline-none focus:border-[#4361ee] text-white" />
          <input type="password" placeholder="Password" className="w-full bg-[#0b1120] border border-slate-800 rounded-2xl p-4 outline-none focus:border-[#4361ee] text-white" />
          <button onClick={onLogin} className="w-full py-4 bg-[#4361ee] hover:bg-indigo-500 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-xl shadow-indigo-600/20">Sign In</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustment, setAdjustment] = useState(0);

  // --- User Profile State ---
  const [user, setUser] = useState({
    name: "Eric Dominic Momo",
    role: "Administrator",
    avatar: "https://ui-avatars.com/api/?name=Eric+Dominic&background=4361ee&color=fff"
  });

  const schedule = [
    { date: "1/6/2026", event: "Harvest festival", type: "Inventory Check" },
    { date: "1/18/2026", event: "Diyandi festival", type: "Delivery" },
    { date: "1/21/2026", event: "Sinulog Festival", type: "Personal" },
    { date: "1/22/2026", event: "silog", type: "Supplier Meeting" },
    { date: "1/25/2026", event: "delivery day", type: "Delivery" },
  ];

  const usersList = [
    { name: "System Admin", username: "@admin", role: "admin" },
    { name: "joe ray II", username: "@joe", role: "admin" },
    { name: "eren jo", username: "@eren@gmail.com", role: "clerk" },
  ];

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) { console.error("Failed to fetch products:", error); }
  };

  useEffect(() => {
    const auth = localStorage.getItem("isLoggedIn");
    if (auth === "true") setIsLoggedIn(true);
    fetchProducts();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  const totalItems = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const inventoryValue = products.reduce((sum, p) => sum + ((Number(p.quantity) || 0) * (Number(p.price) || 0)), 0);
  const lowStock = products.filter(p => p.quantity < 5).length;
  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveAdjustment = async () => {
    if (!selectedProduct) return;
    const adjInt = parseInt(adjustment || 0);
    const newQuantity = (selectedProduct.quantity || 0) + adjInt;
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity, adjustment: adjInt, clerk_name: user.name, name: selectedProduct.name })
      });
      if (response.ok) { setIsModalOpen(false); setAdjustment(0); fetchProducts(); }
    } catch (err) { console.error("Update failed:", err); }
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex h-screen w-full bg-[#0b1120] text-slate-200 font-sans overflow-hidden">
      
      {/* --- NEW SIDENAV --- */}
      <aside className="w-64 bg-[#111827] border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-7 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4361ee] rounded-xl flex items-center justify-center shadow-lg text-xl">📦</div>
          <h2 className="text-lg font-bold text-white tracking-tight">Inventory Pro</h2>
        </div>

        {/* Profile Card */}
        <div className="mx-4 mb-6 p-3 bg-[#1e293b] border border-slate-800 rounded-xl flex items-center gap-3">
          <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-lg" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white truncate w-28">{user.name}</span>
            <small className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.role}</small>
          </div>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4">Main Menu</p>
          <NavItem icon="🏠" label="Dashboard" active />
          <NavItem icon="🛒" label="Customer Orders" />
          <NavItem icon="📅" label="Calendar" />
          <NavItem icon="❓" label="FAQ" />

          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-6">User Account</p>
          <NavItem icon="👤" label="Profile" />
          <NavItem icon="⚙️" label="Settings" />
          {user.role === "Administrator" && <NavItem icon="🛡️" label="Admin Management" color="text-amber-500" />}
          <NavItem icon="📊" label="Reports & Analytics" />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-300 bg-slate-800/40 rounded-lg">🌙 Dark Mode</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-400 bg-red-400/10 rounded-lg hover:bg-red-500 hover:text-white transition-all">🚪 Logout</button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="flex justify-between items-center p-8 border-b border-slate-800/50">
          <div>
            <h1 className="text-3xl font-black text-white">Welcome back, {user.name.split(' ')[0]}!</h1>
            <p className="text-slate-500 font-medium text-sm">Sunday, January 25, 2026</p>
          </div>
          <button className="bg-[#4361ee] hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-xl shadow-indigo-600/20 transition-all active:scale-95">+ Add New Product</button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <StatCard title="Total Items" val={totalItems} icon="📦" />
            <StatCard title="Value" val={`₱${inventoryValue.toLocaleString()}`} icon="💰" />
            <StatCard title="Low Stock" val={lowStock} icon="⚠️" color="text-red-500" />
            <StatCard title="Vegetables" val={products.filter(p => p.category === 'Vegetables').length} icon="🥦" />
            <StatCard title="Fruits" val={products.filter(p => p.category === 'Fruits').length} icon="🍎" />
            <StatCard title="Supplies" val={products.filter(p => p.category === 'Supplies').length} icon="🛠️" />
          </div>

          {/* Search/Filters and Inventory Table... (Remains functionally same as previous version) */}
          <div className="bg-[#111827] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-900/80 border-b border-slate-800">
                <tr className="text-slate-500 text-xs font-black uppercase tracking-widest">
                  <th className="p-6">Name</th><th className="p-6">Category</th><th className="p-6 text-center">Quantity</th><th className="p-6">Price</th><th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-6 font-bold text-white">{item.name}</td>
                    <td className="p-6 text-slate-500 font-semibold">{item.category}</td>
                    <td className="p-6 text-center font-black text-xl">{item.quantity}</td>
                    <td className="p-6 text-slate-400">₱{item.price}</td>
                    <td className="p-6 text-right">
                      <button onClick={() => { setSelectedProduct(item); setIsModalOpen(true); }} className="p-3 bg-slate-800 rounded-xl hover:bg-[#4361ee]">✏️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Schedule & Users Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
             <TableSection title="📅 Upcoming Schedule" data={schedule} headers={['Date', 'Event', 'Type']} />
             <TableSection title="👥 System Users" data={usersList} headers={['User', 'Username', 'Role']} />
          </div>
        </div>
      </main>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
             <h2 className="text-2xl font-black mb-6 text-center">Adjust Stock</h2>
             <input type="number" value={adjustment} onChange={e => setAdjustment(e.target.value)} className="w-full bg-[#0b1120] border border-slate-800 rounded-2xl p-5 text-2xl font-black text-center text-white mb-6 outline-none focus:border-[#4361ee]" autoFocus />
             <div className="flex gap-4">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
               <button onClick={handleSaveAdjustment} className="flex-1 py-4 bg-[#4361ee] rounded-2xl font-bold shadow-lg">Save Changes</button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Helper component for Nav Items
 */
function NavItem({ icon, label, active = false, color = "text-slate-400" }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
      active ? 'bg-[#4361ee]/10 text-[#4361ee]' : `hover:bg-slate-800/50 hover:text-white ${color}`
    }`}>
      <span className="text-lg w-6">{icon}</span> {label}
    </button>
  );
}

/**
 * Helper component for the smaller tables
 */
function TableSection({ title, data, headers }) {
  return (
    <div className="bg-[#111827] rounded-3xl border border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-800 font-bold text-white">{title}</div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900/50 text-[10px] text-slate-500 font-black uppercase tracking-widest">
          <tr>{headers.map(h => <th key={h} className="p-4 px-6">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-800/30">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-800/20 text-slate-300">
              {Object.values(row).map((val, j) => (
                <td key={j} className="p-4 px-6">{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App