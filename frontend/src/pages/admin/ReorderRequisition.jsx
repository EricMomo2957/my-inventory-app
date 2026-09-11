import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import AdminHeader from './AdminHeader';
import { 
  Zap, 
  AlertTriangle, 
  DollarSign, 
  ShoppingCart, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  Search, 
  Package, 
  Layers, 
  TrendingDown, 
  ShieldAlert,
  Sparkles,
  Sliders
} from 'lucide-react';

export default function ReorderRequisition() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState({ summary: {}, recommendations: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [converting, setConverting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/analytics/reorder-recommendations');
      if (!res.ok) throw new Error("Failed to fetch reorder recommendations");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Reorder recommendations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Convert selected items to PO
  const handleCreateAutoPO = async () => {
    if (data.recommendations.length === 0) {
      alert("No deficit items to reorder.");
      return;
    }

    if (!window.confirm(`Generate automated Purchase Order for ${data.recommendations.length} items with estimated budget $${(data.summary.total_estimated_budget || 0).toFixed(2)}?`)) {
      return;
    }

    setConverting(true);
    try {
      const res = await fetch('http://localhost:3000/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: 1,
          supplier_name: 'Prime Logistics & Hardware Supplies',
          notes: 'Auto-generated replenishment purchase requisition based on low-stock threshold algorithms.',
          created_by: localStorage.getItem('userName') || 'MindStock AI Auto-Reorder Engine',
          items: data.recommendations.map(r => ({
            product_id: r.id,
            product_name: r.name,
            quantity_ordered: r.recommended_reorder,
            unit_cost: r.unit_cost,
            total_cost: r.estimated_cost
          }))
        })
      });

      const poData = await res.json();
      if (poData.success) {
        showToast(`✅ Generated Purchase Order ${poData.po_number}! Redirecting to PO Desk...`);
        setTimeout(() => navigate('/admin/purchase-orders'), 1500);
      } else {
        alert("Failed: " + poData.message);
      }
    } catch (err) {
      alert("Error generating auto PO: " + err.message);
    } finally {
      setConverting(false);
    }
  };

  // Filter recommendations
  const filteredRecs = useMemo(() => {
    return (data.recommendations || []).filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUrgency = urgencyFilter === 'all' || item.urgency === urgencyFilter;
      return matchesSearch && matchesUrgency;
    });
  }, [data.recommendations, searchQuery, urgencyFilter]);

  const summary = data.summary || {};

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <AdminHeader 
        title="Automated Reorder Desk" 
        subtitle="Dynamic Stock Deficit Calculation & 1-Click Purchase Requisitions"
      />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* 4-CARD METRIC GRID-BOX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-amber-500/50' : 'bg-white border-slate-200/80 hover:border-amber-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Items Needing Reorder</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {summary.total_items_needing_reorder || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Below safety thresholds</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-red-500/50' : 'bg-white border-slate-200/80 hover:border-red-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Zero Stock (Critical)</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {summary.critical_zero_stock_items || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-semibold">
              <span>Immediate stockout risk</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200/80 hover:border-[#00684a]/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated Budget Needed</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ${(summary.total_estimated_budget || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full replenishment budget</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200/80 hover:border-blue-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg. Unit Cost</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ${(summary.average_unit_cost || 0).toFixed(2)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <Zap className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
              <span>Per SKU average reorder cost</span>
            </div>
          </div>
        </div>

        {/* AI REORDER CALLOUT BANNER */}
        <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
          isDark 
            ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-blue-950/40 border-emerald-500/30' 
            : 'bg-gradient-to-r from-emerald-50 via-white to-blue-50 border-emerald-200'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#00684a] text-white flex items-center justify-center font-bold shadow-md shadow-[#00684a]/30 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black flex items-center gap-2">
                <span>1-Click Automated Procurement Requisition</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">Algorithmic</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Instantly bundle all {data.recommendations?.length || 0} deficit items into a formal Purchase Order for approval.
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateAutoPO}
            disabled={converting || (data.recommendations?.length === 0)}
            className="px-5 py-2.5 rounded-xl bg-[#00684a] hover:bg-[#00553c] text-white text-xs font-bold shadow-lg shadow-[#00684a]/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {converting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
            <span>Generate Reorder PO ({data.recommendations?.length || 0} Items)</span>
          </button>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search product, category or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-700 text-white focus:border-emerald-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#00684a]'
              }`}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className={`p-2.5 rounded-xl border text-xs font-bold focus:outline-none ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">All Urgency Levels</option>
              <option value="CRITICAL">Critical (Zero Stock)</option>
              <option value="HIGH">High (≤ 2 Units)</option>
              <option value="MODERATE">Moderate (Under Threshold)</option>
            </select>

            <button
              onClick={loadRecommendations}
              className={`p-2.5 rounded-xl border text-slate-400 hover:text-slate-200 transition-colors cursor-pointer ${
                isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
              }`}
              title="Refresh Recommendations"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* DEFICIT RECOMMENDATIONS TABLE */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800/60 gap-3">
            <div>
              <h2 className="text-base font-black">Stock Deficit & Reorder Breakdown</h2>
              <p className="text-xs text-slate-400">Target safe holding quantities vs. current inventory on hand</p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {filteredRecs.length} SKU Deficits Detected
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={`border-b text-[11px] font-extrabold uppercase tracking-wider ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                }`}>
                  <th className="pb-3 px-3">SKU & Item</th>
                  <th className="pb-3 px-3">Location</th>
                  <th className="pb-3 px-3 text-center">On Hand</th>
                  <th className="pb-3 px-3 text-center">Min Threshold</th>
                  <th className="pb-3 px-3 text-center">Target Stock</th>
                  <th className="pb-3 px-3 text-center">Suggested Reorder</th>
                  <th className="pb-3 px-3">Estimated Cost</th>
                  <th className="pb-3 px-3 text-right">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredRecs.map(r => {
                  const isCrit = r.urgency === 'CRITICAL';
                  const isHigh = r.urgency === 'HIGH';

                  return (
                    <tr key={r.id} className={`hover:bg-slate-800/20 transition-colors ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}>
                      <td className="py-3 px-3">
                        <div className="font-bold text-sm">{r.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{r.sku} • {r.category}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 text-xs font-mono font-bold">
                          {r.location}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-black">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          r.current_stock === 0 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {r.current_stock}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center text-xs text-slate-400 font-semibold">
                        {r.min_threshold}
                      </td>

                      <td className="py-3 px-3 text-center text-xs font-bold text-emerald-400">
                        {r.target_stock}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-black text-sm text-[#00684a] dark:text-emerald-400">
                        +{r.recommended_reorder} units
                      </td>

                      <td className="py-3 px-3 font-mono font-extrabold text-xs">
                        ${r.estimated_cost.toFixed(2)}
                        <span className="text-[10px] text-slate-400 block font-normal">@ ${r.unit_cost.toFixed(2)}/ea</span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isCrit
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                            : isHigh
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {r.urgency}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
