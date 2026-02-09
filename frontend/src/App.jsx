import { useEffect, useState, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout and Security
import { Sidenav } from './Sidenav'; 
import ProtectedRoute from './context/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/login'; 
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Private Pages
import Dashboard from './pages/Dashboard'; // General/Old Dashboard
import UserDashboard from './pages/user_dashboard'; // YOUR NEW USER DASHBOARD
import ClerkDashboard from './pages/ClerkDashboard'; // YOUR NEW CLERK DASHBOARD
import Orders from './pages/order'; 
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminManagement from './pages/AdminManagement';

export default function App() {
  const [products, setProducts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]); 

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('userToken');
  });

  // Dynamic user state - updated to read from localStorage for role-based logic
  const [user, setUser] = useState({ 
    name: localStorage.getItem('userName') || "Guest", 
    role: localStorage.getItem('userRole') || "User",
    avatar: `https://ui-avatars.com/api/?name=${localStorage.getItem('userName') || 'User'}&background=4361ee&color=fff` 
  });

  // Update user state whenever login status changes
  useEffect(() => {
    if (isLoggedIn) {
      setUser({
        name: localStorage.getItem('userName') || "User",
        role: localStorage.getItem('userRole') || "User",
        avatar: `https://ui-avatars.com/api/?name=${localStorage.getItem('userName') || 'User'}&background=4361ee&color=fff`
      });
    }
  }, [isLoggedIn]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/products');
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
    localStorage.clear();
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className={`flex h-screen w-full font-sans overflow-hidden ${isLoggedIn ? 'bg-[#0b1120] text-slate-200' : ''}`}>
        
        {/* Only show Sidenav for Admin/Clerk roles, usually hidden for basic User Shop view */}
        {isLoggedIn && (user.role === 'admin' || user.role === 'clerk' || user.role === 'Administrator') && (
          <Sidenav user={user} onLogout={handleLogout} />
        )}

        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Global Low Stock Notifications */}
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
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/order" element={<Orders />} />
            <Route path="/reset-password" element={<ResetPassword />} />   

            {/* PROTECTED PRIVATE ROUTES */}
            <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
              {/* Role-Specific Dashboards */}
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/clerk-dashboard" element={<ClerkDashboard />} />
              
              {/* Legacy/General Dashboard */}
              <Route path="/dashboard" element={<Dashboard products={products} fetchProducts={fetchProducts} activeAlertsCount={activeAlerts.length} />} />
              
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/profile" element={<Profile user={user} />} />
              <Route path="/settings" element={<Settings />} />
              
              <Route path="/admin" element={
                (user.role === "Administrator" || user.role === "admin") ? <AdminManagement /> : <Navigate to="/dashboard" replace />
              } />
            </Route>

            {/* CATCH ALL REDIRECT */}
            <Route path="*" element={
              <Navigate to={
                isLoggedIn 
                  ? (user.role === 'user' ? "/user-dashboard" : "/clerk-dashboard") 
                  : "/"
              } replace />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}