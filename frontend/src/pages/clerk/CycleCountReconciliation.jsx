import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import TablePagination from '../../components/TablePagination';
import { 
  Scale, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Layers, 
  Building2, 
  FileCheck2, 
  ArrowRightLeft,
  RotateCcw,
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Check,
  Clock,
  ShieldCheck,
  Sliders,
  Tag,
  Package
} from 'lucide-react';

export default function CycleCountReconciliation() {
  const { isDark, toggleTheme } = useTheme();

  const [products, setProducts] = useState([]);
  const [counts, setCounts] = useState({}); // { [productId]: physicalCount }
  const [reasons, setReasons] = useState({}); // { [productId]: reasonCode }
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const pageSize = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [auditNotes, setAuditNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const clerkName = localStorage.getItem('fullName') || localStorage.getItem('userName') || 'Inventory Auditor';
  const userRole = localStorage.getItem('userRole') || 'CLERK';

  // --- 1. FETCH PRODUCTS ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/api/products');
      const formatted = res.data.map(p => ({
        ...p,
        price: parseFloat(p.price) || 0,
        cost_price: p.cost_price !== undefined && p.cost_price !== null 
          ? parseFloat(p.cost_price) 
          : Math.round((parseFloat(p.price) || 0) * 0.65 * 100) / 100,
        quantity: parseInt(p.quantity, 10) || 0
      }));
      setProducts(formatted);

      // Initialize physical count state with current recorded quantity
      const initialCounts = {};
      const initialReasons = {};
      formatted.forEach(p => {
        initialCounts[p.id] = p.quantity;
        initialReasons[p.id] = 'Periodic Cycle Count Verification';
      });
      setCounts(initialCounts);
      setReasons(initialReasons);
    } catch (err) {
      console.error("Failed to load products for cycle count:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- 2. CALCULATE VARIANCES & METRICS ---
  const modifiedItems = products.filter(p => {
    const physical = counts[p.id] !== undefined ? parseInt(counts[p.id], 10) : p.quantity;
    return !isNaN(physical) && physical !== p.quantity;
  });

  const matchedCount = products.length - modifiedItems.length;

  const totalVarianceNet = modifiedItems.reduce((acc, p) => {
    const physical = parseInt(counts[p.id], 10) || 0;
    return acc + (physical - p.quantity);
  }, 0);

  const surplusItems = modifiedItems.filter(p => (parseInt(counts[p.id], 10) || 0) > p.quantity);
  const shortageItems = modifiedItems.filter(p => (parseInt(counts[p.id], 10) || 0) < p.quantity);

  const handlePhysicalCountChange = (id, val) => {
    const value = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    setCounts(prev => ({ ...prev, [id]: value }));
  };

  const adjustCount = (id, delta) => {
    setCounts(prev => {
      const current = prev[id] !== undefined ? parseInt(prev[id], 10) || 0 : 0;
      return { ...prev, [id]: Math.max(0, current + delta) };
    });
  };

  const handleReasonChange = (id, reason) => {
    setReasons(prev => ({ ...prev, [id]: reason }));
  };

  const handleResetToRecorded = (id, originalQty) => {
    setCounts(prev => ({ ...prev, [id]: originalQty }));
  };

  const resetAllCounts = () => {
    const resetCounts = {};
    products.forEach(p => {
      resetCounts[p.id] = p.quantity;
    });
    setCounts(resetCounts);
  };

  // --- 3. SUBMIT RECONCILIATION ---
  const handleConfirmReconciliation = async () => {
    if (modifiedItems.length === 0) {
      alert("No discrepancies or modifications detected. All items match recorded stock.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        items: modifiedItems.map(p => ({
          id: p.id,
          name: p.name,
          recorded_count: p.quantity,
          physical_count: parseInt(counts[p.id], 10) || 0,
          reason: reasons[p.id] || 'Cycle Count Audit Adjustment'
        })),
        clerk_name: clerkName,
        reference_no: `AUDIT-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: auditNotes
      };

      const res = await axios.post('http://localhost:3000/api/products/batch-reconciliation', payload);

      if (res.data.success) {
        setAuditResult({
          auditRef: res.data.reference_no,
          date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          auditor: clerkName,
          notes: auditNotes,
          items: payload.items,
          netVariance: totalVarianceNet
        });

        setIsModalOpen(false);
        setShowCertificate(true);
        await fetchProducts();
      }
    } catch (err) {
      console.error("Reconciliation error:", err);
      alert("Reconciliation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoriesList = ["General", "Vegetables", "Fruits", "Supplies", "Canned Goods", "Raw Materials"];
  const dynamicCategories = ["All", ...new Set([...categoriesList, ...products.map(p => p.category).filter(Boolean)])];

  const filteredProducts = products.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (item.name || '').toLowerCase().includes(q) ||
                          (item.category || '').toLowerCase().includes(q) ||
                          (item.sku || '').toLowerCase().includes(q) ||
                          (item.batch_number || '').toLowerCase().includes(q);
    const matchesCategory = activeCategory === 'All' || (item.category || '').toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const displayedProducts = isExpanded
    ? filteredProducts
    : filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER SECTION */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        
        {/* Header Title & Quick Badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-[#00684a] dark:text-emerald-400 uppercase tracking-wider">
                PHYSICAL INVENTORY AUDIT
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#00684a]/10 dark:bg-emerald-950/50 text-[#00684a] dark:text-emerald-300 font-bold uppercase tracking-wider border border-[#00684a]/20">
                Cycle Count Desk
              </span>
            </div>
            <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Cycle Count & Reconciliation
            </h1>
            <p className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Verify physical warehouse stock against system records, calculate variances, and submit audited batch adjustments.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
            }`}>
              <Layers className="w-3.5 h-3.5 text-[#00684a] dark:text-emerald-400" />
              <span>{products.length} Catalog SKUs</span>
            </div>

            <div className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              modifiedItems.length > 0 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' 
                : isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{modifiedItems.length} Discrepancies</span>
            </div>

            <button 
              onClick={fetchProducts}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isDark ? 'border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs'
              }`}
              title="Refresh Catalog Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. EXECUTIVE AUDIT KPI METRIC CARDS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          
          {/* Card 1: Total Catalog Items Audited */}
          <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                AUDITED INVENTORY ITEMS
              </p>
              <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Scale className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {products.length} <span className="text-xs font-normal text-slate-400">Products</span>
              </h3>
            </div>
            <p className="text-[10px] text-slate-400">
              Active warehouse stock catalog
            </p>
          </div>

          {/* Card 2: 100% Matched Records */}
          <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                MATCHED RECORDS (0 VARIANCE)
              </p>
              <div className="w-7 h-7 rounded-full bg-[#e6f4ea] dark:bg-emerald-950/40 text-[#00684a] dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className="text-2xl font-extrabold tracking-tight text-[#00684a] dark:text-emerald-400">
                {matchedCount} <span className="text-xs font-normal text-slate-400">Items ({products.length > 0 ? ((matchedCount / products.length) * 100).toFixed(0) : 100}%)</span>
              </h3>
            </div>
            <p className="text-[10px] text-slate-400">
              Exact match between floor and system
            </p>
          </div>

          {/* Card 3: Discrepancies Breakdown */}
          <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
            modifiedItems.length > 0 
              ? 'bg-amber-500/5 border-amber-500/20 dark:bg-amber-950/20 dark:border-amber-800/40' 
              : isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                DISCREPANCIES DETECTED
              </p>
              <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <h3 className={`text-2xl font-extrabold tracking-tight ${modifiedItems.length > 0 ? 'text-amber-600 dark:text-amber-400' : (isDark ? 'text-white' : 'text-slate-900')}`}>
                {modifiedItems.length}
              </h3>
              <span className="text-xs text-slate-400 font-semibold">
                ({shortageItems.length} Short / {surplusItems.length} Surplus)
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Requires supervisor audit reconciliation
            </p>
          </div>

          {/* Card 4: Net Variance Shift */}
          <div className={`p-5 rounded-2xl text-white flex flex-col justify-between shadow-md ${
            totalVarianceNet === 0 
              ? 'bg-[#00684a] shadow-[#00684a]/20' 
              : totalVarianceNet > 0 
                ? 'bg-blue-600 shadow-blue-600/20' 
                : 'bg-rose-600 shadow-rose-600/20'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                NET INVENTORY VARIANCE
              </p>
              <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center">
                {totalVarianceNet >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              </div>
            </div>
            <div className="my-3">
              <h3 className="text-2xl font-extrabold tracking-tight text-white">
                {totalVarianceNet >= 0 ? `+${totalVarianceNet}` : totalVarianceNet} <span className="text-xs font-normal text-white/80">Units Shift</span>
              </h3>
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/80 font-medium">
              <span>Audit reconciliation status:</span>
              <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md">
                {modifiedItems.length > 0 ? 'Pending Submission' : 'Balanced'}
              </span>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 3. CONTROLS, SEARCH & RECONCILE ACTION BAR */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search and Category Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search item, SKU, batch..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 pr-4 py-2 rounded-xl text-xs font-medium border outline-none transition-all w-64 md:w-72 ${
                  isDark ? 'bg-[#0f172a] border-slate-800 text-white focus:border-[#00684a]' : 'bg-white border-slate-200 text-slate-800 focus:border-[#00684a]'
                }`}
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {dynamicCategories.map((c) => (
                <button 
                  key={c} 
                  onClick={() => setActiveCategory(c)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                    activeCategory === c 
                    ? 'bg-[#00684a] text-white border-[#00684a] shadow-xs' 
                    : isDark 
                      ? 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {modifiedItems.length > 0 && (
              <button 
                onClick={resetAllCounts}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isDark ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Counts</span>
              </button>
            )}

            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={modifiedItems.length === 0}
              className="flex items-center gap-2 px-5 py-2 bg-[#00684a] hover:bg-[#005a3f] text-white rounded-xl text-xs font-extrabold shadow-sm shadow-[#00684a]/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Review & Reconcile ({modifiedItems.length})</span>
            </button>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 4. MASTER CYCLE COUNT AUDIT TABLE */}
        {/* ========================================================= */}
        <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                  isDark ? 'bg-slate-900/60 text-slate-400 border-slate-800' : 'bg-[#fcfdfd] text-slate-500 border-slate-100'
                }`}>
                  <th className="py-4 px-5">Product Ref & SKU</th>
                  <th className="py-4 px-4">Batch / Lot</th>
                  <th className="py-4 px-4 text-center">System Recorded</th>
                  <th className="py-4 px-4 text-center">Physical Count</th>
                  <th className="py-4 px-4 text-center">Variance Shift</th>
                  <th className="py-4 px-5">Audit Reason Code</th>
                  <th className="py-4 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs font-medium ${
                isDark ? 'divide-slate-800/80' : 'divide-slate-100'
              }`}>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                      Loading Inventory Audit Sheet...
                    </td>
                  </tr>
                ) : displayedProducts.length > 0 ? (
                  displayedProducts.map(item => {
                    const physical = counts[item.id] !== undefined ? counts[item.id] : item.quantity;
                    const numPhysical = parseInt(physical, 10);
                    const isModified = !isNaN(numPhysical) && numPhysical !== item.quantity;
                    const variance = isNaN(numPhysical) ? 0 : numPhysical - item.quantity;

                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors ${
                          isModified 
                            ? (isDark ? 'bg-amber-950/20 hover:bg-amber-950/30' : 'bg-amber-50/60 hover:bg-amber-50/80') 
                            : (isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70')
                        }`}
                      >
                        {/* Product Ref & SKU */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img 
                                src={item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : `http://localhost:3000${item.image}`} 
                                alt={item.name} 
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700/80 shrink-0 shadow-xs" 
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=60"; }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold shrink-0 shadow-xs">
                                <Package className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className={`font-bold text-sm leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {item.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-mono font-bold text-slate-400">
                                  {item.sku || `SKU-${(item.category || 'GEN').substring(0, 3).toUpperCase()}-${item.id}`}
                                </span>
                                <span className="text-[10px] text-slate-400">•</span>
                                <span className="text-[10px] text-slate-400 font-semibold">{item.category || 'General'}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Batch / Lot Code */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {item.batch_number ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                              {item.batch_number}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">LOT-STANDARD</span>
                          )}
                        </td>

                        {/* System Recorded Stock */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-500 dark:text-slate-400">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold">
                            {item.quantity} Units
                          </span>
                        </td>

                        {/* Interactive Physical Count Input & Steppers */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button 
                              onClick={() => adjustCount(item.id, -1)}
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                                isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
                              }`}
                              title="Decrease physical count"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <input 
                              type="number"
                              min="0"
                              value={physical}
                              onChange={(e) => handlePhysicalCountChange(item.id, e.target.value)}
                              className={`w-16 py-1 text-center font-black text-xs rounded-lg border outline-none transition-all ${
                                isModified
                                  ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200'
                                  : isDark 
                                    ? 'bg-slate-800 border-slate-700 text-white focus:border-[#00684a]' 
                                    : 'bg-white border-slate-200 text-slate-900 focus:border-[#00684a]'
                              }`}
                            />

                            <button 
                              onClick={() => adjustCount(item.id, 1)}
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                                isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
                              }`}
                              title="Increase physical count"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Variance Indicator Badge */}
                        <td className="py-3.5 px-4 text-center">
                          {variance === 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                              <Check className="w-3 h-3" /> Matched (0)
                            </span>
                          ) : variance > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                              <TrendingUp className="w-3 h-3" /> Surplus (+{variance})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                              <TrendingDown className="w-3 h-3" /> Shortage ({variance})
                            </span>
                          )}
                        </td>

                        {/* Discrepancy Reason Code */}
                        <td className="py-3.5 px-5">
                          {isModified ? (
                            <select 
                              value={reasons[item.id] || 'Periodic Cycle Count Verification'}
                              onChange={(e) => handleReasonChange(item.id, e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-semibold outline-none focus:border-[#00684a] ${
                                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="Periodic Cycle Count Verification">Periodic Cycle Count Verification</option>
                              <option value="Found Stock during Physical Recount">Found Stock during Physical Recount</option>
                              <option value="Damaged / Broken Goods in Warehouse">Damaged / Broken Goods in Warehouse</option>
                              <option value="Spoilage / Expired Batch">Spoilage / Expired Batch</option>
                              <option value="Supplier Delivery Shortage">Supplier Delivery Shortage</option>
                              <option value="Data Entry Typo Correction">Data Entry Typo Correction</option>
                              <option value="Shrinkage / Unaccounted Loss">Shrinkage / Unaccounted Loss</option>
                            </select>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No discrepancy noted</span>
                          )}
                        </td>

                        {/* Action / Reset */}
                        <td className="py-3.5 px-4 text-right">
                          {isModified ? (
                            <button 
                              onClick={() => handleResetToRecorded(item.id, item.quantity)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 transition-colors cursor-pointer"
                              title="Reset to system recorded count"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700 pr-2">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 text-xs font-medium">
                      No inventory items found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Component */}
          {filteredProducts.length > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <TablePagination 
                currentPage={currentPage}
                totalItems={filteredProducts.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
                itemLabel="products"
              />
            </div>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* 5. RECONCILIATION REVIEW MODAL */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-[#00684a] text-white">
              <div className="flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-emerald-200" />
                <div>
                  <h2 className="text-lg font-black tracking-tight">Confirm Cycle Count Adjustments</h2>
                  <p className="text-xs text-emerald-100">Review discrepancies and apply audit updates to warehouse database</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white text-lg font-bold cursor-pointer">✕</button>
            </header>
            
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Total Discrepancies</span>
                  <span className="font-extrabold text-base text-slate-800 dark:text-slate-200">{modifiedItems.length} Products</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Net Inventory Variance</span>
                  <span className={`font-black text-base ${totalVarianceNet >= 0 ? 'text-blue-500' : 'text-rose-500'}`}>
                    {totalVarianceNet >= 0 ? `+${totalVarianceNet}` : totalVarianceNet} Units
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Auditor Remarks & Summary Notes
                </label>
                <textarea 
                  rows="2"
                  placeholder="e.g. Completed weekly warehouse floor physical audit on storage bays."
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none focus:border-[#00684a] ${
                    isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Items Discrepancy Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Adjustment Details Breakdown
                </h4>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {modifiedItems.map(item => {
                    const physical = parseInt(counts[item.id], 10) || 0;
                    const diff = physical - item.quantity;
                    return (
                      <div key={item.id} className={`flex justify-between items-center p-3.5 rounded-xl border ${
                        isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="min-w-0 flex-1 pr-4">
                          <p className={`font-extrabold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">{reasons[item.id]}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-400">{item.quantity} → <span className="font-black text-slate-800 dark:text-white">{physical}</span></p>
                          <span className={`text-xs font-black ${diff >= 0 ? 'text-blue-500' : 'text-rose-500'}`}>
                            {diff >= 0 ? `+${diff}` : diff}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`p-6 border-t flex justify-end gap-3 ${
              isDark ? 'bg-[#0b1120]/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border cursor-pointer ${
                  isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmReconciliation}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-[#00684a] hover:bg-[#005a3f] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#00684a]/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? "Applying Changes..." : "Apply Audit Adjustments"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. AUDIT RECONCILIATION CERTIFICATE / REPORT */}
      {/* ========================================================= */}
      {showCertificate && auditResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 p-8 rounded-3xl w-full max-w-lg font-sans shadow-2xl relative border border-slate-200">
            <div className="absolute top-0 left-0 w-full h-3 bg-[#00684a] rounded-t-3xl"></div>
            
            <div className="text-center border-b pb-4 mb-4 mt-2">
              <div className="inline-flex items-center gap-2 text-[#00684a] font-black text-sm uppercase tracking-widest mb-1">
                <Building2 className="w-4 h-4" /> Internal Warehouse Management System
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Stock Reconciliation Certificate</h2>
              <p className="text-xs font-bold text-slate-400 mt-0.5">Audit Ref: {auditResult.auditRef} • {auditResult.date}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Auditor / Custodian</span>
                <span className="font-extrabold text-slate-800">{auditResult.auditor}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Net Discrepancy Variance</span>
                <span className={`font-extrabold ${auditResult.netVariance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                  {auditResult.netVariance >= 0 ? `+${auditResult.netVariance}` : auditResult.netVariance} Units
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Audit Remarks</span>
                <span className="font-medium text-slate-700">{auditResult.notes || 'All inventory variances reconciled to physical floor counts.'}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Reconciled Items Breakdown</span>
              {auditResult.items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-700">{item.name}</span>
                    <span className="text-[10px] text-slate-400 block">{item.reason}</span>
                  </div>
                  <span className="font-black text-[#00684a]">{item.recorded_count} → {item.physical_count}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => window.print()} 
                className="bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Certificate
              </button>
              <button 
                onClick={() => setShowCertificate(false)} 
                className="bg-[#00684a] text-white py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:bg-[#005a3f] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
