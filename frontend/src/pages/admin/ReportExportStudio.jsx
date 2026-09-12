import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AdminHeader from './AdminHeader';
import TablePagination from '../../components/TablePagination';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable, { applyPlugin } from 'jspdf-autotable';
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
  Package,
  TrendingUp,
  DollarSign,
  Building2,
  AlertOctagon,
  Search,
  Filter,
  BarChart3,
  Percent,
  ShoppingCart,
  ArrowUpRight,
  Boxes
} from 'lucide-react';

// Ensure jsPDF plugin is registered
try {
  if (typeof applyPlugin === 'function') {
    applyPlugin(jsPDF);
  }
} catch (e) {
  console.warn("jsPDF plugin init warning:", e);
}

export default function ReportExportStudio() {
  const { isDark } = useTheme();
  
  // Tab State: 'valuation' | 'cogs' | 'deadstock' | 'procurement' | 'variance' | 'expiry' | 'movements'
  const [activeTab, setActiveTab] = useState('valuation');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Data Collections
  const [products, setProducts] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [cogsData, setCogsData] = useState({ summary: {}, data: [] });
  const [deadStockData, setDeadStockData] = useState({ summary: {}, data: [] });
  const [procurementData, setProcurementData] = useState({ summary: {}, data: [] });

  // Filter States
  const [cogsDays, setCogsDays] = useState('30');
  const [deadStockDays, setDeadStockDays] = useState('30');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
    setIsExpanded(false);
    setSearchQuery('');
  }, [activeTab]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch All Reports Data
  const loadAllReportData = async () => {
    setLoading(true);
    try {
      const [prodRes, histRes, cogsRes, deadRes, procRes] = await Promise.all([
        fetch('http://localhost:3000/api/products'),
        fetch('http://localhost:3000/api/stock-history'),
        fetch(`http://localhost:3000/api/reports/cogs?days=${cogsDays}`),
        fetch(`http://localhost:3000/api/reports/dead-stock?days=${deadStockDays}`),
        fetch('http://localhost:3000/api/reports/procurement-spend')
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (histRes.ok) setStockHistory(await histRes.json());
      if (cogsRes.ok) setCogsData(await cogsRes.json());
      if (deadRes.ok) setDeadStockData(await deadRes.json());
      if (procRes.ok) setProcurementData(await procRes.json());
    } catch (err) {
      console.error("Report Studio load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReportData();
  }, [cogsDays, deadStockDays]);

  // Derived filtered lists
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.sku?.toLowerCase().includes(q) || 
      p.category?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const filteredCOGS = useMemo(() => {
    const list = cogsData.data || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(r => 
      r.product_name?.toLowerCase().includes(q) || 
      r.sku?.toLowerCase().includes(q) || 
      r.order_id?.toString().includes(q) ||
      r.cashier_name?.toLowerCase().includes(q)
    );
  }, [cogsData, searchQuery]);

  const filteredDeadStock = useMemo(() => {
    const list = deadStockData.data || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(r => 
      r.name?.toLowerCase().includes(q) || 
      r.sku?.toLowerCase().includes(q) || 
      r.category?.toLowerCase().includes(q)
    );
  }, [deadStockData, searchQuery]);

  const filteredProcurement = useMemo(() => {
    const list = procurementData.data || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(s => 
      s.supplier_name?.toLowerCase().includes(q) || 
      s.contact_person?.toLowerCase().includes(q) || 
      s.email?.toLowerCase().includes(q)
    );
  }, [procurementData, searchQuery]);

  const varianceLogs = useMemo(() => {
    const logs = stockHistory.filter(h => h.action_type === 'reconciliation');
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(l => 
      l.product_name?.toLowerCase().includes(q) || 
      l.user_name?.toLowerCase().includes(q) || 
      l.reference_no?.toLowerCase().includes(q)
    );
  }, [stockHistory, searchQuery]);

  const expiryProducts = useMemo(() => {
    const now = new Date();
    const list = products.filter(p => {
      if (!p.expiry_date) return false;
      const exp = new Date(p.expiry_date);
      const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
      return diffDays <= 90;
    });
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.sku?.toLowerCase().includes(q) || 
      p.batch_number?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const filteredMovements = useMemo(() => {
    if (!searchQuery.trim()) return stockHistory;
    const q = searchQuery.toLowerCase();
    return stockHistory.filter(h => 
      h.product_name?.toLowerCase().includes(q) || 
      h.action_type?.toLowerCase().includes(q) || 
      h.user_name?.toLowerCase().includes(q) ||
      h.reference_no?.toLowerCase().includes(q)
    );
  }, [stockHistory, searchQuery]);

  // Paginated Slices
  const paginate = (array) => {
    if (isExpanded) return array;
    const start = (currentPage - 1) * pageSize;
    return array.slice(start, start + pageSize);
  };

  // --- EXPORT ENGINES ---

  // 1. Excel (.xlsx) Exporter using SheetJS
  const exportXLSX = (filename, sheetName, dataRows, headerLabels) => {
    try {
      if (!dataRows || !dataRows.length) {
        alert("No data available to export.");
        return;
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataRows, { header: headerLabels });

      // Auto-fit column widths
      const colWidths = Object.keys(dataRows[0] || {}).map(key => ({
        wch: Math.max(key.length, 14) + 4
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));

      const cleanFilename = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, cleanFilename);
      showToast(`📗 Exported ${cleanFilename} successfully`);
    } catch (err) {
      console.error("XLSX Export Error:", err);
      exportCSV(filename, dataRows);
    }
  };

  // 2. CSV (.csv) Exporter
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
    showToast(`📄 Exported ${filename}.csv successfully`);
  };

  // 3. Official Executive PDF (.pdf) Exporter
  const exportPDF = (title, columns, rows, summaryBoxes = []) => {
    try {
      const doc = new jsPDF({ orientation: columns.length > 6 ? 'landscape' : 'portrait' });
      const pageWidth = doc.internal.pageSize.getWidth();

      // Top Brand Header Banner
      doc.setFillColor(0, 104, 74); // #00684a
      doc.rect(0, 0, pageWidth, 24, 'F');

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('MINDSTOCK ENTERPRISE INVENTORY SYSTEM', 14, 12);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('EXECUTIVE FINANCIAL & AUDIT REPORTING DESK', 14, 18);

      // Report Title & Metadata
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 14, 34);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleString('en-PH')} | Administrator Desk | Currency: PHP (₱)`, 14, 40);

      // Render Summary KPI Cards if provided
      let currentY = 46;
      if (summaryBoxes && summaryBoxes.length > 0) {
        const boxWidth = (pageWidth - 28 - ((summaryBoxes.length - 1) * 6)) / summaryBoxes.length;
        summaryBoxes.forEach((box, i) => {
          const x = 14 + (i * (boxWidth + 6));
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(x, currentY, boxWidth, 14, 2, 2, 'FD');

          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 116, 139);
          doc.text(box.label.toUpperCase(), x + 4, currentY + 5);

          doc.setFontSize(9.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 104, 74);
          doc.text(box.value, x + 4, currentY + 11);
        });
        currentY += 20;
      }

      // AutoTable
      const tableOpts = {
        startY: currentY,
        head: [columns],
        body: rows,
        theme: 'striped',
        headStyles: { 
          fillColor: [0, 104, 74], 
          textColor: 255, 
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 2.5
        },
        styles: { 
          fontSize: 7.5, 
          cellPadding: 2,
          lineColor: [226, 232, 240],
          lineWidth: 0.1
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didDrawPage: () => {
          const pageNum = doc.internal.getNumberOfPages();
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(`Page ${pageNum}`, pageWidth - 25, doc.internal.pageSize.getHeight() - 8);
          doc.text('MindStock Automated Audit Compliance — Confidential Document', 14, doc.internal.pageSize.getHeight() - 8);
        }
      };

      if (typeof doc.autoTable === 'function') {
        doc.autoTable(tableOpts);
      } else if (typeof autoTable === 'function') {
        autoTable(doc, tableOpts);
      } else {
        try {
          applyPlugin(jsPDF);
          doc.autoTable(tableOpts);
        } catch (e) {
          console.error("AutoTable error:", e);
        }
      }

      const cleanFilename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(cleanFilename);
      showToast(`📕 Generated ${cleanFilename} successfully`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(`PDF Export Error: ${err.message || err}`);
    }
  };

  // --- TAB-SPECIFIC EXPORT HANDLERS ---

  // 1. Asset Valuation Handlers
  const exportValuationExcel = () => {
    const dataRows = products.map(p => {
      const cost = parseFloat(p.cost_price) || (parseFloat(p.price) || 0) * 0.65;
      const totalCost = (p.quantity || 0) * cost;
      const retailVal = (p.quantity || 0) * (p.price || 0);
      return {
        'SKU Code': p.sku || `SKU-${p.id}`,
        'Product Name': p.name,
        'Category': p.category || 'General',
        'Stock on Hand': p.quantity || 0,
        'Unit Cost (PHP)': parseFloat(cost.toFixed(2)),
        'Unit Price (PHP)': parseFloat((p.price || 0).toFixed(2)),
        'Asset Valuation at Cost (PHP)': parseFloat(totalCost.toFixed(2)),
        'Potential Retail Value (PHP)': parseFloat(retailVal.toFixed(2)),
        'Potential Gross Margin (PHP)': parseFloat((retailVal - totalCost).toFixed(2)),
        'Warehouse Coordinate': `${p.location_zone || 'Zone A'}-${p.location_aisle || 'Aisle 01'}`
      };
    });
    exportXLSX('MindStock_Inventory_Valuation_Report', 'Asset Valuation', dataRows);
  };

  const exportValuationPDF = () => {
    const totalValuation = products.reduce((sum, p) => sum + ((p.quantity || 0) * (parseFloat(p.cost_price) || (parseFloat(p.price) || 0) * 0.65)), 0);
    const totalRetail = products.reduce((sum, p) => sum + ((p.quantity || 0) * (parseFloat(p.price) || 0)), 0);
    const totalUnits = products.reduce((sum, p) => sum + (parseInt(p.quantity, 10) || 0), 0);

    const columns = ['SKU', 'Product Name', 'Category', 'Stock', 'Unit Cost', 'Unit Price', 'Total Asset Cost', 'Location'];
    const rows = products.map(p => {
      const cost = parseFloat(p.cost_price) || (parseFloat(p.price) || 0) * 0.65;
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

    const summaryBoxes = [
      { label: 'Total Holding SKUs', value: `${products.length} SKUs` },
      { label: 'Total Inventory Units', value: `${totalUnits.toLocaleString()} Units` },
      { label: 'Asset Valuation (At Cost)', value: `PHP ${totalValuation.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` },
      { label: 'Retail Asset Value', value: `PHP ${totalRetail.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` }
    ];

    exportPDF('Inventory Asset Valuation & Balance Sheet Report', columns, rows, summaryBoxes);
  };

  // 2. COGS & Profitability Handlers
  const exportCOGSExcel = () => {
    const list = cogsData.data || [];
    const dataRows = list.map(r => ({
      'Order #': `ORD-#${r.order_id}`,
      'Date': new Date(r.order_date).toLocaleString('en-PH'),
      'Product Name': r.product_name,
      'SKU': r.sku,
      'Variant': r.variant_name || 'Standard',
      'Units Sold': r.quantity,
      'Selling Price (PHP)': parseFloat(r.selling_price || 0),
      'Unit Cost (PHP)': parseFloat(r.unit_cost || 0),
      'Total Revenue (PHP)': parseFloat(r.total_revenue || 0),
      'Total COGS (PHP)': parseFloat(r.total_cogs || 0),
      'Gross Profit (PHP)': parseFloat(r.gross_profit || 0),
      'Gross Margin %': `${r.margin_pct}%`,
      'Staff / Cashier': r.cashier_name || 'Staff'
    }));
    exportXLSX('MindStock_COGS_Profitability_Report', 'COGS & Sales', dataRows);
  };

  const exportCOGSPDF = () => {
    const list = cogsData.data || [];
    const summary = cogsData.summary || {};
    const columns = ['Order ID', 'Date', 'Product', 'Variant', 'Qty', 'Unit Cost', 'Price', 'Revenue', 'COGS', 'Gross Profit', 'Margin'];
    const rows = list.map(r => [
      `#${r.order_id}`,
      new Date(r.order_date).toLocaleDateString(),
      r.product_name || '',
      r.variant_name || '—',
      r.quantity.toString(),
      `₱${parseFloat(r.unit_cost || 0).toFixed(2)}`,
      `₱${parseFloat(r.selling_price || 0).toFixed(2)}`,
      `₱${parseFloat(r.total_revenue || 0).toFixed(2)}`,
      `₱${parseFloat(r.total_cogs || 0).toFixed(2)}`,
      `₱${parseFloat(r.gross_profit || 0).toFixed(2)}`,
      `${r.margin_pct}%`
    ]);

    const summaryBoxes = [
      { label: `Revenue (${cogsDays} Days)`, value: `PHP ${(summary.totalRevenue || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` },
      { label: 'Total COGS', value: `PHP ${(summary.totalCOGS || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` },
      { label: 'Gross Profit', value: `PHP ${(summary.totalGrossProfit || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` },
      { label: 'Average Margin', value: `${summary.avgMarginPct || 0}%` }
    ];

    exportPDF('Cost of Goods Sold (COGS) & Profitability Report', columns, rows, summaryBoxes);
  };

  // 3. Dead Stock Handlers
  const exportDeadStockExcel = () => {
    const list = deadStockData.data || [];
    const dataRows = list.map(r => ({
      'SKU': r.sku,
      'Product Name': r.name,
      'Category': r.category,
      'Stock on Hand': r.current_stock,
      'Unit Cost (PHP)': parseFloat(r.cost_price || 0),
      'Tied-Up Capital (PHP)': parseFloat(r.tied_up_capital || 0),
      'Potential Value (PHP)': parseFloat(r.potential_retail_value || 0),
      'Days Inactive': r.days_inactive,
      'Last Sold Date': r.last_sold_date ? new Date(r.last_sold_date).toLocaleDateString() : 'Never Sold'
    }));
    exportXLSX('MindStock_Dead_Stock_Analysis', 'Dead Stock', dataRows);
  };

  const exportDeadStockPDF = () => {
    const list = deadStockData.data || [];
    const summary = deadStockData.summary || {};
    const columns = ['SKU', 'Product Name', 'Category', 'Stock Qty', 'Unit Cost', 'Tied-Up Capital', 'Days Inactive', 'Last Sold'];
    const rows = list.map(r => [
      r.sku,
      r.name,
      r.category || 'General',
      r.current_stock.toString(),
      `₱${parseFloat(r.cost_price || 0).toFixed(2)}`,
      `₱${parseFloat(r.tied_up_capital || 0).toFixed(2)}`,
      `${r.days_inactive} days`,
      r.last_sold_date ? new Date(r.last_sold_date).toLocaleDateString() : 'Never'
    ]);

    const summaryBoxes = [
      { label: `Dead Stock SKUs (${deadStockDays}d+)`, value: `${summary.deadStockCount || 0} SKUs` },
      { label: 'Inactive Units', value: `${summary.totalDeadUnits || 0} Units` },
      { label: 'Tied-Up Working Capital', value: `PHP ${(summary.totalTiedUpCapital || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` }
    ];

    exportPDF('Dead Stock & Tied-Up Working Capital Report', columns, rows, summaryBoxes);
  };

  // 4. Procurement Spending Handlers
  const exportProcurementExcel = () => {
    const list = procurementData.data || [];
    const dataRows = list.map(s => ({
      'Supplier Name': s.supplier_name,
      'Contact Person': s.contact_person || 'N/A',
      'Email': s.email || 'N/A',
      'Lead Time (Days)': s.lead_time_days || 3,
      'Rating': s.rating || 5.0,
      'Total POs': s.total_pos || 0,
      'Completed POs': s.completed_pos || 0,
      'Pending POs': s.pending_pos || 0,
      'Total Procurement Spend (PHP)': parseFloat(s.total_spend || 0),
      'Realized Spend (PHP)': parseFloat(s.realized_spend || 0)
    }));
    exportXLSX('MindStock_Procurement_Spend_Report', 'Procurement Spend', dataRows);
  };

  const exportProcurementPDF = () => {
    const list = procurementData.data || [];
    const summary = procurementData.summary || {};
    const columns = ['Supplier Name', 'Contact', 'Lead Time', 'Rating', 'Total POs', 'Completed', 'Total Spend (PHP)', 'Realized Spend (PHP)'];
    const rows = list.map(s => [
      s.supplier_name,
      s.contact_person || 'N/A',
      `${s.lead_time_days || 3}d`,
      `★ ${s.rating || 4.8}`,
      s.total_pos.toString(),
      s.completed_pos.toString(),
      `₱${parseFloat(s.total_spend || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      `₱${parseFloat(s.realized_spend || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
    ]);

    const summaryBoxes = [
      { label: 'Vendor Partners', value: `${summary.totalSuppliers || 0} Suppliers` },
      { label: 'Total POs Issued', value: `${summary.totalPOs || 0} POs` },
      { label: 'Total Procurement Spend', value: `PHP ${(summary.totalProcurementSpend || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` }
    ];

    exportPDF('Supplier Procurement & Purchasing Spend Report', columns, rows, summaryBoxes);
  };

  // 5. Stock Variance Handlers
  const exportVarianceExcel = () => {
    const dataRows = varianceLogs.map(l => ({
      'Log ID': l.id,
      'Audit Date': new Date(l.created_at).toLocaleDateString(),
      'Product Name': l.product_name,
      'Auditor': l.user_name || 'Staff',
      'Variance Adjustment': l.change_amount,
      'Reference No': l.reference_no || 'N/A',
      'Audit Notes': l.notes || 'Routine Reconciliation'
    }));
    exportXLSX('MindStock_Physical_Stock_Variance_Report', 'Variance Audits', dataRows);
  };

  const exportVariancePDF = () => {
    const columns = ['Log ID', 'Date', 'Product', 'Auditor', 'Variance Adjustment', 'Ref No', 'Notes'];
    const rows = varianceLogs.map(l => [
      l.id.toString(),
      new Date(l.created_at).toLocaleDateString(),
      l.product_name || '',
      l.user_name || 'Staff',
      l.change_amount > 0 ? `+${l.change_amount}` : l.change_amount.toString(),
      l.reference_no || 'N/A',
      l.notes || 'Routine Reconciliation'
    ]);
    exportPDF('Physical Cycle Count Variance Audit Report', columns, rows, [
      { label: 'Reconciliation Logs', value: `${varianceLogs.length} Adjustments` }
    ]);
  };

  // 6. Expiry Handlers
  const exportExpiryExcel = () => {
    const dataRows = expiryProducts.map(p => {
      const cost = parseFloat(p.cost_price) || 0;
      const holdingExposure = (p.quantity || 0) * cost;
      const exp = p.expiry_date ? new Date(p.expiry_date) : null;
      const daysLeft = exp ? Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24)) : 999;
      return {
        'Batch #': p.batch_number || `LOT-${p.id}`,
        'Product Name': p.name,
        'Quantity': p.quantity,
        'Expiry Date': p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : 'N/A',
        'Unit Cost (PHP)': cost,
        'Financial Exposure (PHP)': holdingExposure,
        'Days Remaining': daysLeft <= 0 ? 'EXPIRED' : `${daysLeft} Days`
      };
    });
    exportXLSX('MindStock_Batch_Expiry_Liability_Report', 'Batch Expiry', dataRows);
  };

  const exportExpiryPDF = () => {
    const columns = ['Batch #', 'Product Name', 'Quantity', 'Expiry Date', 'Exposure (PHP)', 'Status'];
    const rows = expiryProducts.map(p => {
      const cost = parseFloat(p.cost_price) || 0;
      const exposure = (p.quantity || 0) * cost;
      const exp = p.expiry_date ? new Date(p.expiry_date) : null;
      const daysLeft = exp ? Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24)) : 999;
      return [
        p.batch_number || `LOT-${p.id}`,
        p.name,
        p.quantity.toString(),
        p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : 'N/A',
        `₱${exposure.toFixed(2)}`,
        daysLeft <= 0 ? 'EXPIRED' : `${daysLeft}d left`
      ];
    });
    exportPDF('Batch Expiration & Spoilage Liability Report', columns, rows, [
      { label: 'At-Risk Batches', value: `${expiryProducts.length} Items` }
    ]);
  };

  // 7. Movement Handlers
  const exportMovementExcel = () => {
    const dataRows = filteredMovements.map(h => ({
      'Log ID': h.id,
      'Timestamp': new Date(h.created_at).toLocaleString(),
      'Product Name': h.product_name,
      'Movement Type': h.action_type,
      'Quantity Change': h.change_amount,
      'Staff Operator': h.user_name || 'Staff',
      'Reference No': h.reference_no || 'N/A',
      'Notes': h.notes || ''
    }));
    exportXLSX('MindStock_Stock_Movement_Ledger', 'Movement Ledger', dataRows);
  };

  const exportMovementPDF = () => {
    const columns = ['Log ID', 'Timestamp', 'Product', 'Type', 'Delta', 'Operator', 'Reference'];
    const rows = filteredMovements.map(h => [
      `#${h.id}`,
      new Date(h.created_at).toLocaleString(),
      h.product_name,
      h.action_type.toUpperCase(),
      h.change_amount > 0 ? `+${h.change_amount}` : h.change_amount.toString(),
      h.user_name || 'Staff',
      h.reference_no || 'N/A'
    ]);
    exportPDF('Complete Stock Movement Audit Ledger', columns, rows, [
      { label: 'Total Movement Logs', value: `${filteredMovements.length} Records` }
    ]);
  };

  // Generic Dynamic Exporter Router
  const handleExportExcel = () => {
    switch (activeTab) {
      case 'valuation': return exportValuationExcel();
      case 'cogs': return exportCOGSExcel();
      case 'deadstock': return exportDeadStockExcel();
      case 'procurement': return exportProcurementExcel();
      case 'variance': return exportVarianceExcel();
      case 'expiry': return exportExpiryExcel();
      case 'movements': return exportMovementExcel();
      default: exportValuationExcel();
    }
  };

  const handleExportPDF = () => {
    switch (activeTab) {
      case 'valuation': return exportValuationPDF();
      case 'cogs': return exportCOGSPDF();
      case 'deadstock': return exportDeadStockPDF();
      case 'procurement': return exportProcurementPDF();
      case 'variance': return exportVariancePDF();
      case 'expiry': return exportExpiryPDF();
      case 'movements': return exportMovementPDF();
      default: exportValuationPDF();
    }
  };

  const handleExportCSV = () => {
    switch (activeTab) {
      case 'valuation': return exportCSV('Valuation_Report', products);
      case 'cogs': return exportCSV('COGS_Report', cogsData.data);
      case 'deadstock': return exportCSV('Dead_Stock_Report', deadStockData.data);
      case 'procurement': return exportCSV('Procurement_Report', procurementData.data);
      case 'variance': return exportCSV('Variance_Report', varianceLogs);
      case 'expiry': return exportCSV('Expiry_Report', expiryProducts);
      case 'movements': return exportCSV('Movement_Ledger', filteredMovements);
      default: exportCSV('Report', products);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <AdminHeader 
        title="Financial & Audit Reports Studio" 
        subtitle="1-Click Excel (.xlsx), CSV and Official Executive PDF Financial Exports"
      />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="w-full p-6 md:p-8 space-y-6">

        {/* TOP SUMMARY KPI ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Asset Valuation */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-emerald-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Asset Valuation</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₱{products.reduce((s, p) => s + ((p.quantity || 0) * (parseFloat(p.cost_price) || (parseFloat(p.price) || 0) * 0.65)), 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <Coins className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <Boxes className="w-3.5 h-3.5" />
              <span>{products.length} Active SKUs in Warehouse</span>
            </div>
          </div>

          {/* Card 2: Period Gross Profit */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sales Gross Profit ({cogsDays}d)</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₱{(cogsData.summary?.totalGrossProfit || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
              <Percent className="w-3.5 h-3.5" />
              <span>{cogsData.summary?.avgMarginPct || 0}% Gross Margin</span>
            </div>
          </div>

          {/* Card 3: Dead Stock Capital */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-amber-500/50' : 'bg-white border-slate-200 hover:border-amber-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tied-Up Inactive Capital</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₱{(deadStockData.summary?.totalTiedUpCapital || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{deadStockData.summary?.deadStockCount || 0} Inactive SKUs ({deadStockDays}d+)</span>
            </div>
          </div>

          {/* Card 4: Procurement Spend */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-purple-500/50' : 'bg-white border-slate-200 hover:border-purple-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Procurement Spend</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₱{(procurementData.summary?.totalProcurementSpend || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">
              <FileText className="w-3.5 h-3.5" />
              <span>{procurementData.summary?.totalPOs || 0} POs across {procurementData.summary?.totalSuppliers || 0} Vendors</span>
            </div>
          </div>
        </div>

        {/* REPORT SELECTOR TAB BAR & ACTIONS */}
        <div className={`p-4 rounded-2xl border flex flex-col lg:flex-row items-center justify-between gap-4 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          {/* Scrollable Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
            {[
              { id: 'valuation', label: 'Asset Valuation', icon: Coins, count: products.length },
              { id: 'cogs', label: 'COGS & Profitability', icon: TrendingUp, count: cogsData.data?.length || 0 },
              { id: 'deadstock', label: 'Dead Stock Analysis', icon: Clock, count: deadStockData.data?.length || 0 },
              { id: 'procurement', label: 'Procurement Spend', icon: Building2, count: procurementData.data?.length || 0 },
              { id: 'variance', label: 'Audit Variances', icon: Scale, count: varianceLogs.length },
              { id: 'expiry', label: 'Batch Expiry Risk', icon: AlertTriangle, count: expiryProducts.length },
              { id: 'movements', label: 'Movement Ledger', icon: History, count: stockHistory.length }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'bg-[#00684a] text-white shadow-md shadow-[#00684a]/20' 
                      : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* EXPORT ACTION BUTTONS */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Download formatted Excel Spreadsheet (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Generate Executive Audit PDF Report (.pdf)"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF (.pdf)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Export CSV (.csv)"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.print()}
              className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Print Current View"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU, product name, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs focus:outline-none transition-all ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-700 text-white focus:border-emerald-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#00684a]'
              }`}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {activeTab === 'cogs' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-bold">Timeframe:</span>
                <select
                  value={cogsDays}
                  onChange={(e) => setCogsDays(e.target.value)}
                  className={`p-2 rounded-xl border text-xs font-semibold focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="365">Year to Date (365d)</option>
                </select>
              </div>
            )}

            {activeTab === 'deadstock' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-bold">Inactivity Threshold:</span>
                <select
                  value={deadStockDays}
                  onChange={(e) => setDeadStockDays(e.target.value)}
                  className={`p-2 rounded-xl border text-xs font-semibold focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="15">15+ Days Inactive</option>
                  <option value="30">30+ Days Inactive</option>
                  <option value="60">60+ Days Inactive</option>
                  <option value="90">90+ Days Inactive</option>
                </select>
              </div>
            )}

            <button
              onClick={loadAllReportData}
              className={`p-2 rounded-xl border text-slate-400 hover:text-white transition-colors cursor-pointer ${
                isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
              }`}
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* MAIN DATA TABLE CONTAINER */}
        <div className={`rounded-3xl border overflow-hidden shadow-sm ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm font-semibold">Generating report ledger & calculating margins...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* 1. ASSET VALUATION TABLE */}
              {activeTab === 'valuation' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={isDark ? 'bg-slate-900/80 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-600 border-b border-slate-200'}>
                      <th className="p-4 font-bold uppercase tracking-wider">Product & SKU</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Category</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Stock On Hand</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Unit Landed Cost</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Selling Price</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Total Asset Cost</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Retail Potential</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Coordinate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {paginate(filteredProducts).map(p => {
                      const cost = parseFloat(p.cost_price) || (parseFloat(p.price) || 0) * 0.65;
                      const totalCost = (p.quantity || 0) * cost;
                      const retailVal = (p.quantity || 0) * (p.price || 0);

                      return (
                        <tr key={p.id} className={isDark ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                          <td className="p-4 font-medium">
                            <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</div>
                            <div className="font-mono text-[10px] text-slate-400">{p.sku || `SKU-${p.id}`}</div>
                          </td>
                          <td className="p-4 text-slate-500 dark:text-slate-400 font-semibold">{p.category || 'General'}</td>
                          <td className="p-4 text-right font-black text-slate-900 dark:text-white">{p.quantity || 0}</td>
                          <td className="p-4 text-right font-mono text-blue-600 dark:text-blue-400 font-bold">
                            ₱{cost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            ₱{(parseFloat(p.price) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                            ₱{totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-right font-mono font-bold text-slate-500 dark:text-slate-400">
                            ₱{retailVal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-400 font-mono text-[11px] font-bold">
                              {p.location_zone || 'Zone A'}-{p.location_aisle || 'Aisle 01'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* 2. COGS & PROFITABILITY TABLE */}
              {activeTab === 'cogs' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={isDark ? 'bg-slate-900/80 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-600 border-b border-slate-200'}>
                      <th className="p-4 font-bold uppercase tracking-wider">Order & Date</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Product & Variant</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Units Sold</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Landed Cost</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Sale Price</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Total Revenue</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Total COGS</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Gross Profit</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Margin %</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Cashier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {paginate(filteredCOGS).map((r, i) => (
                      <tr key={i} className={isDark ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                        <td className="p-4 font-medium">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">ORD-#{r.order_id}</div>
                          <div className="text-[10px] text-slate-400">{new Date(r.order_date).toLocaleDateString()}</div>
                        </td>
                        <td className="p-4 font-medium">
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{r.product_name}</div>
                          <div className="font-mono text-[10px] text-slate-400">{r.variant_name ? `Variant: ${r.variant_name}` : r.sku}</div>
                        </td>
                        <td className="p-4 text-right font-black">{r.quantity}</td>
                        <td className="p-4 text-right font-mono text-blue-500 font-bold">₱{parseFloat(r.unit_cost || 0).toFixed(2)}</td>
                        <td className="p-4 text-right font-mono font-bold">₱{parseFloat(r.selling_price || 0).toFixed(2)}</td>
                        <td className="p-4 text-right font-mono font-black text-slate-900 dark:text-white">₱{parseFloat(r.total_revenue || 0).toFixed(2)}</td>
                        <td className="p-4 text-right font-mono font-bold text-slate-400">₱{parseFloat(r.total_cogs || 0).toFixed(2)}</td>
                        <td className="p-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                          +₱{parseFloat(r.gross_profit || 0).toFixed(2)}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                            parseFloat(r.margin_pct) >= 30 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {r.margin_pct}%
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 font-medium">{r.cashier_name || 'Staff'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 3. DEAD STOCK TABLE */}
              {activeTab === 'deadstock' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={isDark ? 'bg-slate-900/80 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-600 border-b border-slate-200'}>
                      <th className="p-4 font-bold uppercase tracking-wider">Product & SKU</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Category</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Current Stock</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Unit Cost</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Tied-Up Capital</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Days Inactive</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Last Sold</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-center">Suggested Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {paginate(filteredDeadStock).map(r => (
                      <tr key={r.id} className={isDark ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                        <td className="p-4 font-medium">
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{r.name}</div>
                          <div className="font-mono text-[10px] text-slate-400">{r.sku}</div>
                        </td>
                        <td className="p-4 text-slate-400 font-semibold">{r.category}</td>
                        <td className="p-4 text-right font-black text-amber-500">{r.current_stock} units</td>
                        <td className="p-4 text-right font-mono text-slate-400 font-bold">₱{parseFloat(r.cost_price || 0).toFixed(2)}</td>
                        <td className="p-4 text-right font-mono font-black text-red-500">₱{parseFloat(r.tied_up_capital || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td className="p-4 text-right font-bold text-amber-400">{r.days_inactive} days</td>
                        <td className="p-4 text-slate-400">{r.last_sold_date ? new Date(r.last_sold_date).toLocaleDateString() : 'Never Sold'}</td>
                        <td className="p-4 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold">
                            {r.days_inactive > 90 ? 'Liquidate / Markdown' : 'Run Bundle Promo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 4. PROCUREMENT SPEND TABLE */}
              {activeTab === 'procurement' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={isDark ? 'bg-slate-900/80 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-600 border-b border-slate-200'}>
                      <th className="p-4 font-bold uppercase tracking-wider">Supplier Name</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Contact</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-center">Lead Time</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-center">Rating</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Total POs</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Completed POs</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Total Spend</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Realized Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {paginate(filteredProcurement).map(s => (
                      <tr key={s.supplier_id} className={isDark ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{s.supplier_name}</td>
                        <td className="p-4 text-slate-400 font-medium">
                          <div>{s.contact_person || 'N/A'}</div>
                          <div className="text-[10px]">{s.email || ''}</div>
                        </td>
                        <td className="p-4 text-center font-bold text-blue-500">{s.lead_time_days || 3} Days</td>
                        <td className="p-4 text-center font-bold text-amber-500">★ {s.rating || 4.8}</td>
                        <td className="p-4 text-right font-black">{s.total_pos || 0}</td>
                        <td className="p-4 text-right font-black text-emerald-500">{s.completed_pos || 0}</td>
                        <td className="p-4 text-right font-mono font-black text-slate-900 dark:text-white">
                          ₱{parseFloat(s.total_spend || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                          ₱{parseFloat(s.realized_spend || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 5. AUDIT VARIANCES TABLE */}
              {activeTab === 'variance' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={isDark ? 'bg-slate-900/80 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-600 border-b border-slate-200'}>
                      <th className="p-4 font-bold uppercase tracking-wider">Log ID</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Date</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Product Name</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Auditor</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Variance Adjustment</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Reference No</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Audit Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {paginate(varianceLogs).map(l => (
                      <tr key={l.id} className={isDark ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                        <td className="p-4 font-mono font-bold">#{l.id}</td>
                        <td className="p-4 text-slate-400">{new Date(l.created_at).toLocaleDateString()}</td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{l.product_name}</td>
                        <td className="p-4 text-slate-300 font-semibold">{l.user_name || 'Staff'}</td>
                        <td className={`p-4 text-right font-black ${l.change_amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {l.change_amount > 0 ? `+${l.change_amount}` : l.change_amount} units
                        </td>
                        <td className="p-4 font-mono text-slate-400">{l.reference_no || 'N/A'}</td>
                        <td className="p-4 text-slate-400 font-medium">{l.notes || 'Routine Reconciliation'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 6. BATCH EXPIRY TABLE */}
              {activeTab === 'expiry' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={isDark ? 'bg-slate-900/80 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-600 border-b border-slate-200'}>
                      <th className="p-4 font-bold uppercase tracking-wider">Batch #</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Product Name</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Quantity</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Expiry Date</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Unit Cost</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Financial Exposure</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {paginate(expiryProducts).map(p => {
                      const cost = parseFloat(p.cost_price) || 0;
                      const exp = p.expiry_date ? new Date(p.expiry_date) : null;
                      const daysLeft = exp ? Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24)) : 999;
                      return (
                        <tr key={p.id} className={isDark ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                          <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{p.batch_number || `LOT-${p.id}`}</td>
                          <td className="p-4 font-bold">{p.name}</td>
                          <td className="p-4 text-right font-black">{p.quantity}</td>
                          <td className="p-4 text-slate-400">{p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : 'N/A'}</td>
                          <td className="p-4 text-right font-mono">₱{cost.toFixed(2)}</td>
                          <td className="p-4 text-right font-mono font-black text-red-500">₱{((p.quantity || 0) * cost).toFixed(2)}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              daysLeft <= 0 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                              {daysLeft <= 0 ? 'EXPIRED' : `${daysLeft}d left`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* 7. STOCK MOVEMENTS TABLE */}
              {activeTab === 'movements' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={isDark ? 'bg-slate-900/80 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-600 border-b border-slate-200'}>
                      <th className="p-4 font-bold uppercase tracking-wider">Log ID</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Timestamp</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Product Name</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Movement Type</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-right">Quantity Delta</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Operator</th>
                      <th className="p-4 font-bold uppercase tracking-wider">Reference No</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {paginate(filteredMovements).map(h => (
                      <tr key={h.id} className={isDark ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                        <td className="p-4 font-mono font-bold">#{h.id}</td>
                        <td className="p-4 text-slate-400">{new Date(h.created_at).toLocaleString()}</td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{h.product_name}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            h.action_type === 'inbound' || h.action_type === 'restock'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : h.action_type === 'outbound' || h.action_type === 'dispatch' || h.action_type === 'sale'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {h.action_type}
                          </span>
                        </td>
                        <td className={`p-4 text-right font-black ${h.change_amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {h.change_amount > 0 ? `+${h.change_amount}` : h.change_amount}
                        </td>
                        <td className="p-4 text-slate-300 font-semibold">{h.user_name || 'Staff'}</td>
                        <td className="p-4 font-mono text-slate-400">{h.reference_no || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TABLE FOOTER / PAGINATION */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Showing report page {currentPage} (Total {
                activeTab === 'valuation' ? filteredProducts.length :
                activeTab === 'cogs' ? filteredCOGS.length :
                activeTab === 'deadstock' ? filteredDeadStock.length :
                activeTab === 'procurement' ? filteredProcurement.length :
                activeTab === 'variance' ? varianceLogs.length :
                activeTab === 'expiry' ? expiryProducts.length :
                filteredMovements.length
              } records)
            </span>
            <TablePagination
              currentPage={currentPage}
              totalPages={Math.ceil((
                activeTab === 'valuation' ? filteredProducts.length :
                activeTab === 'cogs' ? filteredCOGS.length :
                activeTab === 'deadstock' ? filteredDeadStock.length :
                activeTab === 'procurement' ? filteredProcurement.length :
                activeTab === 'variance' ? varianceLogs.length :
                activeTab === 'expiry' ? expiryProducts.length :
                filteredMovements.length
              ) / pageSize) || 1}
              onPageChange={setCurrentPage}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(!isExpanded)}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
