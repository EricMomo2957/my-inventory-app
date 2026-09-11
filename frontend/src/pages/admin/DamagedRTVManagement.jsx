import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AdminHeader from './AdminHeader';
import TablePagination from '../../components/TablePagination';
import { 
  AlertOctagon, 
  Plus, 
  Printer, 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Trash2, 
  RefreshCw,
  FileCheck2,
  Building2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowDownRight,
  Package
} from 'lucide-react';

export default function DamagedRTVManagement() {
  const { isDark } = useTheme();
  const [damagedRecords, setDamagedRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const pageSize = 8;

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 1,
    reason: 'Damaged in transit / unsealed packaging',
    condition_type: 'damaged',
    supplier_id: '',
    supplier_name: '',
    notes: '',
    logged_by: localStorage.getItem('fullName') || localStorage.getItem('userName') || 'Warehouse Clerk'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [damRes, prodRes, supRes] = await Promise.all([
        fetch('http://localhost:3000/api/damaged-items').then(r => r.json()).catch(() => []),
        fetch('http://localhost:3000/api/products').then(r => r.json()).catch(() => []),
        fetch('http://localhost:3000/api/suppliers').then(r => r.json()).catch(() => [])
      ]);
      setDamagedRecords(Array.isArray(damRes) ? damRes : []);
      setProducts(Array.isArray(prodRes) ? prodRes : []);
      setSuppliers(Array.isArray(supRes) ? supRes : []);
    } catch (err) {
      console.error("Failed to load damaged/RTV data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogDamaged = async (e) => {
    e.preventDefault();
    const product = products.find(p => String(p.id) === String(formData.product_id));
    if (!product) {
      alert("Please select a valid product");
      return;
    }

    const supplier = suppliers.find(s => String(s.id) === String(formData.supplier_id));

    const payload = {
      ...formData,
      product_name: product.name,
      cost_price: product.cost_price || Math.round(parseFloat(product.price || 0) * 0.65 * 100) / 100,
      supplier_name: supplier ? supplier.name : 'General Supplier'
    };

    try {
      const res = await fetch('http://localhost:3000/api/damaged-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsLogModalOpen(false);
        setFormData({
          product_id: '',
          quantity: 1,
          reason: 'Damaged in transit / unsealed packaging',
          condition_type: 'damaged',
          supplier_id: '',
          supplier_name: '',
          notes: '',
          logged_by: localStorage.getItem('fullName') || localStorage.getItem('userName') || 'Warehouse Clerk'
        });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to record damaged item");
      }
    } catch (err) {
      console.error("Error logging damage:", err);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:3000/api/damaged-items/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const filteredRecords = damagedRecords.filter(r => {
    const matchesSearch = (r.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.reference_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && r.status === statusFilter;
  });

  const displayedRecords = isExpanded 
    ? filteredRecords 
    : filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Metrics
  const totalQuarantined = damagedRecords.filter(r => r.status === 'quarantined').reduce((acc, r) => acc + (parseInt(r.quantity, 10) || 0), 0);
  const totalLossValue = damagedRecords.reduce((acc, r) => acc + (parseFloat(r.total_loss) || 0), 0);
  const activeRtvClaims = damagedRecords.filter(r => r.status === 'rtv_claimed').length;
  const totalResolved = damagedRecords.filter(r => r.status === 'resolved' || r.status === 'written_off').length;

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 font-sans ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      <AdminHeader 
        title="Damaged Stock & Return to Vendor"
        subtitle="Quarantine defective goods, process write-offs, and file supplier claims"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-7">
        
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Damaged Goods & RTV Claim Desk
            </h1>
            <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Segregate damaged inventory into quarantine, recover supplier replacement credits, and record official write-offs
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className={`p-2.5 rounded-xl border transition-colors ${
                isDark ? 'border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
              title="Refresh Damaged Items"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/25 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" /> Log Damaged / Lost Item
            </button>
          </div>
        </div>

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Quarantined Units */}
          <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                QUARANTINED STOCK
              </p>
              <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <AlertOctagon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {totalQuarantined} <span className="text-xs font-normal text-slate-400">Units</span>
              </h3>
            </div>
            <p className="text-[10px] text-slate-400">Segregated from sellable inventory</p>
          </div>

          {/* Card 2: Financial Loss (PHP) */}
          <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                FINANCIAL LOSS VALUE
              </p>
              <div className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                ₱{totalLossValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <p className="text-[10px] text-slate-400">Estimated cost of damaged items</p>
          </div>

          {/* Card 3: Active RTV Claims */}
          <div className={`p-5 rounded-2xl border shadow-xs transition-colors flex flex-col justify-between ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                ACTIVE RTV CLAIMS
              </p>
              <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Truck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activeRtvClaims} <span className="text-xs font-normal text-slate-400">Claims</span>
              </h3>
            </div>
            <p className="text-[10px] text-slate-400">Pending supplier reimbursement</p>
          </div>

          {/* Card 4 (Featured Emerald Card): Resolved */}
          <div className="p-5 rounded-2xl bg-[#00684a] text-white flex flex-col justify-between shadow-md shadow-[#00684a]/20">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                RESOLVED WRITE-OFFS
              </p>
              <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className="text-2xl font-extrabold tracking-tight text-white">
                {totalResolved} <span className="text-xs font-normal text-emerald-100">Settled</span>
              </h3>
            </div>
            <div className="flex items-center justify-between text-[10px] text-emerald-100">
              <span>Audited Status:</span>
              <span className="font-black bg-white/20 px-2 py-0.5 rounded-md">Balanced</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', 'quarantined', 'rtv_claimed', 'written_off', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#00684a] text-white border-[#00684a]'
                  : isDark 
                    ? 'bg-slate-800/60 border-slate-800 text-slate-400 hover:text-white' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status === 'All' ? 'All Incidents' : status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div className={`rounded-3xl border shadow-sm overflow-hidden transition-colors ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <table className="w-full text-left border-collapse" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
            <thead>
              <tr 
                className="border-b text-[10px] font-black uppercase tracking-wider"
                style={{ 
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  color: isDark ? '#f8fafc' : '#09090b',
                  borderColor: isDark ? '#334155' : '#cbd5e1'
                }}
              >
                <th className="py-4 px-6">Reference No</th>
                <th className="py-4 px-6">Product / SKU</th>
                <th className="py-4 px-6">Qty & Valuation</th>
                <th className="py-4 px-6">Reason / Condition</th>
                <th className="py-4 px-6">Supplier Claim</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-medium">
              {displayedRecords.length > 0 ? (
                displayedRecords.map(item => (
                  <tr 
                    key={item.id} 
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    style={{ color: isDark ? '#f8fafc' : '#09090b' }}
                  >
                    <td className="py-4 px-6 font-mono font-black text-[#00684a] dark:text-emerald-400">
                      {item.reference_no}
                      <p className="text-[10px] font-sans font-bold mt-0.5" style={{ color: isDark ? '#94a3b8' : '#334155' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const matchedProduct = products.find(p => p.id === item.product_id);
                          const pImg = matchedProduct?.image_url || matchedProduct?.image;
                          return pImg ? (
                            <img 
                              src={pImg.startsWith('http') || pImg.startsWith('data:') ? pImg : `http://localhost:3000${pImg}`} 
                              alt={item.product_name} 
                              className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-700/80 shrink-0 shadow-xs" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 shadow-xs">
                              <Package className="w-5 h-5" />
                            </div>
                          );
                        })()}
                        <div>
                          <div className="font-black text-sm" style={{ color: isDark ? '#ffffff' : '#09090b' }}>
                            {item.product_name}
                          </div>
                          <span className="text-[10px] font-mono font-bold" style={{ color: isDark ? '#94a3b8' : '#334155' }}>
                            ID: #{item.product_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-black text-red-600 dark:text-red-400">-{item.quantity} Units</span>
                      <p className="text-[11px] font-black" style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                        ₱{parseFloat(item.total_loss || 0).toFixed(2)} Loss
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase mb-1 ${
                        item.condition_type === 'expired' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400' :
                        item.condition_type === 'defective' ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-400' :
                        'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400'
                      }`}>
                        {item.condition_type}
                      </span>
                      <p className="text-xs font-bold max-w-xs truncate" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
                        {item.reason}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-black text-sm" style={{ color: isDark ? '#ffffff' : '#09090b' }}>
                        {item.supplier_name || 'General Supplier'}
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: isDark ? '#94a3b8' : '#334155' }}>
                        Logged by: {item.logged_by}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        item.status === 'quarantined' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400' :
                        item.status === 'rtv_claimed' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400' :
                        item.status === 'written_off' ? 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400' :
                        'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => { setSelectedRecord(item); setIsClaimModalOpen(true); }}
                        className={`p-2 rounded-xl border transition-colors ${
                          isDark ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
                        }`}
                        title="Print RTV Claim Slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      
                      {item.status === 'quarantined' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'rtv_claimed')}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Claim RTV
                        </button>
                      )}

                      {item.status === 'rtv_claimed' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'resolved')}
                          className="px-2.5 py-1.5 rounded-xl bg-[#00684a] hover:bg-[#005a3f] text-white text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400 text-xs">
                    No damaged goods or RTV claims found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRecords.length > 0 && (
          <TablePagination 
            currentPage={currentPage}
            totalItems={filteredRecords.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            itemLabel="records"
          />
        )}
      </div>

      {/* --- LOG DAMAGED ITEM MODAL --- */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl p-7 border shadow-2xl ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h2 className="text-xl font-black mb-1">Log Damaged / Spoilage Incident</h2>
            <p className="text-xs text-slate-400 mb-5">Record damaged items to quarantine them from active inventory.</p>

            <form onSubmit={handleLogDamaged} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Select Inventory Product *</label>
                <select 
                  required
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity}) - ₱{parseFloat(p.price).toFixed(2)}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Damaged Quantity *</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Condition Type</label>
                  <select 
                    value={formData.condition_type}
                    onChange={(e) => setFormData({ ...formData, condition_type: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="damaged">💥 Physical Damage</option>
                    <option value="expired">⏳ Expired / Spoilage</option>
                    <option value="defective">⚠️ Supplier Defect</option>
                    <option value="lost">🔍 Lost / Missing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Supplier (for RTV Claims)</label>
                <select 
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="">-- General / In-House Spoilage --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">Reason / Description *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Broken carton during pallet transport"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/25 transition-all cursor-pointer"
                >
                  Deduct & Quarantine Stock
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsLogModalOpen(false)} 
                  className={`px-5 py-3 rounded-xl text-xs font-bold border cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RTV CLAIM PRINTABLE SLIP MODAL --- */}
      {isClaimModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl p-8 bg-white text-slate-900 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Slip Header */}
            <div className="border-b pb-4 mb-5 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Official MindStock Warehouse Voucher</span>
                <h2 className="text-xl font-black mt-1">RETURN-TO-VENDOR (RTV) CLAIM</h2>
                <p className="text-xs text-slate-500 font-mono">Reference No: {selectedRecord.reference_no}</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold">Date: {new Date(selectedRecord.created_at).toLocaleDateString()}</p>
                <p className="text-slate-400">Status: {selectedRecord.status.toUpperCase()}</p>
              </div>
            </div>

            {/* Vendor & Details */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-5 text-xs">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Supplier Vendor</p>
                <p className="font-extrabold text-slate-800">{selectedRecord.supplier_name || 'General Supplier'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Logged Auditor</p>
                <p className="font-extrabold text-slate-800">{selectedRecord.logged_by}</p>
              </div>
            </div>

            {/* Claimed Item Table */}
            <table className="w-full text-left text-xs mb-5 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-400">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Defective Qty</th>
                  <th className="py-2 text-right">Unit Landed Cost</th>
                  <th className="py-2 text-right">Total Claim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 font-bold">{selectedRecord.product_name}</td>
                  <td className="py-3 text-center font-black text-red-600">{selectedRecord.quantity} Units</td>
                  <td className="py-3 text-right">₱{parseFloat(selectedRecord.cost_price || 0).toFixed(2)}</td>
                  <td className="py-3 text-right font-black">₱{parseFloat(selectedRecord.total_loss || 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Defect Notes */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-6">
              <p className="font-black text-[10px] uppercase tracking-wider text-amber-700 mb-1">Reason for Supplier Return / Replacement Request:</p>
              <p className="font-medium">{selectedRecord.reason} - {selectedRecord.notes || 'Goods arrived defective from vendor delivery batch.'}</p>
            </div>

            {/* Sign-off Lines */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-center text-xs">
              <div>
                <div className="border-b border-slate-300 pb-8 mb-1"></div>
                <p className="font-bold text-slate-700">Warehouse Inspector Signature</p>
              </div>
              <div>
                <div className="border-b border-slate-300 pb-8 mb-1"></div>
                <p className="font-bold text-slate-700">Supplier Representative Signature</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 mt-8">
              <button 
                onClick={() => window.print()} 
                className="flex-1 py-3 bg-[#00684a] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Formal RTV Claim Slip
              </button>
              <button 
                onClick={() => setIsClaimModalOpen(false)} 
                className="px-5 py-3 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
