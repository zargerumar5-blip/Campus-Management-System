import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarPlus, FaTrash, FaClock, FaMapMarkerAlt, FaUsers, FaBook, FaEdit, FaTimes } from 'react-icons/fa';

const MySchedule = ({ isDark }) => {
  const [schedule, setSchedule] = useState([]);
  const [courses, setCourses] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // --- ADDED EDITING STATE ---
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    day: 'Monday',
    startTime: '',
    endTime: '',
    subject: '',
    batch: '',
    room: '',
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const inputClass = isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200';

  // 1. Fetch Existing Schedule & Courses
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));

      const [schRes, courseRes] = await Promise.all([
        axios.get('http://localhost:5000/api/schedule'),
        axios.get('http://localhost:5000/api/courses')
      ]);

      // Filter: Show only MY classes
      const myClasses = schRes.data.filter(item => item.facultyName === user?.name);

      // Sort: By Subject
      const sortedSchedule = myClasses.sort((a, b) => a.subject.localeCompare(b.subject));
      setSchedule(sortedSchedule);

      // Sort Courses
      const sortedCourses = courseRes.data.sort((a, b) => a.name.localeCompare(b.name));
      setCourses(sortedCourses);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const facultyName = user ? user.name : 'Faculty';
      
      const payload = { ...formData, facultyName };

      if (editingId) {
        // --- UPDATE EXISTING CLASS ---
        await axios.put(`http://localhost:5000/api/schedule/${editingId}`, payload);
        alert('✅ Class Updated Successfully!');
        setEditingId(null);
      } else {
        // --- CREATE NEW CLASS ---
        await axios.post('http://localhost:5000/api/schedule', payload);
        alert('✅ Class Added Successfully!');
      }

      // Reset Form (keep day/batch for convenience, clear others)
      setFormData({ ...formData, subject: '', room: '', startTime: '', endTime: '' });
      fetchData(); 
    } catch (err) {
      alert('Operation failed');
    }
  };

  // 3. Populate Form for Editing
  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      day: item.day,
      startTime: item.startTime,
      endTime: item.endTime,
      subject: item.subject,
      batch: item.batch,
      room: item.room,
    });
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Cancel Editing
  const handleCancel = () => {
    setEditingId(null);
    setFormData({ day: 'Monday', startTime: '', endTime: '', subject: '', batch: '', room: '' });
  };

  // 5. Delete Class
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this class?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/schedule/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto fade-in space-y-8">
      
      {/* ADD / EDIT CLASS FORM */}
      <div className={`p-8 rounded-3xl shadow-xl border-t-4 ${editingId ? 'border-yellow-500' : 'border-blue-500'} ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          {editingId ? <FaEdit className="mr-3 text-yellow-500" /> : <FaCalendarPlus className="mr-3 text-blue-500" />}
          {editingId ? 'Edit Class Details' : 'Manage Schedule'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Day */}
          <div>
            <label className="text-xs font-bold opacity-70 mb-1 block">Day</label>
            <select 
              value={formData.day} 
              onChange={e => setFormData({...formData, day: e.target.value})} 
              className={`w-full p-3 rounded-xl border outline-none ${inputClass}`}
            >
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Times */}
          <div>
            <label className="text-xs font-bold opacity-70 mb-1 block">Start Time</label>
            <input type="time" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${inputClass}`} />
          </div>
          <div>
            <label className="text-xs font-bold opacity-70 mb-1 block">End Time</label>
            <input type="time" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${inputClass}`} />
          </div>

          {/* Details */}
          <div>
            <label className="text-xs font-bold opacity-70 mb-1 block">Batch</label>
            <select 
               value={formData.batch} 
               onChange={e => setFormData({...formData, batch: e.target.value})} 
               className={`w-full p-3 rounded-xl border outline-none ${inputClass}`}
               required
            >
              <option value="">-- Select Batch --</option>
              {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold opacity-70 mb-1 block">Subject</label>
            <input type="text" placeholder="e.g. Mathematics" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${inputClass}`} />
          </div>
          <div>
            <label className="text-xs font-bold opacity-70 mb-1 block">Room No</label>
            <input type="text" placeholder="e.g. 101" required value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${inputClass}`} />
          </div>

          <div className="md:col-span-3 flex gap-3 mt-2">
            <button type="submit" className={`flex-1 font-bold py-3 rounded-xl transition shadow-lg ${editingId ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              {editingId ? 'Update Class Details' : '+ Add Class to Schedule'}
            </button>
            
            {/* Cancel Button (Only shows when editing) */}
            {editingId && (
              <button type="button" onClick={handleCancel} className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl flex items-center">
                <FaTimes className="mr-2" /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SCHEDULE LIST */}
      <div className={`p-8 rounded-3xl shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <h3 className="text-xl font-bold mb-6">My Scheduled Classes</h3>
        
        {loading ? <p>Loading...</p> : schedule.length === 0 ? <p className="opacity-50 text-center py-10">No classes added by you yet.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule.map(item => (
              <div key={item._id} className={`p-5 rounded-2xl border-l-4 border-blue-500 relative group transition hover:-translate-y-1 hover:shadow-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                
                {/* ACTION BUTTONS */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleEdit(item)} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200" title="Edit">
                    <FaEdit size={14} />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200" title="Delete">
                    <FaTrash size={14} />
                  </button>
                </div>
                
                <div className="flex justify-between items-start mb-2">
                   <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{item.day}</span>
                </div>
                
                <h4 className="font-bold text-lg mb-1 pr-16">{item.subject}</h4>
                
                <div className="text-sm opacity-70 space-y-1">
                   <p className="flex items-center gap-2"><FaClock className="text-blue-400"/> {item.startTime} - {item.endTime}</p>
                   <p className="flex items-center gap-2"><FaUsers className="text-purple-400"/> {item.batch}</p>
                   <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-red-400"/> {item.room}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default MySchedule;