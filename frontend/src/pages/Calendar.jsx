import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ title: '', date: '', category: 'Work Task' });

  // Load events from your backend
  useEffect(() => {
    fetch('http://localhost:3000/api/schedules')
      .then(res => res.json())
      .then(data => {
        // FullCalendar expects 'title' and 'date' fields
        const formattedEvents = data.map(item => ({
          id: item.id,
          title: item.title || item.name,
          date: item.date,
          backgroundColor: item.category === 'Delivery' ? '#10b981' : '#3b82f6',
          borderColor: 'transparent'
        }));
        setEvents(formattedEvents);
      })
      .catch(err => console.error("Error loading events:", err));
  }, []);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return alert("Please fill in all fields");

    try {
      const response = await fetch('http://localhost:3000/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        window.location.reload(); // Refresh to show new event
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <div className="p-6 h-screen bg-[#0b1120] text-slate-300 overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          📅 Delivery & Task Schedule
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage upcoming stock arrivals and team tasks</p>
      </header>

      {/* TOP SECTION: THE ACTUAL CALENDAR COMPONENT */}
      <div className="bg-white rounded-xl p-4 mb-8 shadow-2xl calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="450px"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          eventClick={(info) => alert('Event: ' + info.event.title)}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* SIDEBAR: ADD ENTRY */}
        <aside className="w-full lg:w-80 bg-[#111827] rounded-xl border border-slate-800 p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Add New Entry</h2>
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Event Name</label>
              <input 
                type="text" 
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                placeholder="e.g. Harvest Festival"
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Target Date</label>
              <input 
                type="date" 
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white color-scheme-dark outline-none"
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Category</label>
              <select 
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white outline-none"
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Work Task">💼 Work Task</option>
                <option value="Delivery">🚚 Delivery</option>
                <option value="Inventory Check">📋 Inventory Check</option>
              </select>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-lg mt-4 transition-all shadow-lg shadow-blue-500/20">
              Add to Calendar
            </button>
          </form>
        </aside>

        {/* TABLE LIST: AS SEEN IN IMAGE_8B8A96.PNG */}
        <main className="flex-1 bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0b1120] border-b border-slate-800">
              <tr>
                <th className="p-4 px-6 text-[10px] font-black uppercase text-slate-500">Date</th>
                <th className="p-4 px-6 text-[10px] font-black uppercase text-slate-500">Event Description</th>
                <th className="p-4 px-6 text-[10px] font-black uppercase text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {events.map((event, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="p-4 px-6 text-sm text-slate-400">{event.date}</td>
                  <td className="p-4 px-6 text-sm font-bold text-white">{event.title}</td>
                  <td className="p-4 px-6 text-center space-x-2">
                    <button className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded text-[10px] font-bold border border-blue-500/20">Edit</button>
                    <button className="bg-red-500/10 text-red-500 px-3 py-1 rounded text-[10px] font-bold border border-red-500/20">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>

      <style jsx>{`
        .calendar-container { color: #334155; }
        .fc-toolbar-title { font-weight: 900 !important; font-size: 1.25rem !important; }
        .fc-button-primary { background-color: #3b82f6 !important; border: none !important; text-transform: capitalize !important; font-weight: bold !important; }
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </div>
  );
}