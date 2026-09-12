import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import TablePagination from '../../components/TablePagination';
import { 
  PackagePlus, 
  Truck, 
  Search, 
  CheckCircle2, 
  Printer, 
  Trash2, 
  Layers, 
  Building2, 
  FileCheck, 
  ArrowDownRight,
  Receipt,
  Plus,
  Clock,
  DollarSign,
  Tag
} from 'lucide-react';

export default function InboundReceiving() {
  const { isDark } = useTheme();
  
  // Products & Staging State
  const [products, setProducts] = useState([]);
  const [receivingCart, setReceivingCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const pageSize = 8;

  // Receiving Inbound Metadata Form
  const [inboundDetails, setInboundDetails] = useState({
    supplier: 'Fresh Farms Logistics',
    referenceNo: `DR-${Math.floor(10000 + Math.random() * 90000)}`,
    defaultBatch: `LOT-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(10 + Math.random() * 90)}`,
    defaultExpiry: '',
    notes: '',
    deliveryDate: new Date().toISOString().split('T')[0]
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGRN, setShowGRN] = useState(false);
  const [grnData, setGrnData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clerkName = localStorage.getItem('fullName') || localStorage.getItem('userName') || 'Warehouse Clerk';

  // --- 1. FETCH PRODUCTS ---
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/products');
      const formatted = res.data.map(p => ({
        ...p,
        price: parseFloat(p.price) || 0,
        cost_price: p.cost_price !== undefined && p.cost_price !== null 
          ? parseFloat(p.cost_price) 
          : Math.round((parseFloat(p.price) || 0) * 0.65 * 100) / 100,
        quantity: parseInt(p.quantity, 10) || 0
      }));
      setProducts(formatted);
    } catch (err) {
      console.error("Failed to load products for inbound receiving:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalIncomingUnits = receivingCart.reduce((acc, item) => acc + item.quantity, 0);
  const totalIncomingCost = receivingCart.reduce((acc, item) => acc + (item.cost_price * item.quantity), 0);
  const totalIncomingSellingVal = receivingCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // --- 2. HANDLERS ---
  const handleQuantityChange = (id, val) => {
    const value = val === '' ? '' : parseInt(val, 10);
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const addToReceiving = (product) => {
    const qty = parseInt(quantities[product.id], 10) || 10;
    if (qty <= 0) return;

    const defaultExp = product.expiry_date 
      ? String(product.expiry_date).split('T')[0] 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setReceivingCart(prev => {
      const existing = prev.find(item => String(item.id) === String(product.id));
      if (existing) {
        return prev.map(item => 
          String(item.id) === String(product.id) ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { 
        ...product, 
        quantity: qty,
        batch_number: product.batch_number || inboundDetails.defaultBatch,
        expiry_date: defaultExp,
        cost_price: product.cost_price
      }];
    });
    setQuantities(prev => ({ ...prev, [product.id]: 10 }));
  };

  const updateCartItemField = (id, field, value) => {
    setReceivingCart(prev => prev.map(item => {
      if (String(item.id) === String(id)) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleConfirmReceiving = async () => {
    if (receivingCart.length === 0) return;
    if (!inboundDetails.supplier.trim()) {
      alert("Please specify the supplier name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        items: receivingCart.map(item => ({ 
          id: item.id, 
          quantity: item.quantity,
          batch_number: item.batch_number || inboundDetails.defaultBatch,
          expiry_date: item.expiry_date || null,
          cost_price: item.cost_price || null
        })),
        supplier: inboundDetails.supplier,
        reference_no: inboundDetails.referenceNo,
        clerk_name: clerkName,
        notes: inboundDetails.notes
      };

      const res = await axios.post('http://localhost:3000/api/products/batch-stock-in', payload);

      if (res.data.success) {
        const generatedGRN = {
          grnNumber: res.data.reference_no || inboundDetails.referenceNo,
          date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          supplier: inboundDetails.supplier,
          clerkName: clerkName,
          notes: inboundDetails.notes,
          items: [...receivingCart],
          totalUnits: totalIncomingUnits,
          totalCost: totalIncomingCost,
          totalValue: totalIncomingSellingVal
        };

        setGrnData(generatedGRN);
        setIsModalOpen(false);
        setShowGRN(true);
        setReceivingCart([]);
        await fetchProducts();
      }
    } catch (err) {
      console.error("Inbound receiving error:", err);
      alert("Failed to process inbound receiving: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = item.name?.toLowerCase().includes(q) ||
                          item.category?.toLowerCase().includes(q) ||
                          (item.sku && item.sku.toLowerCase().includes(q)) ||
                          (item.batch_number && item.batch_number.toLowerCase().includes(q));
    const matchesCategory = activeCategory === 'All' || item.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const displayedProducts = isExpanded
    ? filteredProducts
    : filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 font-sans ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="w-full p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
        
        {/* --- HEADER BANNER --- */}
        <div className="bg-linear-to-r from-[#00684a] via-[#005a3f] to-[#014732] text-white p-8 lg:p-10 rounded-3xl shadow-xl shadow-[#00684a]/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
          
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-widest border border-white/10">
              <PackagePlus className="w-3.5 h-3.5" /> Inbound Logistics & FIFO Receiving
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Stock In Receiving Desk</h1>
            <p className="text-emerald-100/80 text-sm max-w-xl font-medium">
              Receive supplier deliveries, capture unit landed cost, register batch/lot codes, and assign FIFO expiration dates.
            </p>
          </div>

          <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-black/20 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10 text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200/80">Staged to Receive</p>
              <p className="text-2xl font-black text-white">{totalIncomingUnits} <span className="text-xs font-semibold text-emerald-200">Units</span></p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={receivingCart.length === 0}
              className="bg-white hover:bg-emerald-50 text-[#00684a] font-extrabold px-6 py-4 rounded-2xl shadow-lg transition-all flex items-center gap-2.5 active:scale-95 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-40"
            >
              <Receipt className="w-4 h-4" /> Review & Stock In ({receivingCart.length})
            </button>
          </div>
        </div>

        {/* --- ACTION BAR & FILTERS --- */}
        <div className={`sticky top-4 z-30 backdrop-blur-xl border p-4 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 transition-all ${
          isDark ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search product, SKU, batch..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl pl-11 pr-4 py-3 outline-none text-sm font-medium transition-all ${
                isDark 
                  ? 'bg-[#0b1120] border-slate-800 text-white focus:border-[#00684a]' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#00684a]'
              }`}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['All', 'Vegetables', 'Fruits', 'Supplies', 'Canned Goods', 'Raw Materials'].map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                  activeCategory === cat 
                  ? 'bg-[#00684a] text-white border-[#00684a] shadow-sm' 
                  : isDark 
                    ? 'bg-slate-800/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white' 
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- PRODUCT GRID FOR INBOUND RECEIVING --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProducts.map(item => {
            const stagedItem = receivingCart.find(c => String(c.id) === String(item.id));
            const stagedQty = stagedItem ? stagedItem.quantity : 0;
            const marginPct = item.price > 0 ? (((item.price - item.cost_price) / item.price) * 100) : 0;

            return (
              <div key={item.id} className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col hover:shadow-xl group relative ${
                isDark ? 'bg-[#0f172a] border-slate-800 hover:border-[#00684a]/40' : 'bg-white border-slate-200 hover:border-[#00684a]/30'
              }`}>
                {stagedQty > 0 && (
                  <div className="absolute top-3 right-3 z-10 bg-[#00684a] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> +{stagedQty} Staged
                  </div>
                )}

                <div className={`relative mb-4 overflow-hidden rounded-xl aspect-4/3 flex items-center justify-center ${
                  isDark ? 'bg-slate-900' : 'bg-slate-100'
                }`}>
                  <img 
                    src={item.image_url?.startsWith('http') ? item.image_url : `http://localhost:3000${item.image_url}`} 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80' }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={item.name} 
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
                    {item.category || 'General'}
                  </div>
                </div>
                
                <div className="flex-1 space-y-1.5">
                  <h3 className={`text-base font-extrabold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.name}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>{item.sku || `SKU-#${item.id}`}</span>
                    <span>{item.batch_number || 'LOT-DEFAULT'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 font-semibold">Current Stock:</span>
                    <span className="font-extrabold text-[#00684a] dark:text-emerald-400">
                      {item.quantity} Units
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Cost / Selling:</span>
                    <span className={`font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      ₱{item.cost_price.toFixed(2)} / ₱{item.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <input 
                    type="number" 
                    min="1" 
                    value={quantities[item.id] ?? ''} 
                    placeholder="10"
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className={`w-16 border rounded-xl text-center font-bold text-sm outline-none transition-all ${
                      isDark ? 'bg-[#0b1120] border-slate-800 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#00684a]'
                    }`}
                  />
                  <button 
                    onClick={() => addToReceiving(item)}
                    className="flex-1 bg-[#00684a] hover:bg-[#005a3f] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm shadow-[#00684a]/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Stage Stock
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- TABLE PAGINATION --- */}
        {filteredProducts.length > 0 && (
          <TablePagination 
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            itemLabel="items"
          />
        )}
      </div>

      {/* --- INBOUND GOODS RECEIPT REVIEW MODAL WITH FIFO BATCHES & COST --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className={`border rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-[#00684a] text-white">
              <div className="flex items-center gap-2.5">
                <PackagePlus className="w-5 h-5 text-emerald-200" />
                <div>
                  <h2 className="text-lg font-black tracking-tight">Inbound Goods Receiving Log</h2>
                  <p className="text-xs text-emerald-100">Verify supplier shipment, FIFO batch lots, and acquisition cost</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white text-lg font-bold cursor-pointer">✕</button>
            </header>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Inbound Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Supplier / Vendor Name *
                  </label>
                  <input 
                    type="text" 
                    value={inboundDetails.supplier}
                    onChange={(e) => setInboundDetails({ ...inboundDetails, supplier: e.target.value })}
                    className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none focus:border-[#00684a] ${
                      isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                    placeholder="e.g. AgriCorp Wholesale"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Delivery Receipt (DR) / PO #
                  </label>
                  <input 
                    type="text" 
                    value={inboundDetails.referenceNo}
                    onChange={(e) => setInboundDetails({ ...inboundDetails, referenceNo: e.target.value })}
                    className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none focus:border-[#00684a] ${
                      isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Receiving Notes / Quality Verification
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Verified by morning receiving team, pallet quality optimal"
                    value={inboundDetails.notes}
                    onChange={(e) => setInboundDetails({ ...inboundDetails, notes: e.target.value })}
                    className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none focus:border-[#00684a] ${
                      isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Staged Items List with Batch & Expiry Override */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Received Items & FIFO Parameters ({receivingCart.length})</span>
                  <span>Total Units: +{totalIncomingUnits}</span>
                </h4>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {receivingCart.map(item => (
                    <div key={item.id} className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">{item.category} • SKU: {item.sku || `SKU-#${item.id}`}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-sm text-[#00684a] dark:text-emerald-400">
                            +{item.quantity} Units
                          </span>
                          <button 
                            onClick={() => setReceivingCart(receivingCart.filter(c => c.id !== item.id))}
                            className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Row Inputs for FIFO Batch, Expiry, and Unit Cost */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <div>
                          <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Batch / Lot #</label>
                          <input 
                            type="text" 
                            value={item.batch_number || ''}
                            onChange={(e) => updateCartItemField(item.id, 'batch_number', e.target.value)}
                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                              isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Expiry Date</label>
                          <input 
                            type="date" 
                            value={item.expiry_date || ''}
                            onChange={(e) => updateCartItemField(item.id, 'expiry_date', e.target.value)}
                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                              isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Unit Cost (₱)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={item.cost_price || ''}
                            onChange={(e) => updateCartItemField(item.id, 'cost_price', parseFloat(e.target.value) || 0)}
                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                              isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4 ${
              isDark ? 'bg-[#0b1120]/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-left w-full sm:w-auto">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Total Landed Acquisition Cost</span>
                <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₱{totalIncomingCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmReceiving}
                  disabled={receivingCart.length === 0 || isSubmitting}
                  className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-[#00684a] hover:bg-[#005a3f] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#00684a]/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? "Receiving..." : "Confirm Stock In"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- GOODS RECEIPT NOTE (GRN) SLIP --- */}
      {showGRN && grnData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 p-8 rounded-3xl w-full max-w-lg font-sans shadow-2xl relative border border-slate-200">
            <div className="absolute top-0 left-0 w-full h-3 bg-[#00684a] rounded-t-3xl"></div>
            
            <div className="text-center border-b pb-4 mb-4 mt-2">
              <div className="inline-flex items-center gap-2 text-[#00684a] font-black text-sm uppercase tracking-widest mb-1">
                <Building2 className="w-4 h-4" /> Internal Warehouse Management System
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Goods Receipt Note (GRN)</h2>
              <p className="text-xs font-bold text-slate-400 mt-0.5">Ref #: {grnData.grnNumber} • {grnData.date}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Delivered By Supplier</span>
                <span className="font-extrabold text-slate-800">{grnData.supplier}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Received By Clerk</span>
                <span className="font-extrabold text-[#00684a]">{grnData.clerkName}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Receiving Notes</span>
                <span className="font-medium text-slate-700">{grnData.notes || 'Goods and batch quality verified in good condition.'}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Received Items & FIFO Lot Breakdown</span>
              {grnData.items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Lot: {item.batch_number || 'DEFAULT'} • Exp: {item.expiry_date || 'N/A'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#00684a] block">+{item.quantity} Units</span>
                    <span className="text-[10px] text-slate-400">@ ₱{item.cost_price?.toFixed(2)}/unit</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 mb-6 flex justify-between items-center font-black">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 block">Total Units Received</span>
                <span className="text-base text-slate-900">+{grnData.totalUnits} Units</span>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-slate-500 block">Total Landed Cost</span>
                <span className="text-base text-[#00684a]">₱{grnData.totalCost?.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => window.print()} 
                className="bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print GRN Slip
              </button>
              <button 
                onClick={() => setShowGRN(false)} 
                className="bg-[#00684a] text-white py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:bg-[#005a3f] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
