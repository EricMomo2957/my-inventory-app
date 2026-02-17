import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
// Assuming you have a UserSidenav or similar sidebar for users
// import UserSidenav from './UserSidenav'; 

export default function UserCalendar() {
  const [events, setEvents] = useState([]);
  const [isDarkMode] = useState(() => localStorage.getItem('landingTheme') === 'dark');

  // Load events (filtered for the specific user)
  useEffect(() => {
    // Replace with your actual user-specific endpoint if needed
    fetch('http://localhost:3000/api/schedules')
      .then(res => res.json())
      .then(data => {
        const formattedEvents = data.map(item => ({
          id: item.id,
          title: item.title || item.name,
          date: item.date,
          backgroundColor: item.category === 'Delivery' ? '#10b981' : '#6366f1',
          borderColor: 'transparent',
          extendedProps: { category: item.category }
        }));
        setEvents(formattedEvents);
      })
      .catch(err => console.error("Error loading user events:", err));
  }, []);

  return (
    <div className={`flex min-h-screen w-full transition-colors duration-300 ${isDarkMode ? 'bg-[#0b1120]' : 'bg-slate-50'}`}>
      {/* If you have a UserSidenav, uncomment it here */}
      {/* <UserSidenav /> */}

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              My Schedule
            </h1>
            <p className="text-slate-500 text-sm mt-1">Track your orders and personal appointments</p>
          </div>
          <div className="flex gap-2">
             <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span className="w-3 h-3 rounded-full bg-[#10b981]"></span> Deliveries
             </span>
             <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span className="w-3 h-3 rounded-full bg-[#6366f1]"></span> Tasks
             </span>
          </div>
        </header>

        {/* CALENDAR CARD */}
        <div className={`rounded-3xl p-6 shadow-2xl ${isDarkMode ? 'bg-[#111827] border border-slate-800' : 'bg-white border border-slate-200'}`}>
          <div className={`calendar-container ${isDarkMode ? 'dark-calendar' : ''}`}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              height="650px"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek'
              }}
              eventClick={(info) => {
                alert(`Event: ${info.event.title}\nCategory: ${info.event.extendedProps.category}`);
              }}
            />
          </div>
        </div>
      </main>

      <style jsx="true">{`
        /* Toolbar Styling */
        .fc-toolbar-title { 
            color: ${isDarkMode ? '#ffffff' : '#1e293b'} !important;
            font-weight: 900 !important; 
            font-size: 1.25rem !important; 
            text-transform: uppercase;
        }
        
        /* Button Styling */
        .fc-button-primary { 
            background-color: #4361ee !important; 
            border: none !important; 
            font-weight: bold !important;
            border-radius: 12px !important;
            padding: 8px 16px !important;
        }
        .fc-button-primary:hover { background-color: #3730a3 !important; }

        /* Calendar Grid Styling */
        .fc-theme-standard td, .fc-theme-standard th {
            border-color: ${isDarkMode ? '#1e293b' : '#e2e8f0'} !important;
        }
        
        .fc-daygrid-day-number {
            color: ${isDarkMode ? '#94a3b8' : '#64748b'} !important;
            font-weight: 700;
            padding: 10px !important;
        }

        .fc-col-header-cell-cushion {
            color: #64748b !important;
            text-transform: uppercase;
            font-size: 0.75rem;
            font-weight: 900;
            padding: 10px 0 !important;
        }

        /* Event Styling */
        .fc-event {
            border-radius: 6px !important;
            padding: 2px 4px !important;
            font-size: 0.75rem !important;
            font-weight: 700 !important;
            cursor: pointer;
        }
      `}</style>
    </div>
  );
}