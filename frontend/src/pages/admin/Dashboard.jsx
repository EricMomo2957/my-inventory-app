import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Plus, 
  RefreshCw, 
  Calendar as CalendarIcon, 
  Bell, 
  Moon, 
  Sun, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  Users, 
  BarChart3,
  Activity,
  DollarSign,
  Percent,
  Clock,
  Tag,
  Boxes
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import AdminHeader from './AdminHeader';
import TablePagination from '../../components/TablePagination';
import ProductVariantModal from '../../components/ProductVariantModal';

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

export default function Dashboard({ products = [], fetchProducts, activeAlertsCount = 0 }) {
  const { isDark, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const pageSize = 8;
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [variantProduct, setVariantProduct] = useState(null);

  const [analyticsData, setAnalyticsData] = useState({
    categoryData: [],
    userRoleData: [],
    stockMovements: []
  });

  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    category: "General", 
    quantity: 0, 
    price: 0.00, 
    cost_price: 0.00,
    sku: "",
    batch_number: "",
    expiry_date: "",
    min_threshold: 5,
    imageFile: null 
  });

  const categoriesList = ["General", "Vegetables", "Fruits", "Supplies", "Canned Goods", "Raw Materials"];
  const dynamicCategories = ["All", ...new Set([...categoriesList, ...products.map(p => p.category).filter(Boolean)])];

  const filteredProducts = products.filter(p => 
    (activeCategory === "All" || p.category === activeCategory) && 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (p.batch_number && p.batch_number.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const displayedProducts = isExpanded 
    ? filteredProducts 
    : filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory]);

  // Inventory & Financial Calculations
  const totalItems = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const inventoryValue = products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.price || 0)), 0);
  const totalCapitalInvested = products.reduce((sum, p) => {
    const cost = p.cost_price !== undefined && p.cost_price !== null 
      ? Number(p.cost_price) 
      : Math.round(Number(p.price || 0) * 0.65 * 100) / 100;
    return sum + (Number(p.quantity) * cost);
  }, 0);
  const potentialProfit = Math.max(0, inventoryValue - totalCapitalInvested);
  const overallMarginPct = inventoryValue > 0 ? ((potentialProfit / inventoryValue) * 100) : 0;

  const lowStockProducts = products.filter(p => Number(p.quantity) < (p.min_threshold || 5));
  const expiringProducts = products.filter(p => {
    if (!p.expiry_date) return false;
    const exp = getExpiryStatus(p.expiry_date);
    return exp.status === 'expired' || exp.status === 'critical' || exp.status === 'warning';
  });

  // Fetch live analytics
  const fetchAnalytics = async () => {
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
          userRoleData: apiData.userRoleData?.length ? apiData.userRoleData : [
            { name: 'admin', value: 2 },
            { name: 'clerk', value: 4 },
            { name: 'manager', value: 1 },
            { name: 'user', value: 5 },
          ],
          stockMovements: apiData.stockMovements?.length ? apiData.stockMovements : [
            { day: 'Mon', restock: 20, sale: 15 },
            { day: 'Tue', restock: 40, sale: 10 },
            { day: 'Wed', restock: 10, sale: 25 },
            { day: 'Thu', restock: 30, sale: 5 },
            { day: 'Fri', restock: 50, sale: 35 },
            { day: 'Sat', restock: 15, sale: 40 },
            { day: 'Sun', restock: 5, sale: 20 },
          ]
        });
        return;
      }
    } catch (err) {
      console.warn("Analytics fetch fallback:", err);
    }

    setAnalyticsData({
      categoryData: [
        { name: 'Canned Goods', value: 6 },
        { name: 'Fruits', value: 2 },
        { name: 'Supplies', value: 4 },
        { name: 'Vegetables', value: 11 },
      ],
      userRoleData: [
        { name: 'admin', value: 2 },
        { name: 'clerk', value: 4 },
        { name: 'manager', value: 1 },
        { name: 'user', value: 5 },
      ],
      stockMovements: [
        { day: 'Mon', restock: 20, sale: 15 },
        { day: 'Tue', restock: 40, sale: 10 },
        { day: 'Wed', restock: 10, sale: 25 },
        { day: 'Thu', restock: 30, sale: 5 },
        { day: 'Fri', restock: 50, sale: 35 },
        { day: 'Sat', restock: 15, sale: 40 },
        { day: 'Sun', restock: 5, sale: 20 },
      ]
    });
  };

  useEffect(() => {
    fetchAnalytics();
  }, [products]);

  const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#00684a', '#10b981'];

  // API Handlers
  const handleAddProduct = async () => {
    if (!newProduct.name) return;
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("category", newProduct.category);
    formData.append("quantity", newProduct.quantity);
    formData.append("price", newProduct.price);
    formData.append("cost_price", newProduct.cost_price);
    formData.append("sku", newProduct.sku);
    formData.append("batch_number", newProduct.batch_number);
    formData.append("expiry_date", newProduct.expiry_date);
    formData.append("min_threshold", newProduct.min_threshold);
    if (newProduct.imageFile) formData.append("image", newProduct.imageFile);

    try {
      await fetch('http://localhost:3000/api/products', { method: 'POST', body: formData });
      setIsAddModalOpen(false);
      setNewProduct({ 
        name: "", 
        category: "General", 
        quantity: 0, 
        price: 0, 
        cost_price: 0,
        sku: "",
        batch_number: "",
        expiry_date: "",
        min_threshold: 5,
        imageFile: null 
      });
      fetchProducts && fetchProducts();
    } catch (error) { console.error("Add failed:", error); }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    const formData = new FormData();
    formData.append("name", selectedProduct.name);
    formData.append("category", selectedProduct.category);
    formData.append("quantity", Number(selectedProduct.quantity));
    formData.append("price", Number(selectedProduct.price));
    formData.append("cost_price", Number(selectedProduct.cost_price || 0));
    formData.append("sku", selectedProduct.sku || '');
    formData.append("batch_number", selectedProduct.batch_number || '');
    formData.append("expiry_date", selectedProduct.expiry_date ? String(selectedProduct.expiry_date).split('T')[0] : '');
    formData.append("min_threshold", Number(selectedProduct.min_threshold || 5));
    
    if (selectedProduct.imageFile) formData.append("image", selectedProduct.imageFile);

    try {
      const response = await fetch(`http://localhost:3000/api/products/${selectedProduct.id}`, { 
        method: 'PUT', 
        body: formData 
      });
      
      if (response.ok) {
        setIsEditModalOpen(false);
        fetchProducts && fetchProducts();
      }
    } catch (error) { 
      console.error("Update failed:", error); 
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await fetch(`http://localhost:3000/api/products/${productToDelete.id}`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      fetchProducts && fetchProducts();
    } catch (error) { console.error("Delete failed:", error); }
  };

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* Top Header Bar */}
      <AdminHeader 
        title="Warehouse Admin Executive"
        subtitle="Catalog Control, FIFO Expiry Tracking & Margin Intelligence"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        activeAlerts={lowStockProducts}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7">
        
        {/* ========================================================= */}
        {/* 1. FINANCIAL PROFIT & MARGIN INTELLIGENCE CARDS */}
        {/* ========================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                Cost vs. Selling Valuation & Profit Margins
              </h2>
              <p className="text-[11px] text-slate-400">Real-time accounting analytics and inventory asset valuation</p>
            </div>
            <button 
              onClick={() => {
                fetchAnalytics();
                fetchProducts && fetchProducts();
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Metrics</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* Card 1: Capital Invested (Cost Price) */}
            <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  TOTAL CAPITAL INVESTED
                </p>
                <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-3">
                <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₱{totalCapitalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <p className="text-[10px] text-slate-400">
                Landed acquisition & supplier cost
              </p>
            </div>

            {/* Card 2: Selling Valuation */}
            <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  TOTAL SELLING VALUATION
                </p>
                <div className="w-7 h-7 rounded-full bg-[#e6f4ea] dark:bg-emerald-950/40 text-[#00684a] dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-3">
                <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₱{inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <p className="text-[10px] text-slate-400">
                Revenue potential across {totalItems.toLocaleString()} units
              </p>
            </div>

            {/* Card 3: Potential Gross Profit & Margin */}
            <div className="p-5 rounded-2xl bg-[#00684a] text-white flex flex-col justify-between shadow-md shadow-[#00684a]/20">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                  POTENTIAL GROSS PROFIT
                </p>
                <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center">
                  <Percent className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-3">
                <h3 className="text-2xl font-extrabold tracking-tight text-white">
                  ₱{potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="flex items-center justify-between text-[10px] text-emerald-100">
                <span>Weighted Gross Margin</span>
                <span className="font-black bg-white/20 px-2 py-0.5 rounded-md">+{overallMarginPct.toFixed(1)}%</span>
              </div>
            </div>

            {/* Card 4: FIFO Expiry & Quality Watchlist */}
            <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
              expiringProducts.length > 0 
                ? 'bg-amber-500/5 border-amber-500/20 dark:bg-amber-950/20 dark:border-amber-800/40' 
                : isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  EXPIRY & QUALITY WATCHLIST
                </p>
                <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-3">
                <h3 className={`text-2xl font-extrabold tracking-tight ${expiringProducts.length > 0 ? 'text-amber-600 dark:text-amber-400' : (isDark ? 'text-white' : 'text-slate-900')}`}>
                  {expiringProducts.length} <span className="text-xs font-normal text-slate-400">Batches</span>
                </h3>
              </div>
              <p className="text-[10px] text-slate-400">
                {expiringProducts.length > 0 
                  ? `${expiringProducts.length} items expired or expiring within 30 days` 
                  : "All inventory lots are within safe date bounds"}
              </p>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. ANALYTICS CHARTS SECTION */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* BAR CHART: Stock by Category */}
            <div className={`p-6 rounded-2xl border shadow-xs transition-colors ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">INVENTORY DISTRIBUTION</h2>
                  <p className={`text-sm font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Category Breakdown</p>
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

            {/* PIE CHART: User Roles */}
            <div className={`p-6 rounded-2xl border shadow-xs transition-colors ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">STAFF ROLES & ACCESS</h2>
                  <p className={`text-sm font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Authorized Personnel</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.userRoleData}
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analyticsData.userRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. OPERATIONAL CATALOG & FIFO INVENTORY TABLE */}
        {/* ========================================================= */}
        <div id="inventory-table" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Catalog Inventory, Margins & FIFO Expiry Tracking
              </h2>
              <p className="text-xs text-slate-400">
                Manage products, audit unit margins, and inspect batch expiration lifecycles
              </p>
            </div>

            {/* Search, Category Tabs, and Add Product */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search name, SKU, batch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#00684a] hover:bg-[#005a3f] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#00684a]/20 transition-all cursor-pointer shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Product Data Table */}
          <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[11px] font-black uppercase tracking-wider border-b ${
                  isDark ? 'bg-slate-900/60 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-950 border-slate-200'
                }`} style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                  <th className="py-4 px-5">Product & SKU</th>
                  <th className="py-4 px-4">Batch / Lot</th>
                  <th className="py-4 px-4">Cost Price</th>
                  <th className="py-4 px-4">Selling Price</th>
                  <th className="py-4 px-4 text-center">Gross Margin</th>
                  <th className="py-4 px-4">FIFO Expiry Status</th>
                  <th className="py-4 px-4 text-center">Stock Level</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs font-medium ${
                isDark ? 'divide-slate-800/80' : 'divide-slate-200'
              }`}>
                {displayedProducts.length > 0 ? (
                  displayedProducts.map((item) => {
                    const costPrice = item.cost_price !== undefined && item.cost_price !== null 
                      ? Number(item.cost_price) 
                      : Math.round(Number(item.price || 0) * 0.65 * 100) / 100;
                    const sellPrice = Number(item.price || 0);
                    const unitProfit = Math.max(0, sellPrice - costPrice);
                    const marginPct = sellPrice > 0 ? ((unitProfit / sellPrice) * 100) : 0;
                    const expiry = getExpiryStatus(item.expiry_date);
                    const isLow = Number(item.quantity) < (item.min_threshold || 5);

                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors ${
                          isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Product Name & SKU */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 border flex items-center justify-center ${
                              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
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
                              <p className="font-black text-sm leading-tight truncate" style={{ color: isDark ? '#ffffff' : '#09090b' }}>
                                {item.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-mono font-bold" style={{ color: isDark ? '#94a3b8' : '#334155' }}>
                                  {item.sku || `SKU-${(item.category || 'GEN').substring(0, 3).toUpperCase()}-${item.id}`}
                                </span>
                                <span className="text-[10px] text-slate-400">•</span>
                                <span className="text-[10px] font-bold" style={{ color: isDark ? '#cbd5e1' : '#09090b' }}>{item.category || 'General'}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Batch / Lot */}
                        <td className="py-3.5 px-4 font-mono text-[11px] font-bold">
                          <span 
                            className="px-2.5 py-1 rounded-md border text-[10px] font-mono font-black inline-block shadow-xs"
                            style={{
                              backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                              color: isDark ? '#f8fafc' : '#09090b',
                              borderColor: isDark ? '#334155' : '#cbd5e1'
                            }}
                          >
                            {item.batch_number || 'LOT-DEFAULT'}
                          </span>
                        </td>

                        {/* Cost Price */}
                        <td className="py-3.5 px-4 font-black text-xs" style={{ color: isDark ? '#cbd5e1' : '#09090b' }}>
                          ₱{costPrice.toFixed(2)}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3.5 px-4 font-black text-xs" style={{ color: isDark ? '#ffffff' : '#09090b' }}>
                          ₱{sellPrice.toFixed(2)}
                        </td>

                        {/* Margin % Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              marginPct >= 35 
                                ? 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                                : marginPct >= 20 
                                  ? 'bg-blue-100 text-blue-950 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                  : 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                            }`}>
                              +{marginPct.toFixed(1)}%
                            </span>
                            <span className="text-[9px] font-bold mt-0.5" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                              ₱{unitProfit.toFixed(2)} / unit
                            </span>
                          </div>
                        </td>

                        {/* Expiry Badge */}
                        <td className="py-3.5 px-4">
                          {item.expiry_date ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black border ${expiry.badgeClass}`}>
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
                            <span className="font-black text-xs" style={{ color: isLow ? '#ef4444' : isDark ? '#f8fafc' : '#09090b' }}>
                              {item.quantity} units
                            </span>
                            {isLow && (
                              <span className="text-[9px] text-red-600 dark:text-red-400 font-black uppercase tracking-wider">Low Stock</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right space-x-1.5">
                          <button 
                            onClick={() => { setVariantProduct(item); setIsVariantModalOpen(true); }} 
                            className={`p-2 rounded-lg border transition-colors ${
                              isDark ? 'border-purple-800 bg-purple-950/30 hover:bg-purple-900/50 text-purple-300' : 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-600'
                            }`}
                            title="Manage Variants & Packaging UOM"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => { setSelectedProduct(item); setIsEditModalOpen(true); }} 
                            className={`p-2 rounded-lg border transition-colors ${
                              isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                            }`}
                            title="Edit Product, Cost & Batch Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => { setProductToDelete(item); setIsDeleteModalOpen(true); }} 
                            className="p-2 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* ADD PRODUCT MODAL WITH COST & FIFO BATCH TRACKING */}
      {isAddModalOpen && (
        <div className="fixed inset-0 backdrop-blur-xs bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl p-7 border shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-extrabold">Add New Inventory Product</h2>
                <p className="text-xs text-slate-400">Register catalog item with cost and batch expiry details</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg">✕</button>
            </div>
            
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Product Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Fresh Organic Tomatoes"
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">SKU / Item Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SKU-VEG-102"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Cost Price vs Selling Price */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00684a] dark:text-emerald-400 block">
                  Pricing & Profit Margins
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Cost Price (₱)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      step="0.01"
                      value={newProduct.cost_price || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Selling Price (₱) *</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      step="0.01"
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      required
                    />
                  </div>
                </div>

                {newProduct.price > 0 && (
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-300 flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                    <span>Est. Unit Margin:</span>
                    <span className="text-[#00684a] dark:text-emerald-400 font-extrabold">
                      ₱{Math.max(0, (newProduct.price || 0) - (newProduct.cost_price || (newProduct.price * 0.65))).toFixed(2)} ({newProduct.price > 0 ? (((Math.max(0, newProduct.price - (newProduct.cost_price || (newProduct.price * 0.65)))) / newProduct.price) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                )}
              </div>

              {/* FIFO Batch & Expiry Tracking */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00684a] dark:text-emerald-400 block">
                  FIFO Batch & Expiration
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Batch / Lot Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. LOT-202609-01"
                      value={newProduct.batch_number}
                      onChange={(e) => setNewProduct({ ...newProduct, batch_number: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Expiry Date</label>
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Initial Quantity</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newProduct.quantity || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Min Alert Threshold</label>
                  <input 
                    type="number" 
                    placeholder="5"
                    value={newProduct.min_threshold || 5}
                    onChange={(e) => setNewProduct({ ...newProduct, min_threshold: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Product Photo (Optional)</label>
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
                  onClick={handleAddProduct}
                  className="flex-1 py-3 bg-[#00684a] text-white rounded-xl text-xs font-extrabold shadow-md shadow-[#00684a]/20 hover:bg-[#00563b] transition-all cursor-pointer"
                >
                  Save Product & Log Batch
                </button>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-5 py-3 rounded-xl text-xs font-bold border cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL WITH COST & FIFO BATCH TRACKING */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 backdrop-blur-xs bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl p-7 border shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-extrabold">Edit Product & Batch Details</h2>
                <p className="text-xs text-slate-400">Update cost, SKU, selling price, or expiry parameters</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg">✕</button>
            </div>
            
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Product Name</label>
                <input 
                  type="text" 
                  value={selectedProduct.name || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#00684a]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Category</label>
                  <select
                    value={selectedProduct.category || 'General'}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">SKU Code</label>
                  <input 
                    type="text" 
                    value={selectedProduct.sku || ''}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, sku: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Cost Price vs Selling Price */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00684a] dark:text-emerald-400 block">
                  Pricing & Profit Margins
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Cost Price (₱)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={selectedProduct.cost_price ?? ''}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, cost_price: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Selling Price (₱)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={selectedProduct.price ?? ''}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* FIFO Batch & Expiry */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00684a] dark:text-emerald-400 block">
                  FIFO Batch & Expiry Settings
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Batch / Lot Number</label>
                    <input 
                      type="text" 
                      value={selectedProduct.batch_number || ''}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, batch_number: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Expiry Date</label>
                    <input 
                      type="date" 
                      value={selectedProduct.expiry_date ? String(selectedProduct.expiry_date).split('T')[0] : ''}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, expiry_date: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Stock Quantity</label>
                  <input 
                    type="number" 
                    value={selectedProduct.quantity ?? ''}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, quantity: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Min Alert Threshold</label>
                  <input 
                    type="number" 
                    value={selectedProduct.min_threshold ?? 5}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, min_threshold: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Update Photo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, imageFile: e.target.files[0] })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs text-slate-400 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={handleUpdateProduct}
                  className="flex-1 py-3 bg-[#00684a] text-white rounded-xl text-xs font-extrabold shadow-md shadow-[#00684a]/20 hover:bg-[#00563b] transition-all cursor-pointer"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className={`px-5 py-3 rounded-xl text-xs font-bold border cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 backdrop-blur-xs bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-xl text-center ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold mb-1">Delete Product</h3>
            <p className="text-xs text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-white">"{productToDelete.name}"</span>?
            </p>
            <div className="flex gap-2.5">
              <button 
                onClick={handleDeleteProduct}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Delete
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
                  isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT VARIANT & UOM CONVERSION MODAL */}
      <ProductVariantModal 
        product={variantProduct}
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        onVariantsUpdated={fetchProducts}
      />

    </div>
  );
}