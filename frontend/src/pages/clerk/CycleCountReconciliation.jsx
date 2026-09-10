import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';

export default function CycleCountReconciliation() {
  const { isDark } = useTheme();

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

  const clerkName = localStorage.getItem('userName') || 'Inventory Auditor';

  // --- 1. FETCH PRODUCTS ---
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/products');
      const formatted = res.data.map(p => ({
        ...p,
        price: parseFloat(p.price) || 0,
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
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- 2. CALCULATE VARIANCES ---
  const modifiedItems = products.filter(p => {
    const physical = counts[p.id] !== undefined ? parseInt(counts[p.id], 10) : p.quantity;
    return !isNaN(physical) && physical !== p.quantity;
  });

  const totalVarianceNet = modifiedItems.reduce((acc, p) => {
    const physical = parseInt(counts[p.id], 10) || 0;
    return acc + (physical - p.quantity);
  }, 0);

  const handlePhysicalCountChange = (id, val) => {
    const value = val === '' ? '' : parseInt(val, 10);
    setCounts(prev => ({ ...prev, [id]: value }));
  };

  const handleReasonChange = (id, reason) => {
    setReasons(prev => ({ ...prev, [id]: reason }));
  };

  const handleResetToRecorded = (id, originalQty) => {
    setCounts(prev => ({ ...prev, [id]: originalQty }));
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

  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const displayedProducts = isExpanded
    ? filteredProducts
    : filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 font-sans ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
        
        {/* --- HEADER BANNER --- */}
        <div className="bg-linear-to-r from-[#00684a] via-[#005a3f] to-[#014732] text-white p-8 lg:p-10 rounded-3xl shadow-xl shadow-[#00684a]/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
          
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-widest border border-white/10">
              <Scale className="w-3.5 h-3.5" /> Physical Inventory Audit & Count
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Cycle Count & Reconciliation</h1>
            <p className="text-emerald-100/80 text-sm max-w-xl font-medium">
              Verify physical warehouse stock against system records, calculate variances, and submit audited batch adjustments.
            </p>
          </div>

          <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-black/20 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10 text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200/80">Pending Adjustments</p>
              <p className="text-2xl font-black text-white">{modifiedItems.length} <span className="text-xs font-semibold text-emerald-200">Discrepancies</span></p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={modifiedItems.length === 0}
              className="bg-white hover:bg-emerald-50 text-[#00684a] font-extrabold px-6 py-4 rounded-2xl shadow-lg transition-all flex items-center gap-2.5 active:scale-95 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-40"
            >
              <FileCheck2 className="w-4 h-4" /> Reconcile Stock ({modifiedItems.length})
            </button>
          </div>
        </div>

        {/* --- ACTION BAR & FILTERS --- */}
        <div className={`sticky top-4 z-30 backdrop-blur-xl border p-4 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 transition-all ${
          isDark ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search items to audit..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl pl-11 pr-4 py-3 outline-none text-sm font-medium transition-all ${
                isDark 
                  ? 'bg-[#0b1120] border-slate-800 text-white focus:border-[#00684a]' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#00684a]'
              }`}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['All', 'Vegetables', 'Fruits', 'Supplies', 'Raw Materials'].map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                  activeCategory === cat 
                  ? 'bg-[#00684a] text-white border-[#00684a] shadow-sm' 
                  : isDark 
                    ? 'bg-slate-800/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white' 
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- AUDIT SHEET TABLE --- */}
        <div className={`border rounded-3xl overflow-hidden shadow-xl ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-black uppercase tracking-wider ${
                  isDark ? 'border-slate-800 text-slate-400 bg-slate-900/50' : 'border-slate-200 text-slate-500 bg-slate-50'
                }`}>
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-4 text-center">System Recorded</th>
                  <th className="py-4 px-4 text-center">Physical Count</th>
                  <th className="py-4 px-4 text-center">Variance</th>
                  <th className="py-4 px-6">Reason Code</th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {displayedProducts.map(item => {
                  const physical = counts[item.id] !== undefined ? counts[item.id] : item.quantity;
                  const numPhysical = parseInt(physical, 10);
                  const isModified = !isNaN(numPhysical) && numPhysical !== item.quantity;
                  const variance = isNaN(numPhysical) ? 0 : numPhysical - item.quantity;

                  return (
                    <tr key={item.id} className={`transition-colors ${
                      isModified 
                        ? (isDark ? 'bg-amber-950/20' : 'bg-amber-50/50') 
                        : (isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50')
                    }`}>
                      {/* Product Name & Category */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image_url?.startsWith('http') ? item.image_url : `http://localhost:3000${item.image_url}`} 
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=100&q=80' }}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" 
                            alt={item.name} 
                          />
                          <div>
                            <p className={`font-extrabold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-semibold">{item.category} • ₱{item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </td>

                      {/* System Recorded Stock */}
                      <td className="py-4 px-4 text-center font-bold text-slate-500">
                        {item.quantity} Units
                      </td>

                      {/* Physical Count Input */}
                      <td className="py-4 px-4 text-center">
                        <input 
                          type="number"
                          min="0"
                          value={physical}
                          onChange={(e) => handlePhysicalCountChange(item.id, e.target.value)}
                          className={`w-24 px-3 py-2 rounded-xl text-center font-black text-sm border outline-none transition-all ${
                            isModified
                              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                              : isDark 
                                ? 'bg-[#0b1120] border-slate-800 text-white focus:border-[#00684a]' 
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#00684a]'
                          }`}
                        />
                      </td>

                      {/* Variance Indicator */}
                      <td className="py-4 px-4 text-center">
                        {variance === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Matched (0)
                          </span>
                        ) : variance > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            Surplus (+{variance})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                            Shortage ({variance})
                          </span>
                        )}
                      </td>

                      {/* Discrepancy Reason Code */}
                      <td className="py-4 px-6">
                        {isModified ? (
                          <select 
                            value={reasons[item.id] || ''}
                            onChange={(e) => handleReasonChange(item.id, e.target.value)}
                            className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-none focus:border-[#00684a] ${
                              isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
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
                          <span className="text-xs text-slate-400 italic">No discrepancy</span>
                        )}
                      </td>

                      {/* Action / Reset */}
                      <td className="py-4 px-4 text-center">
                        {isModified ? (
                          <button 
                            onClick={() => handleResetToRecorded(item.id, item.quantity)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Reset to system recorded count"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {filteredProducts.length > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <TablePagination 
                currentPage={currentPage}
                totalItems={filteredProducts.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
                itemLabel="items"
              />
            </div>
          )}
        </div>
      </div>

      {/* --- RECONCILIATION REVIEW MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className={`border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
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
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Total Discrepancies</span>
                  <span className="font-extrabold text-base text-slate-800 dark:text-slate-200">{modifiedItems.length} Products</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Net Inventory Variance</span>
                  <span className={`font-black text-base ${totalVarianceNet >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
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
                  placeholder="e.g. Completed weekly warehouse floor physical audit on main storage bays."
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
                  Adjustment Details
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
                          <span className={`text-xs font-black ${diff >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
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

      {/* --- AUDIT RECONCILIATION CERTIFICATE / REPORT --- */}
      {showCertificate && auditResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 p-8 rounded-3xl w-full max-w-lg font-sans shadow-2xl relative border border-slate-200">
            <div className="absolute top-0 left-0 w-full h-3 bg-[#00684a] rounded-t-3xl"></div>
            
            <div className="text-center border-b pb-4 mb-4 mt-2">
              <div className="inline-flex items-center gap-2 text-[#00684a] font-black text-sm uppercase tracking-widest mb-1">
                <Building2 className="w-4 h-4" /> Internal Warehouse Audit Certificate
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Stock Reconciliation Report</h2>
              <p className="text-xs font-bold text-slate-400 mt-0.5">Audit Ref: {auditResult.auditRef} • {auditResult.date}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Auditor / Custodian</span>
                <span className="font-extrabold text-slate-800">{auditResult.auditor}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Net Discrepancy Variance</span>
                <span className={`font-extrabold ${auditResult.netVariance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {auditResult.netVariance >= 0 ? `+${auditResult.netVariance}` : auditResult.netVariance} Units
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Audit Remarks</span>
                <span className="font-medium text-slate-700">{auditResult.notes || 'All inventory variances reconciled to physical counts.'}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Reconciled Items</span>
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
                <CheckCircle2 className="w-4 h-4" /> Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
