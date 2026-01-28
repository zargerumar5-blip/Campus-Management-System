import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook, FaTrash, FaEdit, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

const ManageCourses = ({ isDark }) => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [editingId, setEditingId] = useState(null); // Track which ID is being edited

  // Fetch all courses & SORT A-Z
  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/courses');
      
      // --- SORTING LOGIC ADDED HERE (By Name A-Z) ---
      const sortedCourses = res.data.sort((a, b) => a.name.localeCompare(b.name));
      
      setCourses(sortedCourses);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // UPDATE Logic
        await axios.put(`http://localhost:5000/api/courses/${editingId}`, form);
        alert('✅ Course Updated!');
        setEditingId(null);
      } else {
        // CREATE Logic
        await axios.post('http://localhost:5000/api/courses/add', form);
        alert('✅ Course Added!');
      }
      setForm({ name: '', code: '', description: '' });
      fetchCourses();
    } catch (err) { alert('Operation failed'); }
  };

  const handleEdit = (course) => {
    setEditingId(course._id);
    setForm({ name: course.name, code: course.code, description: course.description });
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this course?")) return;
    await axios.delete(`http://localhost:5000/api/courses/${id}`);
    fetchCourses();
  };

  const cardClass = isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200';
  const inputClass = isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* FORM */}
      <div className={`p-6 rounded-xl shadow-md border ${cardClass}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          {editingId ? <FaEdit className="mr-2 text-yellow-500"/> : <FaBook className="mr-2 text-indigo-500"/>} 
          {editingId ? 'Edit Course' : 'Manage Courses'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Course Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={`p-2 border rounded ${inputClass}`} required />
          <input placeholder="Code (e.g. BSC-01)" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className={`p-2 border rounded ${inputClass}`} required />
          <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className={`p-2 border rounded ${inputClass}`} />
          
          <div className="md:col-span-3 flex gap-2">
            <button type="submit" className={`flex-1 py-2 rounded font-bold text-white flex items-center justify-center ${editingId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
               {editingId ? <><FaSave className="mr-2"/> Update Course</> : <><FaPlus className="mr-2"/> Add Course</>}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', code: '', description: '' }); }} className="px-4 bg-gray-500 text-white rounded hover:bg-gray-600">
                <FaTimes />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST (Sorted A-Z) */}
      <div className={`p-6 rounded-xl shadow-md border ${cardClass}`}>
        <h3 className="font-bold mb-4">Existing Courses</h3>
        <table className="w-full text-left">
          <thead className={isDark ? 'bg-gray-700' : 'bg-gray-100'}>
            <tr><th className="p-3">Name</th><th className="p-3">Code</th><th className="p-3">Description</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c._id} className="border-b border-gray-700/20">
                <td className="p-3 font-semibold">{c.name}</td>
                <td className="p-3 opacity-75">{c.code}</td>
                <td className="p-3 text-sm opacity-70">{c.description}</td>
                <td className="p-3 flex space-x-2">
                  <button onClick={() => handleEdit(c)} className="text-blue-500 hover:text-blue-600 p-2 bg-blue-50 rounded"><FaEdit/></button>
                  <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:text-red-600 p-2 bg-red-50 rounded"><FaTrash/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCourses;