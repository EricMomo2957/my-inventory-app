import { useEffect, useState, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout and Security
import { Sidenav } from './Sidenav'; 
import ProtectedRoute from './context/ProtectedRoute';

// Public Pages
import Login from './pages/login';
import Register from './pages/Register';

// Private Pages
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminManagement from './pages/AdminManagement';

export default function App() {
  const [products, setProducts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]); 

  // FIX: Use a function inside useState so this only runs ONCE on initial load
  // This solves the "cascading render" error (image_1727db.png)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('userToken');
  });

  const [user] = useState({ 
    name: "Eric Dominic Momo", 
    role: "Administrator",
    avatar: "https://ui-avatars.com/api/?name=Eric+Dominic&background=4361ee&color=fff" 
  });

  const fetchProducts = useCallback(async () => {
    try {
      // Note: Ensure your vite.config.js has the proxy for /api set up
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data);
    } catch (error) { 
      console.error("Fetch error:", error); 
    }
  }, []);

  useEffect(() => { 
    if (isLoggedIn) {
      fetchProducts();
    }
  }, [fetchProducts, isLoggedIn]);

  const activeAlerts = useMemo(() => {
    return products.filter(p => p.quantity > 0 && p.quantity < 5 && !dismissedAlerts.includes(p.id));
  }, [products, dismissedAlerts]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="flex h-screen w-full bg-[#0b1120] text-slate-200 font-sans overflow-hidden">
        
        {/* Only show Sidenav if logged in */}
        {isLoggedIn && <Sidenav user={user} onLogout={handleLogout} />}

        <main className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Global Notifications */}
          {isLoggedIn && activeAlerts.length > 0 && (
            <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
              {activeAlerts.map(item => (
                <div key={item.id} className="pointer-events-auto bg-[#1e293b] p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-slide-in w-80 border border-slate-800 border-l-4 border-l-red-500">
                  <div className="text-xl">⚠️</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-white">Low Stock</h4>
                    <p className="text-xs text-slate-400">{item.name}: {item.quantity} left</p>
                  </div>
                  <button 
                    onClick={() => setDismissedAlerts(prev => [...prev, item.id])} 
                    className="text-slate-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />

            {/* PROTECTED PRIVATE ROUTES */}
            <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard products={products} fetchProducts={fetchProducts} activeAlertsCount={activeAlerts.length} />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/profile" element={<Profile user={user} />} />
              <Route path="/settings" element={<Settings />} />
              
              <Route path="/admin" element={
                user.role === "Administrator" ? <AdminManagement /> : <Navigate to="/dashboard" replace />
              } />
            </Route>

            {/* CATCH ALL */}
            <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}