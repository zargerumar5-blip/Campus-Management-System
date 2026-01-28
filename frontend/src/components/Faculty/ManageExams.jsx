import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaClipboardList, FaEdit, FaTimes, FaTrash, FaUsers, FaClock, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';

const ManageExams = ({ isDark }) => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]); 
  
  // --- UPDATED STATE: startTime & endTime ---
  const [scheduleData, setScheduleData] = useState({ 
    title: '', 
    subject: '', 
    date: '', 
    batch: '', 
    room: '', 
    startTime: '', 
    endTime: '' 
  });
  const [editingId, setEditingId] = useState(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const examRes = await axios.get('http://localhost:5000/api/exams');
      const sortedExams = examRes.data.sort((a, b) => a.title.localeCompare(b.title));
      setExams(sortedExams);
      
      const courseRes = await axios.get('http://localhost:5000/api/courses');
      const sortedCourses = courseRes.data.sort((a, b) => a.name.localeCompare(b.name));
      setCourses(sortedCourses);
    } catch (err) { console.error("Error fetching data"); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HANDLE SCHEDULE / UPDATE ---
  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      if(editingId) {
          await axios.put(`http://localhost:5000/api/exams/${editingId}`, scheduleData);
          alert('✅ Schedule Updated!');
          setEditingId(null);
      } else {
          await axios.post('http://localhost:5000/api/exams/schedule', scheduleData);
          alert('✅ Exam Scheduled!');
      }
      // Reset form
      setScheduleData({ title: '', subject: '', date: '', batch: '', room: '', startTime: '', endTime: '' });
      fetchData();
    } catch (err) { alert('Error scheduling exam'); }
  };

  const handleEdit = (exam) => {
      setEditingId(exam._id);
      const formattedDate = new Date(exam.date).toISOString().split('T')[0];
      setScheduleData({ 
        title: exam.title, 
        subject: exam.subject, 
        date: formattedDate,
        batch: exam.batch || '', 
        room: exam.room || '',
        startTime: exam.startTime || '', 
        endTime: exam.endTime || ''
      });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this exam?")) return;
    try { await axios.delete(`http://localhost:5000/api/exams/${id}`); fetchData(); } catch (err) { console.error(err); }
  };

  const themeClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const inputClass = isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300';

  return (
    <div className="space-y-8">
      
      {/* 1. SCHEDULE EXAM FORM */}
      <div className={`p-6 rounded-xl shadow-md border-t-4 border-indigo-600 ${themeClass}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaCalendarAlt className="mr-2 text-indigo-600" /> {editingId ? 'Edit Schedule' : 'Schedule New Exam'}
        </h2>
        <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <input type="text" placeholder="Exam Title" value={scheduleData.title} onChange={e => setScheduleData({...scheduleData, title: e.target.value})} required className={`p-2 border rounded ${inputClass}`} />
          <input type="text" placeholder="Subject" value={scheduleData.subject} onChange={e => setScheduleData({...scheduleData, subject: e.target.value})} required className={`p-2 border rounded ${inputClass}`} />
          
          <select value={scheduleData.batch} onChange={e => setScheduleData({...scheduleData, batch: e.target.value})} required className={`p-2 border rounded ${inputClass}`}>
            <option value="">-- Select Batch --</option>
            {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>

          <input type="text" placeholder="Room No" value={scheduleData.room} onChange={e => setScheduleData({...scheduleData, room: e.target.value})} required className={`p-2 border rounded ${inputClass}`} />
          
          {/* --- NEW TIME RANGE INPUTS --- */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
                <span className="text-[10px] uppercase font-bold opacity-60 ml-1">From</span>
                <input type="time" value={scheduleData.startTime} onChange={e => setScheduleData({...scheduleData, startTime: e.target.value})} required className={`w-full p-2 border rounded ${inputClass}`} />
            </div>
            <div className="flex-1">
                <span className="text-[10px] uppercase font-bold opacity-60 ml-1">To</span>
                <input type="time" value={scheduleData.endTime} onChange={e => setScheduleData({...scheduleData, endTime: e.target.value})} required className={`w-full p-2 border rounded ${inputClass}`} />
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold opacity-60 ml-1">Date</span>
            <input type="date" value={scheduleData.date} onChange={e => setScheduleData({...scheduleData, date: e.target.value})} required className={`w-full p-2 border rounded ${inputClass}`} />
          </div>
          
          <div className="md:col-span-2 lg:col-span-4 flex gap-2 mt-2">
            <button type="submit" className={`flex-1 text-white py-2 rounded font-bold ${editingId ? 'bg-yellow-600' : 'bg-indigo-600'}`}>{editingId ? 'Update' : 'Publish'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setScheduleData({ title: '', subject: '', date: '', batch: '', room: '', startTime: '', endTime: '' }); }} className="px-4 bg-gray-500 text-white rounded"><FaTimes/> Cancel</button>}
          </div>
        </form>
      </div>

      {/* 2. EXAM LIST */}
      <div className={`p-6 rounded-xl shadow-md ${themeClass}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center"><FaClipboardList className="mr-2 text-blue-600" /> Scheduled Exams</h2>
        {exams.length > 0 ? (
          <ul className="space-y-3">
            {exams.map((exam) => (
              <li key={exam._id} className={`flex flex-col md:flex-row justify-between items-center p-4 rounded-lg border-l-4 border-blue-500 shadow-sm ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="mb-2 md:mb-0">
                  <span className="font-bold block text-lg">{exam.title}</span>
                  <div className="flex flex-wrap gap-3 text-sm opacity-75 items-center mt-1">
                    <span className="flex items-center text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-900 px-2 py-0.5 rounded-full text-xs">
                      <FaUsers className="mr-1"/> {exam.batch}
                    </span>
                    {/* DISPLAY TIME RANGE */}
                    <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                      <FaClock className="mr-1"/> {exam.startTime} <FaArrowRight className="mx-1 text-[10px]"/> {exam.endTime}
                    </span>
                    <span className="flex items-center text-red-500 dark:text-red-400">
                      <FaMapMarkerAlt className="mr-1"/> {exam.room || 'N/A'}
                    </span>
                    <span>• {exam.subject}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-right block font-bold text-blue-500 mr-2">{new Date(exam.date).toLocaleDateString('en-GB')}</span>
                  <button onClick={() => handleEdit(exam)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full"><FaEdit size={18}/></button>
                  <button onClick={() => handleDelete(exam._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><FaTrash size={18}/></button>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="text-center opacity-50 py-4">No exams scheduled yet.</p>}
      </div>
    </div>
  );
};

export default ManageExams;