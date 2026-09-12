import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'; 
import axios from 'axios';
import TablePagination from '../../components/TablePagination';
import { 
  Truck, 
  Send, 
  Package, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Building2, 
  Printer, 
  Trash2, 
  Layers,
  Boxes
} from 'lucide-react';

export default function Order() {
  const { isDark } = useTheme(); 
  const navigate = useNavigate();

  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [variantsMap, setVariantsMap] = useState({});
  const [selectedVariants, setSelectedVariants] = useState({});
  const [dispatchCart, setDispatchCart] = useState([]);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);
  const [voucherData, setVoucherData] = useState({ 
    date: '', 
    trx: '', 
    department: '', 
    recipient: '', 
    reason: '',
    items: [],
    clerkName: '' 
  });
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const pageSize = 8;

  // Dispatch Metadata Form
  const [dispatchDetails, setDispatchDetails] = useState({
    department: 'Production & Manufacturing',
    recipient: '',
    reason: 'Department Requisition',
    referenceNo: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current Logged-in Clerk Info
  const clerkName = localStorage.getItem('userName') || 'Warehouse Clerk';
  const clerkId = localStorage.getItem('userId') || '1';

  // --- DATA FETCHING ---
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/products?status=active');
      const formattedData = res.data.map(p => ({
        ...p,
        price: parseFloat(p.price) || 0,
        quantity: parseInt(p.quantity, 10) || 0
      }));
      setProducts(formattedData);

      // Fetch variants for products
      const map = {};
      await Promise.all(
        formattedData.map(async (prod) => {
          try {
            const vRes = await axios.get(`http://localhost:3000/api/variants/${prod.id}`);
            if (vRes.data && vRes.data.length > 0) {
              map[prod.id] = vRes.data;
            }
          } catch (err) {}
        })
      );
      setVariantsMap(map);
    } catch (err) {
      console.error("Failed to load products for dispatch:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalItemsCount = dispatchCart.reduce((acc, item) => acc + item.quantity, 0);
  const totalValuation = dispatchCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // --- HANDLERS ---
  const handleQuantityChange = (id, val) => {
    const value = val === '' ? '' : parseInt(val, 10);
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const addToDispatch = (product) => {
    const qty = parseInt(quantities[product.id], 10) || 1;
    if (qty <= 0) return;

    const chosenVariantId = selectedVariants[product.id];
    const chosenVariant = chosenVariantId && variantsMap[product.id]
      ? variantsMap[product.id].find(v => String(v.id) === String(chosenVariantId))
      : null;

    const availableStock = chosenVariant ? chosenVariant.quantity : product.quantity;

    if (qty > availableStock) {
      alert(`Cannot dispatch ${qty} units. Only ${availableStock} units available for ${chosenVariant ? chosenVariant.variant_name : product.name}.`);
      return;
    }

    const cartKey = chosenVariant ? `${product.id}-${chosenVariant.id}` : `${product.id}-main`;

    setDispatchCart(prev => {
      const existing = prev.find(item => item.cartKey === cartKey);
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > availableStock) {
          alert(`Total staged dispatch (${newQty}) exceeds available stock (${availableStock}).`);
          return prev;
        }
        return prev.map(item => 
          item.cartKey === cartKey ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { 
        ...product, 
        cartKey,
        variant_id: chosenVariant ? chosenVariant.id : null,
        variant_name: chosenVariant ? chosenVariant.variant_name : null,
        variant_sku: chosenVariant ? chosenVariant.sku : null,
        price: chosenVariant && chosenVariant.price > 0 ? chosenVariant.price : product.price,
        quantity: qty 
      }];
    });
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const handleConfirmDispatch = async () => {
    if (dispatchCart.length === 0) return;
    if (!dispatchDetails.recipient.trim()) {
      alert("Please enter the name of the recipient or department staff receiving the items.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Process stock deduction via API
      for (const item of dispatchCart) {
        await axios.post('http://localhost:3000/api/orders', {
          user_id: clerkId,
          product_id: item.id,
          variant_id: item.variant_id || null,
          variant_name: item.variant_name || null,
          quantity: item.quantity,
          price: item.price
        });
      }

      const generatedVoucher = {
        date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
        trx: `DISP-${Math.floor(100000 + Math.random() * 900000)}`,
        department: dispatchDetails.department,
        recipient: dispatchDetails.recipient,
        reason: dispatchDetails.reason,
        referenceNo: dispatchDetails.referenceNo,
        notes: dispatchDetails.notes,
        clerkName: clerkName,
        items: [...dispatchCart],
        totalValue: totalValuation,
        totalUnits: totalItemsCount
      };

      setVoucherData(generatedVoucher);
      setIsDispatchModalOpen(false);
      setShowVoucher(true);
      setDispatchCart([]);
      
      // Refresh warehouse stock list
      await fetchProducts();
    } catch (err) {
      console.error("Dispatch Processing Error:", err);
      alert("Dispatch failed: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category?.toLowerCase().includes(searchQuery.toLowerCase());
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
              <Truck className="w-3.5 h-3.5" /> Outbound Material Movement
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Stock Dispatch & Issuance</h1>
            <p className="text-emerald-100/80 text-sm max-w-xl font-medium">
              Fulfill internal requisitions, issue materials to departments, and record instant inventory deductions.
            </p>
          </div>

          <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-black/20 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10 text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200/80">Staged for Dispatch</p>
              <p className="text-2xl font-black text-white">{totalItemsCount} <span className="text-xs font-semibold text-emerald-200">Units</span></p>
            </div>
            <button 
              onClick={() => setIsDispatchModalOpen(true)}
              className="bg-white hover:bg-emerald-50 text-[#00684a] font-extrabold px-6 py-4 rounded-2xl shadow-lg transition-all flex items-center gap-2.5 active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
            >
              <Send className="w-4 h-4" /> Review & Issue ({dispatchCart.length})
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
              placeholder="Search by item name or category..." 
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
            {['All', 'Vegetables', 'Fruits', 'Supplies', 'Raw Materials'].map((cat) => (
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

        {/* --- WAREHOUSE INVENTORY GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProducts.map(item => {
            const isLowStock = item.quantity > 0 && item.quantity < 5;
            const isOut = item.quantity <= 0;
            const stagedItem = dispatchCart.find(c => String(c.id) === String(item.id));
            const stagedQty = stagedItem ? stagedItem.quantity : 0;

            return (
              <div key={item.id} className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col hover:shadow-xl group relative ${
                isDark ? 'bg-[#0f172a] border-slate-800 hover:border-[#00684a]/40' : 'bg-white border-slate-200 hover:border-[#00684a]/30'
              }`}>
                {stagedQty > 0 && (
                  <div className="absolute top-3 right-3 z-10 bg-[#00684a] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Staged: {stagedQty}
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
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Available:</span>
                    <span className={`font-black ${
                      isOut ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {isOut ? 'Out of Stock' : `${item.quantity} Units`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Unit Valuation:</span>
                    <span className={`font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      ₱{item.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Variant Selection Dropdown if product has variants */}
                  {variantsMap[item.id] && variantsMap[item.id].length > 0 && (
                    <div className="pt-2">
                      <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Boxes className="w-3 h-3" /> Select Variant
                      </label>
                      <select
                        value={selectedVariants[item.id] || ''}
                        onChange={(e) => setSelectedVariants({ ...selectedVariants, [item.id]: e.target.value })}
                        className={`w-full p-2 rounded-xl text-xs font-bold border outline-none cursor-pointer transition-colors ${
                          isDark 
                            ? 'bg-purple-950/30 border-purple-800 text-purple-200 focus:border-purple-400' 
                            : 'bg-purple-50 border-purple-200 text-purple-900 focus:border-purple-500'
                        }`}
                      >
                        <option value="">Master Stock ({item.quantity} units)</option>
                        {variantsMap[item.id].map(v => (
                          <option key={v.id} value={v.id}>
                            {v.variant_name} ({v.quantity} units available)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <input 
                    type="number" 
                    min="1" 
                    max={item.quantity}
                    value={quantities[item.id] ?? ''} 
                    placeholder="1"
                    disabled={isOut}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className={`w-16 border rounded-xl text-center font-bold text-sm outline-none transition-all disabled:opacity-40 ${
                      isDark ? 'bg-[#0b1120] border-slate-800 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#00684a]'
                    }`}
                  />
                  <button 
                    onClick={() => addToDispatch(item)}
                    disabled={isOut}
                    className="flex-1 bg-[#00684a] hover:bg-[#005a3f] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 active:scale-95 flex items-center justify-center gap-1.5 shadow-sm shadow-[#00684a]/20 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Stage
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

      {/* --- DISPATCH REVIEW & ISSUANCE MODAL --- */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className={`border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-[#00684a] text-white">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-emerald-200" />
                <div>
                  <h2 className="text-lg font-black tracking-tight">Outbound Material Dispatch Form</h2>
                  <p className="text-xs text-emerald-100">Review requisition items and specify receiving department</p>
                </div>
              </div>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-white/80 hover:text-white text-lg font-bold cursor-pointer">✕</button>
            </header>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Dispatch Metadata Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Issuing Department / Branch
                  </label>
                  <select 
                    value={dispatchDetails.department}
                    onChange={(e) => setDispatchDetails({ ...dispatchDetails, department: e.target.value })}
                    className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none focus:border-[#00684a] ${
                      isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Production & Manufacturing">Production & Manufacturing</option>
                    <option value="Maintenance & Facilities">Maintenance & Facilities</option>
                    <option value="IT & Infrastructure">IT & Infrastructure</option>
                    <option value="Logistics & Branch Transfer">Logistics & Branch Transfer</option>
                    <option value="Client Delivery Order">Client Delivery Order</option>
                    <option value="Quality Assurance & Testing">Quality Assurance & Testing</option>
                    <option value="General Admin & Office">General Admin & Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Movement Reason
                  </label>
                  <select 
                    value={dispatchDetails.reason}
                    onChange={(e) => setDispatchDetails({ ...dispatchDetails, reason: e.target.value })}
                    className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none focus:border-[#00684a] ${
                      isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Department Requisition">Department Requisition</option>
                    <option value="Maintenance & Repair Use">Maintenance & Repair Use</option>
                    <option value="Project Allocation">Project Allocation</option>
                    <option value="Client Order Dispatch">Client Order Dispatch</option>
                    <option value="Branch Transfer">Branch Transfer</option>
                    <option value="Damaged / Scrap Write-Off">Damaged / Scrap Write-Off</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Received By (Staff Name) *
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., John Doe (Foreman)"
                    value={dispatchDetails.recipient}
                    onChange={(e) => setDispatchDetails({ ...dispatchDetails, recipient: e.target.value })}
                    className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none focus:border-[#00684a] ${
                      isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Requisition Ref / Work Order #
                  </label>
                  <input 
                    type="text" 
                    value={dispatchDetails.referenceNo}
                    onChange={(e) => setDispatchDetails({ ...dispatchDetails, referenceNo: e.target.value })}
                    className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none focus:border-[#00684a] ${
                      isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Items Staged List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Staged Items ({dispatchCart.length})</span>
                  <span>Total Units: {totalItemsCount}</span>
                </h4>

                {dispatchCart.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-2xl border-slate-300 dark:border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    No items staged for dispatch.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {dispatchCart.map(item => (
                      <div key={item.cartKey || item.id} className={`flex justify-between items-center p-3.5 rounded-xl border ${
                        isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="min-w-0 flex-1 pr-4">
                          <div className="flex items-center gap-2">
                            <p className={`font-extrabold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                            {item.variant_name && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                Variant: {item.variant_name}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-semibold">{item.category} • ₱{item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-sm text-[#00684a] dark:text-emerald-400">
                            {item.quantity} Units
                          </span>
                          <button 
                            onClick={() => setDispatchCart(dispatchCart.filter(c => c.cartKey !== item.cartKey))}
                            className="text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={`p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4 ${
              isDark ? 'bg-[#0b1120]/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-left w-full sm:w-auto">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Total Dispatched Valuation</span>
                <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₱{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setIsDispatchModalOpen(false)}
                  className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border cursor-pointer ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDispatch}
                  disabled={dispatchCart.length === 0 || isSubmitting}
                  className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-[#00684a] hover:bg-[#005a3f] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#00684a]/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? "Processing..." : "Confirm & Issue Stock"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- OFFICIAL DISPATCH VOUCHER / SLIP --- */}
      {showVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 p-8 rounded-3xl w-full max-w-lg font-sans shadow-2xl relative border border-slate-200">
            <div className="absolute top-0 left-0 w-full h-3 bg-[#00684a] rounded-t-3xl"></div>
            
            <div className="text-center border-b pb-4 mb-4 mt-2">
              <div className="inline-flex items-center gap-2 text-[#00684a] font-black text-sm uppercase tracking-widest mb-1">
                <Building2 className="w-4 h-4" /> Internal Warehouse Management System
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Material Dispatch Voucher</h2>
              <p className="text-xs font-bold text-slate-400 mt-0.5">Voucher #: {voucherData.trx} • {voucherData.date}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Receiving Department</span>
                <span className="font-extrabold text-slate-800">{voucherData.department}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Recipient Staff</span>
                <span className="font-extrabold text-slate-800">{voucherData.recipient}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Reason Code</span>
                <span className="font-extrabold text-slate-800">{voucherData.reason}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Issuing Clerk</span>
                <span className="font-extrabold text-[#00684a]">{voucherData.clerkName}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Notes / Purpose</span>
                <span className="font-medium text-slate-700">{voucherData.notes || 'Authorized material release from warehouse facility.'}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Dispatched Items List</span>
              {voucherData.items.map(item => (
                <div key={item.cartKey || item.id} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {item.name} {item.variant_name ? `(${item.variant_name})` : ''}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">SKU: {item.variant_sku || item.sku || `SKU-#${item.id}`}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#00684a] block">{item.quantity} Units</span>
                    <span className="text-[10px] text-slate-400">@ ₱{item.price.toFixed(2)}/unit</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 mb-6 flex justify-between items-center font-black">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 block">Total Units Dispatched</span>
                <span className="text-base text-slate-900">{voucherData.totalUnits} Units</span>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-slate-500 block">Total Material Value</span>
                <span className="text-base text-[#00684a]">₱{voucherData.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => window.print()} 
                className="bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Voucher
              </button>
              <button 
                onClick={() => setShowVoucher(false)} 
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