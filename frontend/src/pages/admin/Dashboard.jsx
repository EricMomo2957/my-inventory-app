import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Plus, 
  RefreshCw, 
  Calendar as CalendarIcon, 
  Bell, 
  Moon, 
  Sun, 
  Package, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Edit3, 
  Trash2,
  CheckCircle2,
  Layers,
  ShoppingBag
} from 'lucide-react';

export default function Dashboard({ products = [], fetchProducts, activeAlertsCount = 0 }) {
  const { isDark, toggleTheme } = useTheme();
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
  const lowStockProducts = products.filter(p => Number(p.quantity) < 5);

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

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
    formData.append("quantity", Number(selectedProduct.quantity));
    formData.append("price", Number(selectedProduct.price));
    
    if (selectedProduct.imageFile) formData.append("image", selectedProduct.imageFile);

    try {
      const response = await fetch(`http://localhost:3000/api/products/${selectedProduct.id}`, { 
        method: 'PUT', 
        body: formData 
      });
      
      if (response.ok) {
        setIsEditModalOpen(false);
        fetchProducts();
      }
    } catch (error) { 
      console.error("Update failed:", error); 
    }
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
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* Top Header Bar */}
      <header className={`px-8 py-4 border-b flex items-center justify-between transition-colors ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            System Dashboard
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Pill */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold ${
            isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200/80 text-slate-600'
          }`}>
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDateFormatted}</span>
          </div>

          {/* Notifications */}
          <button 
            className={`p-2 rounded-xl border transition-colors relative ${
              isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-100 hover:bg-slate-50 text-slate-600'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {lowStockProducts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            )}
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-colors ${
              isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-100 hover:bg-slate-50 text-slate-600'
            }`}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-7">
        
        {/* Title & Refresh Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              System Overview
            </h1>
            <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Real-time Stock Monitoring & Inventory Analytics
            </p>
          </div>

          <button 
            onClick={() => fetchProducts && fetchProducts()}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all shadow-xs ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Top Grid: Quick-Desk & Pending Notice Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Quick-Desk Actions (Col 8) */}
          <div className={`lg:col-span-8 p-6 rounded-2xl border shadow-xs transition-colors ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <h2 className={`text-xs font-bold uppercase tracking-wider mb-4 ${
              isDark ? 'text-slate-300' : 'text-slate-800'
            }`}>
              Administrative Actions Quick-Desk
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Action 1: Add Product */}
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                  isDark ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800' : 'bg-[#fcfdfd] border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#00684a]/10 text-[#00684a] dark:text-emerald-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Add New Product
                </span>
              </button>

              {/* Action 2: Restock Queue */}
              <button 
                onClick={() => {
                  const target = document.getElementById('inventory-table');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                  isDark ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800' : 'bg-[#fcfdfd] border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Stock Restock Queue
                </span>
              </button>

              {/* Action 3: Export Reports */}
              <a 
                href="/admin/reports"
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                  isDark ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800' : 'bg-[#fcfdfd] border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Export Reports
                </span>
              </a>

            </div>
          </div>

          {/* Pending Alerts / Notice Card (Col 4) */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#fef9ee] dark:bg-amber-950/20 border border-[#fde8bb] dark:border-amber-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Pending Stock Placements</span>
                </div>
                <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200 text-[10px] font-bold flex items-center justify-center">
                  {lowStockProducts.length}
                </span>
              </div>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-1 leading-relaxed">
                {lowStockProducts.length > 0 
                  ? `${lowStockProducts.length} item(s) are critically low and require restocking.` 
                  : "All product stock levels are currently up to date."}
              </p>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-amber-200/60 dark:border-slate-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#00684a] dark:text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate">
                  {lowStockProducts.length > 0 ? "Replenishment Recommended" : "No Critical Shortages"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {lowStockProducts.length > 0 ? `${lowStockProducts[0]?.name} is below 5 units` : "Inventory audit trail is clear"}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Financial & Stock Health Section */}
        <div>
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-3.5 ${
            isDark ? 'text-slate-400' : 'text-slate-800'
          }`}>
            Inventory Financial & Stock Health
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* Card 1: Total Value */}
            <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  TOTAL CAPITAL / VALUE
                </p>
                <div className="w-7 h-7 rounded-full bg-[#e6f4ea] dark:bg-emerald-950/40 text-[#00684a] dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-3">
                <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₱{inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <p className="text-[10px] text-slate-400">
                Cumulative evaluated stock volume
              </p>
            </div>

            {/* Card 2: Total Items */}
            <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  TOTAL UNITS IN STOCK
                </p>
                <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-3">
                <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {totalItems.toLocaleString()} <span className="text-xs font-normal text-slate-400">Units</span>
                </h3>
              </div>
              <p className="text-[10px] text-slate-400">
                Across {products.length} catalog items
              </p>
            </div>

            {/* Card 3: Active SKUs */}
            <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  LOW STOCK ITEMS
                </p>
                <div className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-3">
                <h3 className={`text-2xl font-extrabold tracking-tight ${lowStockProducts.length > 0 ? 'text-red-500' : (isDark ? 'text-white' : 'text-slate-900')}`}>
                  {lowStockProducts.length} <span className="text-xs font-normal text-slate-400">Alerts</span>
                </h3>
              </div>
              <p className="text-[10px] text-slate-400">
                Items below critical threshold (&lt;5)
              </p>
            </div>

            {/* Card 4: Highlight Solid Emerald Card (Matching Reference Design!) */}
            <div className="p-5 rounded-2xl bg-[#00684a] text-white flex flex-col justify-between shadow-md shadow-[#00684a]/20">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                  STOCK HEALTH RATE
                </p>
                <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-3">
                <h3 className="text-2xl font-extrabold tracking-tight text-white">
                  {products.length > 0 ? `${(((products.length - lowStockProducts.length) / products.length) * 100).toFixed(1)}%` : '100%'}
                </h3>
              </div>
              <p className="text-[10px] text-emerald-100">
                Fulfillment & supply pipeline active
              </p>
            </div>

          </div>
        </div>

        {/* Operational Inventory Table Section */}
        <div id="inventory-table" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Operational Inventory Status
              </h2>
              <p className="text-xs text-slate-400">
                Click any product to adjust stock or update details
              </p>
            </div>

            {/* Search & Category Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search catalog..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-9 pr-4 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#00684a]' : 'bg-white border-slate-200 text-slate-800 focus:border-[#00684a]'
                  }`}
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {dynamicCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                      activeCategory === c
                        ? 'bg-[#00684a] text-white border-[#00684a] shadow-xs'
                        : `${isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Data Table */}
          <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                  isDark ? 'bg-slate-900/60 text-slate-400 border-slate-800' : 'bg-[#fcfdfd] text-slate-500 border-slate-100'
                }`}>
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-center">Stock Level</th>
                  <th className="py-4 px-6">Unit Price</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs font-medium ${
                isDark ? 'divide-slate-800/80' : 'divide-slate-100'
              }`}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Product Name & Avatar */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-11 h-11 rounded-xl overflow-hidden shrink-0 border flex items-center justify-center ${
                            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
                          }`}>
                            {item.image_url ? (
                              <img 
                                src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:3000${item.image_url}`} 
                                alt={item.name} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className={`font-bold text-sm leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {item.name}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400">
                              SKU-#{item.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          item.category === 'Vegetables' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' :
                          item.category === 'Fruits' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800' :
                          item.category === 'Supplies' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800' :
                          'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}>
                          {item.category || 'General'}
                        </span>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-6 text-center">
                        <span className={`font-extrabold ${
                          Number(item.quantity) < 5 ? 'text-red-500' : isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          {item.quantity} units
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-6 font-bold text-[#00684a] dark:text-emerald-400">
                        ₱{Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right space-x-1.5">
                        <button 
                          onClick={() => { setSelectedProduct(item); setIsEditModalOpen(true); }} 
                          className={`p-2 rounded-lg border transition-colors ${
                            isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                          title="Edit Product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => { setProductToDelete(item); setIsDeleteModalOpen(true); }} 
                          className="p-2 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">
                      No products found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 backdrop-blur-xs bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-3xl p-7 border shadow-xl ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            <h2 className="text-lg font-extrabold mb-5">Add New Product</h2>
            
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Fresh Organic Tomatoes"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Unit Price (₱)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Initial Quantity</label>
                <input 
                  type="number" 
                  placeholder="0"
                  value={newProduct.quantity || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Product Photo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setNewProduct({ ...newProduct, imageFile: e.target.files[0] })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs text-slate-400 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button 
                  onClick={handleAddProduct}
                  className="flex-1 py-3 bg-[#00684a] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00684a]/20 hover:bg-[#00563b] transition-all"
                >
                  Save Product
                </button>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-5 py-3 rounded-xl text-xs font-bold border ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 backdrop-blur-xs bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-3xl p-7 border shadow-xl ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            <h2 className="text-lg font-extrabold mb-5">Edit Product Details</h2>
            
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Product Name</label>
                <input 
                  type="text" 
                  value={selectedProduct.name || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Category</label>
                  <select
                    value={selectedProduct.category || 'General'}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Unit Price (₱)</label>
                  <input 
                    type="number" 
                    value={selectedProduct.price ?? ''}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Stock Quantity</label>
                <input 
                  type="number" 
                  value={selectedProduct.quantity ?? ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, quantity: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Update Photo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, imageFile: e.target.files[0] })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs text-slate-400 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button 
                  onClick={handleUpdateProduct}
                  className="flex-1 py-3 bg-[#00684a] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00684a]/20 hover:bg-[#00563b] transition-all"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className={`px-5 py-3 rounded-xl text-xs font-bold border ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 backdrop-blur-xs bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-xl text-center ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold mb-1">Delete Product</h3>
            <p className="text-xs text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-white">"{productToDelete.name}"</span>?
            </p>
            <div className="flex gap-2.5">
              <button 
                onClick={handleDeleteProduct}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Delete
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${
                  isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}