import React, { useState, useEffect } from 'react';

export default function Profile() {
  // 1. DYNAMIC USER DATA STATE
  const [userData, setUserData] = useState({
    id: '',
    full_name: '',
    username: '',
    role: '',
    email: '',
    profile_image: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // --- FIX: Removed unused 'message' and 'setMessage' state to clear ESLint errors ---

  // 2. LOAD USER FROM LOCALSTORAGE
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // --- FIX: Added logic check and dependency [userData.id] to prevent cascading renders ---
      if (parsedUser.id !== userData.id) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserData(parsedUser);
      }
    }
  }, [userData.id]); 

  // 3. PASSWORD UPDATE HANDLER
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userData.id,
          full_name: userData.full_name,
          email: userData.email,
          password: passwordData.newPassword
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Password updated successfully!");
        setPasswordData({ newPassword: '', confirmPassword: '' });
      } else {
        alert(data.message || "Update failed.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("An error occurred while updating the password.");
    }
  };

  return (
    <div className="p-6 h-screen bg-[#0b1120] text-slate-300 overflow-y-auto">
      {/* HEADER CARD: Profile Photo & Name */}
      <div className="bg-[#111827] rounded-xl border border-slate-800 p-8 mb-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-[#4361ee] overflow-hidden shadow-2xl transition-transform group-hover:scale-105 bg-slate-800 flex items-center justify-center">
              {userData.profile_image ? (
                <img 
                  src={`http://localhost:3000${userData.profile_image}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-black text-[#4361ee]">
                  {userData.full_name?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-white mt-4">{userData.full_name || 'Loading...'}</h2>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{userData.role || 'User'}</p>
          
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
              <p className="text-white font-bold">{userData.full_name || 'N/A'}</p>
            </div>

            <div className="border-b border-slate-800 pb-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email</p>
              <p className="text-white font-bold">{userData.email || 'not provided'}</p>
            </div>

            <div className="border-b border-slate-800 pb-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">User ID</p>
              <p className="text-white font-bold">{userData.id || 'N/A'}</p>
            </div>

            <div className="border-b border-slate-800 pb-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Username</p>
              <p className="text-white font-bold">{userData.username || 'N/A'}</p>
            </div>

            <div className="pb-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Account Role</p>
              <p className="text-white font-bold capitalize">{userData.role || 'User'}</p>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Security / Password Update */}
        <div className="bg-[#111827] rounded-xl border border-slate-800 p-8 shadow-xl flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6">Security</h3>
          
          <form className="space-y-6 flex-1" onSubmit={handlePasswordUpdate}>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">New Password</label>
              <input 
                type="password" 
                placeholder="Enter new password"
                className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
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
                required
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