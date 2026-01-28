import React, { useState } from 'react';

export default function Profile() {
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  return (
    <div className="p-6 h-screen bg-[#0b1120] text-slate-300 overflow-y-auto">
      {/* HEADER CARD: Profile Photo & Name */}
      <div className="bg-[#111827] rounded-xl border border-slate-800 p-8 mb-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-[#4361ee] overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
              {/* Replace with actual image source or keep the placeholder style from image_8b1df9.png */}
              <img 
                src="https://via.placeholder.com/150" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-pulse"></div>
          </div>
          
          <h2 className="text-2xl font-black text-white mt-4">System Administrators</h2>
          <p className="text-slate-500 font-bold text-sm">admin</p>
          
          <button className="mt-4 px-6 py-2 bg-[#1e293b] hover:bg-[#4361ee] text-white text-xs font-black uppercase tracking-widest rounded-lg border border-slate-700 transition-all">
            Edit Profile & Photo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {/* LEFT CARD: Profile Details */}
        <div className="bg-[#111827] rounded-xl border border-slate-800 p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6">Profile Details</h3>
          
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Full Name</p>
              <p className="text-white font-bold">System Administrators</p>
            </div>

            <div className="border-b border-slate-800 pb-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email</p>
              <p className="text-white font-bold">admin@inventory.com</p>
            </div>

            <div className="border-b border-slate-800 pb-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">User ID</p>
              <p className="text-white font-bold">11</p>
            </div>

            <div className="border-b border-slate-800 pb-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Department</p>
              <p className="text-white font-bold">IT Department</p>
            </div>

            <div className="pb-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Role</p>
              <p className="text-white font-bold">admin</p>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Security / Password Update */}
        <div className="bg-[#111827] rounded-xl border border-slate-800 p-8 shadow-xl flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6">Security</h3>
          
          <form className="space-y-6 flex-1">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">New Password</label>
              <input 
                type="password" 
                placeholder="Enter new password"
                className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
              <input 
                type="password" 
                placeholder="Repeat new password"
                className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              className="w-full mt-auto py-4 bg-[#1e293b] hover:bg-blue-600 text-white rounded-lg font-black text-xs uppercase tracking-widest transition-all border border-slate-700 hover:border-blue-500 shadow-lg"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}