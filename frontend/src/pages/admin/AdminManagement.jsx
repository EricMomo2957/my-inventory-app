import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Users, UserPlus, Edit3, Trash2, Shield, Mail, Building, RefreshCw } from 'lucide-react';
import AdminHeader from './AdminHeader';
import TablePagination from '../../components/TablePagination';

export default function AdminManagement() {
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const pageSize = 8;

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [newUser, setNewUser] = useState({
    username: '', password: '', full_name: '', role: 'clerk', email: '', department: 'General'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/users');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.full_name) return;
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        setIsAddModalOpen(false);
        setNewUser({ username: '', password: '', full_name: '', role: 'clerk', email: '', department: 'General' });
        fetchUsers();
      }
    } catch (error) { console.error(error); }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
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
    if (!selectedUser) return;
    try {
      await fetch(`http://localhost:3000/api/users/${selectedUser.id}`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) { console.error(error); }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedUsers = isExpanded 
    ? filteredUsers 
    : filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Top Header Bar */}
      <AdminHeader 
        title="Staff & Members"
        subtitle="Organizational Roles & Access Permissions"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="flex-1 overflow-y-auto p-8 space-y-7">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Staff & Member Directory
            </h1>
            <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage organizational access, staff roles, and administrative permissions
            </p>
          </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchUsers}
            className={`p-2.5 rounded-xl border transition-colors ${
              isDark ? 'border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title="Refresh Users"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00684a] hover:bg-[#00563b] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00684a]/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
        isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-[11px] font-bold uppercase tracking-wider border-b ${
              isDark ? 'bg-slate-900/60 text-slate-400 border-slate-800' : 'bg-[#fcfdfd] text-slate-500 border-slate-100'
            }`}>
              <th className="py-4 px-6">User / Member</th>
              <th className="py-4 px-6">Access Role</th>
              <th className="py-4 px-6">Department</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs font-medium ${
            isDark ? 'divide-slate-800/80' : 'divide-slate-100'
          }`}>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-16 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                  Loading User Directory...
                </td>
              </tr>
            ) : displayedUsers.length > 0 ? (
              displayedUsers.map((u) => (
                <tr key={u.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#00684a]/10 text-[#00684a] dark:text-emerald-400 flex items-center justify-center font-extrabold text-sm overflow-hidden shrink-0 border border-[#00684a]/20">
                        {u.profile_image ? (
                          <img src={u.profile_image.startsWith('http') ? u.profile_image : `http://localhost:3000${u.profile_image}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (u.full_name || u.username || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className={`font-bold text-sm leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {u.full_name || u.username}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          @{u.username} • {u.email || `${u.username}@inventorypro.com`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      u.role === 'admin' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' :
                      u.role === 'manager' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800' :
                      u.role === 'clerk' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800' :
                      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {u.department || 'General'}
                  </td>
                  <td className="py-4 px-6 text-right space-x-1.5">
                    <button 
                      onClick={() => { setSelectedUser(u); setIsEditModalOpen(true); }} 
                      className={`p-2 rounded-lg border transition-colors ${
                        isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                      title="Edit User"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => { setSelectedUser(u); setIsDeleteModalOpen(true); }} 
                      className="p-2 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-16 text-center text-slate-400 text-xs">
                  No users found in database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Component */}
      {filteredUsers.length > 0 && (
        <TablePagination 
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          itemLabel="members"
        />
      )}

      {/* ADD USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-3xl p-7 border shadow-xl ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            <h2 className="text-lg font-extrabold mb-5">Register New User</h2>
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Full Name *</label>
                <input type="text" placeholder="e.g. John Doe" className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} value={newUser.full_name} onChange={(e) => setNewUser({...newUser, full_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Username *</label>
                  <input type="text" placeholder="johndoe" className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Role</label>
                  <select className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                    <option value="admin">👑 Administrator (Manager)</option>
                    <option value="clerk">👷 Warehouse Clerk (Operations)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Password *</label>
                <input type="password" placeholder="••••••••" className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div className="flex gap-2.5 pt-3">
                <button onClick={handleCreateUser} className="flex-1 py-3 bg-[#00684a] hover:bg-[#00563b] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00684a]/20 transition-all cursor-pointer">Create Staff Account</button>
                <button onClick={() => setIsAddModalOpen(false)} className={`px-5 py-3 rounded-xl text-xs font-bold border cursor-pointer ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-3xl p-7 border shadow-xl ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            <h2 className="text-lg font-extrabold mb-5">Edit Staff Permissions</h2>
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Full Name</label>
                <input type="text" className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} value={selectedUser.full_name || ''} onChange={(e) => setSelectedUser({...selectedUser, full_name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Role</label>
                <select className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} value={selectedUser.role} onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}>
                  <option value="admin">👑 Administrator (Manager)</option>
                  <option value="clerk">👷 Warehouse Clerk (Operations)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Department</label>
                <input type="text" className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} value={selectedUser.department || ''} onChange={(e) => setSelectedUser({...selectedUser, department: e.target.value})} />
              </div>
              <div className="flex gap-2.5 pt-3">
                <button onClick={handleUpdateUser} className="flex-1 py-3 bg-[#00684a] hover:bg-[#00563b] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00684a]/20 transition-all cursor-pointer">Save Changes</button>
                <button onClick={() => setIsEditModalOpen(false)} className={`px-5 py-3 rounded-xl text-xs font-bold border cursor-pointer ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-xl text-center ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold mb-1">Delete User?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Remove <span className="font-bold text-slate-800 dark:text-white">"{selectedUser.username}"</span> from the system?
            </p>
            <div className="flex gap-2.5">
              <button onClick={handleDeleteUser} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all">Delete</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}