import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import AdminSideNav from './admin_sidenav'; // Path alignment

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ title: '', date: '', category: 'Work Task' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Load events from backend
  useEffect(() => {
    fetch('http://localhost:3000/api/schedules')
      .then(res => res.json())
      .then(data => {
        const formattedEvents = data.map(item => ({
          id: item.id,
          title: item.title || item.name,
          date: item.date,
          category: item.category,
          backgroundColor: item.category === 'Delivery' ? '#10b981' : '#4361ee',
          borderColor: 'transparent',
          allDay: true
        }));
        setEvents(formattedEvents);
      })
      .catch(err => console.error("Error loading events:", err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this event?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/schedules/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setEvents(prev => prev.filter(event => event.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const startEdit = (event) => {
    setIsEditing(true);
    setEditId(event.id);
    const formattedDate = new Date(event.date).toISOString().split('T')[0];
    setFormData({
      title: event.title,
      date: formattedDate,
      category: event.category || 'Work Task'
    });
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return alert("Please fill in all fields");

    const url = isEditing 
      ? `http://localhost:3000/api/schedules/${editId}` 
      : 'http://localhost:3000/api/schedules';
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsEditing(false);
        setEditId(null);
        setFormData({ title: '', date: '', category: 'Work Task' });
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b1120] transition-colors duration-500">
      {/* Sidebar Integration */}
      <AdminSideNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        <header className="p-8 border-b border-slate-200 dark:border-slate-800/50 flex justify-between items-center bg-white/50 dark:bg-transparent backdrop-blur-md">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              📅 Schedule
            </h1>
            <p className="text-slate-500 text-sm font-medium">Manage arrivals and team operations</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Calendar Card */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl transition-colors">
            <div className="calendar-wrapper">
              <FullCalendar
                plugins={[daygridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                height="500px"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek'
                }}
                eventClick={(info) => {
                    const evt = events.find(e => e.id == info.event.id);
                    if(evt) startEdit(evt);
                }}
              />
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-8 pb-10">
            {/* Form Section */}
            <aside className="w-full xl:w-96 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl h-fit">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">
                {isEditing ? '📝 Edit Entry' : '➕ Add Entry'}
              </h2>
              <form onSubmit={handleSaveEntry} className="space-y-5">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Event Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-[#4361ee] transition-all"
                    placeholder="e.g. Bulk Delivery"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Target Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-[#4361ee] color-scheme-light dark:color-scheme-dark"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Category</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-[#4361ee]"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Work Task">💼 Work Task</option>
                    <option value="Delivery">🚚 Delivery</option>
                    <option value="Inventory Check">📋 Inventory Check</option>
                    <option value="Supplier Meeting">🤝 Supplier Meeting</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    type="submit"
                    className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 ${
                      isEditing ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-[#4361ee] hover:bg-indigo-500 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {isEditing ? 'Update Schedule' : 'Add to Calendar'}
                  </button>
                  
                  {isEditing && (
                    <button 
                      type="button"
                      onClick={() => { setIsEditing(false); setFormData({title:'', date:'', category:'Work Task'}); }}
                      className="w-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-3 rounded-xl text-xs hover:bg-slate-300 dark:hover:bg-slate-700"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </aside>

            {/* List Section */}
            <main className="flex-1 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-5 px-8 text-[10px] font-black uppercase text-slate-500 tracking-widest">Date</th>
                    <th className="p-5 px-8 text-[10px] font-black uppercase text-slate-500 tracking-widest">Event Description</th>
                    <th className="p-5 px-8 text-[10px] font-black uppercase text-slate-500 text-right tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {events.length > 0 ? events.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="p-5 px-8 text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-5 px-8 text-sm font-bold text-slate-900 dark:text-white">
                        <span className={`w-2 h-2 rounded-full inline-block mr-3`} style={{ backgroundColor: event.backgroundColor }}></span>
                        {event.title}
                      </td>
                      <td className="p-5 px-8 text-right space-x-2">
                        <button 
                          onClick={() => startEdit(event)}
                          className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-[#4361ee] hover:text-white transition-all"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(event.id)}
                          className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-500 hover:text-white transition-all"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="p-20 text-center text-slate-400 italic font-medium">
                        No events scheduled for this month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </main>
          </div>
        </div>
      </div>

      <style jsx>{`
        .calendar-wrapper :global(.fc) {
          --fc-border-color: rgba(203, 213, 225, 0.2);
          --fc-button-bg-color: #4361ee;
          --fc-button-border-color: transparent;
          --fc-button-hover-bg-color: #3b82f6;
          --fc-page-bg-color: transparent;
        }
        .calendar-wrapper :global(.fc-theme-standard td), 
        .calendar-wrapper :global(.fc-theme-standard th) {
          border-color: var(--fc-border-color);
        }
        .calendar-wrapper :global(.fc-daygrid-day-number) {
            color: #64748b;
            font-weight: 800;
            padding: 8px;
            text-decoration: none !important;
        }
        .calendar-wrapper :global(.fc-col-header-cell-cushion) {
            color: #94a3b8;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.1em;
            font-weight: 900;
            padding: 10px 0;
            text-decoration: none !important;
        }
        .calendar-wrapper :global(.fc-toolbar-title) {
          font-weight: 900 !important;
          color: #1e293b;
          font-size: 1.25rem !important;
        }
        :global(.dark) .calendar-wrapper :global(.fc-toolbar-title) {
          color: #f8fafc;
        }
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </div>
  );
}