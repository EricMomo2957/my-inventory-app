import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function AdminManagement() {
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [, setLoading] = useState(true);

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
    <div className={`p-8 space-y-8 min-h-screen transition-colors ${isDark ? 'bg-[#0b1120]' : 'bg-slate-50'}`}>
      <header className="flex justify-between items-end">
        <div>
          <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin Management</h1>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold">+ New User</button>
      </header>

      {/* Table Section */}
      <div className={`rounded-3xl border p-6 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}`}>
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500 font-black uppercase text-[10px] tracking-widest">
            <tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((u) => (
              <tr key={u.id} className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                <td className="p-4 font-bold">{u.full_name}</td>
                <td className="p-4 uppercase text-[10px] font-black text-orange-500">{u.role}</td>
                <td className="p-4 text-right">
                  <button onClick={() => { setSelectedUser(u); setIsEditModalOpen(true); }} className="p-2">✏️</button>
                  <button onClick={() => { setSelectedUser(u); setIsDeleteModalOpen(true); }} className="p-2">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ADD MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-[#111827] w-full max-w-lg rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-slate-900 dark:text-white">Register User</h2>
            <input placeholder="Full Name" className="w-full mb-4 p-4 rounded-xl bg-slate-100 dark:bg-[#0b1120] text-slate-900 dark:text-white" value={newUser.full_name} onChange={(e) => setNewUser({...newUser, full_name: e.target.value})} />
            {/* Add other inputs similarly... */}
            <button onClick={handleCreateUser} className="w-full py-4 bg-orange-500 rounded-xl font-bold text-white">Create</button>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-slate-900 dark:text-white">Edit Permissions</h2>
            <input className="w-full mb-4 p-4 rounded-xl bg-slate-100 dark:bg-[#0b1120] text-slate-900 dark:text-white" value={selectedUser.full_name} onChange={(e) => setSelectedUser({...selectedUser, full_name: e.target.value})} />
            <select className="w-full mb-4 p-4 rounded-xl bg-slate-100 dark:bg-[#0b1120] text-slate-900 dark:text-white" value={selectedUser.role} onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}>
              <option value="admin">Admin</option><option value="manager">Manager</option><option value="clerk">Clerk</option>
            </select>
            <button onClick={handleUpdateUser} className="w-full py-4 bg-orange-500 rounded-xl font-bold text-white">Save Changes</button>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center">
            <h2 className="text-xl font-black text-white mb-2">Delete User?</h2>
            <button onClick={handleDeleteUser} className="w-full py-3 bg-red-500 rounded-xl font-bold text-white">Confirm Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}