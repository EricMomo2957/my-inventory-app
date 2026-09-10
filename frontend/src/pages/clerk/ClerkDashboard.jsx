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
  Maximize2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

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
  const [adjustmentType, setAdjustmentType] = useState('add'); // 'add' | 'subtract' | 'set'
  const [adjustmentAmount, setAdjustmentAmount] = useState(1);
  const [adjustmentReason, setAdjustmentReason] = useState('Weekly Restock');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

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
  const categoriesList = ["General", "Vegetables", "Fruits", "Supplies", "Canned Goods"];
  const dynamicCategories = ["All", ...new Set([...categoriesList, ...products.map(p => p.category).filter(Boolean)])];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
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
  const lowStockProducts = products.filter(p => Number(p.quantity) < lowStockThreshold);

  const STATUS_PIE_COLORS = ['#00684a', '#ef4444', '#f59e0b'];

  // --- Handlers ---
  const downloadCSV = () => {
    if (products.length === 0) return;
    const headers = ["ID", "Product Name", "Category", "Unit Price", "Quantity In Stock", "Status"];
    const rows = products.map(p => [
      p.id,
      `"${p.name}"`, 
      `"${p.category || 'General'}"`,
      p.price,
      p.quantity,
      p.quantity < lowStockThreshold ? "LOW STOCK" : "OPTIMAL"
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clerk_inventory_audit_${new Date().toISOString().split('T')[0]}.csv`);
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

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* Top Header Bar */}
      <header className={`sticky top-0 z-30 px-8 py-3.5 border-b backdrop-blur-md transition-colors ${
        isDark ? 'bg-[#0f172a]/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-100 text-slate-800 shadow-xs'
      }`}>
        <div className="flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00684a]/10 text-[#00684a] dark:text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Clerk Desk</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight truncate">
                Inventory & Stock Management
              </h2>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                Real-time stock adjustments, logging and dispatch operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Date */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200/80 text-slate-600'
            }`}>
              <CalendarIcon className="w-3.5 h-3.5 text-[#00684a] dark:text-emerald-400" />
              <span>{currentDateFormatted}</span>
            </div>

            {/* Status */}
            <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold ${
              isDark ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-[#00684a]'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Terminal Online</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                className={`p-2 rounded-xl border transition-colors relative ${
                  isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                }`}
                title="Low Stock Alerts"
              >
                <Bell className="w-4 h-4" />
                {lowStockProducts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {lowStockProducts.length}
                  </span>
                )}
              </button>
            </div>

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

            {/* User Avatar */}
            <div className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl border ${
              isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-7 h-7 rounded-lg bg-[#00684a] text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                {profileImage ? (
                  <img src={profileImage.startsWith('http') ? profileImage : `http://localhost:3000${profileImage}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-xs font-bold leading-none hidden md:block">{userName}</span>
            </div>

          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-7">

        {/* ========================================================= */}
        {/* 1. CLERK ANALYTICS & INTELLIGENCE SECTION AT TOP */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Stock Analytics & Terminal Intelligence
              </h1>
              <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Live category volumes, stock health levels, and weekly movement logs
              </p>
            </div>

            <button 
              onClick={() => {
                fetchData();
                fetchAnalytics();
              }}
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

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* BAR CHART: Category Distribution */}
            <div className={`p-6 rounded-2xl border shadow-xs transition-colors lg:col-span-2 ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CATEGORY PORTFOLIO (BAR)</h2>
                  <p className={`text-sm font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Available Stock by Category</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#e6f4ea] dark:bg-emerald-950/40 text-[#00684a] dark:text-emerald-400 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                    <XAxis dataKey="name" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
                    <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#0f172a' : '#fff', 
                        borderRadius: '12px', 
                        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                      itemStyle={{ color: '#00684a' }}
                    />
                    <Bar dataKey="value" fill="#00684a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PIE CHART: Stock Health */}
            <div className={`p-6 rounded-2xl border shadow-xs transition-colors ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">INVENTORY HEALTH</h2>
                  <p className={`text-sm font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Threshold Proportions</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#00684a] dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.stockStatusData}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analyticsData.stockStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_PIE_COLORS[index % STATUS_PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#0f172a' : '#fff', 
                        borderRadius: '12px', 
                        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                        fontSize: '12px' 
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* LINE CHART: Clerk Weekly Activity */}
            <div className={`p-6 rounded-2xl border shadow-xs col-span-1 lg:col-span-3 transition-colors ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TERMINAL INFLOW VS. DISPATCH</h2>
                  <p className={`text-sm font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Weekly Restock vs. Sales / Outflows</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#00684a] dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.movementTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                    <XAxis dataKey="day" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
                    <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#0f172a' : '#fff', 
                        borderRadius: '12px', 
                        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" name="Restock Inflows" dataKey="restock" stroke="#00684a" strokeWidth={3} dot={{ r: 4, fill: '#00684a' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="Order Dispatches" dataKey="dispatch" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CLERK ACTIONS DESK & LOW STOCK NOTICE */}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Action 1: Manage Orders */}
              <button 
                onClick={() => navigate('/clerk/order')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                  isDark ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800' : 'bg-[#fcfdfd] border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#00684a]/10 text-[#00684a] dark:text-emerald-400 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Point of Sale / Orders
                </span>
              </button>

              {/* Action 2: Export CSV */}
              <button 
                onClick={downloadCSV}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                  isDark ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800' : 'bg-[#fcfdfd] border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Export Stock CSV
                </span>
              </button>

              {/* Action 3: Operations Calendar */}
              <button 
                onClick={() => navigate('/clerk/clerkCalendar')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                  isDark ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800' : 'bg-[#fcfdfd] border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Schedule & Tasks
                </span>
              </button>

            </div>
          </div>

          {/* Pending Alerts / Notice Card (Col 4) */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#fef9ee] dark:bg-amber-950/20 border border-[#fde8bb] dark:border-amber-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Clerk Stock Alerts</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold rounded-full">
                  {lowStockProducts.length} Items
                </span>
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-300/80 font-medium mt-2 leading-relaxed">
                {lowStockProducts.length > 0 
                  ? `${lowStockProducts.length} product(s) have dropped below ${lowStockThreshold} units. Restock is advised.`
                  : "All inventory products are currently stocked at safe levels."}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400">
                Quick Action Required
              </span>
              <button 
                onClick={() => {
                  const target = document.getElementById('clerk-inventory-table');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-[11px] font-extrabold text-[#00684a] dark:text-emerald-400 hover:underline"
              >
                Inspect Catalog ↓
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 3. KPI STAT METRIC CARDS */}
        {/* ========================================================= */}
        <div>
          <h2 className={`text-xs font-bold uppercase tracking-wider mb-3.5 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Core Inventory Metrics
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
                <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
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
                  TOTAL UNITS
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
                Aggregated inventory volume
              </p>
            </div>

            {/* Card 3: Low Stock Alerts */}
            <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  LOW STOCK ALERTS
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
                Below minimum limit (&lt;{lowStockThreshold})
              </p>
            </div>

            {/* Card 4: Total Inventory Value */}
            <div className="p-5 rounded-2xl bg-[#00684a] text-white flex flex-col justify-between shadow-md shadow-[#00684a]/20">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                  TOTAL VALUE
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
                Assessed stock assets on floor
              </p>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. OPERATIONAL PRODUCT MANAGEMENT TABLE */}
        {/* ========================================================= */}
        <div id="clerk-inventory-table" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Operational Stock Inventory
              </h2>
              <p className="text-xs text-slate-400">
                Click Adjust to perform rapid restock or inventory corrections
              </p>
            </div>

            {/* Search & Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search products..."
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
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-center">Stock Level</th>
                  <th className="py-4 px-6">Unit Price</th>
                  <th className="py-4 px-6 text-right">Quick Stock Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs font-medium ${
                isDark ? 'divide-slate-800/80' : 'divide-slate-100'
              }`}>
                {displayedProducts.length > 0 ? (
                  displayedProducts.map((item) => {
                    const isLow = Number(item.quantity) < lowStockThreshold;
                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors ${
                          isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Product Detail */}
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
                          <div className="inline-flex items-center gap-1.5">
                            <span className={`font-extrabold text-sm ${
                              isLow ? 'text-red-500' : isDark ? 'text-slate-200' : 'text-slate-800'
                            }`}>
                              {item.quantity} units
                            </span>
                            {isLow && (
                              <span className="px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase">
                                Low
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Unit Price */}
                        <td className="py-3.5 px-6 font-bold text-[#00684a] dark:text-emerald-400">
                          ₱{Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-6 text-right">
                          <button 
                            onClick={() => openAdjustmentModal(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00684a] hover:bg-[#00553c] text-white text-xs font-bold transition-all shadow-sm shadow-[#00684a]/20 active:scale-95"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Adjust Stock</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
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
              <div>
                <h3 className="text-base font-extrabold">Adjust Product Stock</h3>
                <p className="text-xs text-slate-400 mt-0.5">Terminal logging for {selectedProduct.name}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Current Status Pill */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between mb-5 ${
              isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00684a]/10 text-[#00684a] dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">{selectedProduct.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">SKU-#{selectedProduct.id} • {selectedProduct.category}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current</span>
                <span className="text-sm font-extrabold text-[#00684a] dark:text-emerald-400">{selectedProduct.quantity} units</span>
              </div>
            </div>

            {/* Adjustment Type Switcher */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Action Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('add')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      adjustmentType === 'add'
                        ? 'bg-[#00684a] text-white border-[#00684a] shadow-xs'
                        : `${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Restock</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustmentType('subtract')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      adjustmentType === 'subtract'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : `${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Deduct</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustmentType('set')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      adjustmentType === 'set'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : `${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Override</span>
                  </button>
                </div>
              </div>

              {/* Quantity Input & Fast Presets */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Amount
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    min="1"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-extrabold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#00684a]'
                    }`}
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[1, 5, 10, 25, 50].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAdjustmentAmount(val)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                        adjustmentAmount === val 
                          ? 'bg-[#00684a]/10 border-[#00684a] text-[#00684a] dark:text-emerald-400' 
                          : `${isDark ? 'border-slate-700 bg-slate-800/60 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'}`
                      }`}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
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
                  <option value="Damaged Goods Removal">Damaged Goods Removal</option>
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
                  className="flex-1 py-2.5 bg-[#00684a] hover:bg-[#00553c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00684a]/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Commit Stock"}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}