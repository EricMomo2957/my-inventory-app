import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

/** * UI COMPONENTS */
function StatCard({ title, val, icon, color = "text-slate-900", isDark }) {
  return (
    <div className={`p-6 rounded-2xl border transition-all duration-500 shadow-sm hover:shadow-md ${
      isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border transition-colors ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
        }`}>
          {icon}
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {title}
          </p>
          <h3 className={`text-2xl font-black ${isDark ? 'text-white' : color}`}>
            {val}
          </h3>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ products = [], fetchProducts, activeAlertsCount = 0 }) {
  const { isDark } = useTheme();
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
      await fetch('http://localhost:3000/api/products', { method: 'POST', body: formData });
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
      await fetch(`http://localhost:3000/api/products/${selectedProduct.id}`, { method: 'POST', body: formData });
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error) { console.error("Update failed:", error); }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await fetch(`http://localhost:3000/api/products/${productToDelete.id}`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch (error) { console.error("Delete failed:", error); }
  };

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-500 ${
      isDark ? 'bg-[#0b1120]' : 'bg-[#f8fafc]'
    }`}>
      {/* Header */}
      <header className={`flex justify-between items-center p-8 border-b transition-colors duration-500 ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Dashboard</h1>
          <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-[#4361ee] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200/50 dark:shadow-none active:scale-95 transition-all">
          + Add Product
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <StatCard title="Total Items" val={totalItems} icon="📦" isDark={isDark} />
          <StatCard title="Value" val={`₱${inventoryValue.toLocaleString()}`} icon="💰" isDark={isDark} />
          <StatCard title="Low Stock" val={activeAlertsCount} icon="⚠️" color="text-red-500" isDark={isDark} />
          <StatCard title="Veg" val={products.filter(p => p.category === 'Vegetables').length} icon="🥦" isDark={isDark} />
          <StatCard title="Fruits" val={products.filter(p => p.category === 'Fruits').length} icon="🍎" isDark={isDark} />
          <StatCard title="Supplies" val={products.filter(p => p.category === 'Supplies').length} icon="🛠️" isDark={isDark} />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Search products..." 
            className={`flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-4 transition-all ${
              isDark 
                ? 'bg-[#111827] border-slate-800 text-white focus:ring-indigo-900/20' 
                : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-50'
            }`} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {dynamicCategories.map(c => (
              <button 
                key={c} 
                onClick={() => setActiveCategory(c)} 
                className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategory === c 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                    : `${isDark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Main Table */}
        <div className={`rounded-3xl border overflow-hidden shadow-sm transition-colors duration-500 ${
          isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <table className="w-full text-left border-collapse">
            <thead className={`text-[10px] font-black uppercase tracking-widest border-b transition-colors ${
              isDark ? 'bg-slate-900/80 text-slate-500 border-slate-800' : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}>
              <tr>
                <th className="p-6">Name</th>
                <th className="p-6">Category</th>
                <th className="p-6 text-center">Qty</th>
                <th className="p-6">Price</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
              {filteredProducts.map(item => (
                <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/50'}`}>
                  <td className="p-6 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center overflow-hidden shrink-0 ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                    }`}>
                      {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" alt="" /> : "📦"}
                    </div>
                    <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item.name}</span>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className={`p-6 text-center font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.quantity}</td>
                  <td className={`p-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>₱{Number(item.price).toFixed(2)}</td>
                  <td className="p-6 text-right space-x-2">
                    <button onClick={() => { setSelectedProduct(item); setIsEditModalOpen(true); }} className={`p-2 rounded-lg transition-all ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-indigo-900/30 hover:text-indigo-400' : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600'}`}>✏️</button>
                    <button onClick={() => { setProductToDelete(item); setIsDeleteModalOpen(true); }} className={`p-2 rounded-lg transition-all ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-red-900/30 hover:text-red-400' : 'bg-slate-50 hover:bg-red-50 hover:text-red-600'}`}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-6 bg-slate-900/40 dark:bg-black/60">
          <div className={`w-full max-w-md rounded-3xl p-8 shadow-2xl border transition-colors ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h2 className={`text-xl font-black mb-6 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>New Product</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Product Name" className={`w-full border rounded-xl p-4 outline-none ${isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              <select className={`w-full border rounded-xl p-4 outline-none ${isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}>
                {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price" className={`w-full border rounded-xl p-4 outline-none ${isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                <input type="number" placeholder="Qty" className={`w-full border rounded-xl p-4 outline-none ${isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})} />
              </div>
              <button onClick={handleAddProduct} className="w-full py-4 bg-[#4361ee] rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all">Add Product</button>
              <button onClick={() => setIsAddModalOpen(false)} className="w-full py-2 font-bold text-sm text-slate-500">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-6 bg-slate-900/40 dark:bg-black/60">
          <div className={`w-full max-w-md rounded-3xl p-8 shadow-2xl border transition-colors ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h2 className={`text-xl font-black mb-6 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Product</h2>
            <div className="space-y-4">
              <input type="text" value={selectedProduct.name} className={`w-full border rounded-xl p-4 outline-none ${isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={selectedProduct.price} className={`w-full border rounded-xl p-4 outline-none ${isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} onChange={(e) => setSelectedProduct({...selectedProduct, price: e.target.value})} />
                <input type="number" value={selectedProduct.quantity} className={`w-full border rounded-xl p-4 outline-none ${isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} onChange={(e) => setSelectedProduct({...selectedProduct, quantity: e.target.value})} />
              </div>
              <button onClick={handleUpdateProduct} className="w-full py-4 bg-emerald-500 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all">Save Changes</button>
              <button onClick={() => setIsEditModalOpen(false)} className="w-full py-2 font-bold text-sm text-slate-500">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-6 bg-slate-900/40 dark:bg-black/60">
          <div className={`w-full max-sm rounded-3xl p-8 shadow-2xl border text-center transition-colors ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h2 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Delete Product?</h2>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Are you sure you want to delete <span className="font-bold text-indigo-500">{productToDelete.name}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={handleDeleteProduct} className="flex-1 py-3 bg-red-500 rounded-xl font-bold text-white hover:bg-red-600 transition-colors">Delete</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}>Keep</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}