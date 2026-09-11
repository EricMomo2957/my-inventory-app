import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AdminHeader from './AdminHeader';
import TablePagination from '../../components/TablePagination';
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  Coins, 
  Boxes, 
  Layers, 
  Sparkles,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Lock,
  Package
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart as RechartsPieChart, 
  Pie 
} from 'recharts';

export default function ABCAnalytics() {
  const { isDark } = useTheme();
  const [data, setData] = useState({ summary: {}, items: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadABC = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/analytics/abc-analysis');
      if (!res.ok) throw new Error("Failed to fetch ABC analysis");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("ABC Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadABC();
  }, []);

  const summary = data.summary || {};
  const items = data.items || [];

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = selectedClass === 'all' || item.abc_class === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [items, searchQuery, selectedClass]);

  // Reset page on search or class filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedClass]);

  // Paginated items
  const displayedItems = useMemo(() => {
    if (isExpanded) return filteredItems;
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize, isExpanded]);

  // Top 8 Items for Bar Chart
  const topValuedItems = useMemo(() => {
    return items.slice(0, 8).map(i => ({
      name: i.name.length > 14 ? i.name.substring(0, 12) + '...' : i.name,
      value: i.holding_value,
      class: i.abc_class
    }));
  }, [items]);

  // Pie Chart Data
  const pieData = useMemo(() => {
    return [
      { name: 'Class A (High Value)', value: summary.class_a?.value || 0, color: '#00684a' },
      { name: 'Class B (Moderate)', value: summary.class_b?.value || 0, color: '#3b82f6' },
      { name: 'Class C (Low Value)', value: summary.class_c?.value || 0, color: '#8b5cf6' },
    ];
  }, [summary]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <AdminHeader 
        title="ABC Inventory Analysis & Velocity" 
        subtitle="Pareto 80/20 Valuation Categorization & Capital Lockup Prevention"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* 4-CARD METRIC GRID-BOX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200/80 hover:border-[#00684a]/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Asset Valuation</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₱{(summary.total_valuation || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <Coins className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Across {summary.total_skus || 0} active warehouse SKUs</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200/80 hover:border-[#00684a]/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Class A (Top 70%)</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {summary.class_a?.count || 0} SKUs ({summary.class_a?.pct || 0}%)
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>High capital concentration</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200/80 hover:border-blue-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Class B (20% Worth)</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {summary.class_b?.count || 0} SKUs ({summary.class_b?.pct || 0}%)
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
              <span>Moderate turnover rate</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-purple-500/50' : 'bg-white border-slate-200/80 hover:border-purple-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Class C (Low Value / Bulk)</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {summary.class_c?.count || 0} SKUs ({summary.class_c?.pct || 0}%)
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <Boxes className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">
              <span>Candidate for bulk replenishment</span>
            </div>
          </div>
        </div>

        {/* VISUAL CHARTS (2-Column Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Top Valued SKUs Bar Chart (Col 7) */}
          <div className={`lg:col-span-7 p-6 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/60">
              <div>
                <h3 className="text-base font-black">Top Holding Value Assets</h3>
                <p className="text-xs text-slate-400">Products tying up the highest working capital</p>
              </div>
              <span className="text-xs font-bold text-slate-400">Unit Cost × Quantity</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topValuedItems}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                      borderRadius: '12px',
                      border: '1px solid #334155'
                    }} 
                    formatter={(value) => [`₱${Number(value).toFixed(2)}`, 'Holding Value']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {topValuedItems.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.class === 'A' ? '#00684a' : (entry.class === 'B' ? '#3b82f6' : '#8b5cf6')} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pareto Valuation Ratio Donut (Col 5) */}
          <div className={`lg:col-span-5 p-6 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/60">
              <div>
                <h3 className="text-base font-black">Valuation Concentration</h3>
                <p className="text-xs text-slate-400">Class A / B / C asset proportion</p>
              </div>
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₱${Number(value).toFixed(2)}`, 'Valuation']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend breakdown */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-center">
              <div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#00684a] inline-block mb-1"></span>
                <p className="text-[10px] font-bold text-slate-400">Class A (70%)</p>
                <p className="text-xs font-black text-emerald-400">₱{(summary.class_a?.value || 0).toLocaleString()}</p>
              </div>
              <div>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block mb-1"></span>
                <p className="text-[10px] font-bold text-slate-400">Class B (20%)</p>
                <p className="text-xs font-black text-blue-400">₱{(summary.class_b?.value || 0).toLocaleString()}</p>
              </div>
              <div>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block mb-1"></span>
                <p className="text-[10px] font-bold text-slate-400">Class C (10%)</p>
                <p className="text-xs font-black text-purple-400">₱{(summary.class_c?.value || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search SKU or Product Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-700 text-white focus:border-emerald-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#00684a]'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['all', 'A', 'B', 'C'].map(c => (
              <button
                key={c}
                onClick={() => setSelectedClass(c)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedClass === c
                    ? 'bg-[#00684a] text-white shadow-md shadow-[#00684a]/20'
                    : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c === 'all' ? 'All Classes' : `Class ${c}`}
              </button>
            ))}
            <button
              onClick={loadABC}
              className={`p-2 rounded-xl border text-slate-400 hover:text-slate-200 transition-colors cursor-pointer ${
                isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
              }`}
              title="Refresh ABC Classification"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ABC CLASSIFICATION MASTER TABLE */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300 shadow-sm'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800/60 gap-3">
            <div>
              <h2 className="text-base font-black" style={{ color: isDark ? '#ffffff' : '#09090b' }}>Pareto ABC Classification Matrix</h2>
              <p className="text-xs font-bold" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Inventory prioritized by cumulative holding valuation</p>
            </div>
            <span className="text-xs font-bold" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
              Showing {filteredItems.length} of {items.length} SKUs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
              <thead>
                <tr 
                  className="border-b text-[11px] font-black uppercase tracking-wider"
                  style={{ 
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    color: isDark ? '#f8fafc' : '#09090b',
                    borderColor: isDark ? '#334155' : '#cbd5e1'
                  }}
                >
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-3">SKU & Item Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-center">Units On Hand</th>
                  <th className="py-3 px-3">Unit Cost</th>
                  <th className="py-3 px-3">Total Holding Value</th>
                  <th className="py-3 px-3">Cumulative %</th>
                  <th className="py-3 px-3 text-right">Control Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                {displayedItems.length > 0 ? (
                  displayedItems.map(item => {
                    const isA = item.abc_class === 'A';
                    const isB = item.abc_class === 'B';

                    return (
                      <tr 
                        key={item.id} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                        style={{ color: isDark ? '#f8fafc' : '#09090b' }}
                      >
                        <td className="py-3 px-3">
                          <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                            isA 
                              ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30' 
                              : isB 
                                ? 'bg-blue-500/20 text-blue-800 dark:text-blue-400 border border-blue-500/30'
                                : 'bg-purple-500/20 text-purple-800 dark:text-purple-400 border border-purple-500/30'
                          }`}>
                            {item.abc_class}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const img = item.image_url || item.image;
                              return img ? (
                                <img 
                                  src={img.startsWith('http') || img.startsWith('data:') ? img : `http://localhost:3000${img}`} 
                                  alt={item.name} 
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-700/80 shrink-0 shadow-xs" 
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 shadow-xs">
                                  <Package className="w-5 h-5" />
                                </div>
                              );
                            })()}
                            <div>
                              <div className="font-black text-sm leading-tight" style={{ color: isDark ? '#ffffff' : '#09090b' }}>
                                {item.name}
                              </div>
                              <div className="text-xs font-mono font-bold mt-0.5" style={{ color: isDark ? '#94a3b8' : '#334155' }}>
                                {item.sku}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-xs font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          {item.category}
                        </td>

                        <td className="py-3 px-3 text-center font-black text-sm" style={{ color: isDark ? '#ffffff' : '#09090b' }}>
                          {item.quantity} units
                        </td>

                        <td className="py-3 px-3 font-mono text-xs font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          ₱{item.cost_price.toFixed(2)}
                        </td>

                        <td className="py-3 px-3 font-mono font-black text-sm" style={{ color: isDark ? '#34d399' : '#00684a' }}>
                          ₱{item.holding_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-3 font-mono text-xs font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div 
                                className={`h-full ${isA ? 'bg-emerald-500' : isB ? 'bg-blue-500' : 'bg-purple-500'}`}
                                style={{ width: `${Math.min(100, item.cumulative_pct)}%` }}
                              ></div>
                            </div>
                            <span>{item.cumulative_pct}%</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            isA 
                              ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-400' 
                              : isB 
                                ? 'bg-blue-500/20 text-blue-800 dark:text-blue-400'
                                : 'bg-purple-500/20 text-purple-800 dark:text-purple-400'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-wider">
                      No matching ABC classified items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Component */}
          {filteredItems.length > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <TablePagination 
                currentPage={currentPage}
                totalItems={filteredItems.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
                itemLabel="SKUs"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
