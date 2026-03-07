import React, { useState } from 'react';

/** * UI COMPONENTS */
function StatCard({ title, val, icon, color = "text-slate-900" }) {
  return (
    <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-xl border border-slate-100 dark:border-slate-700">{icon}</div>
        <div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
          <h3 className={`text-2xl font-black ${color} dark:text-white`}>{val}</h3>
        </div>
      </div>
    </div>
  );
}

function TableSection({ title, data, headers }) {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full shadow-sm">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">{title}</h3>
        <span className="text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-slate-500 font-bold">{data.length} Total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
            <tr>{headers.map(h => <th key={h} className="p-4 px-6">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-colors">
                {Object.values(row).map((val, j) => (
                  <td key={j} className="p-4 px-6 truncate max-w-37.5">{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Dashboard({ products = [], fetchProducts, activeAlertsCount = 0 }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const [newProduct, setNewProduct] = useState({ 
    name: "", category: "General", quantity: 0, price: 0.00, imageFile: null 
  });

  const categoriesList = ["General", "Vegetables", "Fruits", "Supplies", "Canned Goods"];
  const dynamicCategories = ["All", ...new Set([...categoriesList, ...products.map(p => p.category)])];

  const filteredProducts = products.filter(p => 
    (activeCategory === "All" || p.category === activeCategory) && 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const inventoryValue = products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.price)), 0);

  // API Handlers
  const handleAddProduct = async () => {
    if (!newProduct.name) return;
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("category", newProduct.category);
    formData.append("quantity", newProduct.quantity);
    formData.append("price", newProduct.price);
    if (newProduct.imageFile) formData.append("image", newProduct.imageFile);

    try {
      await fetch('/api/products', { method: 'POST', body: formData });
      setIsAddModalOpen(false);
      setNewProduct({ name: "", category: "General", quantity: 0, price: 0, imageFile: null });
      fetchProducts();
    } catch (error) { console.error("Add failed:", error); }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    const formData = new FormData();
    formData.append("name", selectedProduct.name);
    formData.append("category", selectedProduct.category);
    formData.append("quantity", selectedProduct.quantity);
    formData.append("price", selectedProduct.price);
    if (selectedProduct.imageFile) formData.append("image", selectedProduct.imageFile);

    try {
      await fetch(`/api/products/${selectedProduct.id}`, { method: 'POST', body: formData });
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error) { console.error("Update failed:", error); }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await fetch(`/api/products/${productToDelete.id}`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch (error) { console.error("Delete failed:", error); }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-[#0b1120] transition-colors duration-300">
      <header className="flex justify-between items-center p-8 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Monday, Jan 26, 2026</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-[#4361ee] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all">
          + Add Product
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <StatCard title="Total Items" val={totalItems} icon="📦" />
          <StatCard title="Value" val={`₱${inventoryValue.toLocaleString()}`} icon="💰" />
          <StatCard title="Low Stock" val={activeAlertsCount} icon="⚠️" color="text-red-500" />
          <StatCard title="Veg" val={products.filter(p => p.category === 'Vegetables').length} icon="🥦" />
          <StatCard title="Fruits" val={products.filter(p => p.category === 'Fruits').length} icon="🍎" />
          <StatCard title="Supplies" val={products.filter(p => p.category === 'Supplies').length} icon="🛠️" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <input type="text" placeholder="Search products..." className="flex-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 text-slate-900 dark:text-white shadow-sm" onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {dynamicCategories.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === c ? 'bg-slate-900 dark:bg-[#4361ee] text-white border-slate-900 dark:border-[#4361ee]' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-6">Name</th>
                <th className="p-6">Category</th>
                <th className="p-6 text-center">Qty</th>
                <th className="p-6">Price</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredProducts.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                      {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" alt="" /> : "📦"}
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                  </td>
                  <td className="p-6"><span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400">{item.category}</span></td>
                  <td className="p-6 text-center font-bold text-slate-800 dark:text-slate-200">{item.quantity}</td>
                  <td className="p-6 text-slate-500 dark:text-slate-400">₱{Number(item.price).toFixed(2)}</td>
                  <td className="p-6 text-right space-x-2">
                    <button onClick={() => { setSelectedProduct(item); setIsEditModalOpen(true); }} className="p-2 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-all">✏️</button>
                    <button onClick={() => { setProductToDelete(item); setIsDeleteModalOpen(true); }} className="p-2 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-all">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS (Updated with dark mode support) --- */}

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-slate-900 dark:text-white text-center">New Product</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Product Name" className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 outline-none text-slate-900 dark:text-white" onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              <select className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 outline-none text-slate-900 dark:text-white" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}>
                {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price" className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 outline-none text-slate-900 dark:text-white" onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                <input type="number" placeholder="Qty" className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 outline-none text-slate-900 dark:text-white" onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})} />
              </div>
              <button onClick={handleAddProduct} className="w-full py-4 bg-[#4361ee] rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all">Add Product</button>
              <button onClick={() => setIsAddModalOpen(false)} className="w-full py-2 text-slate-400 dark:text-slate-500 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-slate-900 dark:text-white text-center">Edit Product</h2>
            <div className="space-y-4">
              <input type="text" value={selectedProduct.name} className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 outline-none text-slate-900 dark:text-white" onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={selectedProduct.price} className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 outline-none text-slate-900 dark:text-white" onChange={(e) => setSelectedProduct({...selectedProduct, price: e.target.value})} />
                <input type="number" value={selectedProduct.quantity} className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 outline-none text-slate-900 dark:text-white" onChange={(e) => setSelectedProduct({...selectedProduct, quantity: e.target.value})} />
              </div>
              <button onClick={handleUpdateProduct} className="w-full py-4 bg-emerald-500 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all">Save Changes</button>
              <button onClick={() => setIsEditModalOpen(false)} className="w-full py-2 text-slate-400 dark:text-slate-500 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete Product?</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Are you sure you want to delete <span className="font-bold text-indigo-600 dark:text-indigo-400">{productToDelete.name}</span>?</p>
            <div className="flex gap-3">
              <button onClick={handleDeleteProduct} className="flex-1 py-3 bg-red-500 rounded-xl font-bold text-white hover:bg-red-600 transition-colors">Delete</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Keep</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

