import { useEffect, useState, useCallback, useMemo } from 'react'
import { Sidenav } from './Sidenav'; 

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
            <tr>{headers.map(h => <th key={h} className="p-4 px-6">{h}</th>)}</tr>
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

export default function App() {
  const [products, setProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Defaulted for development
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Modal Visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selection States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState([]); 
  const [newProduct, setNewProduct] = useState({ name: "", category: "Vegetables", quantity: 0, price: 0 });

  const [user] = useState({ 
    name: "Eric Dominic Momo", 
    role: "Administrator",
    avatar: "https://ui-avatars.com/api/?name=Eric+Dominic&background=4361ee&color=fff" 
  });

  // Data Lists
  const schedule = [
    { date: "1/6/2026", event: "Harvest festival", type: "Inventory Check" },
    { date: "1/18/2026", event: "Diyandi festival", type: "Delivery" },
    { date: "1/21/2026", event: "Sinulog Festival", type: "Personal" },
    { date: "1/22/2026", event: "silog", type: "Supplier Meeting" },
    { date: "1/25/2026", event: "delivery day", type: "Delivery" },
  ];

  const usersList = [
    { name: "System Admin", handle: "@admin", role: "clerk" },
    { name: "joe ray II", handle: "@joe", role: "admin" },
    { name: "eren jo", handle: "@eren@gmail.com", role: "clerk" },
  ];

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) { console.error("Fetch error:", error); }
  }, []);

  useEffect(() => { 
    fetchProducts(); 
  }, [fetchProducts]);

  // Derived Stats
  const activeAlerts = useMemo(() => {
    return products.filter(p => p.quantity > 0 && p.quantity < 5 && !dismissedAlerts.includes(p.id));
  }, [products, dismissedAlerts]);

  const filteredProducts = products.filter(p => 
    (activeCategory === "All" || p.category === activeCategory) && 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const inventoryValue = products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.price)), 0);
  const categories = ["All", ...new Set(products.map(p => p.category))];

  // --- Logic Handlers ---
  const handleAddProduct = async () => {
    if (!newProduct.name) return;
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });
    setIsAddModalOpen(false);
    setNewProduct({ name: "", category: "Vegetables", quantity: 0, price: 0 });
    fetchProducts();
  };

  const handleUpdateProduct = async () => {
    await fetch(`/api/products/${selectedProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedProduct)
    });
    setIsEditModalOpen(false);
    fetchProducts();
  };

  const handleDeleteProduct = async () => {
    await fetch(`/api/products/${productToDelete.id}`, { method: 'DELETE' });
    setIsDeleteModalOpen(false);
    fetchProducts();
  };

  return (
    <div className="flex h-screen w-full bg-[#0b1120] text-slate-200 font-sans overflow-hidden">
      
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {activeAlerts.map(item => (
          <div key={item.id} className="pointer-events-auto bg-[#1e293b] p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-slide-in w-80 border border-slate-800 border-l-4 border-l-red-500">
            <div className="text-xl">⚠️</div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-white">Low Stock</h4>
              <p className="text-xs text-slate-400">{item.name}: {item.quantity} left</p>
            </div>
            <button onClick={() => setDismissedAlerts([...dismissedAlerts, item.id])} className="text-slate-500 hover:text-white">✕</button>
          </div>
        ))}
      </div>

      <Sidenav user={user} onLogout={() => setIsLoggedIn(false)} />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="flex justify-between items-center p-8 border-b border-slate-800/50">
          <div>
            <h1 className="text-3xl font-black text-white">Dashboard</h1>
            <p className="text-slate-500 text-sm font-medium">Monday, Jan 26, 2026</p>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-[#4361ee] hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">+ Add Product</button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <StatCard title="Total Items" val={totalItems} icon="📦" />
            <StatCard title="Value" val={`₱${inventoryValue.toLocaleString()}`} icon="💰" />
            <StatCard title="Low Stock" val={activeAlerts.length} icon="⚠️" color="text-red-500" />
            <StatCard title="Vegetables" val={products.filter(p => p.category === 'Vegetables').length} icon="🥦" />
            <StatCard title="Fruits" val={products.filter(p => p.category === 'Fruits').length} icon="🍎" />
            <StatCard title="Supplies" val={products.filter(p => p.category === 'Supplies').length} icon="🛠️" />
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="bg-[#111827] border border-slate-800 rounded-xl px-4 py-2 flex-1 outline-none focus:border-[#4361ee] text-white" 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <div className="flex gap-2">
              {categories.map(c => (
                <button 
                  key={c} 
                  onClick={() => setActiveCategory(c)} 
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === c ? 'bg-[#4361ee] text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Main Product Table */}
          <div className="bg-[#111827] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-[10px] text-slate-500 font-black uppercase tracking-widest border-b border-slate-800">
                <tr>
                  <th className="p-6">Name</th>
                  <th className="p-6">Category</th>
                  <th className="p-6 text-center">Qty</th>
                  <th className="p-6">Price</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredProducts.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-6 font-bold text-white">{item.name}</td>
                    <td className="p-6 text-slate-500">{item.category}</td>
                    <td className="p-6 text-center font-black text-xl">{item.quantity}</td>
                    <td className="p-6 text-slate-400">₱{item.price}</td>
                    <td className="p-6 text-right space-x-2">
                      <button onClick={() => { setSelectedProduct(item); setIsEditModalOpen(true); }} className="p-2 bg-slate-800 rounded-lg hover:bg-blue-500 text-white transition-colors">✏️</button>
                      <button onClick={() => { setProductToDelete(item); setIsDeleteModalOpen(true); }} className="p-2 bg-slate-800 rounded-lg hover:bg-red-500 text-white transition-colors">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Secondary Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
             <TableSection title="Upcoming Schedule" data={schedule} headers={["Date", "Event", "Type"]} />
             <TableSection title="System Users" data={usersList} headers={["Name", "Username", "Role"]} />
          </div>
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
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

      {/* Edit Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black mb-6 text-white text-center">Edit Product</h2>
            <div className="space-y-4">
              <input type="text" value={selectedProduct.name} className="w-full bg-[#0b1120] border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-[#4361ee]" onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={selectedProduct.price} className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-[#4361ee]" onChange={(e) => setSelectedProduct({...selectedProduct, price: e.target.value})} />
                <input type="number" value={selectedProduct.quantity} className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-[#4361ee]" onChange={(e) => setSelectedProduct({...selectedProduct, quantity: e.target.value})} />
              </div>
              <button onClick={handleUpdateProduct} className="w-full py-4 bg-emerald-500 rounded-2xl font-bold text-white shadow-lg hover:bg-emerald-400 transition-all">Save Changes</button>
              <button onClick={() => setIsEditModalOpen(false)} className="w-full py-2 text-slate-500 font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl text-center">
            <div className="text-4xl mb-4 text-red-500">⚠️</div>
            <h2 className="text-xl font-black text-white mb-2">Delete Product?</h2>
            <p className="text-slate-400 text-sm mb-6">Are you sure you want to delete <span className="text-white font-bold">{productToDelete.name}</span>?</p>
            <div className="flex gap-3">
              <button onClick={handleDeleteProduct} className="flex-1 py-3 bg-red-500 rounded-xl font-bold text-white">Delete</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-800 rounded-xl font-bold">Keep</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}