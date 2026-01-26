import { useEffect, useState, useCallback, useMemo } from 'react'

/**
 * UI COMPONENTS
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

function TableSection({ title, data, headers }) {
  return (
    <div className="bg-[#111827] rounded-3xl border border-slate-800 overflow-hidden flex flex-col h-full shadow-xl">
      <div className="p-5 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider">{title}</h3>
        <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-bold">{data.length} Total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/50 text-[10px] text-slate-500 font-black uppercase tracking-widest">
            <tr>
              {headers.map(h => <th key={h} className="p-4 px-6">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/20 text-slate-300 transition-colors">
                {Object.values(row).map((val, j) => (
                  <td key={j} className="p-4 px-6 truncate max-w-37.5">{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Login({ onLogin }) {
  return (
    <div className="h-screen w-full bg-[#0b1120] flex items-center justify-center p-6">
      <div className="bg-[#111827] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl text-center">
        <div className="w-16 h-16 bg-[#4361ee] rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6 text-3xl">📦</div>
        <h2 className="text-3xl font-black text-white mb-2">Inventory Pro</h2>
        <p className="text-slate-500 mb-8 font-medium">Please sign in to continue</p>
        <div className="space-y-4 text-left">
          <input type="text" placeholder="Username" className="w-full bg-[#0b1120] border border-slate-800 rounded-2xl p-4 outline-none focus:border-[#4361ee] text-white" />
          <input type="password" placeholder="Password" className="w-full bg-[#0b1120] border border-slate-800 rounded-2xl p-4 outline-none focus:border-[#4361ee] text-white" />
          <button onClick={onLogin} className="w-full py-4 bg-[#4361ee] hover:bg-indigo-500 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-xl shadow-indigo-600/20">Sign In</button>
        </div>
      </div>
    </div>
  );
}

/**
 * MAIN APPLICATION
 */
function App() {
  const [products, setProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [adjustment, setAdjustment] = useState(0);
  
  // FIXED: Removed the alerts state to prevent cascading renders
  const [dismissedAlerts, setDismissedAlerts] = useState([]); 
  const [newProduct, setNewProduct] = useState({ name: "", category: "Vegetables", quantity: 0, price: 0 });

  const [user] = useState({
    name: "Eric Dominic Momo",
    role: "Administrator",
    avatar: "https://ui-avatars.com/api/?name=Eric+Dominic&background=4361ee&color=fff"
  });

  const schedule = [
    { date: "1/6/2026", event: "Harvest Check", type: "Inventory" },
    { date: "1/18/2026", event: "Diyandi fest", type: "Delivery" },
    { date: "1/25/2026", event: "Supplier Day", type: "Restock" },
  ];

  const usersList = [
    { name: "Admin System", handle: "@admin", role: "Superuser" },
    { name: "Joe Ray II", handle: "@joe", role: "Clerk" },
  ];

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) { console.error("Fetch error:", error); }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") setIsLoggedIn(true);
    fetchProducts();
  }, [fetchProducts]);

  // FIXED: Calculate alerts on the fly using useMemo. This stops the cascading error.
  const activeAlerts = useMemo(() => {
    return products.filter(p => p.quantity > 0 && p.quantity < 5 && !dismissedAlerts.includes(p.id));
  }, [products, dismissedAlerts]);

  const handleLogin = () => { setIsLoggedIn(true); localStorage.setItem("isLoggedIn", "true"); };
  const handleLogout = () => { setIsLoggedIn(false); localStorage.removeItem("isLoggedIn"); };

  const handleAddProduct = async () => {
    if (!newProduct.name) return;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) { setIsAddModalOpen(false); fetchProducts(); }
    } catch (err) { console.error(err); }
  };

  const handleSaveAdjustment = async () => {
    if (!selectedProduct) return;
    const newQty = (Number(selectedProduct.quantity) || 0) + parseInt(adjustment || 0);
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty, adjustment: parseInt(adjustment), clerk_name: user.name, name: selectedProduct.name })
      });
      if (res.ok) { setIsModalOpen(false); setAdjustment(0); fetchProducts(); }
    } catch (err) { console.error(err); }
  };

  const handleDeleteProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, { method: 'DELETE' });
      if (res.ok) { setIsDeleteModalOpen(false); fetchProducts(); }
    } catch (err) { console.error(err); }
  };

  const filteredProducts = products.filter(p => (activeCategory === "All" || p.category === activeCategory) && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalItems = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const inventoryValue = products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.price)), 0);
  const categories = ["All", ...new Set(products.map(p => p.category))];

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex h-screen w-full bg-[#0b1120] text-slate-200 font-sans overflow-hidden">
      
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-100 flex flex-col gap-3 pointer-events-none">
        {activeAlerts.map(item => (
          <div key={item.id} className="pointer-events-auto bg-[#1e293b] border-l-4 border-red-500 p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-slide-in w-80 border-slate-800">
            <div className="text-xl">⚠️</div>
            <div className="flex-1"><h4 className="text-sm font-black text-white">Low Stock</h4><p className="text-xs text-slate-400">{item.name}: {item.quantity} left</p></div>
            <button onClick={() => setDismissedAlerts([...dismissedAlerts, item.id])} className="text-slate-500 hover:text-white">✕</button>
          </div>
        ))}
      </div>

      {/* Sidenav */}
      <aside className="w-64 bg-[#111827] border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-7 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4361ee] rounded-xl flex items-center justify-center shadow-lg text-xl">📦</div>
          <h2 className="text-lg font-bold text-white tracking-tight">Inventory Pro</h2>
        </div>
        <div className="mx-4 mb-6 p-3 bg-[#1e293b] border border-slate-800 rounded-xl flex items-center gap-3">
          <img src={user.avatar} className="w-10 h-10 rounded-lg" alt="avatar" />
          <div className="flex flex-col"><span className="text-sm font-semibold text-white truncate w-28">{user.name}</span><small className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{user.role}</small></div>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase mb-2 mt-4">Main Menu</p>
          <NavItem icon="🏠" label="Dashboard" active />
          <NavItem icon="🛒" label="Customer Orders" />
          <NavItem icon="📅" label="Calendar" />
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase mb-2 mt-6">User Account</p>
          <NavItem icon="👤" label="Profile" />
          <NavItem icon="⚙️" label="Settings" />
          {user.role === "Administrator" && <NavItem icon="🛡️" label="Admin Management" color="text-amber-500" />}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-400 bg-red-400/10 rounded-lg hover:bg-red-500 hover:text-white transition-all">🚪 Logout</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="flex justify-between items-center p-8 border-b border-slate-800/50">
          <div><h1 className="text-3xl font-black text-white">Dashboard</h1><p className="text-slate-500 text-sm font-medium">Monday, Jan 26, 2026</p></div>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-[#4361ee] hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">+ Add New Product</button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <StatCard title="Total Items" val={totalItems} icon="📦" />
            <StatCard title="Value" val={`₱${inventoryValue.toLocaleString()}`} icon="💰" />
            {/* Displaying length of the Memoized alerts */}
            <StatCard title="Low Stock" val={activeAlerts.length} icon="⚠️" color="text-red-500" />
            <StatCard title="Vegetables" val={products.filter(p => p.category === 'Vegetables').length} icon="🥦" />
            <StatCard title="Fruits" val={products.filter(p => p.category === 'Fruits').length} icon="🍎" />
            <StatCard title="Supplies" val={products.filter(p => p.category === 'Supplies').length} icon="🛠️" />
          </div>

          <div className="flex gap-4">
            <input type="text" placeholder="Search..." className="bg-[#111827] border border-slate-800 rounded-xl px-4 py-2 flex-1 outline-none focus:border-[#4361ee] text-white" onChange={(e) => setSearchTerm(e.target.value)} />
            {categories.map(c => <button key={c} onClick={() => setActiveCategory(c)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === c ? 'bg-[#4361ee] text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{c}</button>)}
          </div>

          <div className="bg-[#111827] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-[10px] text-slate-500 font-black uppercase tracking-widest border-b border-slate-800">
                <tr><th className="p-6">Name</th><th className="p-6">Category</th><th className="p-6 text-center">Qty</th><th className="p-6">Price</th><th className="p-6 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredProducts.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-6 font-bold text-white">{item.name}</td>
                    <td className="p-6 text-slate-500">{item.category}</td>
                    <td className="p-6 text-center font-black text-xl">{item.quantity}</td>
                    <td className="p-6 text-slate-400">₱{item.price}</td>
                    <td className="p-6 text-right space-x-2">
                      <button onClick={() => { setSelectedProduct(item); setIsModalOpen(true); }} className="p-2 bg-slate-800 rounded-lg hover:bg-[#4361ee] text-white transition-colors">✏️</button>
                      <button onClick={() => { setProductToDelete(item); setIsDeleteModalOpen(true); }} className="p-2 bg-slate-800 rounded-lg hover:bg-red-500 text-white transition-colors">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <TableSection title="Upcoming Schedule" data={schedule} headers={["Date", "Event", "Type"]} />
             <TableSection title="System Users" data={usersList} headers={["Name", "Username", "Role"]} />
          </div>
        </div>
      </main>

      {/* MODALS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black mb-6 text-white text-center">New Product</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Product Name" className="w-full bg-[#0b1120] border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-[#4361ee]" onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price" className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-[#4361ee]" onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                <input type="number" placeholder="Qty" className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-[#4361ee]" onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})} />
              </div>
              <button onClick={handleAddProduct} className="w-full py-4 bg-[#4361ee] rounded-2xl font-bold text-white shadow-lg hover:bg-indigo-500 transition-all">Add Product</button>
              <button onClick={() => setIsAddModalOpen(false)} className="w-full py-2 text-slate-500 font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl text-center">
             <h2 className="text-2xl font-black mb-6 text-white">Adjust Stock: {selectedProduct?.name}</h2>
             <input type="number" value={adjustment} onChange={e => setAdjustment(e.target.value)} className="w-full bg-[#0b1120] border border-slate-800 rounded-2xl p-5 text-2xl font-black text-center text-white mb-6 outline-none focus:border-[#4361ee]" autoFocus />
             <div className="flex gap-4">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-slate-500 hover:text-white">Cancel</button>
               <button onClick={handleSaveAdjustment} className="flex-1 py-4 bg-[#4361ee] rounded-2xl font-bold shadow-lg hover:bg-indigo-500 transition-all">Save</button>
             </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-[#111827] border border-slate-800 w-full max-sm rounded-[2.5rem] p-10 shadow-2xl text-center">
            <h2 className="text-2xl font-black mb-2 text-white">Delete Item?</h2>
            <p className="text-slate-500 mb-8">Delete <span className="text-white font-bold">{productToDelete?.name}</span> permanently?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDeleteProduct} className="py-4 bg-red-500 rounded-2xl font-bold text-white shadow-lg hover:bg-red-600 transition-all">Delete</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="py-2 text-slate-500 font-bold hover:text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NavItem({ icon, label, active = false, color = "text-slate-400" }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${active ? 'bg-[#4361ee]/10 text-[#4361ee]' : `hover:bg-slate-800/50 hover:text-white ${color}`}`}>
      <span className="text-lg w-6">{icon}</span> {label}
    </button>
  );
}

export default App