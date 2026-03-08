import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function AdminManagement() {
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from your backend API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users'); // Adjust URL to your API route
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className={`p-8 space-y-8 min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0b1120]' : 'bg-slate-50'}`}>
      
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Admin Management
          </h1>
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Restricted Area: System User Directory
          </p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-xl shadow-orange-600/20 active:scale-95 transition-all">
          + New User
        </button>
      </header>
      
      {/* Security Alert Banner */}
      <div className={`rounded-3xl border p-6 shadow-sm transition-colors duration-500 ${isDark ? 'bg-[#111827] border-orange-500/20' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isDark ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
          <span className="text-2xl">🛡️</span>
          <p className="text-sm font-bold">
            You are managing {users.length} system accounts and security roles.
          </p>
        </div>

        {/* User Table Section */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className={`${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} font-black uppercase tracking-widest text-[10px]`}>
              <tr>
                <th className="p-4 px-6">User</th>
                <th className="p-4 px-6">Role</th>
                <th className="p-4 px-6">Department</th>
                <th className="p-4 px-6">Email</th>
                <th className="p-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500">Loading directory...</td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`}>
                  <td className="p-4 px-6">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.profile_image || `https://ui-avatars.com/api/?name=${user.username}&background=orange&color=fff`} 
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        alt=""
                      />
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.full_name || user.username}</span>
                    </div>
                  </td>
                  <td className="p-4 px-6 text-xs uppercase font-black tracking-tighter">
                    <span className={`px-2 py-1 rounded-md ${
                      user.role === 'admin' ? 'bg-red-500/10 text-red-500' : 
                      user.role === 'clerk' ? 'bg-blue-500/10 text-blue-500' : 
                      'bg-slate-500/10 text-slate-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 px-6 text-xs">{user.department || 'N/A'}</td>
                  <td className="p-4 px-6 text-xs">{user.email}</td>
                  <td className="p-4 px-6 text-right">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">⚙️</button>
                    <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}