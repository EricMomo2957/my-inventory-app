import { useEffect, useState, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerOrder from './pages/CustomerOrder';

// Theme Support
import { useTheme } from './context/ThemeContext'; // Ensure this path is correct

// Layout and Security
import ClerkSidenav from './pages/clerk/ClerkSidenav'; 
import UserSidenav from './pages/user/UserSidenav'; 
import ProtectedRoute from './context/ProtectedRoute';

// Public & Auth Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/login'; 
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Private Pages - User Folder
import UserDashboard from './pages/user/user_dashboard';
import UserOrders from './pages/user/Orders'; 
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';
import UserCalendar from './pages/user/user_calendar';
import Favorite from './pages/user/Favorite';

// Private Pages - Clerk Folder
import ClerkDashboard from './pages/clerk/ClerkDashboard';
import ClerkOrderManagement from './pages/clerk/order';
import ClerkCalendar from './pages/clerk/clerkCalendar';
import ClerkSetting from './pages/clerk/clerkSetting';
import ClerkProfile from './pages/clerk/clerkProfile';

// Private Pages - Admin Folder
import Dashboard from './pages/admin/Dashboard'; 
import AdminManagement from './pages/admin/AdminManagement';
import Calendar from './pages/admin/Calendar';

export default function App() {
  const { isDark } = useTheme(); // 1. Pull the theme state
  const [products, setProducts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]); 

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('userToken');
  });

  const [user, setUser] = useState({ 
    name: localStorage.getItem('userName') || "Guest", 
    role: localStorage.getItem('userRole') || "User",
    avatar: `https://ui-avatars.com/api/?name=${localStorage.getItem('userName') || 'User'}&background=4361ee&color=fff` 
  });

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
      {/* 2. Dynamic background logic for the whole app container */}
      <div className={`flex h-screen w-full font-sans overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#0b1120] text-slate-200' : 'bg-slate-50 text-slate-900'
      }`}>
        
        {/* GLOBAL SIDENAV LOGIC */}
        {isLoggedIn && (
          <>
            {(user.role === 'admin' || user.role === 'clerk' || user.role === 'Administrator') && (
              <ClerkSidenav user={user} onLogout={handleLogout} />
            )}
            
            {(user.role === 'User' || user.role === 'user' || user.role === 'Member') && (
              <UserSidenav user={user} onLogout={handleLogout} />
            )}
          </>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto relative scrollbar-hide">
          
          {/* Global Low Stock Notifications */}
          {isLoggedIn && activeAlerts.length > 0 && (
            <div className="fixed top-6 right-6 z-100 flex flex-col gap-3 pointer-events-none">
              {activeAlerts.map(item => (
                <div key={item.id} className={`pointer-events-auto p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full w-80 border border-l-4 border-l-red-500 ${
                  isDark ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="text-xl">⚠️</div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Low Stock</h4>
                    <p className="text-xs text-slate-400">{item.name}: {item.quantity} left</p>
                  </div>
                  <button 
                    onClick={() => setDismissedAlerts(prev => [...prev, item.id])} 
                    className="text-slate-500 hover:text-white p-1"
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />  
            <Route path="/shop" element={<CustomerOrder />} />

            <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
              <Route path="/user_dashboard" element={<UserDashboard />} />
              <Route path="/user_calendar" element={<UserCalendar />} />
              <Route path="/Orders" element={<UserOrders />} />
              <Route path="/Favorite" element={<Favorite />} />
              <Route path="/Profile" element={<Profile user={user} />} />
              <Route path="/Settings" element={<Settings />} />

              <Route path="/clerk/ClerkDashboard" element={<ClerkDashboard />} />
              <Route path="/clerk/order" element={<ClerkOrderManagement />} />
              <Route path="/clerk/clerkCalendar" element={<ClerkCalendar />} />
              <Route path="/clerk/clerkSetting" element={<ClerkSetting />} />
              <Route path="/clerk/clerkProfile" element={<ClerkProfile />} />
              
              <Route path="/dashboard" element={<Dashboard products={products} fetchProducts={fetchProducts} activeAlertsCount={activeAlerts.length} />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/admin" element={
                (user.role === "Administrator" || user.role === "admin") ? <AdminManagement /> : <Navigate to="/dashboard" replace />
              } />
            </Route>

            <Route path="*" element={
              <Navigate to={
                isLoggedIn 
                  ? (user.role === 'user' || user.role === 'User' ? "/user_dashboard" : "/clerk/ClerkDashboard") 
                  : "/"
              } replace />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}