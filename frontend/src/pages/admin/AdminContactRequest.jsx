import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { MessageSquare, RefreshCw, Trash2, Mail } from 'lucide-react';
import AdminHeader from './AdminHeader';
import TablePagination from '../../components/TablePagination';

export default function AdminContactRequest() {
  const { isDark } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const pageSize = 8;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/contact-requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`http://localhost:3000/api/contact-requests/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      setRequests(requests.filter(req => req.id !== id));
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete the message.');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => 
    (req.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.message || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedRequests = isExpanded
    ? filteredRequests
    : filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Top Header Bar */}
      <AdminHeader 
        title="Contact Inquiries"
        subtitle="Customer Feedback & Support Requests"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="flex-1 overflow-y-auto p-8 space-y-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Contact Inquiries & Feedback
            </h1>
            <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Review incoming user feedback, support requests, and messages
            </p>
          </div>

          <button 
            onClick={fetchRequests}
            className={`p-2.5 rounded-xl border transition-colors ${
              isDark ? 'border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title="Refresh Inquiries"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      <div className={`rounded-3xl border shadow-sm ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className={`${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500'} font-black uppercase tracking-widest text-[10px]`}>
              <tr>
                <th className="p-5">Timestamp</th>
                <th className="p-5">Name</th>
                <th className="p-5">Email</th>
                <th className="p-5">Message</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center font-bold animate-pulse text-slate-500">Retrieving Inquiries...</td></tr>
              ) : displayedRequests.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500 italic">No inquiries found.</td></tr>
              ) : (
                displayedRequests.map((req) => (
                  <tr key={req.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`}>
                    <td className="p-5 text-[11px] font-mono">{new Date(req.created_at).toLocaleString()}</td>
                    <td className="p-5 font-bold">{req.name}</td>
                    <td className="p-5">{req.email}</td>
                    <td className="p-5 max-w-sm">
                      <p className="truncate hover:text-clip hover:whitespace-normal cursor-help" title={req.message}>
                        {req.message}
                      </p>
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => handleDelete(req.id)}
                        disabled={deletingId === req.id}
                        className={`font-bold uppercase text-[10px] ${deletingId === req.id ? 'text-slate-500 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}`}
                      >
                        {deletingId === req.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Component */}
      {filteredRequests.length > 0 && (
        <TablePagination 
          currentPage={currentPage}
          totalItems={filteredRequests.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          itemLabel="inquiries"
        />
      )}
      </div>
    </div>
  );
}