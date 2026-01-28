import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaChalkboardTeacher, FaBook, FaSpinner, FaLock } from 'react-icons/fa';

const StudentTimetable = ({ isDark }) => {
  const [schedule, setSchedule] = useState([]);
  const [activeDay, setActiveDay] = useState('Monday'); 
  const [loading, setLoading] = useState(true);
  
  // Stores the student's enrolled course (Auto-detected)
  const [myCourse, setMyCourse] = useState(''); 

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Styles
  const cardClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const activeTabClass = 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg transform scale-105';
  const inactiveTabClass = isDark ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-white text-gray-500 hover:bg-blue-50';

  // 1. Fetch Student Profile to get Enrolled Course
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user._id) return;

        // Fetch Profile
        const profileRes = await axios.get(`http://localhost:5000/api/students/profile/${user._id}`);
        const enrolledCourse = profileRes.data.course;

        if (enrolledCourse) {
          setMyCourse(enrolledCourse);
        } else {
          console.warn("Student is not enrolled in any course.");
        }

      } catch (err) {
        console.error("Error fetching student profile:", err);
      }
    };

    fetchStudentData();
  }, []);

  // 2. Fetch Schedule automatically when Course is detected
  useEffect(() => {
    if (!myCourse) {
        setLoading(false);
        return;
    }

    const fetchSchedule = async () => {
      setLoading(true);
      try {
        // Strictly fetch schedule for the enrolled course ONLY
        const res = await axios.get(`http://localhost:5000/api/schedule/batch/${myCourse}`);
        setSchedule(res.data);
      } catch (err) {
        console.error("Error loading schedule:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [myCourse]); 

  // Filter & Sort Schedule
  const dailySchedule = schedule
    .filter(item => item.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in">
      
      {/* HEADER (No Dropdown - Read Only) */}
      <div className={`p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center ${cardClass}`}>
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold flex items-center">
            <FaCalendarAlt className="mr-3 text-blue-500" /> My Class Timetable
          </h2>
          <p className="text-sm opacity-60 mt-1">
            Official schedule for your enrolled batch.
          </p>
        </div>

        {/* LOCKED BATCH DISPLAY */}
        <div className={`flex items-center px-6 py-3 rounded-2xl border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'}`}>
           <div className="flex flex-col text-right mr-3">
             <span className="text-[10px] uppercase font-bold opacity-60">Current Batch</span>
             <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
               {myCourse || 'Not Enrolled'}
             </span>
           </div>
           <FaLock className="text-blue-400 opacity-50" />
        </div>
      </div>

      {/* DAY TABS */}
      <div className="flex overflow-x-auto space-x-3 pb-4 custom-scrollbar">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-8 py-3 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap ${activeDay === day ? activeTabClass : inactiveTabClass}`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* SCHEDULE CARDS */}
      {loading ? (
        <div className="text-center p-10"><FaSpinner className="animate-spin text-4xl mx-auto text-blue-500"/></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dailySchedule.length > 0 ? (
            dailySchedule.map((item, index) => (
              <div key={index} className={`relative p-6 rounded-3xl shadow-lg border-l-8 border-blue-500 hover:-translate-y-1 transition duration-300 ${cardClass}`}>
                
                <div className="flex justify-between items-start mb-4">
                   <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                      <FaClock className="mr-1" /> {item.startTime} - {item.endTime}
                   </span>
                </div>

                <h3 className="text-xl font-bold mb-2 flex items-center">
                   <FaBook className="mr-2 text-gray-400 text-sm" />
                   {item.subject}
                </h3>
                
                <div className="space-y-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm opacity-80">
                   <p className="flex items-center">
                      <FaChalkboardTeacher className="mr-2 text-purple-500" /> 
                      <span>{item.facultyName || 'Faculty'}</span>
                   </p>
                   <p className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-red-500" /> 
                      <span>{item.room}</span>
                   </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center opacity-50 border-2 border-dashed rounded-3xl">
              <FaCalendarAlt size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-medium">No classes scheduled for {activeDay}.</p>
              {!myCourse && (
                <p className="text-sm mt-2 text-red-400">
                  (You are not enrolled in any course. Please contact Admin.)
                </p>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default StudentTimetable;