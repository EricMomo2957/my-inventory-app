import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Boxes, 
  Plus, 
  Trash2, 
  Layers, 
  Tag, 
  Calculator, 
  CheckCircle2, 
  Package,
  Sparkles
} from 'lucide-react';

const COMMON_UOMS = ['Piece', 'Box', 'Pack', 'Sack', 'Case', 'Bundle', 'Kg', 'Liter'];

export default function ProductVariantModal({ product, isOpen, onClose, onVariantsUpdated }) {
  const { isDark } = useTheme();
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    variant_name: '',
    sku: '',
    uom_type: 'Box',
    multiplier: 24,
    price: '',
    cost_price: '',
    barcode: ''
  });

  const fetchVariants = async () => {
    if (!product) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/variants/${product.id}`);
      if (res.ok) {
        const data = await res.json();
        setVariants(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load variants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && product) {
      fetchVariants();
      setFormData({
        variant_name: `Bulk Box (24x)`,
        sku: `${product.sku || 'SKU'}-BOX24`,
        uom_type: 'Box',
        multiplier: 24,
        price: Math.round(parseFloat(product.price || 0) * 24 * 0.95 * 100) / 100, // 5% bulk discount
        cost_price: Math.round(parseFloat(product.cost_price || product.price * 0.65 || 0) * 24 * 100) / 100,
        barcode: ''
      });
    }
  }, [isOpen, product]);

  const handleAddVariant = async (e) => {
    e.preventDefault();
    if (!formData.variant_name.trim()) return;

    try {
      const res = await fetch('http://localhost:3000/api/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          product_id: product.id
        })
      });

      if (res.ok) {
        fetchVariants();
        if (onVariantsUpdated) onVariantsUpdated();
        setFormData({
          variant_name: '',
          sku: '',
          uom_type: 'Box',
          multiplier: 12,
          price: '',
          cost_price: '',
          barcode: ''
        });
      }
    } catch (err) {
      console.error("Error adding variant:", err);
    }
  };

  const handleDeleteVariant = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/variants/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchVariants();
        if (onVariantsUpdated) onVariantsUpdated();
      }
    } catch (err) {
      console.error("Error deleting variant:", err);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className={`w-full max-w-2xl rounded-3xl p-7 border shadow-2xl max-h-[90vh] flex flex-col ${
        isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00684a]/10 text-[#00684a] dark:text-emerald-400 flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">{product.name}</h2>
              <p className="text-xs text-slate-400">Manage Product Variants & Packaging Unit Conversions (UOM)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl border text-xs font-bold ${
              isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'
            }`}
          >
            ✕ Close
          </button>
        </div>

        {/* Existing Base SKU Info */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 mb-5 text-xs">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Base Master SKU</p>
            <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{product.sku || `SKU-#${product.id}`}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Single Unit Price</p>
            <p className="font-extrabold text-slate-900 dark:text-white">₱{parseFloat(product.price || 0).toFixed(2)} / Pc</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Base Stock Qty</p>
            <p className="font-extrabold text-slate-900 dark:text-white">{product.quantity} Single Units</p>
          </div>
        </div>

        {/* Existing Variants List */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-5 pr-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Active Variants & Pack Units ({variants.length})</h3>
          {variants.length > 0 ? (
            variants.map(v => (
              <div 
                key={v.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{v.variant_name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {v.sku} • 1 {v.uom_type} = <span className="font-black text-emerald-600 dark:text-emerald-400">{v.multiplier} Base Pieces</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-black text-[#00684a] dark:text-emerald-400">₱{parseFloat(v.price || 0).toFixed(2)}</p>
                    <span className="text-[10px] text-slate-400 font-medium">Equiv: {Math.floor((product.quantity || 0) / (v.multiplier || 1))} {v.uom_type}s</span>
                  </div>
                  <button
                    onClick={() => handleDeleteVariant(v.id)}
                    className="p-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    title="Remove Variant"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed rounded-2xl border-slate-200 dark:border-slate-800">
              No packaging variants configured. Add a bulk box or size variation below.
            </div>
          )}
        </div>

        {/* Add New Variant Form */}
        <form onSubmit={handleAddVariant} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Add Variant or Pack Rule</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Variant Name *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Master Carton (48x)" 
                value={formData.variant_name}
                onChange={(e) => setFormData({ ...formData, variant_name: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Unit of Measure (UOM)</label>
              <select
                value={formData.uom_type}
                onChange={(e) => setFormData({ ...formData, uom_type: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {COMMON_UOMS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Base Multiplier (Pcs)</label>
              <input 
                type="number" 
                min="1"
                required
                value={formData.multiplier}
                onChange={(e) => {
                  const m = parseInt(e.target.value, 10) || 1;
                  setFormData({ 
                    ...formData, 
                    multiplier: m,
                    price: Math.round(parseFloat(product.price || 0) * m * 100) / 100,
                    cost_price: Math.round(parseFloat(product.cost_price || product.price * 0.65 || 0) * m * 100) / 100
                  });
                }}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Pack Selling Price (₱)</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Variant SKU</label>
              <input 
                type="text" 
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. SKU-BOX24"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-2.5 bg-[#00684a] hover:bg-[#005a3f] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00684a]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Save Variant & UOM Conversion Rule
          </button>
        </form>

      </div>
    </div>
  );
}
