import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    role: '',
    password: ''
  });
  
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("Registering:", formData);
    // After registration logic, send them to login
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
        
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#1e293b] mb-1">Create Account</h1>
          <p className="text-slate-500 text-sm font-medium">Join Inventory Manager Pro</p>
        </header>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Full Name */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">Full Name</label>
            <input 
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 placeholder:text-slate-300"
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          {/* Username */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">Username</label>
            <input 
              type="text"
              placeholder="Choose a username"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 placeholder:text-slate-300"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          {/* Select Role */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">Select Role</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 cursor-pointer"
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              defaultValue=""
            >
              <option value="" disabled>Choose your account type</option>
              <option value="admin">Administrator</option>
              <option value="manager">Manager</option>
              <option value="staff">Clerk / Staff</option>
            </select>
          </div>

          {/* Password */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">Password</label>
            <input 
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 placeholder:text-slate-300"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {/* Register Button */}
          <button 
            type="submit"
            className="w-full py-3.5 px-4 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] mt-2"
          >
            Register Account
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}