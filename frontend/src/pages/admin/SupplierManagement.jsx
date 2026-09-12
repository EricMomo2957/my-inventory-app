import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import AdminHeader from './AdminHeader';
import { 
  Building2, 
  Plus, 
  Search, 
  Clock, 
  Star, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Truck,
  Package,
  Eye,
  DollarSign,
  ArrowUpRight,
  Boxes,
  Calendar
} from 'lucide-react';

export default function SupplierManagement() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    lead_time_days: 3,
    rating: 4.8,
    status: 'active'
  });
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Supplier Profile & Supplied Products State
  const [selectedProfileSupplier, setSelectedProfileSupplier] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileTab, setProfileTab] = useState('catalog'); // 'catalog' | 'pos' | 'info'
  const [suppliedProducts, setSuppliedProducts] = useState([]);
  const [supplierPOs, setSupplierPOs] = useState([]);
  const [loadingSupplied, setLoadingSupplied] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/suppliers');
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      console.error("Suppliers load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      lead_time_days: 3,
      rating: 4.8,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      contact_person: sup.contact_person || '',
      email: sup.email || '',
      phone: sup.phone || '',
      address: sup.address || '',
      lead_time_days: sup.lead_time_days || 3,
      rating: sup.rating || 4.8,
      status: sup.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingSupplier 
        ? `http://localhost:3000/api/suppliers/${editingSupplier.id}`
        : 'http://localhost:3000/api/suppliers';
      const method = editingSupplier ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingSupplier ? 'Supplier updated successfully' : 'New supplier registered successfully');
        setIsModalOpen(false);
        loadSuppliers();
      } else {
        alert("Operation failed: " + data.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenProfile = async (sup) => {
    setSelectedProfileSupplier(sup);
    setIsProfileModalOpen(true);
    setProfileTab('catalog');
    setCatalogSearch('');
    setLoadingSupplied(true);
    try {
      const [prodRes, poRes] = await Promise.all([
        fetch(`http://localhost:3000/api/suppliers/${sup.id}/products`),
        fetch(`http://localhost:3000/api/purchase-orders`)
      ]);
      if (prodRes.ok) {
        const pData = await prodRes.json();
        setSuppliedProducts(pData.data || []);
      }
      if (poRes.ok) {
        const poData = await poRes.json();
        const vendorPOs = (poData.data || []).filter(po => 
          po.supplier_id === sup.id || po.supplier_name?.toLowerCase() === sup.name?.toLowerCase()
        );
        setSupplierPOs(vendorPOs);
      }
    } catch (err) {
      console.error("Error loading supplier profile details:", err);
    } finally {
      setLoadingSupplied(false);
    }
  };

  const filteredSuppliedProducts = useMemo(() => {
    if (!catalogSearch.trim()) return suppliedProducts;
    const q = catalogSearch.toLowerCase();
    return suppliedProducts.filter(p => 
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category_name?.toLowerCase().includes(q)
    );
  }, [suppliedProducts, catalogSearch]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove supplier "${name}"?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/api/suppliers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Supplier "${name}" deleted`);
        loadSuppliers();
      }
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter(s => s.status === 'active').length;
    const avgLeadTime = total > 0 ? (suppliers.reduce((s, sup) => s + (parseInt(sup.lead_time_days, 10) || 0), 0) / total).toFixed(1) : 0;
    const avgRating = total > 0 ? (suppliers.reduce((s, sup) => s + (parseFloat(sup.rating) || 0), 0) / total).toFixed(1) : 0;
    return { total, active, avgLeadTime, avgRating };
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;
    const q = searchQuery.toLowerCase();
    return suppliers.filter(s => 
      s.name?.toLowerCase().includes(q) ||
      s.contact_person?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.includes(q)
    );
  }, [suppliers, searchQuery]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <AdminHeader 
        title="Supplier Directory" 
        subtitle="Manage Vendor Partners, Procurement Lead Times & SLAs"
      />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="w-full p-6 md:p-8 space-y-6">

        {/* 4-CARD METRIC GRID-BOX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200/80 hover:border-[#00684a]/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Suppliers</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{metrics.total}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{metrics.active} active vendor partners</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200/80 hover:border-blue-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg. Lead Time</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{metrics.avgLeadTime} Days</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
              <Truck className="w-3.5 h-3.5" />
              <span>Fulfillment dispatch turnaround</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-amber-500/50' : 'bg-white border-slate-200/80 hover:border-amber-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Vendor Reliability</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{metrics.avgRating} / 5.0</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Star className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Average quality fulfillment score</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-purple-500/50' : 'bg-white border-slate-200/80 hover:border-purple-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Procurement Orders</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Active POs</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">
              <button 
                onClick={() => navigate('/admin/purchase-orders')}
                className="hover:underline font-bold"
              >
                Go to PO Management →
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH & ACTIONS */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search vendor name, contact or email..."
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
            <button
              onClick={loadSuppliers}
              className={`p-2.5 rounded-xl border text-slate-400 hover:text-slate-200 transition-colors cursor-pointer ${
                isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
              }`}
              title="Refresh Suppliers"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-[#00684a] hover:bg-[#00553c] text-white text-xs font-bold shadow-md shadow-[#00684a]/20 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Supplier</span>
            </button>
          </div>
        </div>

        {/* SUPPLIERS GRID OF CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map(sup => (
            <div 
              key={sup.id}
              className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isDark ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#00684a]/10 text-[#00684a] dark:text-emerald-400 flex items-center justify-center font-black text-lg border border-[#00684a]/20">
                      {sup.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`font-black text-base line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {sup.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold">{sup.contact_person || 'Primary Contact'}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    sup.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {sup.status}
                  </span>
                </div>

                {/* Info List */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2" style={{ color: isDark ? '#cbd5e1' : '#09090b' }}>
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate font-bold">{sup.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: isDark ? '#cbd5e1' : '#09090b' }}>
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-bold">{sup.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: isDark ? '#cbd5e1' : '#09090b' }}>
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate font-bold">{sup.address || 'Central Distribution Center'}</span>
                  </div>
                </div>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/60">
                  <div className={`p-2.5 rounded-xl border text-center ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Lead Time</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 mt-0.5 block">{sup.lead_time_days || 3} Days</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border text-center ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Rating</span>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500" /> {sup.rating || '4.8'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-200 dark:border-slate-800/60 gap-2">
                <button
                  onClick={() => handleOpenProfile(sup)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-emerald-500/20"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Profile & Catalog</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => navigate('/admin/purchase-orders')}
                    className={`p-2 rounded-lg border text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer ${
                      isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Draft Purchase Order"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(sup)}
                    className={`p-2 rounded-lg border text-slate-400 hover:text-white transition-colors cursor-pointer ${
                      isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Edit Supplier"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(sup.id, sup.name)}
                    className={`p-2 rounded-lg border text-red-400 hover:text-red-300 transition-colors cursor-pointer ${
                      isDark ? 'border-slate-800 hover:bg-red-500/10' : 'border-slate-200 hover:bg-red-50'
                    }`}
                    title="Delete Supplier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* SUPPLIER PROFILE & SUPPLIED PRODUCTS MODAL */}
      {isProfileModalOpen && selectedProfileSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-5xl rounded-3xl border shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh] overflow-hidden ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#00684a]/20 text-[#00684a] dark:text-emerald-400 flex items-center justify-center font-black text-2xl border border-[#00684a]/30">
                  {selectedProfileSupplier.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-black">{selectedProfileSupplier.name}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      selectedProfileSupplier.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {selectedProfileSupplier.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Contact: <span className="font-semibold text-slate-300">{selectedProfileSupplier.contact_person || 'N/A'}</span> • {selectedProfileSupplier.email || 'No email'} • {selectedProfileSupplier.phone || 'No phone'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="px-6 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-500/5">
              <div className="flex items-center gap-2 py-2.5">
                <button
                  onClick={() => setProfileTab('catalog')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    profileTab === 'catalog'
                      ? 'bg-[#00684a] text-white shadow-md shadow-[#00684a]/20'
                      : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  <span>Supplied Products ({suppliedProducts.length})</span>
                </button>
                <button
                  onClick={() => setProfileTab('pos')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    profileTab === 'pos'
                      ? 'bg-[#00684a] text-white shadow-md shadow-[#00684a]/20'
                      : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Purchase Orders ({supplierPOs.length})</span>
                </button>
                <button
                  onClick={() => setProfileTab('info')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    profileTab === 'info'
                      ? 'bg-[#00684a] text-white shadow-md shadow-[#00684a]/20'
                      : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Vendor Overview</span>
                </button>
              </div>

              {profileTab === 'catalog' && (
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search supplied SKUs..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingSupplied ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                  <p className="text-sm font-semibold">Loading supplier catalog & past landed costs...</p>
                </div>
              ) : profileTab === 'catalog' ? (
                <div>
                  {filteredSuppliedProducts.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-slate-700/50 rounded-2xl">
                      <Boxes className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
                      <h4 className="text-base font-bold">No Products Linked to this Supplier</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        This supplier has not been attached to incoming purchase orders or batch receipts yet. Create a Purchase Order to link SKUs.
                      </p>
                      <button
                        onClick={() => {
                          setIsProfileModalOpen(false);
                          navigate('/admin/purchase-orders');
                        }}
                        className="mt-4 px-4 py-2 rounded-xl bg-[#00684a] text-white text-xs font-bold hover:bg-[#00553c] transition-all inline-flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Create Purchase Order</span>
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className={isDark ? 'bg-slate-900/80 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-600 border-b border-slate-200'}>
                            <th className="p-3.5 font-bold uppercase tracking-wider">Product & SKU</th>
                            <th className="p-3.5 font-bold uppercase tracking-wider">Category</th>
                            <th className="p-3.5 font-bold uppercase tracking-wider text-right">Warehouse Stock</th>
                            <th className="p-3.5 font-bold uppercase tracking-wider text-right">Latest Landed Cost</th>
                            <th className="p-3.5 font-bold uppercase tracking-wider text-right">Selling Price</th>
                            <th className="p-3.5 font-bold uppercase tracking-wider text-right">Margin</th>
                            <th className="p-3.5 font-bold uppercase tracking-wider text-right">Last Supplied</th>
                            <th className="p-3.5 font-bold uppercase tracking-wider text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                          {filteredSuppliedProducts.map((prod) => {
                            const cost = parseFloat(prod.latest_purchase_cost) || 0;
                            const price = parseFloat(prod.price) || 0;
                            const margin = price > 0 && cost > 0 ? (((price - cost) / price) * 100).toFixed(1) : null;
                            const isLowStock = prod.quantity <= (prod.min_stock || 10);

                            return (
                              <tr key={prod.id} className={isDark ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                                <td className="p-3.5">
                                  <div className="flex items-center gap-3">
                                    {prod.image_url ? (
                                      <img src={prod.image_url} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-700/50" />
                                    ) : (
                                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                                        <Package className="w-4 h-4" />
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{prod.name}</div>
                                      <div className="font-mono text-[10px] text-slate-400">{prod.sku}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3.5 text-slate-500 dark:text-slate-400 font-medium">
                                  {prod.category_name || 'General'}
                                </td>
                                <td className="p-3.5 text-right font-black">
                                  <span className={`px-2 py-0.5 rounded-md ${
                                    isLowStock 
                                      ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                      : isDark ? 'text-slate-200' : 'text-slate-800'
                                  }`}>
                                    {prod.quantity} units
                                  </span>
                                </td>
                                <td className="p-3.5 text-right font-black text-blue-600 dark:text-blue-400">
                                  ₱{cost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="p-3.5 text-right font-black text-slate-900 dark:text-white">
                                  ₱{price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="p-3.5 text-right font-bold">
                                  {margin !== null ? (
                                    <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                                      parseFloat(margin) >= 30 ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'
                                    }`}>
                                      +{margin}%
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">—</span>
                                  )}
                                </td>
                                <td className="p-3.5 text-right text-slate-400 text-[11px] font-medium">
                                  {prod.last_supplied_date ? new Date(prod.last_supplied_date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="p-3.5 text-center">
                                  <button
                                    onClick={() => {
                                      setIsProfileModalOpen(false);
                                      navigate('/admin/purchase-orders');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-[#00684a]/10 hover:bg-[#00684a] text-[#00684a] hover:text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    title="Create Restock Purchase Order"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Restock</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : profileTab === 'pos' ? (
                <div>
                  {supplierPOs.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-slate-700/50 rounded-2xl">
                      <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
                      <h4 className="text-base font-bold">No Purchase Orders on Record</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        No purchase orders have been drafted for {selectedProfileSupplier.name} yet.
                      </p>
                      <button
                        onClick={() => {
                          setIsProfileModalOpen(false);
                          navigate('/admin/purchase-orders');
                        }}
                        className="mt-4 px-4 py-2 rounded-xl bg-[#00684a] text-white text-xs font-bold hover:bg-[#00553c] transition-all inline-flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Draft New PO</span>
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className={isDark ? 'bg-slate-900/80 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-600 border-b border-slate-200'}>
                            <th className="p-3.5 font-bold uppercase tracking-wider">PO Number</th>
                            <th className="p-3.5 font-bold uppercase tracking-wider">Order Date</th>
                            <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
                            <th className="p-3.5 font-bold uppercase tracking-wider text-right">Total Valuation</th>
                            <th className="p-3.5 font-bold uppercase tracking-wider text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                          {supplierPOs.map((po) => (
                            <tr key={po.id} className={isDark ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                              <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                                {po.po_number || `PO-#${po.id}`}
                              </td>
                              <td className="p-3.5 text-slate-400 font-medium">
                                {new Date(po.created_at).toLocaleDateString()}
                              </td>
                              <td className="p-3.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  po.status === 'received' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : po.status === 'ordered'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {po.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                                ₱{parseFloat(po.total_cost || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-3.5 text-center">
                                <button
                                  onClick={() => {
                                    setIsProfileModalOpen(false);
                                    navigate('/admin/purchase-orders');
                                  }}
                                  className="text-xs font-bold text-blue-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <span>View PO</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-500" />
                      <span>Corporate & Warehouse Location</span>
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Company Legal Entity</span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{selectedProfileSupplier.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Warehouse / Hub Address</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedProfileSupplier.address || 'Central Fulfillment Depot'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <span>Service Level Agreement (SLA)</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lead Time</span>
                        <span className="text-base font-black text-blue-500 mt-1 block">{selectedProfileSupplier.lead_time_days || 3} Days</span>
                      </div>
                      <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reliability Score</span>
                        <span className="text-base font-black text-amber-500 mt-1 flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 fill-amber-500" /> {selectedProfileSupplier.rating || 4.8}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-500/5">
              <span className="text-xs text-slate-400 font-medium">
                Supplier ID: <span className="font-mono font-bold text-slate-300">#SUP-{selectedProfileSupplier.id}</span>
              </span>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT SUPPLIER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl animate-in zoom-in-95 ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#00684a]/20 text-[#00684a] dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {editingSupplier ? 'Edit Vendor Supplier' : 'Register New Supplier'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure fulfillment terms and primary contacts</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Supplier / Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Industrial Raw Materials Corp."
                  className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="e.g. Marcus Vance"
                    className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +63 917 555 1024"
                    className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Business Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. sales@apexindustrial.com"
                  className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Warehouse Address / Hub</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Block 4, Industrial Export Processing Zone, Cavite"
                  className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.lead_time_days}
                    onChange={(e) => setFormData({ ...formData, lead_time_days: parseInt(e.target.value, 10) || 1 })}
                    className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="active">Active Vendor</option>
                    <option value="inactive">Inactive / On Hold</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#00684a] hover:bg-[#00553c] text-white text-xs font-bold shadow-md shadow-[#00684a]/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{editingSupplier ? 'Update Supplier' : 'Register Supplier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
