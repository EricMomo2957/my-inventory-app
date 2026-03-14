import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function AdminManagement() {
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [newUser, setNewUser] = useState({
    username: '', password: '', full_name: '', role: 'clerk', email: '', admin_id: '', department: 'Management'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/users');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        setIsAddModalOpen(false);
        setNewUser({ username: '', password: '', full_name: '', role: 'clerk', email: '', admin_id: '', department: 'Management' });
        fetchUsers();
      }
    } catch (error) { console.error(error); }
  };

  const handleUpdateUser = async () => {
    try {
      await fetch(`http://localhost:3000/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedUser),
      });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) { console.error(error); }
  };

  const handleDeleteUser = async () => {
    try {
      await fetch(`http://localhost:3000/api/users/${selectedUser.id}`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) { console.error(error); }
  };

  return (
    <div className={`p-8 space-y-8 min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0b1120]' : 'bg-slate-50'}`}>
      <header className="flex justify-between items-end">
        <div>
          <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin Management</h1>
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>System User Directory</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-xl shadow-orange-600/20 active:scale-95 transition-all">
          + New User
        </button>
      </header>

      {/* Table Section */}
      <div className={`rounded-3xl border p-6 shadow-sm transition-colors duration-500 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className={`${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} font-black uppercase tracking-widest text-[10px]`}>
              <tr>
                <th className="p-4 px-6">User</th>
                <th className="p-4 px-6">Role</th>
                <th className="p-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-10 text-center text-slate-500 font-bold animate-pulse">
                    Synchronizing Database...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`}>
                    <td className="p-4 px-6 font-bold">{u.full_name || u.username}</td>
                    <td className="p-4 px-6">
                      <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-tighter">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-right space-x-2">
                      <button onClick={() => { setSelectedUser(u); setIsEditModalOpen(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">✏️</button>
                      <button onClick={() => { setSelectedUser(u); setIsDeleteModalOpen(true); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-black mb-6 text-slate-900 dark:text-white text-center">Register New User</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Full Name *" className="col-span-2 bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50" value={newUser.full_name} onChange={(e) => setNewUser({...newUser, full_name: e.target.value})} />
              <input type="text" placeholder="Username *" className="bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} />
              <input type="password" placeholder="Password *" className="bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
              <button onClick={handleCreateUser} className="col-span-2 py-4 bg-orange-500 hover:bg-orange-400 rounded-xl font-bold text-white shadow-lg transition-all">Create Account</button>
              <button onClick={() => setIsAddModalOpen(false)} className="col-span-2 py-2 text-slate-400 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-slate-900 dark:text-white text-center">Edit Permissions</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white" value={selectedUser.full_name || ''} onChange={(e) => setSelectedUser({...selectedUser, full_name: e.target.value})} />
              <select className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white outline-none" value={selectedUser.role} onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="clerk">Clerk</option>
                <option value="auditor">Auditor</option>
                <option value="user">User</option>
              </select>
              <button onClick={handleUpdateUser} className="w-full py-4 bg-orange-500 hover:bg-orange-400 rounded-xl font-bold text-white shadow-lg transition-all">Save Changes</button>
              <button onClick={() => setIsEditModalOpen(false)} className="w-full py-2 text-slate-400 font-bold text-sm hover:text-slate-300 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete User?</h2>
            <p className="text-slate-500 text-sm mb-6">Remove <span className="font-bold text-orange-500">{selectedUser.username}</span> from the system?</p>
            <div className="flex gap-3">
              <button onClick={handleDeleteUser} className="flex-1 py-3 bg-red-500 hover:bg-red-400 rounded-xl font-bold text-white transition-all">Delete</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-500">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}