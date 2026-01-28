import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserPlus, FaUserGraduate, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const AddStudent = ({ isDark }) => {
  // Form State
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: 'student123', 
    rollNum: '', 
    course: '', 
    batch: '', 
    dob: '' 
  });
  
  // State for Editing
  const [editingId, setEditingId] = useState(null);

  // Data State
  const [courses, setCourses] = useState([]); 
  const [recentStudents, setRecentStudents] = useState([]); 

  // Fetch Data
  const fetchData = async () => {
    try {
      // 1. Fetch & Sort Courses (A-Z)
      const cRes = await axios.get('http://localhost:5000/api/courses');
      const sortedCourses = cRes.data.sort((a, b) => a.name.localeCompare(b.name));
      setCourses(sortedCourses);

      // 2. Fetch Students
      const sRes = await axios.get('http://localhost:5000/api/students');
      
      // Get the 10 most recently added students (Reverse + Slice)
      let recentList = sRes.data.reverse().slice(0, 10);

      // Sort these 10 students Alphabetically by Name (A-Z)
      recentList.sort((a, b) => (a.userId?.name || "").localeCompare(b.userId?.name || ""));

      setRecentStudents(recentList); 
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLE SUBMIT (ADD or UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // === UPDATE MODE ===
        await axios.put(`http://localhost:5000/api/students/${editingId}`, formData);
        alert('✅ Student Updated Successfully!');
        setEditingId(null);
      } else {
        // === ADD MODE ===
        // 1. Create Login Account
        const userRes = await axios.post('http://localhost:5000/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'student'
        });

        // 2. Create Student Profile
        await axios.post('http://localhost:5000/api/students/add', {
          userId: userRes.data._id,
          rollNum: formData.rollNum,
          course: formData.course,
          batch: formData.batch,
          dob: formData.dob
        });
        alert('✅ Student Admitted Successfully!');
      }
      
      // Reset Form & Refresh
      setFormData({ name: '', email: '', password: 'student123', rollNum: '', course: '', batch: '', dob: '' });
      fetchData();

    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.message || 'Operation failed'));
    }
  };

  // --- HANDLE EDIT CLICK ---
  const handleEdit = (student) => {
    setEditingId(student._id);
    
    // Populate form with existing data
    setFormData({
      name: student.userId?.name || '',
      email: student.userId?.email || '',
      password: '', // Leave blank when editing
      rollNum: student.rollNum,
      course: student.course,
      batch: student.batch,
      dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : ''
    });
  };

  // --- HANDLE DELETE ---
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure? This will delete the student and their login.")) return;
    try {
        await axios.delete(`http://localhost:5000/api/students/${id}`);
        fetchData(); 
    } catch (err) {
        alert("Delete failed: " + err.message);
    }
  };

  // --- CANCEL EDIT ---
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: 'student123', rollNum: '', course: '', batch: '', dob: '' });
  };

  // Styles
  const themeClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const inputClass = isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300';

  return (
    <div className="space-y-8">
      
      {/* 1. ADMISSION / EDIT FORM */}
      <div className={`p-8 rounded-xl shadow-md border-t-4 border-indigo-600 ${themeClass}`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
          <span className="flex items-center">
            {editingId ? <FaEdit className="mr-3 text-yellow-500"/> : <FaUserPlus className="mr-3 text-indigo-600"/>}
            {editingId ? 'Edit Student Details' : 'New Student Admission'}
          </span>
          {editingId && (
            <button onClick={cancelEdit} className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition flex items-center">
              <FaTimes className="mr-1"/> Cancel
            </button>
          )}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="flex flex-col">
             <label className="text-xs opacity-70 mb-1">Full Name</label>
             <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`border p-2 rounded ${inputClass}`} required />
          </div>

          <div className="flex flex-col">
             <label className="text-xs opacity-70 mb-1">Email Address</label>
             <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`border p-2 rounded ${inputClass}`} required />
          </div>

          <div className="flex flex-col">
             <label className="text-xs opacity-70 mb-1">Roll Number</label>
             <input type="text" placeholder="e.g. CS-2024-001" value={formData.rollNum} onChange={e => setFormData({...formData, rollNum: e.target.value})} className={`border p-2 rounded ${inputClass}`} required />
          </div>
          
          <div className="flex flex-col">
             <label className="text-xs opacity-70 mb-1">Select Course</label>
             <select value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className={`border p-2 rounded ${inputClass}`} required>
               <option value="">-- Choose Course --</option>
               {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
             </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs opacity-70 mb-1">Date of Birth</label>
            <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className={`border p-2 rounded ${inputClass}`} required />
          </div>

          <div className="flex flex-col">
             <label className="text-xs opacity-70 mb-1">Batch Year</label>
             <input type="text" placeholder="e.g. 2024-2025" value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} className={`border p-2 rounded ${inputClass}`} required />
          </div>

          {/* Password field - Only required when adding new */}
          {!editingId && (
             <div className="flex flex-col md:col-span-2">
                <label className="text-xs opacity-70 mb-1">Default Password</label>
                <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={`border p-2 rounded ${inputClass}`} required />
             </div>
          )}

          <button type="submit" className={`md:col-span-2 text-white py-3 rounded font-bold transition shadow-lg flex items-center justify-center ${editingId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {editingId ? <><FaSave className="mr-2"/> Update Student</> : <><FaUserPlus className="mr-2"/> Admit Student</>}
          </button>
        </form>
      </div>

      {/* 2. RECENT ADMISSIONS LIST (Sorted A-Z) */}
      <div className={`p-6 rounded-xl shadow-md ${themeClass}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaUserGraduate className="mr-2 opacity-75" /> Recent Admissions
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-100'}>
              <tr>
                <th className="p-3">Roll No</th>
                <th className="p-3">Name</th>
                <th className="p-3">Course</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.map((s) => (
                <tr key={s._id} className={`border-b border-gray-700/20 hover:bg-gray-500/10 ${editingId === s._id ? 'bg-yellow-50/10 border-l-4 border-yellow-500' : ''}`}>
                  <td className="p-3 font-bold">{s.rollNum}</td>
                  <td className="p-3">{s.userId?.name}</td>
                  <td className="p-3">{s.course}</td>
                  <td className="p-3 flex space-x-2">
                    <button 
                      onClick={() => handleEdit(s)} 
                      className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-100 transition"
                      title="Edit Student"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(s._id)} 
                      className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-100 transition"
                      title="Delete Student"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;