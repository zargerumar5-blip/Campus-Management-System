import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUserCheck, FaUserTimes, FaSave, FaCheckDouble, 
  FaSpinner, FaBookOpen, FaFileDownload, FaCheckCircle, FaEdit, FaCalendarAlt
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- NEW IMPORTS FOR CUSTOM CALENDAR ---
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// ---------------------------------------

const MarkAttendance = ({ isDark }) => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  // View States
  const [isMarked, setIsMarked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState(''); 
  const [attendanceState, setAttendanceState] = useState({}); 

  // --- NEW STATE: Dates that already have attendance ---
  const [markedDates, setMarkedDates] = useState([]);

  const cardClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const inputClass = isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200';

  // 1. Fetch Init Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, courseRes] = await Promise.all([
          axios.get('http://localhost:5000/api/students'),
          axios.get('http://localhost:5000/api/courses')
        ]);
        setStudents(studentRes.data);
        setCourses(courseRes.data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // 2. Load Daily Data (When Date or Course Changes)
  useEffect(() => {
    const loadDailyData = async () => {
      if (!selectedCourse || !selectedDate) {
        setFilteredStudents([]);
        return;
      }

      setLoading(true);
      setMessage('');
      setIsEditing(false);

      // Format Date for API (YYYY-MM-DD)
      const offsetDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
      const dateStr = offsetDate.toISOString().split('T')[0];

      try {
        // A. Filter Students
        const filtered = students.filter(s => s.course === selectedCourse);
        filtered.sort((a, b) => (a.userId?.name || "").localeCompare(b.userId?.name || ""));
        setFilteredStudents(filtered);

        // B. Fetch Existing Attendance
        const attRes = await axios.get(`http://localhost:5000/api/attendance/batch/${selectedCourse}/${dateStr}`);
        const existingRecords = attRes.data;

        const statusMap = {};
        if (existingRecords.length > 0) {
          setIsMarked(true);
          filtered.forEach(s => {
            const record = existingRecords.find(r => r.studentId === s._id);
            statusMap[s._id] = record ? record.status : 'Present';
          });
        } else {
          setIsMarked(false);
          filtered.forEach(s => statusMap[s._id] = 'Present');
        }
        setAttendanceState(statusMap);

      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };

    loadDailyData();
  }, [selectedCourse, selectedDate, students]);

  // 3. Fetch Monthly "Marked" Dates (For Calendar Visuals)
  useEffect(() => {
    const fetchMonthlyStatus = async () => {
      if (!selectedCourse) return;
      
      try {
        const offsetDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
        const monthStr = offsetDate.toISOString().substring(0, 7); // YYYY-MM

        const res = await axios.get(`http://localhost:5000/api/attendance/report/${selectedCourse}/${monthStr}`);
        
        // Extract unique dates that have records
        const uniqueDates = [...new Set(res.data.map(item => item.date))];
        const dateObjects = uniqueDates.map(dateStr => new Date(dateStr));
        setMarkedDates(dateObjects);

      } catch (err) { console.error(err); }
    };

    fetchMonthlyStatus();
  }, [selectedCourse, selectedDate]); 

  // 4. Submit
  const handleSubmit = async () => {
    if (!selectedCourse || !selectedDate) return;

    setSubmitting(true);
    const offsetDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
    const dateStr = offsetDate.toISOString().split('T')[0];

    try {
      const promises = filteredStudents.map(student => {
        return axios.post('http://localhost:5000/api/attendance', {
          studentId: student._id,
          date: dateStr,
          batch: selectedCourse, 
          status: attendanceState[student._id]
        });
      });

      await Promise.all(promises);
      setMessage({ type: 'success', text: 'Attendance Saved Successfully!' });
      setIsMarked(true);
      setIsEditing(false);
      
      // Refresh the "Marked Dates" list
      const monthStr = dateStr.substring(0, 7); 
      const res = await axios.get(`http://localhost:5000/api/attendance/report/${selectedCourse}/${monthStr}`);
      const uniqueDates = [...new Set(res.data.map(item => item.date))];
      setMarkedDates(uniqueDates.map(d => new Date(d)));

    } catch (err) { setMessage({ type: 'error', text: 'Failed to save.' }); } 
    finally { setSubmitting(false); }
  };

  // 5. Download PDF
  const handleDownloadReport = async () => {
    if (!selectedCourse) return alert("Select Course first.");
    const offsetDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
    const monthStr = offsetDate.toISOString().substring(0, 7);

    try {
      const res = await axios.get(`http://localhost:5000/api/attendance/report/${selectedCourse}/${monthStr}`);
      const monthlyRecords = res.data;
      const doc = new jsPDF();
      
      doc.setFontSize(18); doc.text(`Attendance Report: ${selectedCourse}`, 14, 20);
      doc.setFontSize(12); doc.text(`Month: ${monthStr}`, 14, 28);
      doc.line(14, 32, 196, 32);

      const tableRows = filteredStudents.map(student => {
        const studentRecords = monthlyRecords.filter(r => r.studentId === student._id);
        const present = studentRecords.filter(r => r.status === 'Present').length;
        const absent = studentRecords.filter(r => r.status === 'Absent').length;
        const total = present + absent;
        const percentage = total > 0 ? Math.round((present / total) * 100) + '%' : '0%';
        return [student.rollNum, student.userId?.name || 'Unknown', present, absent, percentage];
      });

      autoTable(doc, { startY: 35, head: [['Roll No', 'Student Name', 'Present', 'Absent', '%']], body: tableRows });
      doc.save(`${selectedCourse}_Attendance_${monthStr}.pdf`);
    } catch (err) { alert("Failed to generate report."); }
  };

  // --- CUSTOM CALENDAR RENDERER ---
  const renderDayContents = (day, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isMarkedDay = markedDates.some(d => d.toISOString().split('T')[0] === dateStr);

    return (
      <div className="relative flex flex-col items-center justify-center h-full w-full">
        <span>{day}</span>
        {isMarkedDay && (
          <div className="absolute -bottom-1 text-green-500">
            <FaCheckCircle size={10} />
          </div>
        )}
      </div>
    );
  };

  const toggleStatus = (id) => {
    setAttendanceState(prev => ({ ...prev, [id]: prev[id] === 'Present' ? 'Absent' : 'Present' }));
  };

  // Stats
  const presentCount = Object.values(attendanceState).filter(s => s === 'Present').length;
  const absentCount = Object.values(attendanceState).filter(s => s === 'Absent').length;

  return (
    <div className="max-w-5xl mx-auto fade-in">
      
      {/* GLOBAL CSS FOR DATEPICKER */}
      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker__input-container input { width: 100%; padding: 0.75rem; padding-left: 2.5rem; border-radius: 0.75rem; border: 1px solid #e5e7eb; outline: none; }
        .dark-picker .react-datepicker__input-container input { background-color: #374151; color: white; border-color: #4b5563; }
        .react-datepicker__day--selected { background-color: #2563eb !important; color: white !important; font-weight: bold; border-radius: 50%; }
        .react-datepicker__day--keyboard-selected { background-color: #93c5fd !important; color: black !important; }
        .react-datepicker__day--disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className={`p-8 rounded-3xl shadow-xl mb-8 ${cardClass}`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <FaUserCheck className="mr-3 text-emerald-500" /> Mark Attendance
        </h2>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
           
           {/* Custom Date Picker */}
           <div>
             <label className="text-xs font-bold uppercase mb-2 block opacity-70">Date</label>
             <div className={`relative ${isDark ? 'dark-picker' : ''}`}>
               <FaCalendarAlt className="absolute left-3 top-3.5 opacity-50 z-10" />
               <DatePicker 
                 selected={selectedDate} 
                 onChange={(date) => setSelectedDate(date)} 
                 dateFormat="yyyy-MM-dd"
                 placeholderText="Select Date"
                 renderDayContents={renderDayContents} 
                 className="w-full"
                 maxDate={new Date()} // <--- DISABLES FUTURE DATES
               />
             </div>
           </div>

           <div>
             <label className="text-xs font-bold uppercase mb-2 block opacity-70">Select Course</label>
             <div className="relative">
               <FaBookOpen className="absolute left-3 top-3.5 opacity-50" />
               <select 
                 value={selectedCourse} 
                 onChange={e => setSelectedCourse(e.target.value)} 
                 className={`w-full pl-10 p-3 rounded-xl border outline-none ${inputClass}`}
               >
                 <option value="">-- Choose Course --</option>
                 {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
               </select>
             </div>
           </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl mb-6 text-center font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* --- VIEW 1: READ-ONLY SUMMARY (LOCKED VIEW) --- */}
        {isMarked && !isEditing && filteredStudents.length > 0 && (
          <div className="animate-fade-in">
             <div className={`p-6 rounded-2xl border-l-4 border-green-500 mb-6 ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
               <div className="flex justify-between items-center">
                 <div>
                    <h3 className="text-lg font-bold flex items-center text-green-700 dark:text-green-400">
                      <FaCheckDouble className="mr-2"/> Attendance Marked
                    </h3>
                    <p className="text-sm opacity-70">
                      Present: <strong>{presentCount}</strong> | Absent: <strong>{absentCount}</strong>
                    </p>
                 </div>
                 <button 
                   onClick={() => setIsEditing(true)}
                   className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 shadow-sm rounded-lg text-sm font-bold hover:bg-gray-100 transition"
                 >
                   <FaEdit /> Edit List
                 </button>
               </div>
             </div>
             
             {/* Report Button Only */}
             <div className="mt-8 flex justify-end">
               <button onClick={handleDownloadReport} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg">
                 <FaFileDownload /> Monthly Report
               </button>
             </div>
          </div>
        )}

        {/* --- VIEW 2: MARKING INTERFACE (EDITABLE) --- */}
        {(!isMarked || isEditing) && filteredStudents.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold opacity-70">Tap to toggle Present / Absent</h3>
               {isEditing && <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Editing Mode</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredStudents.map((student) => (
                <div 
                  key={student._id} 
                  onClick={() => toggleStatus(student._id)}
                  className={`p-4 rounded-2xl border-l-4 cursor-pointer transition-all shadow-sm flex items-center justify-between
                    ${attendanceState[student._id] === 'Present' 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'} 
                    ${isDark ? 'bg-gray-800' : 'bg-white'}
                  `}
                >
                  <div>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {student.userId?.name || 'Student Name'}
                    </h4>
                    <p className="text-xs opacity-60">{student.rollNum} • {student.batch}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-colors ${attendanceState[student._id] === 'Present' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {attendanceState[student._id] === 'Present' ? <FaCheckDouble size={14} /> : <FaUserTimes size={14} />}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              {isEditing && (
                <button onClick={() => setIsEditing(false)} className="px-6 py-4 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600">
                  Cancel
                </button>
              )}
              <button 
                onClick={handleSubmit} 
                disabled={submitting}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all 
                  ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}
                `}
              >
                {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                {submitting ? 'Saving...' : (isEditing ? 'Update Attendance' : 'Submit Attendance')}
              </button>
            </div>
          </div>
        )}

        {/* NO STUDENTS */}
        {selectedCourse && filteredStudents.length === 0 && !loading && (
           <div className="text-center py-10 opacity-50 border-2 border-dashed rounded-3xl">
             No students found in the course <strong>{selectedCourse}</strong>.
           </div>
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;