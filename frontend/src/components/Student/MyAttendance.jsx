import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios for real data
import { FaChartPie, FaListAlt, FaSpinner } from 'react-icons/fa';

const MyAttendance = ({ isDark }) => {
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  // Styles
  const cardClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';

  // --- REAL LOGIC (Connected to Database) ---
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Safety check: if no user is logged in
        if (!user || !user._id) {
          setLoading(false);
          return;
        }

        // 1. Call the Backend API
        const res = await axios.get(`http://localhost:5000/api/attendance/user/${user._id}`);
        const data = res.data;

        // 2. Calculate Real Stats
        const total = data.length;
        const present = data.filter(r => r.status === 'Present').length;
        const absent = total - present; 
        // Calculate Percentage (Round to nearest whole number)
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        setStats({ total, present, absent, percentage });

      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  if (loading) {
    return <div className="p-10 text-center"><FaSpinner className="animate-spin mx-auto text-2xl text-blue-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in">
      
      {/* OVERVIEW STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 1. Big Percentage Card (Logic Applied: Color changes based on %) */}
        <div className={`p-8 rounded-3xl shadow-xl flex items-center justify-between ${cardClass} relative overflow-hidden transform hover:scale-[1.02] transition-transform`}>
           <div className="z-10">
              <p className={`text-sm font-bold uppercase ${textMuted}`}>Overall Attendance</p>
              <h2 className={`text-6xl font-bold mt-4 ${stats.percentage < 75 ? 'text-red-500' : 'text-emerald-500'}`}>
                {stats.percentage}%
              </h2>
              <p className="text-sm mt-2 opacity-70 font-medium">Target: 75% required</p>
           </div>
           <div className={`z-10 p-5 rounded-full shadow-inner ${stats.percentage < 75 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <FaChartPie size={50} />
           </div>
           {/* Decorative Blur */}
           <div className={`absolute -right-10 -bottom-10 w-48 h-48 opacity-10 rounded-full blur-3xl ${stats.percentage < 75 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
        </div>

        {/* 2. Counts Card (Logic Applied: Shows real counts) */}
        <div className={`p-8 rounded-3xl shadow-xl flex flex-col justify-center ${cardClass}`}>
           <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><FaListAlt size={28} /></div>
              <div>
                 <h3 className="text-3xl font-bold">{stats.total}</h3>
                 <p className={`text-sm font-medium ${textMuted}`}>Total Lectures Conducted</p>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                 <p className="text-green-600 font-bold text-2xl">{stats.present}</p>
                 <p className="text-xs font-bold text-green-500 uppercase tracking-wider">Present</p>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                 <p className="text-red-600 font-bold text-2xl">{stats.absent}</p>
                 <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Absent</p>
              </div>
           </div>
        </div>
        
      </div>
    </div>
  );
};

export default MyAttendance;