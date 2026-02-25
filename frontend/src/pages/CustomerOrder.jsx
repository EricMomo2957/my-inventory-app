import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function CustomerOrder() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  // Removed setActiveCategory from declaration since it wasn't being used in your filter logic
  const [activeCategory] = useState('All'); 
  
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: '', contact: '', address: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);

  const navigate = useNavigate();
  const isDarkMode = localStorage.getItem('landingTheme') === 'dark';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/products');
        setProducts(res.data.map(p => ({ ...p, price: parseFloat(p.price) || 0 })));
      } catch (err) { 
        console.error("Error fetching products:", err); 
      }
    };
    fetchProducts();
  }, []);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const generateReceipt = (orderData) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); 
    doc.text("INVENTORY PRO", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Official Guest Order Receipt", 105, 28, { align: "center" });

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(`Bill To: ${orderData.customer.name}`, 14, 45);
    doc.text(`Contact: ${orderData.customer.contact}`, 14, 52);
    doc.text(`Address: ${orderData.customer.address}`, 14, 59);
    doc.text(`Date: ${date}`, 140, 45);

    const tableRows = orderData.items.map(item => [
      item.name,
      `P${item.price.toFixed(2)}`,
      item.quantity,
      `P${(item.price * item.quantity).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 70,
      head: [['Product', 'Price', 'Qty', 'Subtotal']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Total Amount: P${orderData.total.toLocaleString()}`, 140, finalY);

    doc.save(`Receipt_${orderData.customer.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleGuestOrder = async () => {
    if (!guestInfo.name || !guestInfo.contact || !guestInfo.address) {
      alert("Please fill in all guest details!");
      return;
    }

    setIsProcessing(true);
    const orderData = { customer: guestInfo, items: cart, total: cartTotal };

    try {
      await axios.post('http://localhost:3000/api/guest-orders', orderData);
      setLastOrderDetails(orderData);
      setShowSuccessModal(true);
      setCart([]);
      setIsGuestMode(false);
      setGuestInfo({ name: '', contact: '', address: '' });
    // eslint-disable-next-line no-unused-vars
    } catch (_err) { // Changed 'err' to '_err' to satisfy ESLint
      alert("Order failed. Check backend connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuantityChange = (id, val) => {
    const value = val === '' ? '' : parseInt(val, 10);
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const addToCart = (product) => {
    const qty = parseInt(quantities[product.id]) || 1;
    setCart(prev => {
      const existing = prev.find(item => String(item.id) === String(product.id));
      if (existing) {
        return prev.map(item => String(item.id) === String(product.id) 
          ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { ...product, quantity: qty }];
    });
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#0b1120] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"> {/* Changed z-[100] to z-100 */}
          <div className={`w-full max-w-md p-8 rounded-3xl text-center shadow-2xl animate-in zoom-in duration-300 ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
            <h2 className="text-2xl font-black mb-2">Order Confirmed!</h2>
            <p className="opacity-60 mb-8">Thank you for shopping. Your fresh items are being prepared.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => generateReceipt(lastOrderDetails)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
              >
                📥 Download PDF Receipt
              </button>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 bg-slate-200 dark:bg-slate-800 rounded-2xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md border-b ${isDarkMode ? 'bg-[#0b1120]/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black tracking-tighter">
            Inventory<span className="text-blue-600">Pro</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-bold hover:text-blue-600 transition-colors">Login</Link>
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm">🛒 Cart ({cart.length})</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 lg:p-10 flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-8">
          <header>
            <h1 className="text-4xl font-black mb-2">Our Products</h1>
            <p className="opacity-60 font-medium">Fresh items available for order today.</p>
          </header>

          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" placeholder="Search items..."
              className={`flex-1 px-6 py-4 rounded-2xl border outline-none focus:border-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map(item => (
              <div key={item.id} className={`group p-4 rounded-3xl border transition-all hover:shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="aspect-square rounded-2xl mb-4 overflow-hidden bg-slate-100">
                   <img 
                    src={item.image_url ? `http://localhost:3000${item.image_url}` : 'https://via.placeholder.com/300?text=No+Image'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={item.name} 
                  />
                </div>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-2xl font-black text-blue-600 mb-4">₱{item.price.toLocaleString()}</p>
                <div className="flex gap-2">
                  <input 
                    type="number" min="1" value={quantities[item.id] ?? ''} placeholder="1"
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className="w-16 rounded-xl text-center font-bold bg-slate-100 text-black outline-none"
                  />
                  <button onClick={() => addToCart(item)} className="flex-1 bg-slate-900 text-white dark:bg-blue-600 py-3 rounded-xl font-black text-xs">ADD TO CART</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className={`w-full lg:w-96 h-fit sticky top-28 p-8 rounded-4xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h2 className="text-xl font-black mb-6 flex justify-between">
            Your Order <span className="text-blue-600">₱{cartTotal.toLocaleString()}</span>
          </h2>
          
          {!isGuestMode ? (
            <div className="flex flex-col gap-3">
              <div className="space-y-4 mb-8 max-h-60 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm font-bold">
                    <span>{item.name} x{item.quantity}</span>
                    <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/login')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs">LOGIN TO CHECKOUT</button>
              <button disabled={cart.length === 0} onClick={() => setIsGuestMode(true)} className="w-full py-4 border-2 border-blue-600 text-blue-600 rounded-2xl font-black text-xs">CHECKOUT AS GUEST</button>
            </div>
          ) : (
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm" onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}/>
              <input type="text" placeholder="Contact Number" className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm" onChange={(e) => setGuestInfo({...guestInfo, contact: e.target.value})}/>
              <textarea placeholder="Address" className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm" onChange={(e) => setGuestInfo({...guestInfo, address: e.target.value})}/>
              <button onClick={handleGuestOrder} disabled={isProcessing} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-xs">
                {isProcessing ? 'ORDERING...' : 'CONFIRM GUEST ORDER'}
              </button>
              <button onClick={() => setIsGuestMode(false)} className="w-full text-xs font-bold opacity-50">Go Back</button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}