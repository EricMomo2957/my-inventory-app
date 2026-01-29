import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('admin_user');
  const [password, setPassword] = useState('********');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // 1. Save the token to localStorage so the session persists on refresh
    localStorage.setItem('userToken', 'secure-entry-granted');
    
    // 2. Update the global state in App.jsx to show the Sidenav
    setIsLoggedIn(true);
    
    // 3. Navigate to the dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center border border-slate-200">
        
        {/* Logo and Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-black text-[#1e293b] mb-1">InventoryPro</h1>
          <p className="text-slate-500 text-sm font-medium">Sign in to your dashboard</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username Input */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
              Username
            </label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800"
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Password Input */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
              Password
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Sign In Button */}
          <button 
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] mt-2"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-bold">OR</span>
          </div>
        </div>

        {/* Footer Links */}
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            New here? <Link to="/register" className="text-blue-600 font-bold hover:underline">Create an Account</Link>
          </p>
          <p className="text-xs text-slate-400">
            Just browsing? <Link to="/orders" className="text-blue-500 font-semibold hover:underline">Place an Order</Link>
          </p>
        </div>
      </div>
    </div>
  );
}