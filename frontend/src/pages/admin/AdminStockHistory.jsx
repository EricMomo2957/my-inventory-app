import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { History, ArrowUpRight, ArrowDownRight, RefreshCw, Layers, Package } from 'lucide-react';
import AdminHeader from './AdminHeader';
import TablePagination from '../../components/TablePagination';

export default function AdminStockHistory() {
  const { isDark } = useTheme();
  const [history, setHistory] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const pageSize = 8;

  const fetchHistory = () => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:3000/api/stock-history').then(res => res.json()).catch(() => []),
      fetch('http://localhost:3000/api/products').then(res => res.json()).catch(() => [])
    ]).then(([historyData, productsData]) => {
      const pMap = {};
      if (Array.isArray(productsData)) {
        productsData.forEach(p => {
          pMap[p.id] = p;
        });
      }
      setProductsMap(pMap);
      setHistory(Array.isArray(historyData) ? historyData : []);
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching history:", err);
      setHistory([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getProductName = (log) => {
    if (log.product_name && !log.product_name.startsWith('Product #')) {
      return log.product_name;
    }
    if (log.product_id && productsMap[log.product_id]?.name) {
      return productsMap[log.product_id].name;
    }
    return log.product_name || (log.product_id ? `Product #${log.product_id}` : 'General Stock Item');
  };

  const filteredHistory = history.filter(item => {
    const prodName = getProductName(item);
    return prodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.action_type || item.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.reference_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const displayedHistory = isExpanded 
    ? filteredHistory 
    : filteredHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalLogs = history.length;
  const inboundLogs = history.filter(h => h.action_type === 'restock' || h.action_type === 'stock_in' || (parseInt(h.change_amount, 10) > 0)).length;
  const outboundLogs = history.filter(h => h.action_type === 'dispatch' || h.action_type === 'sale' || (parseInt(h.change_amount, 10) < 0)).length;
  const netUnitsShift = history.reduce((acc, h) => acc + (parseInt(h.change_amount, 10) || 0), 0);

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Top Header Bar */}
      <AdminHeader 
        title="Stock Movement"
        subtitle="Immutable Audit Trail of Inventory Transactions"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="flex-1 overflow-y-auto p-8 space-y-7">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Stock Movement & Audit Trail
            </h1>
            <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Immutable transaction records for inventory restocks, deductions, and sales
            </p>
          </div>
        
          <div className="flex items-center gap-3">
            <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              {history.length} Total Logs
            </div>
            
            <button 
              onClick={fetchHistory}
              className={`p-2 rounded-xl border transition-colors ${
                isDark ? 'border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
              title="Refresh Logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Executive KPI Grid Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Logs */}
          <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                AUDITED TRANSACTION LOGS
              </p>
              <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <History className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {totalLogs} <span className="text-xs font-normal text-slate-400">Records</span>
              </h3>
            </div>
            <p className="text-[10px] text-slate-400">
              Immutable ledger of warehouse events
            </p>
          </div>

          {/* Card 2: Inbound Restocks */}
          <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                INBOUND RESTOCK INFLOWS
              </p>
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className="text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                {inboundLogs} <span className="text-xs font-normal text-slate-400">Batches</span>
              </h3>
            </div>
            <p className="text-[10px] text-slate-400">
              Supplier deliveries & replenishment
            </p>
          </div>

          {/* Card 3: Outbound Deductions */}
          <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                OUTBOUND DISPATCHES
              </p>
              <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {outboundLogs} <span className="text-xs font-normal text-slate-400">Dispatches</span>
              </h3>
            </div>
            <p className="text-[10px] text-slate-400">
              Material issuance & department fulfillment
            </p>
          </div>

          {/* Card 4 (Featured Emerald Card): Net Shift */}
          <div className="p-5 rounded-2xl bg-[#00684a] text-white flex flex-col justify-between shadow-md shadow-[#00684a]/20">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                NET INVENTORY VARIANCE
              </p>
              <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className="text-2xl font-extrabold tracking-tight text-white">
                {netUnitsShift >= 0 ? `+${netUnitsShift}` : netUnitsShift} <span className="text-xs font-normal text-emerald-100">Units Shift</span>
              </h3>
            </div>
            <div className="flex items-center justify-between text-[10px] text-emerald-100">
              <span>Audit reconciliation status:</span>
              <span className="font-black bg-white/20 px-2 py-0.5 rounded-md">Balanced</span>
            </div>
          </div>
        </div>

      {/* Table Content */}
      <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-[11px] font-bold uppercase tracking-wider border-b ${
              isDark ? 'bg-slate-900/60 text-slate-400 border-slate-800' : 'bg-[#fcfdfd] text-slate-500 border-slate-100'
            }`}>
              <th className="py-4 px-6">Product Ref</th>
              <th className="py-4 px-6">Staff / Actor</th>
              <th className="py-4 px-6">Action Type</th>
              <th className="py-4 px-6 text-center">Amount Shift</th>
              <th className="py-4 px-6 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs font-medium ${
            isDark ? 'divide-slate-800/80' : 'divide-slate-100'
          }`}>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-16 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                  Loading Audit Logs...
                </td>
              </tr>
            ) : displayedHistory.length > 0 ? (
              displayedHistory.map((log) => {
                const isRestock = log.action_type === 'restock' || log.action_type === 'stock_in' || (log.change_amount > 0);
                const isRecon = log.action_type === 'reconciliation';
                const displayName = getProductName(log);
                const prodImg = log.product_id && productsMap[log.product_id]?.image;
                const category = log.category || (log.product_id && productsMap[log.product_id]?.category);

                return (
                  <tr key={log.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {prodImg ? (
                          <img 
                            src={prodImg.startsWith('http') || prodImg.startsWith('data:') ? prodImg : `http://localhost:3000${prodImg}`} 
                            alt={displayName} 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700/80 shrink-0 shadow-xs" 
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=60"; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold shrink-0 shadow-xs">
                            <Package className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className={`font-bold text-xs truncate max-w-[220px] ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {displayName}
                          </span>
                          {category && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              {category}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#00684a]/10 text-[#00684a] dark:text-emerald-400 flex items-center justify-center text-xs font-extrabold">
                          {log.user_name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {log.user_name || 'System / Staff'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        isRecon
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
                          : isRestock 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' 
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
                      }`}>
                        {isRecon ? <Layers className="w-3 h-3" /> : (isRestock ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />)}
                        {isRecon ? 'Audit Reconciliation' : (isRestock ? 'Restock / Inflow' : 'Dispatch / Outflow')}
                      </span>
                    </td>
                    <td className={`py-4 px-6 text-center font-extrabold ${
                      isRecon
                        ? (log.change_amount > 0 ? 'text-emerald-400' : log.change_amount < 0 ? 'text-amber-400' : 'text-slate-400')
                        : (isRestock ? 'text-[#00684a] dark:text-emerald-400' : 'text-red-500')
                    }`}>
                      {log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount}
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-slate-400 font-medium">
                      {new Date(log.created_at || Date.now()).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-16 text-center text-slate-400 text-xs">
                  No stock movement history recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Component */}
      {filteredHistory.length > 0 && (
        <TablePagination 
          currentPage={currentPage}
          totalItems={filteredHistory.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          itemLabel="transactions"
        />
      )}
      </div>
    </div>
  );
}