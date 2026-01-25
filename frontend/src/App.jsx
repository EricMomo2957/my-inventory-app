import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustment, setAdjustment] = useState(0);

  // 1. Unified fetch logic using async/await
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Run once on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Logic to Save Changes ---
  const handleSaveAdjustment = async () => {
    if (!selectedProduct) return;
    
    const adjInt = parseInt(adjustment || 0);
    const newQuantity = (selectedProduct.quantity || 0) + adjInt;
    
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: newQuantity,
          adjustment: adjInt,
          clerk_name: "Admin",
          name: selectedProduct.name
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setAdjustment(0);
        await fetchProducts(); // Refresh the list
      }
    } catch (err) {
      console.error("Failed to update stock:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Inventory Dashboard</h1>
            <p className="text-slate-500">Real-time stock management</p>
          </div>
          <button 
            onClick={fetchProducts} 
            disabled={loading}
            className="bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-sky-100"
          >
            {loading ? 'Refreshing...' : 'Refresh Stock'}
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-slate-400 text-sm uppercase font-bold">Product</th>
                <th className="p-6 text-slate-400 text-sm uppercase font-bold text-center">Stock Level</th>
                <th className="p-6 text-slate-400 text-sm uppercase font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <td className="p-6 font-bold text-slate-700">{item.name}</td>
                    <td className="p-6 text-center">
                      <span className={`font-black text-lg ${item.quantity < 5 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => { setSelectedProduct(item); setIsModalOpen(true); }}
                        className="text-sky-500 hover:bg-sky-50 font-bold px-4 py-2 rounded-lg transition-all"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-10 text-center text-slate-400">
                    {loading ? 'Loading products...' : 'No products found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- STOCK ADJUSTMENT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-slate-800 mb-2">Adjust Stock</h2>
            <p className="text-slate-500 mb-8">Editing: <span className="text-sky-500 font-bold">{selectedProduct?.name}</span></p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase mb-3">Adjustment (+ / -)</label>
                <input 
                  type="number" 
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xl font-black focus:border-sky-500 outline-none transition-all"
                  placeholder="e.g. 10 or -5"
                  autoFocus
                />
                <div className="mt-4 flex justify-between text-sm font-bold">
                  <span className="text-slate-400">Current: {selectedProduct?.quantity}</span>
                  <span className="text-slate-800">Result: {(selectedProduct?.quantity || 0) + parseInt(adjustment || 0)}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => { setIsModalOpen(false); setAdjustment(0); }}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveAdjustment}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-sky-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App