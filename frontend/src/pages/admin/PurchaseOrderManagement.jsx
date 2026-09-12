import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AdminHeader from './AdminHeader';
import { 
  FileText, 
  Plus, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Coins, 
  Package, 
  Calendar,
  Building2,
  Download,
  Filter,
  ArrowDownLeft
} from 'lucide-react';

export default function PurchaseOrderManagement() {
  const { isDark } = useTheme();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // New PO Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [poNotes, setPoNotes] = useState('');
  const [orderItems, setOrderItems] = useState([
    { product_id: '', product_name: '', quantity_ordered: 10, unit_cost: 0 }
  ]);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // View Details Modal
  const [viewingPO, setViewingPO] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [poRes, supRes, prodRes] = await Promise.all([
        fetch('http://localhost:3000/api/purchase-orders'),
        fetch('http://localhost:3000/api/suppliers'),
        fetch('http://localhost:3000/api/products')
      ]);

      if (poRes.ok) setPurchaseOrders(await poRes.json());
      if (supRes.ok) setSuppliers(await supRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (err) {
      console.error("PO Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Item Line
  const handleAddItemRow = () => {
    setOrderItems(prev => [
      ...prev,
      { product_id: '', product_name: '', quantity_ordered: 10, unit_cost: 0 }
    ]);
  };

  // Remove Item Line
  const handleRemoveItemRow = (index) => {
    setOrderItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Update item field
  const handleItemChange = (index, field, value) => {
    const updated = [...orderItems];
    if (field === 'product_id') {
      const selectedProd = products.find(p => p.id === parseInt(value, 10));
      if (selectedProd) {
        updated[index].product_id = selectedProd.id;
        updated[index].product_name = selectedProd.name;
        updated[index].unit_cost = selectedProd.cost_price || Math.round((selectedProd.price || 0) * 0.65 * 100) / 100;
      }
    } else if (field === 'quantity_ordered') {
      updated[index].quantity_ordered = parseInt(value, 10) || 1;
    } else if (field === 'unit_cost') {
      updated[index].unit_cost = parseFloat(value) || 0;
    }
    setOrderItems(updated);
  };

  // Compute PO Total
  const calculatedTotal = useMemo(() => {
    return orderItems.reduce((sum, it) => sum + ((it.quantity_ordered || 0) * (it.unit_cost || 0)), 0);
  }, [orderItems]);

  // Submit New PO
  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      alert("Please select a vendor supplier");
      return;
    }
    const validItems = orderItems.filter(it => it.product_id && it.quantity_ordered > 0);
    if (validItems.length === 0) {
      alert("Please add at least one product with valid quantity");
      return;
    }

    setSaving(true);
    try {
      const selectedSup = suppliers.find(s => s.id === parseInt(selectedSupplierId, 10));
      const res = await fetch('http://localhost:3000/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: selectedSupplierId,
          supplier_name: selectedSup?.name || 'General Supplier',
          expected_date: expectedDate || null,
          notes: poNotes,
          created_by: localStorage.getItem('userName') || 'Administrator',
          items: validItems.map(it => ({
            product_id: it.product_id,
            product_name: it.product_name,
            quantity_ordered: it.quantity_ordered,
            unit_cost: it.unit_cost,
            total_cost: it.quantity_ordered * it.unit_cost
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`✅ Purchase Order ${data.po_number} created successfully`);
        setIsModalOpen(false);
        setOrderItems([{ product_id: '', product_name: '', quantity_ordered: 10, unit_cost: 0 }]);
        setPoNotes('');
        loadData();
      } else {
        alert("Failed to create PO: " + data.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Receive PO (Fulfill into Inventory)
  const handleReceivePO = async (po) => {
    if (!window.confirm(`Fulfill and receive Purchase Order "${po.po_number}"? This will automatically update warehouse stock levels!`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/purchase-orders/${po.id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerk_name: localStorage.getItem('userName') || 'Warehouse Receiving Desk'
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`📦 Received PO ${po.po_number}! Warehouse inventory incremented.`);
        loadData();
      } else {
        alert("Receive failed: " + data.message);
      }
    } catch (err) {
      alert("Error receiving PO: " + err.message);
    }
  };

  // Delete PO
  const handleDeletePO = async (id, poNumber) => {
    if (!window.confirm(`Delete Purchase Order "${poNumber}"?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/api/purchase-orders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Deleted ${poNumber}`);
        loadData();
      }
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = purchaseOrders.length;
    const ordered = purchaseOrders.filter(p => p.status === 'ordered').length;
    const received = purchaseOrders.filter(p => p.status === 'received').length;
    const inTransitValue = purchaseOrders
      .filter(p => p.status === 'ordered')
      .reduce((sum, p) => sum + (parseFloat(p.total_amount) || 0), 0);

    return { total, ordered, received, inTransitValue };
  }, [purchaseOrders]);

  // Filtered POs
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchesSearch = po.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchQuery, statusFilter]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <AdminHeader 
        title="Purchase Order (PO) Workflow" 
        subtitle="Manage Requisitions, Inbound Procurement & Fulfillment Status"
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
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Purchase Orders</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{metrics.total}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Procurement lifecycle tracking</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200/80 hover:border-blue-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">In-Transit Value</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₱{metrics.inTransitValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>{metrics.ordered} active vendor shipments</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-purple-500/50' : 'bg-white border-slate-200/80 hover:border-purple-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Fulfilled & Stocked</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{metrics.received}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">
              <Package className="w-3.5 h-3.5" />
              <span>Inventory auto-credited</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-amber-500/50' : 'bg-white border-slate-200/80 hover:border-amber-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Suppliers</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{suppliers.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <span>Ready for requisition</span>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search PO number or supplier name..."
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
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`p-2.5 rounded-xl border text-xs font-bold focus:outline-none ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="ordered">In Transit / Ordered</option>
              <option value="received">Received & Stocked</option>
              <option value="draft">Draft</option>
            </select>

            <button
              onClick={loadData}
              className={`p-2.5 rounded-xl border text-slate-400 hover:text-slate-200 transition-colors cursor-pointer ${
                isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
              }`}
              title="Refresh POs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#00684a] hover:bg-[#00553c] text-white text-xs font-bold shadow-md shadow-[#00684a]/20 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          </div>
        </div>

        {/* PO MASTER TABLE */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300 shadow-sm'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800/60 gap-3">
            <div>
              <h2 className="text-base font-black" style={{ color: isDark ? '#ffffff' : '#09090b' }}>Purchase Order Registry</h2>
              <p className="text-xs font-bold" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>Formal purchase orders and delivery check-offs</p>
            </div>
            <span className="text-xs font-bold" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
              Showing {filteredPOs.length} of {purchaseOrders.length} Orders
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
                  <th className="pb-3 px-3">PO Number</th>
                  <th className="pb-3 px-3">Vendor Supplier</th>
                  <th className="pb-3 px-3">Items / Lines</th>
                  <th className="pb-3 px-3">Total Amount</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Expected Date</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                {filteredPOs.map(po => {
                  const isReceived = po.status === 'received';
                  const isOrdered = po.status === 'ordered';
                  const isDraft = po.status === 'draft';

                  return (
                    <tr 
                      key={po.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                      style={{ color: isDark ? '#f8fafc' : '#09090b' }}
                    >
                      <td className="py-3 px-3">
                        <div className="font-mono font-black text-sm text-[#00684a] dark:text-emerald-400">
                          {po.po_number}
                        </div>
                        <div className="text-[11px] font-bold" style={{ color: isDark ? '#94a3b8' : '#334155' }}>Created by {po.created_by || 'Admin'}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-black text-sm" style={{ color: isDark ? '#ffffff' : '#09090b' }}>{po.supplier_name || 'General Supplier'}</div>
                        <div className="text-xs font-mono font-bold" style={{ color: isDark ? '#94a3b8' : '#334155' }}>ID #{po.supplier_id}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700">
                          {po.item_count || po.items?.length || 1} SKU Lines
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-black text-sm" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                        ₱{parseFloat(po.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          isReceived
                            ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30'
                            : isOrdered
                              ? 'bg-blue-500/20 text-blue-800 dark:text-blue-400 border border-blue-500/30 animate-pulse'
                              : 'bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {po.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-xs font-bold" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
                        {po.expected_date ? new Date(po.expected_date).toLocaleDateString() : 'Immediate'}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1-Click Inbound Receiving Button */}
                          {isOrdered && (
                            <button
                              onClick={() => handleReceivePO(po)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                              title="Receive into Warehouse Inventory"
                            >
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                              <span>Receive Stock</span>
                            </button>
                          )}

                          <button
                            onClick={() => setViewingPO(po)}
                            className={`p-1.5 rounded-lg border text-slate-400 hover:text-white transition-colors cursor-pointer ${
                              isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                            }`}
                            title="View PO Lines"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeletePO(po.id, po.po_number)}
                            className={`p-1.5 rounded-lg border text-red-400 hover:text-red-300 transition-colors cursor-pointer ${
                              isDark ? 'border-slate-800 hover:bg-red-500/10' : 'border-slate-200 hover:bg-red-50'
                            }`}
                            title="Delete PO"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* CREATE PURCHASE ORDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-2xl p-6 rounded-3xl border shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#00684a]/20 text-[#00684a] dark:text-emerald-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Draft Purchase Requisition</h3>
                  <p className="text-xs text-slate-400">Create official procurement order for vendor fulfillment</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Supplier Picker */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Select Supplier Partner
                  </label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="">-- Choose Vendor --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Lead Time: {s.lead_time_days || 3}d)</option>
                    ))}
                  </select>
                </div>

                {/* Expected Delivery Date */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              {/* Order Items Table Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Order Lines / SKUs
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-[#00684a] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item Line</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {orderItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl border flex flex-col md:flex-row items-center gap-3 ${
                        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      {/* Product Selector */}
                      <div className="flex-1 w-full">
                        <select
                          required
                          value={item.product_id}
                          onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                          className={`w-full p-2 rounded-lg border text-xs focus:outline-none ${
                            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <option value="">-- Select SKU / Product --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity Ordered */}
                      <div className="w-full md:w-28">
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="Qty"
                          value={item.quantity_ordered}
                          onChange={(e) => handleItemChange(idx, 'quantity_ordered', e.target.value)}
                          className={`w-full p-2 rounded-lg border text-xs text-center focus:outline-none ${
                            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>

                      {/* Unit Cost */}
                      <div className="w-full md:w-28">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          placeholder="Cost (₱)"
                          value={item.unit_cost}
                          onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                          className={`w-full p-2 rounded-lg border text-xs text-right focus:outline-none ${
                            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>

                      {/* Line Total */}
                      <div className="w-full md:w-28 text-right font-black text-xs">
                        ₱{((item.quantity_ordered || 0) * (item.unit_cost || 0)).toFixed(2)}
                      </div>

                      {/* Remove line */}
                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between font-extrabold text-sm">
                <span>Total PO Procurement Amount:</span>
                <span className="font-mono text-base font-black">
                  ₱{calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Special Instructions / PO Notes</label>
                <textarea
                  rows="2"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="e.g. Deliver to Loading Bay 3, require Certificate of Analysis."
                  className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                ></textarea>
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
                  <span>Issue Purchase Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PO DETAILS MODAL */}
      {viewingPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl animate-in zoom-in-95 ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
              <div>
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-emerald-400">Formal Requisition</span>
                <h3 className="text-lg font-black">{viewingPO.po_number}</h3>
              </div>
              <button 
                onClick={() => setViewingPO(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Supplier:</span>
                <span className="font-bold">{viewingPO.supplier_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Status:</span>
                <span className="font-black uppercase text-emerald-400">{viewingPO.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Expected Delivery:</span>
                <span className="font-semibold">{viewingPO.expected_date ? new Date(viewingPO.expected_date).toLocaleDateString() : 'Immediate'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                <span className="text-slate-400">Total Valuation:</span>
                <span className="font-black text-sm font-mono text-[#00684a] dark:text-emerald-400">
                  ₱{parseFloat(viewingPO.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {viewingPO.notes && (
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300">
                  <p className="font-bold text-[11px] mb-0.5 text-slate-400">Notes:</p>
                  <p>{viewingPO.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-5 mt-4 border-t border-slate-800/60">
              <button
                onClick={() => setViewingPO(null)}
                className="px-5 py-2 rounded-xl bg-[#00684a] text-white text-xs font-bold cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
