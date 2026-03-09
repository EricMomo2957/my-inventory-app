import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

export default function AdminReports() {
  const { isDark } = useTheme();
  const [data, setData] = useState({
    categoryData: [],
    userRoleData: [],
    stockMovements: []
  });

  useEffect(() => {
    // In a real app, you would fetch this from your API
    // This mockup matches your database structure
    const fetchData = async () => {
      // Example data based on your "Dashboard" and "Users" images
      setData({
        categoryData: [
          { name: 'Vegetables', value: 4 },
          { name: 'Fruits', value: 4 },
          { name: 'Supplies', value: 10 },
          { name: 'Canned Goods', value: 15 },
        ],
        userRoleData: [
          { name: 'Admins', value: 2 },
          { name: 'Clerks', value: 5 },
          { name: 'Managers', value: 1 },
        ],
        stockMovements: [
          { day: 'Mon', restock: 20, sale: 15 },
          { day: 'Tue', restock: 40, sale: 10 },
          { day: 'Wed', restock: 10, sale: 25 },
          { day: 'Thu', restock: 30, sale: 5 },
        ]
      });
    };
    fetchData();
  }, []);

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

  return (
    <div className={`p-8 space-y-8 min-h-screen ${isDark ? 'bg-[#0b1120]' : 'bg-slate-50'}`}>
      <header>
        <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>System Analytics</h1>
        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Visualizing Products, Users, and Stock Flow</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BAR CHART: Stock by Category */}
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className={`mb-6 font-bold uppercase text-xs tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Inventory Distribution (Bar)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <BarChart data={data.categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none' }}
                  itemStyle={{ color: '#f97316' }}
                />
                <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: User Roles */}
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className={`mb-6 font-bold uppercase text-xs tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Staff Role Composition (Pie)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.userRoleData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LINE CHART: Activity Trends */}
        <div className={`p-6 rounded-3xl border col-span-1 lg:col-span-2 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className={`mb-6 font-bold uppercase text-xs tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Weekly Stock Activity Trend</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <LineChart data={data.stockMovements}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="day" stroke={isDark ? '#94a3b8' : '#64748b'} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '12px' }} />
                <Legend />
                <Line type="monotone" dataKey="restock" stroke="#f97316" strokeWidth={3} dot={{ r: 6 }} />
                <Line type="monotone" dataKey="sale" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}