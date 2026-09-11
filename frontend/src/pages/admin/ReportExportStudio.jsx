import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AdminHeader from './AdminHeader';
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  Coins, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Scale, 
  Clock, 
  History,
  ShieldCheck,
  Package
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable, { applyPlugin } from 'jspdf-autotable';

// Ensure jsPDF plugin is registered
try {
  if (typeof applyPlugin === 'function') {
    applyPlugin(jsPDF);
  }
} catch (e) {
  console.warn("jsPDF plugin init warning:", e);
}

// Helper to resolve exact product image_url from database matching Overview Dashboard
const getProductImage = (p) => {
  const rawImg = p?.image_url || p?.image;
  if (rawImg) {
    return rawImg.startsWith('http') || rawImg.startsWith('data:') ? rawImg : `http://localhost:3000${rawImg}`;
  }
  return null;
};

export default function ReportExportStudio() {
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReportTab, setActiveReportTab] = useState('valuation');
  const [toastMessage, setToastMessage] = useState(null);

  const productsMap = useMemo(() => {
    const map = {};
    products.forEach(p => {
      map[p.id] = p;
      if (p.name) map[p.name.toLowerCase()] = p;
    });
    return map;
  }, [products]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [prodRes, histRes] = await Promise.all([
        fetch('http://localhost:3000/api/products'),
        fetch('http://localhost:3000/api/stock-history')
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (histRes.ok) setStockHistory(await histRes.json());
    } catch (err) {
      console.error("Report Studio load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics
  const metrics = useMemo(() => {
    const totalValuation = products.reduce((sum, p) => {
      const cost = parseFloat(p.cost_price) || (parseFloat(p.price) || 0) * 0.65;
      return sum + (parseInt(p.quantity, 10) || 0) * cost;
    }, 0);

    const reconciliationLogs = stockHistory.filter(h => h.action_type === 'reconciliation').length;

    // Near Expiry (within 90 days)
    const now = new Date();
    const nearExpiryItems = products.filter(p => {
      if (!p.expiry_date) return false;
      const exp = new Date(p.expiry_date);
      const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 90;
    });

    const nearExpiryRiskValue = nearExpiryItems.reduce((sum, p) => {
      const cost = parseFloat(p.cost_price) || (parseFloat(p.price) || 0) * 0.65;
      return sum + (parseInt(p.quantity, 10) || 0) * cost;
    }, 0);

    return {
      totalValuation,
      reconciliationLogs,
      nearExpiryCount: nearExpiryItems.length,
      nearExpiryRiskValue
    };
  }, [products, stockHistory]);

  // CSV Exporter
  const exportCSV = (filename, rows) => {
    if (!rows || !rows.length) {
      alert("No data available to export.");
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell instanceof Date
            ? cell.toLocaleString()
            : cell.toString().replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✅ Exported ${filename}.csv successfully`);
  };

  // PDF Exporter using jsPDF & AutoTable with fallback
  const exportPDF = (title, columns, rows) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.setTextColor(0, 104, 74);
      doc.text('MindStock Enterprise Warehouse System', 14, 15);
      
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text(title, 14, 22);

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Generated on: ${new Date().toLocaleString()} | Administrator Desk`, 14, 28);

      const tableOpts = {
        startY: 32,
        head: [columns],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [0, 104, 74], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2.5 }
      };

      if (typeof doc.autoTable === 'function') {
        doc.autoTable(tableOpts);
      } else if (typeof autoTable === 'function') {
        autoTable(doc, tableOpts);
      } else {
        try {
          applyPlugin(jsPDF);
          doc.autoTable(tableOpts);
        } catch (pluginErr) {
          console.error("AutoTable fallback error:", pluginErr);
        }
      }

      const cleanFilename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(cleanFilename);
      showToast(`📑 Generated ${title}.pdf successfully`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(`PDF Export Error: ${err.message || err}`);
    }
  };

  // 1. Valuation Report Handlers
  const handleExportValuationCSV = () => {
    const dataRows = products.map(p => {
      const cost = parseFloat(p.cost_price) || Math.round((parseFloat(p.price) || 0) * 0.65 * 100) / 100;
      const totalCost = (p.quantity || 0) * cost;
      const retailVal = (p.quantity || 0) * (p.price || 0);
      return {
        SKU: p.sku || `SKU-${p.id}`,
        ProductName: p.name,
        Category: p.category,
        Quantity: p.quantity,
        UnitCost_PHP: cost.toFixed(2),
        UnitPrice_PHP: (p.price || 0).toFixed(2),
        TotalHoldingValuation_PHP: totalCost.toFixed(2),
        RetailValuation_PHP: retailVal.toFixed(2),
        Location: `${p.location_zone || 'Zone A'}-${p.location_aisle || 'Aisle 01'}`
      };
    });
    exportCSV('Inventory_Valuation_Audit_Report', dataRows);
  };

  const handleExportValuationPDF = () => {
    const columns = ['SKU', 'Product Name', 'Category', 'Stock', 'Unit Cost (PHP)', 'Unit Price (PHP)', 'Total Valuation', 'Location'];
    const rows = products.map(p => {
      const cost = parseFloat(p.cost_price) || Math.round((parseFloat(p.price) || 0) * 0.65 * 100) / 100;
      const totalCost = (p.quantity || 0) * cost;
      return [
        p.sku || `SKU-${p.id}`,
        p.name || '',
        p.category || 'General',
        (p.quantity || 0).toString(),
        `PHP ${cost.toFixed(2)}`,
        `PHP ${(parseFloat(p.price) || 0).toFixed(2)}`,
        `PHP ${totalCost.toFixed(2)}`,
        `${p.location_zone || 'Zone A'}-${p.location_aisle || 'Aisle 01'}`
      ];
    });
    exportPDF('Inventory Asset Valuation & Balance Sheet', columns, rows);
  };

  // 2. Stock Variance Handlers
  const handleExportVarianceCSV = () => {
    const varianceLogs = stockHistory.filter(h => h.action_type === 'reconciliation');
    const dataRows = varianceLogs.map(l => ({
      LogID: l.id,
      Date: new Date(l.created_at).toLocaleDateString(),
      ProductName: l.product_name,
      Auditor: l.user_name,
      VarianceAdjustment: l.change_amount,
      ReferenceNo: l.reference_no || 'N/A',
      AuditNotes: l.notes || 'Routine Reconciliation'
    }));
    exportCSV('Physical_Stock_Variance_Audit_Report', dataRows);
  };

  const handleExportVariancePDF = () => {
    const varianceLogs = stockHistory.filter(h => h.action_type === 'reconciliation');
    const columns = ['Log ID', 'Date', 'Product', 'Auditor', 'Variance', 'Ref No', 'Notes'];
    const rows = varianceLogs.map(l => [
      l.id.toString(),
      new Date(l.created_at).toLocaleDateString(),
      l.product_name || '',
      l.user_name || 'Staff',
      l.change_amount > 0 ? `+${l.change_amount}` : l.change_amount.toString(),
      l.reference_no || 'N/A',
      l.notes || 'Routine Reconciliation'
    ]);
    exportPDF('Physical Cycle Count Variance Audit Report', columns, rows);
  };

  // 3. Expiry Report Handlers
  const handleExportExpiryCSV = () => {
    const dataRows = products.map(p => {
      const cost = parseFloat(p.cost_price) || 0;
      const holdingExposure = (p.quantity || 0) * cost;
      const exp = p.expiry_date ? new Date(p.expiry_date) : null;
      const daysLeft = exp ? Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24)) : 999;
      const status = daysLeft <= 0 ? 'EXPIRED' : daysLeft <= 60 ? `WARNING (${daysLeft}d left)` : 'HEALTHY';
      return {
        BatchNumber: p.batch_number || `LOT-${p.id}`,
        ProductName: p.name,
        Category: p.category || 'General',
        Quantity: p.quantity,
        ExpiryDate: p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : 'Non-perishable',
        UnitCost_PHP: cost.toFixed(2),
        HoldingExposure_PHP: holdingExposure.toFixed(2),
        RiskStatus: status
      };
    });
    exportCSV('Batch_Expiry_Liability_Report', dataRows);
  };

  const handleExportExpiryPDF = () => {
    const columns = ['Batch #', 'Product Name', 'Quantity', 'Expiry Date', 'Holding Exposure', 'Risk Status'];
    const rows = products.map(p => {
      const cost = parseFloat(p.cost_price) || 0;
      const holdingExposure = (p.quantity || 0) * cost;
      const exp = p.expiry_date ? new Date(p.expiry_date) : null;
      const daysLeft = exp ? Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24)) : 999;
      const status = daysLeft <= 0 ? 'EXPIRED' : daysLeft <= 60 ? `${daysLeft}d Left` : 'HEALTHY';
      return [
        p.batch_number || `LOT-${p.id}`,
        p.name || '',
        (p.quantity || 0).toString(),
        p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : 'Non-perishable',
        `PHP ${holdingExposure.toFixed(2)}`,
        status
      ];
    });
    exportPDF('Batch Expiration & Spoilage Liability Register', columns, rows);
  };

  // 4. Movement Report Handlers
  const handleExportMovementCSV = () => {
    const dataRows = stockHistory.map(h => ({
      LogID: h.id,
      Date: new Date(h.created_at).toLocaleString(),
      Product: h.product_name,
      User: h.user_name || 'System',
      ActionType: h.action_type || 'Adjustment',
      ChangeAmount: h.change_amount,
      ReferenceNo: h.reference_no || 'N/A',
      Notes: h.notes || ''
    }));
    exportCSV('Stock_Movements_Audit_Ledger', dataRows);
  };

  const handleExportMovementPDF = () => {
    const columns = ['Date', 'Product', 'User', 'Action', 'Amount', 'Ref / Notes'];
    const rows = stockHistory.slice(0, 100).map(h => [
      new Date(h.created_at).toLocaleDateString(),
      h.product_name || '',
      h.user_name || 'System',
      h.action_type || 'Adjustment',
      h.change_amount > 0 ? `+${h.change_amount}` : (h.change_amount || 0).toString(),
      h.notes || h.reference_no || 'Movement Log'
    ]);
    exportPDF('Inventory Stock Movement & Ledger Report', columns, rows);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <AdminHeader 
        title="Comprehensive Audit Report & Export Studio" 
        subtitle="Export Formal Valuation, Variance, Spoilage & Movement Ledgers"
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
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-300 hover:border-[#00684a]/60 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">Inventory Asset Worth</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  ₱{metrics.totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Coins className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Cost Basis Valuation</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-300 hover:border-blue-500/60 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">Variance Audits Logged</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {metrics.reconciliationLogs}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Scale className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Physical cycle counts verified</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-amber-500/50' : 'bg-white border-slate-300 hover:border-amber-500/60 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">Near-Expiry Risk (90d)</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  ₱{metrics.nearExpiryRiskValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{metrics.nearExpiryCount} batches nearing expiry</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-purple-500/50' : 'bg-white border-slate-300 hover:border-purple-500/60 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">Audit Ledger Entries</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {stockHistory.length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <History className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-purple-700 dark:text-purple-400 font-bold">
              <span>Complete transactional audit trail</span>
            </div>
          </div>
        </div>

        {/* REPORT MODULE SELECTOR TABS */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {[
            { id: 'valuation', name: '1. Monthly Valuation & Balance Sheet', icon: Coins },
            { id: 'variance', name: '2. Stock Variance & Discrepancies', icon: Scale },
            { id: 'expiry', name: '3. Expiry & Spoilage Liabilities', icon: Clock },
            { id: 'movement', name: '4. Stock Movements & Receiving Ledger', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeReportTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReportTab(tab.id)}
                className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#00684a] text-white shadow-md shadow-[#00684a]/20'
                    : isDark ? 'bg-[#0f172a] border border-slate-800 text-slate-300 hover:text-white' : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: VALUATION & BALANCE SHEET */}
        {activeReportTab === 'valuation' && (
          <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/60 gap-4">
              <div>
                <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>Monthly Inventory Valuation & Holding Worth</h3>
                <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Total cost assets vs. estimated retail value by category</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => window.print()}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print View</span>
                </button>
                <button
                  onClick={handleExportValuationCSV}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleExportValuationPDF}
                  className="px-3.5 py-2 rounded-xl bg-[#00684a] hover:bg-[#00553c] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
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
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center">Stock</th>
                    <th className="py-3 px-3">Cost Price</th>
                    <th className="py-3 px-3">Retail Price</th>
                    <th className="py-3 px-3">Total Holding Cost</th>
                    <th className="py-3 px-3">Retail Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {products.map(p => {
                    const cost = parseFloat(p.cost_price) || Math.round((parseFloat(p.price) || 0) * 0.65 * 100) / 100;
                    const totalCost = (p.quantity || 0) * cost;
                    const totalRetail = (p.quantity || 0) * (parseFloat(p.price) || 0);
                    const imgUrl = getProductImage(p);

                    return (
                      <tr 
                        key={p.id} 
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        style={{ color: isDark ? '#f8fafc' : '#09090b' }}
                      >
                        <td className="py-3.5 px-3 font-mono text-xs font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          {p.sku || `SKU-${p.id}`}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            {imgUrl ? (
                              <img 
                                src={imgUrl} 
                                alt={p.name} 
                                className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shrink-0 shadow-xs" 
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=120&auto=format&fit=crop&q=80"; }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 border border-slate-300 dark:border-slate-700">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-black text-sm leading-tight" style={{ color: isDark ? '#ffffff' : '#09090b' }}>
                                {p.name}
                              </p>
                              <span className="text-[10px] font-mono font-bold" style={{ color: isDark ? '#94a3b8' : '#334155' }}>
                                ID: #{p.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-xs font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          {p.category || 'General'}
                        </td>
                        <td className="py-3.5 px-3 text-center font-black text-sm" style={{ color: isDark ? '#ffffff' : '#09090b' }}>
                          {p.quantity}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          ₱{cost.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          ₱{(parseFloat(p.price) || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-black text-sm" style={{ color: isDark ? '#34d399' : '#00684a' }}>
                          ₱{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-black text-xs" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          ₱{totalRetail.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PHYSICAL STOCK VARIANCE & AUDIT LOGS */}
        {activeReportTab === 'variance' && (
          <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/60 gap-4">
              <div>
                <h3 className="text-base font-black" style={{ color: isDark ? '#ffffff' : '#09090b' }}>Physical Cycle Count Variance Log</h3>
                <p className="text-xs font-bold" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Differences between recorded theoretical counts vs. floor counts</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleExportVarianceCSV}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleExportVariancePDF}
                  className="px-3.5 py-2 rounded-xl bg-[#00684a] hover:bg-[#00553c] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
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
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3 px-3">Auditor</th>
                    <th className="py-3 px-3 text-center">Variance Adjustment</th>
                    <th className="py-3 px-3">Reference No</th>
                    <th className="py-3 px-3">Reconciliation Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {stockHistory.filter(h => h.action_type === 'reconciliation').map(l => {
                    const matchedProd = l.product_id ? productsMap[l.product_id] : productsMap[l.product_name?.toLowerCase()];
                    const imgUrl = getProductImage(matchedProd || { name: l.product_name });

                    return (
                      <tr 
                        key={l.id} 
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        style={{ color: isDark ? '#f8fafc' : '#09090b' }}
                      >
                        <td className="py-3.5 px-3 text-xs font-mono font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          {new Date(l.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            {imgUrl ? (
                              <img 
                                src={imgUrl} 
                                alt={l.product_name} 
                                className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shrink-0 shadow-xs" 
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=120&auto=format&fit=crop&q=80"; }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 border border-slate-300 dark:border-slate-700">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-black text-sm leading-tight" style={{ color: isDark ? '#ffffff' : '#09090b' }}>
                                {l.product_name}
                              </p>
                              <span className="text-[10px] font-mono font-bold" style={{ color: isDark ? '#94a3b8' : '#334155' }}>
                                ID: #{l.product_id || '—'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-xs font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          {l.user_name || 'Staff'}
                        </td>
                        <td className="py-3.5 px-3 text-center font-black">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                            l.change_amount > 0 
                              ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-400' 
                              : l.change_amount < 0
                                ? 'bg-red-500/20 text-red-800 dark:text-red-400'
                                : 'bg-slate-500/20 text-slate-950 dark:text-slate-200'
                          }`}>
                            {l.change_amount > 0 ? `+${l.change_amount}` : l.change_amount}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          {l.reference_no || 'N/A'}
                        </td>
                        <td className="py-3.5 px-3 text-xs font-bold" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          {l.notes || 'Cycle Count Audit'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: EXPIRY & SPOILAGE */}
        {activeReportTab === 'expiry' && (
          <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/60 gap-4">
              <div>
                <h3 className="text-base font-black" style={{ color: isDark ? '#ffffff' : '#09090b' }}>Batch Expiry & Spoilage Liability Register</h3>
                <p className="text-xs font-bold" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Batches nearing shelf life limits requiring promotional priority or write-off</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => window.print()}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print View</span>
                </button>
                <button
                  onClick={handleExportExpiryCSV}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleExportExpiryPDF}
                  className="px-3.5 py-2 rounded-xl bg-[#00684a] hover:bg-[#00553c] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
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
                    <th className="py-3 px-3">Batch Number</th>
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3 px-3">Quantity</th>
                    <th className="py-3 px-3">Expiry Date</th>
                    <th className="py-3 px-3">Holding Exposure</th>
                    <th className="py-3 px-3 text-right">Risk Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {products.map(p => {
                    const cost = parseFloat(p.cost_price) || 0;
                    const holdingExposure = (p.quantity || 0) * cost;
                    const exp = p.expiry_date ? new Date(p.expiry_date) : null;
                    const daysLeft = exp ? Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24)) : 999;
                    const isExpired = daysLeft <= 0;
                    const isWarning = daysLeft > 0 && daysLeft <= 60;
                    const imgUrl = getProductImage(p);

                    return (
                      <tr 
                        key={p.id} 
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        style={{ color: isDark ? '#f8fafc' : '#09090b' }}
                      >
                        <td className="py-3.5 px-3 font-mono text-xs font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          {p.batch_number || `LOT-${p.id}`}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            {imgUrl ? (
                              <img 
                                src={imgUrl} 
                                alt={p.name} 
                                className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shrink-0 shadow-xs" 
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=120&auto=format&fit=crop&q=80"; }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 border border-slate-300 dark:border-slate-700">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-black text-sm leading-tight" style={{ color: isDark ? '#ffffff' : '#09090b' }}>
                                {p.name}
                              </p>
                              <span className="text-[10px] font-mono font-bold" style={{ color: isDark ? '#94a3b8' : '#334155' }}>
                                ID: #{p.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-black" style={{ color: isDark ? '#ffffff' : '#09090b' }}>
                          {p.quantity} units
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          {p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : 'Non-perishable'}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-black text-sm" style={{ color: isDark ? '#34d399' : '#00684a' }}>
                          ₱{holdingExposure.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            isExpired
                              ? 'bg-red-500/20 text-red-800 dark:text-red-400 border border-red-500/30'
                              : isWarning
                                ? 'bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                          }`}>
                            {isExpired ? 'EXPIRED' : (isWarning ? `${daysLeft} Days Left` : 'HEALTHY')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: STOCK MOVEMENTS */}
        {activeReportTab === 'movement' && (
          <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/60 gap-4">
              <div>
                <h3 className="text-base font-black" style={{ color: isDark ? '#ffffff' : '#09090b' }}>Stock Inbound & Outbound Movement Ledger</h3>
                <p className="text-xs font-bold" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Complete audit log of restocks, deliveries, and adjustments</p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => window.print()}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print View</span>
                </button>
                <button
                  onClick={handleExportMovementCSV}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleExportMovementPDF}
                  className="px-3.5 py-2 rounded-xl bg-[#00684a] hover:bg-[#00553c] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
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
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Action Type</th>
                    <th className="py-3 px-3 text-center">Amount</th>
                    <th className="py-3 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {stockHistory.slice(0, 30).map(h => {
                    const matchedProd = h.product_id ? productsMap[h.product_id] : productsMap[h.product_name?.toLowerCase()];
                    const imgUrl = getProductImage(matchedProd || { name: h.product_name });

                    return (
                      <tr 
                        key={h.id} 
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        style={{ color: isDark ? '#f8fafc' : '#09090b' }}
                      >
                        <td className="py-3.5 px-3 font-mono text-xs font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          {new Date(h.created_at).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            {imgUrl ? (
                              <img 
                                src={imgUrl} 
                                alt={h.product_name} 
                                className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shrink-0 shadow-xs" 
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=120&auto=format&fit=crop&q=80"; }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 border border-slate-300 dark:border-slate-700">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-black text-sm leading-tight" style={{ color: isDark ? '#ffffff' : '#09090b' }}>
                                {h.product_name}
                              </p>
                              <span className="text-[10px] font-mono font-bold" style={{ color: isDark ? '#94a3b8' : '#334155' }}>
                                ID: #{h.product_id || '—'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-xs font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          {h.user_name || 'Staff'}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            h.action_type === 'stock_in' ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400' : 'bg-blue-500/15 text-blue-800 dark:text-blue-400'
                          }`}>
                            {h.action_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-black text-sm" style={{ color: isDark ? '#ffffff' : '#09090b' }}>
                          {h.change_amount}
                        </td>
                        <td className="py-3.5 px-3 text-xs font-bold" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                          {h.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
