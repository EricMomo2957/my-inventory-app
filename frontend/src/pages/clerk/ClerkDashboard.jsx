import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import TablePagination from '../../components/TablePagination';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Edit3, 
  Plus, 
  Minus, 
  RefreshCw, 
  Download, 
  ShoppingCart, 
  Calendar as CalendarIcon, 
  Bell, 
  Sun, 
  Moon, 
  Layers, 
  CheckCircle2,
  Sliders,
  Maximize2,
  Clock,
  DollarSign,
  Percent,
  Tag
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

// Helper to compute FIFO expiry status
const getExpiryStatus = (expiryDateStr) => {
  if (!expiryDateStr) {
    return { status: 'none', label: 'No Expiry Set', color: 'slate', days: null };
  }
  const expDate = new Date(expiryDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { 
      status: 'expired', 
      label: `Expired (${Math.abs(diffDays)}d ago)`, 
      badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50',
      days: diffDays 
    };
  }
  if (diffDays <= 7) {
    return { 
      status: 'critical', 
      label: `Expires in ${diffDays}d (Critical)`, 
      badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50 animate-pulse',
      days: diffDays 
    };
  }
  if (diffDays <= 30) {
    return { 
      status: 'warning', 
      label: `Expires in ${diffDays}d`, 
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
      days: diffDays 
    };
  }
  return { 
    status: 'healthy', 
    label: `Valid (${expDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`, 
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
    days: diffDays 
  };
};

export default function ClerkDashboard() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  // --- State Management ---
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const pageSize = 8;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(5);
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [adjustmentReason, setAdjustmentReason] = useState('Weekly Restock');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add New Product State for Clerk
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Supplies',
    quantity: 0,
    price: '',
    cost_price: '',
    sku: '',
    batch_number: '',
    expiry_date: '',
    min_threshold: 5,
    imageFile: null
  });

  // Live analytics state
  const [analyticsData, setAnalyticsData] = useState({
    categoryData: [],
    stockStatusData: [],
    movementTrends: []
  });

  const [lowStockThreshold] = useState(() => parseInt(localStorage.getItem('lowStockThreshold') || '5', 10));

  const userName = localStorage.getItem('fullName') || localStorage.getItem('userName') || 'Clerk Staff';
  const role = localStorage.getItem('userRole') || 'CLERK';
  const profileImage = localStorage.getItem('userPhoto') || localStorage.getItem('profileImage');

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/products');
      if (response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/reports/analytics');
      if (res.ok) {
        const apiData = await res.json();
        setAnalyticsData({
          categoryData: apiData.categoryData?.length ? apiData.categoryData : [
            { name: 'Canned Goods', value: 6 },
            { name: 'Fruits', value: 2 },
            { name: 'Supplies', value: 4 },
            { name: 'Vegetables', value: 11 },
          ],
          stockStatusData: [
            { name: 'Healthy Stock', value: products.filter(p => p.quantity >= 10).length || 18 },
            { name: 'Low Stock (<5)', value: products.filter(p => p.quantity < 5).length || 3 },
            { name: 'Moderate (5-9)', value: products.filter(p => p.quantity >= 5 && p.quantity < 10).length || 5 },
          ],
          movementTrends: apiData.stockMovements?.length ? apiData.stockMovements : [
            { day: 'Mon', restock: 25, dispatch: 12 },
            { day: 'Tue', restock: 40, dispatch: 18 },
            { day: 'Wed', restock: 15, dispatch: 30 },
            { day: 'Thu', restock: 35, dispatch: 10 },
            { day: 'Fri', restock: 60, dispatch: 45 },
            { day: 'Sat', restock: 20, dispatch: 35 },
            { day: 'Sun', restock: 10, dispatch: 15 },
          ]
        });
        return;
      }
    } catch (err) {
      console.warn("Analytics fallback:", err);
    }

    setAnalyticsData({
      categoryData: [
        { name: 'Canned Goods', value: 6 },
        { name: 'Fruits', value: 2 },
        { name: 'Supplies', value: 4 },
        { name: 'Vegetables', value: 11 },
      ],
      stockStatusData: [
        { name: 'Healthy Stock', value: 18 },
        { name: 'Low Stock (<5)', value: 3 },
        { name: 'Moderate (5-9)', value: 5 },
      ],
      movementTrends: [
        { day: 'Mon', restock: 25, dispatch: 12 },
        { day: 'Tue', restock: 40, dispatch: 18 },
        { day: 'Wed', restock: 15, dispatch: 30 },
        { day: 'Thu', restock: 35, dispatch: 10 },
        { day: 'Fri', restock: 60, dispatch: 45 },
        { day: 'Sat', restock: 20, dispatch: 35 },
        { day: 'Sun', restock: 10, dispatch: 15 },
      ]
    });
  }, [products]);

  // Auth Check
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'clerk' && userRole !== 'admin' && userRole !== 'Administrator') {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchAnalytics();
  }, [products, fetchAnalytics]);

  // --- Computed Filters & Metrics ---
  const categoriesList = ["General", "Vegetables", "Fruits", "Supplies", "Canned Goods", "Raw Materials"];
  const dynamicCategories = ["All", ...new Set([...categoriesList, ...products.map(p => p.category).filter(Boolean)])];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(q) || 
                          (p.sku && p.sku.toLowerCase().includes(q)) ||
                          (p.batch_number && p.batch_number.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const displayedProducts = isExpanded 
    ? filteredProducts 
    : filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  const totalItems = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const totalValue = products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.quantity) || 0)), 0);
  const totalCost = products.reduce((sum, p) => {
    const cost = p.cost_price !== undefined && p.cost_price !== null 
      ? Number(p.cost_price) 
      : Math.round(Number(p.price || 0) * 0.65 * 100) / 100;
    return sum + ((Number(p.quantity) || 0) * cost);
  }, 0);
  const potentialProfit = Math.max(0, totalValue - totalCost);
  const overallMarginPct = totalValue > 0 ? ((potentialProfit / totalValue) * 100) : 0;

  const lowStockProducts = products.filter(p => Number(p.quantity) < (p.min_threshold || lowStockThreshold));
  const expiringProducts = products.filter(p => {
    if (!p.expiry_date) return false;
    const exp = getExpiryStatus(p.expiry_date);
    return exp.status === 'expired' || exp.status === 'critical' || exp.status === 'warning';
  });

  const STATUS_PIE_COLORS = ['#00684a', '#ef4444', '#f59e0b'];

  // --- Handlers ---
  const downloadCSV = () => {
    if (products.length === 0) return;
    const headers = ["ID", "SKU", "Product Name", "Category", "Batch/Lot", "Cost Price", "Selling Price", "Quantity In Stock", "Expiry Date", "Status"];
    const rows = products.map(p => [
      p.id,
      `"${p.sku || `SKU-${p.id}`}"`,
      `"${p.name}"`, 
      `"${p.category || 'General'}"`,
      `"${p.batch_number || 'DEFAULT'}"`,
      p.cost_price || (p.price * 0.65).toFixed(2),
      p.price,
      p.quantity,
      p.expiry_date ? String(p.expiry_date).split('T')[0] : 'N/A',
      p.quantity < (p.min_threshold || lowStockThreshold) ? "LOW STOCK" : "OPTIMAL"
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `warehouse_inventory_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAdjustmentModal = (product) => {
    setSelectedProduct({ ...product });
    setAdjustmentType('add');
    setAdjustmentAmount(5);
    setAdjustmentReason('Weekly Restock');
    setIsModalOpen(true);
  };

  const applyAdjustment = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);

    let calculatedNewQuantity = selectedProduct.quantity;
    const amount = Number(adjustmentAmount) || 0;

    if (adjustmentType === 'add') {
      calculatedNewQuantity = selectedProduct.quantity + amount;
    } else if (adjustmentType === 'subtract') {
      calculatedNewQuantity = Math.max(0, selectedProduct.quantity - amount);
    } else {
      calculatedNewQuantity = Math.max(0, amount);
    }

    try {
      await axios.put(`http://localhost:3000/api/products/${selectedProduct.id}`, {
        name: selectedProduct.name,
        category: selectedProduct.category,
        quantity: calculatedNewQuantity,
        price: selectedProduct.price,
        cost_price: selectedProduct.cost_price,
        sku: selectedProduct.sku,
        batch_number: selectedProduct.batch_number,
        expiry_date: selectedProduct.expiry_date,
        adjustment: adjustmentType === 'subtract' ? -amount : amount,
        reason: adjustmentReason,
        clerk_name: userName
      });
      setIsModalOpen(false);
      fetchData(); 
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update stock. Check network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.price) {
      alert("Please enter product name and unit price.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('category', newProduct.category || 'Supplies');
      formData.append('quantity', newProduct.quantity || 0);
      formData.append('price', newProduct.price);
      formData.append('cost_price', newProduct.cost_price || (parseFloat(newProduct.price) * 0.65).toFixed(2));
      formData.append('sku', newProduct.sku);
      formData.append('batch_number', newProduct.batch_number);
      formData.append('expiry_date', newProduct.expiry_date);
      formData.append('min_threshold', newProduct.min_threshold || 5);
      if (newProduct.imageFile) {
        formData.append('image', newProduct.imageFile);
      }

      const res = await axios.post('http://localhost:3000/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success || res.status === 201) {
        setIsAddProductModalOpen(false);
        setNewProduct({ 
          name: '', 
          category: 'Supplies', 
          quantity: 0, 
          price: '', 
          cost_price: '',
          sku: '',
          batch_number: '',
          expiry_date: '',
          min_threshold: 5,
          imageFile: null 
        });
        fetchData();
        fetchAnalytics();
      }
    } catch (err) {
      console.error("Add Product Error:", err);
      alert("Failed to add product: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* Top Header Bar */}
      <header className={`sticky top-0 z-30 px-8 py-3.5 border-b backdrop-blur-md transition-colors ${
        isDark ? 'bg-[#0f172a]/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-100 text-slate-800 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-[#00684a] dark:text-emerald-400">
                WAREHOUSE OPERATIONS
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#00684a]/10 dark:bg-emerald-950/40 text-[#00684a] dark:text-emerald-300 font-bold uppercase tracking-wider">
                FIFO & Margins
              </span>
            </div>
            <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Floor Management Desk
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-colors ${
                isDark ? 'border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-9 h-9 rounded-full bg-[#00684a] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {profileImage ? (
                  <img src={profileImage} alt={userName} className="w-full h-full object-cover rounded-full" />
                ) : (
                  userName.substring(0, 2)
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {role} STAFF
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7">
        
        {/* ========================================================= */}
        {/* 1. CLERK QUICK-DESK ACTIONS & ALERTS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Quick-Desk Actions (Col 8) */}
          <div className={`lg:col-span-8 p-6 rounded-2xl border shadow-xs transition-colors ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <h2 className={`text-xs font-bold uppercase tracking-wider mb-4 ${
              isDark ? 'text-slate-300' : 'text-slate-800'
            }`}>
              Clerk Operations Quick-Desk
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Action 1: Add New Product */}
              <button 
                onClick={() => setIsAddProductModalOpen(true)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                  isDark ? 'bg-emerald-950/30 border-emerald-800/50 hover:bg-emerald-950/50 text-emerald-300' : 'bg-[#e6f4ea]/60 border-[#ccebd7] hover:bg-[#e6f4ea] text-[#00684a]'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#00684a] text-white flex items-center justify-center shadow-sm">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-black">
                  + Add Product
                </span>
              </button>

              {/* Action 2: Inbound Stock In */}
              <button 
                onClick={() => navigate('/clerk/stock-in')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                  isDark ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800' : 'bg-[#fcfdfd] border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Inbound Stock In
                </span>
              </button>

              {/* Action 3: Stock Dispatch */}
              <button 
                onClick={() => navigate('/clerk/order')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                  isDark ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800' : 'bg-[#fcfdfd] border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#00684a]/10 text-[#00684a] dark:text-emerald-400 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Stock Dispatch
                </span>
              </button>

              {/* Action 4: Export CSV */}
              <button 
                onClick={downloadCSV}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                  isDark ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800' : 'bg-[#fcfdfd] border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Export Stock CSV
                </span>
              </button>

            </div>
          </div>

          {/* FIFO Expiry & Quality Notice Card (Col 4) */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#fef9ee] dark:bg-amber-950/20 border border-[#fde8bb] dark:border-amber-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>FIFO Expiration Watchlist</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold rounded-full">
                  {expiringProducts.length} Batches
                </span>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-300/80 font-medium mt-2 leading-relaxed">
                {expiringProducts.length > 0 
                  ? `${expiringProducts.length} product batch(es) are nearing expiry or expired. Prioritize FIFO dispatch.`
                  : "All current inventory batches are safely within quality dates."}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400">
                {lowStockProducts.length} Low Stock Alert(s)
              </span>
              <button 
                onClick={() => {
                  const target = document.getElementById('clerk-inventory-table');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-[11px] font-extrabold text-[#00684a] dark:text-emerald-400 hover:underline"
              >
                Inspect Batches ↓
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 2. CORE FINANCIAL & INVENTORY METRIC CARDS */}
        {/* ========================================================= */}
        <div>
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-3.5 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Core Inventory Metrics & Margins
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total SKUs */}
            <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  CATALOG ITEMS
                </p>
                <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:blue-400 flex items-center justify-center">
                  <Package className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-3">
                <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {products.length} <span className="text-xs font-normal text-slate-400">SKUs</span>
                </h3>
              </div>
              <p className="text-[10px] text-slate-400">
                Active products in catalog
              </p>
            </div>

            {/* Card 2: Total Units On-Hand */}
            <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  TOTAL UNITS ON-HAND
                </p>
                <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#00684a] dark:text-emerald-400 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-3">
                <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {totalItems.toLocaleString()} <span className="text-xs font-normal text-slate-400">Units</span>
                </h3>
              </div>
              <p className="text-[10px] text-slate-400">
                Total physical stock quantity
              </p>
            </div>

            {/* Card 3: Potential Profit & Margin */}
            <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  POTENTIAL GROSS PROFIT
                </p>
                <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Percent className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-3">
                <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₱{potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <p className="text-[10px] text-slate-400">
                Avg margin: <span className="font-bold text-[#00684a] dark:text-emerald-400">+{overallMarginPct.toFixed(1)}%</span>
              </p>
            </div>

            {/* Card 4: Total Inventory Valuation */}
            <div className="p-5 rounded-2xl bg-[#00684a] text-white flex flex-col justify-between shadow-md shadow-[#00684a]/20">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                  TOTAL SELLING VALUATION
                </p>
                <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-3">
                <h3 className="text-2xl font-extrabold tracking-tight text-white">
                  ₱{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <p className="text-[10px] text-emerald-100">
                Floor inventory assessed value
              </p>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. OPERATIONAL PRODUCT MANAGEMENT TABLE */}
        {/* ========================================================= */}
        <div id="clerk-inventory-table" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Operational Stock Inventory & FIFO Tracking
              </h2>
              <p className="text-xs text-slate-400">
                Track unit profit margins, batch codes, and shelf-life expiration dates
              </p>
            </div>

            {/* Search, Category Pills, and Add Product Button */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search name, SKU, batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

              <button
                onClick={() => setIsAddProductModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#00684a] hover:bg-[#005a3f] text-white rounded-xl text-xs font-extrabold shadow-sm shadow-[#00684a]/20 transition-all cursor-pointer shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Product</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                  isDark ? 'bg-slate-900/60 text-slate-400 border-slate-800' : 'bg-[#fcfdfd] text-slate-500 border-slate-100'
                }`}>
                  <th className="py-4 px-5">Product & SKU</th>
                  <th className="py-4 px-4">Batch / Lot</th>
                  <th className="py-4 px-4">Cost Price</th>
                  <th className="py-4 px-4">Selling Price</th>
                  <th className="py-4 px-4 text-center">Unit Margin</th>
                  <th className="py-4 px-4">FIFO Expiry Status</th>
                  <th className="py-4 px-4 text-center">Stock Level</th>
                  <th className="py-4 px-5 text-right">Quick Stock Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs font-medium ${
                isDark ? 'divide-slate-800/80' : 'divide-slate-100'
              }`}>
                {displayedProducts.length > 0 ? (
                  displayedProducts.map((item) => {
                    const isLow = Number(item.quantity) < (item.min_threshold || lowStockThreshold);
                    const costPrice = item.cost_price !== undefined && item.cost_price !== null 
                      ? Number(item.cost_price) 
                      : Math.round(Number(item.price || 0) * 0.65 * 100) / 100;
                    const sellPrice = Number(item.price || 0);
                    const unitProfit = Math.max(0, sellPrice - costPrice);
                    const marginPct = sellPrice > 0 ? ((unitProfit / sellPrice) * 100) : 0;
                    const expiry = getExpiryStatus(item.expiry_date);

                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors ${
                          isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Product Detail & SKU */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 border flex items-center justify-center ${
                              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
                            }`}>
                              {item.image_url ? (
                                <img 
                                  src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:3000${item.image_url}`} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <Package className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
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

                        {/* Batch / Lot */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {item.batch_number ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                              {item.batch_number}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">LOT-DEFAULT</span>
                          )}
                        </td>

                        {/* Cost Price */}
                        <td className="py-3.5 px-4 font-semibold text-slate-500 dark:text-slate-400">
                          ₱{costPrice.toFixed(2)}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                          ₱{sellPrice.toFixed(2)}
                        </td>

                        {/* Unit Margin % */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              marginPct >= 35 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                                : marginPct >= 20 
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                            }`}>
                              +{marginPct.toFixed(1)}%
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5">
                              ₱{unitProfit.toFixed(2)}
                            </span>
                          </div>
                        </td>

                        {/* FIFO Expiry Status */}
                        <td className="py-3.5 px-4">
                          {item.expiry_date ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${expiry.badgeClass}`}>
                              <Clock className="w-3 h-3" />
                              {expiry.label}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No Expiry Set</span>
                          )}
                        </td>

                        {/* Stock Level */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`font-extrabold ${isLow ? 'text-red-500' : isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {item.quantity} units
                            </span>
                            {isLow && (
                              <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider">Low</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <button 
                            onClick={() => openAdjustmentModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00684a] hover:bg-[#00553c] text-white text-xs font-bold transition-all shadow-sm shadow-[#00684a]/20 active:scale-95 cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Adjust</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400 text-xs">
                      No products found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Component */}
          {filteredProducts.length > 0 && (
            <TablePagination 
              currentPage={currentPage}
              totalItems={filteredProducts.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(!isExpanded)}
              itemLabel="products"
            />
          )}

        </div>

      </div>

      {/* ========================================================= */}
      {/* STOCK ADJUSTMENT MODAL */}
      {/* ========================================================= */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`w-full max-w-md p-7 rounded-3xl shadow-2xl border transition-colors ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00684a]/10 text-[#00684a] dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold leading-tight">Quick Stock Adjustment</h3>
                  <p className="text-[11px] text-slate-400">Update warehouse floor count & log audit trail</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Product Summary Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between mb-5">
              <div className="min-w-0 pr-3">
                <h4 className="font-extrabold text-sm truncate">{selectedProduct.name}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                  <span>{selectedProduct.sku || `SKU-#${selectedProduct.id}`}</span>
                  <span>•</span>
                  <span>{selectedProduct.batch_number || 'LOT-DEFAULT'}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Stock</span>
                <span className="text-base font-black text-[#00684a] dark:text-emerald-400">
                  {selectedProduct.quantity} Units
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Type Select */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Action Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('add')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      adjustmentType === 'add'
                        ? 'bg-[#00684a] text-white border-[#00684a] shadow-xs'
                        : `${isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" /> Restock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('subtract')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      adjustmentType === 'subtract'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : `${isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" /> Dispatch
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('set')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      adjustmentType === 'set'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : `${isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`
                    }`}
                  >
                    Exact Count
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  {adjustmentType === 'set' ? 'New Exact Quantity' : 'Adjustment Units'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Reason / Audit Log Note
                </label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="Weekly Restock">Weekly Restock</option>
                  <option value="Supplier Batch Delivery">Supplier Batch Delivery</option>
                  <option value="Damaged / Expired Goods Removal">Damaged / Expired Goods Removal</option>
                  <option value="Physical Inventory Audit">Physical Inventory Audit</option>
                  <option value="Manual Correction">Manual Correction</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={applyAdjustment}
                  className="flex-1 py-2.5 bg-[#00684a] hover:bg-[#00553c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00684a]/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Updating..." : "Commit Stock"}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. CLERK ADD PRODUCT MODAL */}
      {/* ========================================================= */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 backdrop-blur-xs bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl p-7 border shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00684a] text-white flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight">Register New Product</h2>
                  <p className="text-[11px] text-slate-400">Add an item with cost, SKU and FIFO batch details</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                  Product Name *
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Fresh Gala Apples"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#00684a]'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                    Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {categoriesList.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                    SKU Code (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. SKU-APP-001"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Pricing & Cost Margin Section */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00684a] dark:text-emerald-400 block">
                  Valuation & Cost Price
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                      Cost Price (₱)
                    </label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      step="0.01"
                      value={newProduct.cost_price}
                      onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                      Selling Price (₱) *
                    </label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* FIFO Batch & Expiry Date */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00684a] dark:text-emerald-400 block">
                  FIFO Batch & Expiry
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                      Batch / Lot #
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. LOT-202609-02"
                      value={newProduct.batch_number}
                      onChange={(e) => setNewProduct({ ...newProduct, batch_number: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                      Expiry Date
                    </label>
                    <input 
                      type="date" 
                      value={newProduct.expiry_date}
                      onChange={(e) => setNewProduct({ ...newProduct, expiry_date: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                    Initial Stock Quantity
                  </label>
                  <input 
                    type="number" 
                    placeholder="0"
                    min="0"
                    value={newProduct.quantity || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value, 10) || 0 })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#00684a]'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                    Min Stock Threshold
                  </label>
                  <input 
                    type="number" 
                    placeholder="5"
                    min="1"
                    value={newProduct.min_threshold || 5}
                    onChange={(e) => setNewProduct({ ...newProduct, min_threshold: parseInt(e.target.value, 10) || 5 })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                  Product Image (Optional)
                </label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setNewProduct({ ...newProduct, imageFile: e.target.files[0] })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs text-slate-400 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleAddProduct}
                  className="flex-1 py-2.5 bg-[#00684a] text-white rounded-xl text-xs font-extrabold shadow-md shadow-[#00684a]/20 hover:bg-[#005a3f] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Registering..." : "Save Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}