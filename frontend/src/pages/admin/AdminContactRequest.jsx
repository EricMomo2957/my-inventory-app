import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function AdminContactRequest() {
  const { isDark } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // Track which item is being deleted

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

  return (
    <div className={`p-8 space-y-8 min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0b1120]' : 'bg-slate-50'}`}>
      <header>
        <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Contact Inquiries</h1>
        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Reviewing user feedback and support requests.
        </p>
      </header>

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
              ) : requests.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500 italic">No inquiries found.</td></tr>
              ) : (
                requests.map((req) => (
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
    </div>
  );
}