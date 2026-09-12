import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AdminHeader from './AdminHeader';
import TablePagination from '../../components/TablePagination';
import { 
  MapPin, 
  Layers, 
  Search, 
  Grid, 
  Boxes, 
  ArrowRight, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Filter,
  Navigation,
  Sparkles,
  Sliders,
  ChevronRight,
  Package,
  Eye,
  Compass
} from 'lucide-react';

const WAREHOUSE_ZONES = [
  { id: 'Zone A', name: 'Zone A - Ambient Raw Materials', color: 'emerald', bgClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  { id: 'Zone B', name: 'Zone B - Finished Goods & Assembly', color: 'blue', bgClass: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  { id: 'Zone C', name: 'Zone C - Fast Moving Consumer Goods', color: 'purple', bgClass: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  { id: 'Zone D', name: 'Zone D - High Value & Secure Vault', color: 'amber', bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
];

const AISLES = ['Aisle 01', 'Aisle 02', 'Aisle 03', 'Aisle 04'];
const RACKS = ['Rack A', 'Rack B', 'Rack C', 'Rack D'];
const SHELVES = ['Shelf 1', 'Shelf 2', 'Shelf 3', 'Shelf 4'];

export const normalizeZone = (zoneStr) => {
  if (!zoneStr) return 'Zone A';
  const z = zoneStr.toString().trim();
  if (/zone\s*a/i.test(z) || z === 'A') return 'Zone A';
  if (/zone\s*b/i.test(z) || z === 'B') return 'Zone B';
  if (/zone\s*c/i.test(z) || z === 'C') return 'Zone C';
  if (/zone\s*d/i.test(z) || z === 'D') return 'Zone D';
  return zoneStr;
};

export const normalizeAisle = (aisleStr) => {
  if (!aisleStr) return 'Aisle 01';
  const a = aisleStr.toString().trim();
  if (/aisle\s*0?1/i.test(a) || a === '1') return 'Aisle 01';
  if (/aisle\s*0?2/i.test(a) || a === '2') return 'Aisle 02';
  if (/aisle\s*0?3/i.test(a) || a === '3') return 'Aisle 03';
  if (/aisle\s*0?4/i.test(a) || a === '4') return 'Aisle 04';
  return aisleStr;
};

export const normalizeRack = (rackStr) => {
  if (!rackStr) return 'Rack A';
  const r = rackStr.toString().trim();
  if (/^(rack\s*0?1|rack\s*a|a)$/i.test(r)) return 'Rack A';
  if (/^(rack\s*0?2|rack\s*b|b)$/i.test(r)) return 'Rack B';
  if (/^(rack\s*0?3|rack\s*c|c)$/i.test(r)) return 'Rack C';
  if (/^(rack\s*0?4|rack\s*d|d)$/i.test(r)) return 'Rack D';
  if (r.toLowerCase().includes('a') || r.includes('1')) return 'Rack A';
  if (r.toLowerCase().includes('b') || r.includes('2')) return 'Rack B';
  if (r.toLowerCase().includes('c') || r.includes('3')) return 'Rack C';
  if (r.toLowerCase().includes('d') || r.includes('4')) return 'Rack D';
  return 'Rack A';
};

export const normalizeShelf = (shelfStr) => {
  if (!shelfStr) return 'Shelf 1';
  const s = shelfStr.toString().trim();
  if (/^(shelf\s*0?1|bin\s*0?1|shelf\s*1|bin\s*1|1)$/i.test(s)) return 'Shelf 1';
  if (/^(shelf\s*0?2|bin\s*0?2|shelf\s*2|bin\s*2|2)$/i.test(s)) return 'Shelf 2';
  if (/^(shelf\s*0?3|bin\s*0?3|shelf\s*3|bin\s*3|3)$/i.test(s)) return 'Shelf 3';
  if (/^(shelf\s*0?4|bin\s*0?4|shelf\s*4|bin\s*4|4)$/i.test(s)) return 'Shelf 4';
  if (s.toLowerCase().includes('1')) return 'Shelf 1';
  if (s.toLowerCase().includes('2')) return 'Shelf 2';
  if (s.toLowerCase().includes('3')) return 'Shelf 3';
  if (s.toLowerCase().includes('4')) return 'Shelf 4';
  return 'Shelf 1';
};

export default function WarehouseLocationMap() {
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('Zone A');
  const [selectedAisle, setSelectedAisle] = useState('Aisle 01');

  // Table Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Coordinate Editor Modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [editZone, setEditZone] = useState('Zone A');
  const [editAisle, setEditAisle] = useState('Aisle 01');
  const [editRack, setEditRack] = useState('Rack A');
  const [editBin, setEditBin] = useState('Shelf 1');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch products
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/products');
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Location Map fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered products based on search
  const searchedProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.sku?.toLowerCase().includes(q) || 
      p.category?.toLowerCase().includes(q) ||
      p.location_zone?.toLowerCase().includes(q) ||
      p.location_aisle?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Paginated products for the Warehouse Master Coordinate Index table
  const displayedProducts = useMemo(() => {
    if (isExpanded) return searchedProducts;
    const start = (currentPage - 1) * pageSize;
    return searchedProducts.slice(start, start + pageSize);
  }, [searchedProducts, currentPage, pageSize, isExpanded]);

  // Warehouse Metrics
  const metrics = useMemo(() => {
    const total = products.length;
    const mapped = products.filter(p => p.location_zone && p.location_aisle).length;
    const unassigned = total - mapped;
    const zoneCount = new Set(products.map(p => p.location_zone).filter(Boolean)).size || 4;
    const totalCapacity = 4 * 4 * 4 * 4; // 256 physical bin slots
    const utilizationRate = Math.min(100, Math.round((total / totalCapacity) * 100));

    return {
      total,
      mapped,
      unassigned,
      zoneCount,
      utilizationRate
    };
  }, [products]);

  // Open edit modal for a product
  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setEditZone(normalizeZone(p.location_zone));
    setEditAisle(normalizeAisle(p.location_aisle));
    setEditRack(normalizeRack(p.location_rack));
    setEditBin(normalizeShelf(p.location_bin));
  };

  // Save new location coordinates
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/api/products/location/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_zone: editZone,
          location_aisle: editAisle,
          location_rack: editRack,
          location_bin: editBin
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`📍 Relocated "${editingProduct.name}" to ${editZone} → ${editAisle} → ${editRack} → ${editBin}`);
        setEditingProduct(null);
        loadProducts();
      } else {
        alert("Failed to update coordinate: " + data.message);
      }
    } catch (err) {
      alert("Error saving coordinate: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <AdminHeader 
        title="Warehouse Location Map" 
        subtitle="Visual Aisle, Rack & Bin Coordinate Locator"
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
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200/80 hover:border-[#00684a]/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mapped SKUs</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{metrics.mapped}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <MapPin className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{Math.round((metrics.mapped / (metrics.total || 1)) * 100)}% inventory geo-indexed</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200/80 hover:border-blue-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Storage Zones</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{metrics.zoneCount} Zones</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Zone A, B, C & D Fully Active</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-purple-500/50' : 'bg-white border-slate-200/80 hover:border-purple-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Rack Utilization</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{metrics.utilizationRate}%</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <Grid className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">
              <Boxes className="w-3.5 h-3.5" />
              <span>256 Total Bin Capacity</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group shadow-sm ${
            isDark ? 'bg-[#0f172a] border-slate-800 hover:border-amber-500/50' : 'bg-white border-slate-200/80 hover:border-amber-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Floating / Unassigned</p>
                <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{metrics.unassigned}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <span>{metrics.unassigned > 0 ? 'Requires shelf allocation' : 'All SKUs organized'}</span>
            </div>
          </div>
        </div>

        {/* SEARCH & QUICK LOCATOR BAR */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
        }`}>
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search SKU, Product Name or Coordinate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-700 text-white focus:border-emerald-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#00684a]'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {WAREHOUSE_ZONES.map(z => (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedZone === z.id
                    ? 'bg-[#00684a] text-white shadow-md shadow-[#00684a]/20'
                    : isDark ? 'bg-slate-800/80 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {z.id}
              </button>
            ))}
            <button
              onClick={loadProducts}
              className={`p-2 rounded-xl border text-slate-400 hover:text-slate-200 transition-colors cursor-pointer ${
                isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
              }`}
              title="Refresh Map"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* MAIN VISUAL FLOOR & AISLE VIEWER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* AISLE SELECTOR TABS (Left Col 3) */}
          <div className="lg:col-span-3 space-y-3">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Warehouse Aisles</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">{selectedZone}</span>
              </div>
              <div className="space-y-2">
                {AISLES.map(aisle => {
                  const count = products.filter(p => normalizeZone(p.location_zone) === selectedZone && normalizeAisle(p.location_aisle) === aisle).length;
                  const isSelected = selectedAisle === aisle;
                  return (
                    <button
                      key={aisle}
                      onClick={() => setSelectedAisle(aisle)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00684a]/15 border-[#00684a] text-[#00684a] dark:text-emerald-400 shadow-sm'
                          : isDark ? 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800' : 'border-slate-200/70 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Navigation className={`w-4 h-4 ${isSelected ? 'text-[#00684a] dark:text-emerald-400' : 'text-slate-400'}`} />
                        <span>{aisle}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        isSelected ? 'bg-[#00684a] text-white' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {count} SKUs
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Warehouse Safety Notice */}
              <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Forklift speed limit in aisles is <strong>5 km/h</strong>. Always wear high-visibility vest during cycle counts.
                </p>
              </div>
            </div>
          </div>

          {/* INTERACTIVE RACK & SHELF MATRIX (Right Col 9) */}
          <div className="lg:col-span-9 space-y-4">
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-800/60 gap-2">
                <div>
                  <h2 className="text-lg font-black flex items-center gap-2">
                    <span>Physical Shelf Matrix: {selectedZone} → {selectedAisle}</span>
                  </h2>
                  <p className="text-xs text-slate-400">Click any product badge to reassign physical coordinates</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Adequate
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Low Stock
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Out of Stock
                  </span>
                </div>
              </div>

              {/* Racks Grid (Rack A, B, C, D) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {RACKS.map(rack => (
                  <div 
                    key={rack} 
                    className={`p-4 rounded-xl border ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-800/40">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00684a]"></span>
                        <h3 className="text-sm font-extrabold">{rack}</h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">4 Storage Tiers</span>
                    </div>

                    {/* Shelves inside this Rack */}
                    <div className="space-y-2.5">
                      {SHELVES.map(shelf => {
                        // Find all products located in this exact coordinate
                        const shelfProducts = products.filter(p => 
                          normalizeZone(p.location_zone) === selectedZone &&
                          normalizeAisle(p.location_aisle) === selectedAisle &&
                          normalizeRack(p.location_rack) === rack &&
                          normalizeShelf(p.location_bin) === shelf
                        );

                        return (
                          <div 
                            key={shelf} 
                            className={`p-2.5 rounded-lg border transition-all ${
                              shelfProducts.length > 0
                                ? isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
                                : isDark ? 'bg-slate-950/40 border-slate-800/50 border-dashed' : 'bg-slate-100/50 border-slate-200/50 border-dashed'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-bold text-slate-400">{shelf}</span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {shelfProducts.length} item{shelfProducts.length === 1 ? '' : 's'}
                              </span>
                            </div>

                            {/* Product Badges */}
                            {shelfProducts.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {shelfProducts.map(p => {
                                  const isLow = p.quantity <= (p.min_threshold || 5);
                                  const isZero = p.quantity === 0;
                                  return (
                                    <button
                                      key={p.id}
                                      onClick={() => handleOpenEdit(p)}
                                      className={`group px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                                        isZero
                                          ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                          : isLow
                                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                            : isDark ? 'bg-slate-700/60 border-slate-600 text-slate-200 hover:border-emerald-500' : 'bg-slate-100 border-slate-200 text-slate-800 hover:border-[#00684a]'
                                      }`}
                                      title="Click to relocate product"
                                    >
                                      <span className="font-bold truncate max-w-[120px]">{p.name}</span>
                                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                                        isZero ? 'bg-red-500 text-white' : isLow ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                                      }`}>
                                        {p.quantity}
                                      </span>
                                      <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="py-1 text-center text-[10px] text-slate-400/60 font-mono">
                                [ Empty Slot Available ]
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FULL PRODUCT DIRECTORY TABLE WITH COORDINATE STATUS */}
        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800/60 gap-3">
            <div>
              <h2 className="text-base font-black">Warehouse Master Coordinate Index</h2>
              <p className="text-xs text-slate-400">Search, verify physical shelf positions, and dispatch pick paths</p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Showing {searchedProducts.length} of {products.length} Products
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={`border-b text-[11px] font-black uppercase tracking-wider ${
                  isDark ? 'border-slate-800 text-slate-300 bg-slate-900/60' : 'border-slate-200 text-slate-950 bg-slate-100'
                }`} style={{ color: isDark ? '#f8fafc' : '#09090b' }}>
                  <th className="py-3 px-3">SKU / Item</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Current Stock</th>
                  <th className="py-3 px-3">Location Coordinate</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                {displayedProducts.length > 0 ? (
                  displayedProducts.map(p => (
                    <tr key={p.id} className={`transition-colors ${
                      isDark ? 'hover:bg-slate-800/20 text-slate-200' : 'hover:bg-slate-50 text-slate-950'
                    }`}>
                      <td className="py-3 px-3">
                        <div className="font-black text-sm" style={{ color: isDark ? '#ffffff' : '#09090b' }}>{p.name}</div>
                        <div className="text-xs font-mono font-bold" style={{ color: isDark ? '#94a3b8' : '#334155' }}>{p.sku || `SKU-${p.id}`}</div>
                      </td>
                      <td className="py-3 px-3 text-xs font-bold" style={{ color: isDark ? '#cbd5e1' : '#09090b' }}>{p.category}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          p.quantity === 0 
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                            : p.quantity <= (p.min_threshold || 5)
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-[#00684a] dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {p.quantity} units
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-[#00684a] dark:text-emerald-400 font-bold border border-emerald-500/30">
                            {normalizeZone(p.location_zone)}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-400 font-bold border border-blue-500/30">
                            {normalizeAisle(p.location_aisle)}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-400 font-bold border border-purple-500/30">
                            {normalizeRack(p.location_rack)}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30">
                            {normalizeShelf(p.location_bin)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-3 py-1.5 rounded-lg bg-[#00684a] hover:bg-[#00553c] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Relocate</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-wider">
                      No matching products found in warehouse coordinate index.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Component */}
          {searchedProducts.length > 0 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <TablePagination 
                currentPage={currentPage}
                totalItems={searchedProducts.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
                itemLabel="products"
              />
            </div>
          )}
        </div>

      </div>

      {/* MODAL: EDIT COORDINATE */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl animate-in zoom-in-95 ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#00684a]/20 text-[#00684a] dark:text-emerald-400 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Assign Warehouse Coordinate</h3>
                  <p className="text-xs text-slate-400 truncate max-w-xs">{editingProduct.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4">
              {/* Zone */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Warehouse Zone</label>
                <select
                  value={editZone}
                  onChange={(e) => setEditZone(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {WAREHOUSE_ZONES.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>

              {/* Aisle, Rack, Shelf */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Aisle</label>
                  <select
                    value={editAisle}
                    onChange={(e) => setEditAisle(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {AISLES.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Rack</label>
                  <select
                    value={editRack}
                    onChange={(e) => setEditRack(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {RACKS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Shelf / Bin</label>
                  <select
                    value={editBin}
                    onChange={(e) => setEditBin(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {SHELVES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Coordinate Preview Callout */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
                <span className="font-semibold">New Coordinate Path:</span>
                <span className="font-mono font-black">{editZone} → {editAisle} → {editRack} → {editBin}</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
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
                  <span>Confirm Relocation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
