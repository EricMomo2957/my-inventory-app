import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AdminHeader from './AdminHeader';
import { 
  FolderTree, 
  Plus, 
  Edit3, 
  Trash2, 
  Package, 
  Layers, 
  TrendingUp, 
  Search, 
  Check, 
  Sparkles,
  RefreshCw,
  Folder,
  Tag,
  Boxes,
  Eye
} from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Emerald', code: '#00684a' },
  { name: 'Teal', code: '#10b981' },
  { name: 'Blue', code: '#3b82f6' },
  { name: 'Indigo', code: '#6366f1' },
  { name: 'Purple', code: '#8b5cf6' },
  { name: 'Amber', code: '#f59e0b' },
  { name: 'Cyan', code: '#06b6d4' },
  { name: 'Rose', code: '#ec4899' },
];

export default function CategoryManagement() {
  const { isDark } = useTheme();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Folder',
    color_code: '#00684a'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch('http://localhost:3000/api/categories').then(r => r.json()).catch(() => []),
        fetch('http://localhost:3000/api/products').then(r => r.json()).catch(() => [])
      ]);
      setCategories(Array.isArray(catRes) ? catRes : []);
      setProducts(Array.isArray(prodRes) ? prodRes : []);
    } catch (err) {
      console.error("Failed to load category data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const res = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({ name: '', description: '', icon: 'Folder', color_code: '#00684a' });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create category");
      }
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !selectedCategory.name.trim()) return;

    try {
      const res = await fetch(`http://localhost:3000/api/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedCategory)
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    try {
      const res = await fetch(`http://localhost:3000/api/categories/${selectedCategory.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCategories = categories.length;
  const totalCategorizedSkus = categories.reduce((acc, c) => acc + (parseInt(c.product_count, 10) || 0), 0);
  const totalCategoryValuation = categories.reduce((acc, c) => acc + (parseFloat(c.total_valuation) || 0), 0);
  const topCategory = [...categories].sort((a, b) => (parseFloat(b.total_valuation) || 0) - (parseFloat(a.total_valuation) || 0))[0];

  const categoryProducts = selectedCategory 
    ? products.filter(p => (p.category || '').toLowerCase().trim() === selectedCategory.name.toLowerCase().trim())
    : [];

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 font-sans ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      <AdminHeader 
        title="Category & Brand Master"
        subtitle="Standardize product classification, color-tagging, and portfolio valuation"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-7">
        
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Category Master Directory
            </h1>
            <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Organize warehouse catalogs, set standardized classification codes, and track category inventory value
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className={`p-2.5 rounded-xl border transition-colors ${
                isDark ? 'border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
              title="Refresh Categories"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#00684a] hover:bg-[#005a3f] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00684a]/25 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add New Category
            </button>
          </div>
        </div>

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Categories */}
          <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>
                MASTER CATEGORIES
              </p>
              <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <FolderTree className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {totalCategories} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Classifications</span>
              </h3>
            </div>
            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Active catalog divisions</p>
          </div>

          {/* Card 2: Categorized SKUs */}
          <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                CATEGORIZED PRODUCTS
              </p>
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Package className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {totalCategorizedSkus} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Assigned SKUs</span>
              </h3>
            </div>
            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Mapped warehouse items</p>
          </div>

          {/* Card 3: Portfolio Valuation */}
          <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                TOTAL VALUATION (PHP)
              </p>
              <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                ₱{totalCategoryValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Combined catalog value</p>
          </div>

          {/* Card 4 (Featured Emerald Card): Top Category */}
          <div className="p-5 rounded-2xl bg-[#00684a] text-white flex flex-col justify-between shadow-md shadow-[#00684a]/20">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-100">
                TOP VALUED DIVISION
              </p>
              <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className="text-2xl font-black tracking-tight truncate text-white">
                {topCategory ? topCategory.name : 'General Stock'}
              </h3>
            </div>
            <div className="flex items-center justify-between text-[10px] text-emerald-100 font-bold">
              <span>Category Value:</span>
              <span className="font-black bg-white/20 px-2 py-0.5 rounded-md">
                ₱{(parseFloat(topCategory?.total_valuation) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Category Cards Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCategories.map(cat => {
            const valuation = parseFloat(cat.total_valuation) || 0;
            const skuCount = parseInt(cat.product_count, 10) || 0;
            const units = parseInt(cat.total_units, 10) || 0;

            return (
              <div 
                key={cat.id} 
                className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between hover:shadow-xl relative group ${
                  isDark ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-300 hover:border-slate-400'
                }`}
              >
                {/* Accent Color Bar */}
                <div 
                  className="w-12 h-1.5 rounded-full mb-4" 
                  style={{ backgroundColor: cat.color_code || '#00684a' }}
                ></div>

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {cat.name}
                    </h3>
                    <p className={`text-xs mt-1 line-clamp-2 min-h-8 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {cat.description || 'Standard warehouse classification code.'}
                    </p>
                  </div>
                  
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: `${cat.color_code || '#00684a'}20`, color: cat.color_code || '#00684a' }}
                  >
                    <Folder className="w-5 h-5" />
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="my-4 p-3.5 rounded-2xl border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-300">Assigned SKUs:</span>
                    <span className={`font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>{skuCount} Products</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-300">Available Units:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{units} Units</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-300">Total Valuation:</span>
                    <span className="font-black text-[#00684a] dark:text-emerald-400">₱{valuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => { setSelectedCategory(cat); setIsInspectModalOpen(true); }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      isDark ? 'border-slate-800 bg-slate-800/70 hover:bg-slate-700 text-slate-200' : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-950'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> View SKUs
                  </button>
                  <button 
                    onClick={() => { setSelectedCategory(cat); setIsEditModalOpen(true); }}
                    className="p-2 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => { setSelectedCategory(cat); setIsDeleteModalOpen(true); }}
                    className="p-2 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- ADD CATEGORY MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className={`w-full max-w-md rounded-3xl p-7 border shadow-2xl ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-xl font-black mb-1">Add Master Category</h2>
            <p className="text-xs text-slate-400 mb-5">Create a standardized classification division for inventory items.</p>
            
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Category Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Frozen Cold Logistics" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Description</label>
                <textarea 
                  rows="2"
                  placeholder="Brief summary of items classified under this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none resize-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                ></textarea>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 block">Category Color Accent</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setFormData({ ...formData, color_code: c.code })}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: c.code }}
                      title={c.name}
                    >
                      {formData.color_code === c.code && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-[#00684a] hover:bg-[#005a3f] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00684a]/25 transition-all cursor-pointer"
                >
                  Create Category
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className={`px-5 py-3 rounded-xl text-xs font-bold border cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CATEGORY MODAL --- */}
      {isEditModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className={`w-full max-w-md rounded-3xl p-7 border shadow-2xl ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-xl font-black mb-1">Edit Category</h2>
            <p className="text-xs text-slate-400 mb-5">Update details for "{selectedCategory.name}".</p>
            
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Category Name</label>
                <input 
                  type="text" 
                  required
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Description</label>
                <textarea 
                  rows="2"
                  value={selectedCategory.description || ''}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none resize-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                ></textarea>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 block">Color Accent</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedCategory({ ...selectedCategory, color_code: c.code })}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: c.code }}
                      title={c.name}
                    >
                      {selectedCategory.color_code === c.code && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-[#00684a] hover:bg-[#005a3f] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00684a]/25 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  className={`px-5 py-3 rounded-xl text-xs font-bold border cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- INSPECT PRODUCTS MODAL --- */}
      {isInspectModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className={`w-full max-w-2xl rounded-3xl p-7 border shadow-2xl max-h-[85vh] flex flex-col ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h2 className="text-lg font-black flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCategory.color_code || '#00684a' }}></span>
                  {selectedCategory.name} Catalog
                </h2>
                <p className="text-xs text-slate-400">Total {categoryProducts.length} assigned inventory SKUs</p>
              </div>
              <button 
                onClick={() => setIsInspectModalOpen(false)}
                className={`p-2 rounded-xl border text-xs font-bold ${
                  isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'
                }`}
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {categoryProducts.length > 0 ? (
                categoryProducts.map(prod => (
                  <div 
                    key={prod.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700">
                        <img 
                          src={prod.image_url?.startsWith('http') ? prod.image_url : `http://localhost:3000${prod.image_url}`} 
                          alt={prod.name} 
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=100&q=80' }}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>{prod.name}</h4>
                        <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{prod.sku || `SKU-#${prod.id}`}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-[#00684a] dark:text-emerald-400">₱{parseFloat(prod.price || 0).toFixed(2)}</p>
                      <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>{prod.quantity} Units Available</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  No products currently classified under this category.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {isDeleteModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl text-center ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold mb-1">Delete Category?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Remove <span className="font-bold text-slate-800 dark:text-white">"{selectedCategory.name}"</span> from the catalog master directory?
            </p>
            <div className="flex gap-2.5">
              <button 
                onClick={handleDeleteCategory} 
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Delete
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
                  isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'
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
