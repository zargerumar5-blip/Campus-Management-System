import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserTie, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const ManageFaculty = ({ isDark }) => {
  const [facultyList, setFacultyList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', password: 'svm123', employeeId: '', department: '', designation: '', qualifications: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    try {
      // 1. Fetch & Sort Faculty (A-Z by Name)
      const fRes = await axios.get('http://localhost:5000/api/faculty');
      const sortedFaculty = fRes.data.sort((a, b) => 
        (a.userId?.name || "").localeCompare(b.userId?.name || "")
      );
      setFacultyList(sortedFaculty);

      // 2. Fetch & Sort Courses/Departments (A-Z)
      const cRes = await axios.get('http://localhost:5000/api/courses');
      const sortedCourses = cRes.data.sort((a, b) => a.name.localeCompare(b.name));
      setCourses(sortedCourses);

    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/faculty/${editingId}`, formData);
        alert('✅ Faculty Updated!');
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5000/api/faculty/add', formData);
        alert('✅ Faculty Added!');
      }
      setFormData({ name: '', email: '', password: 'svm123', employeeId: '', department: '', designation: '', qualifications: '' });
      fetchData();
    } catch (err) { alert('Operation failed'); }
  };

  const handleEdit = (fac) => {
    setEditingId(fac._id);
    setFormData({
      name: fac.userId?.name || '',
      email: fac.userId?.email || '',
      password: '', // Don't show hash
      employeeId: fac.employeeId,
      department: fac.department,
      designation: fac.designation,
      qualifications: fac.qualifications
    });
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this faculty member?")) return;
    await axios.delete(`http://localhost:5000/api/faculty/${id}`);
    fetchData();
  };

  const themeClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const inputClass = isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300';

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-xl shadow-md border-t-4 border-indigo-600 ${themeClass}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaUserTie className="mr-2 text-indigo-600" /> {editingId ? 'Edit Faculty' : 'Add Faculty'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className={`p-2 border rounded ${inputClass}`} />
          <input name="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className={`p-2 border rounded ${inputClass}`} />
          
          <input 
            type="text" 
            name="password" 
            placeholder="Password (Default: svm123)" 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            className={`p-2 border rounded ${inputClass}`} 
          />

          <input name="employeeId" placeholder="Emp ID" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} required className={`p-2 border rounded ${inputClass}`} />
          
          {/* SORTED DEPARTMENT DROPDOWN */}
          <select name="department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required className={`p-2 border rounded ${inputClass}`}>
            <option value="">Select Department</option>
            {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>

          <input name="designation" placeholder="Designation" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} required className={`p-2 border rounded ${inputClass}`} />
          <input name="qualifications" placeholder="Qualifications" value={formData.qualifications} onChange={e => setFormData({...formData, qualifications: e.target.value})} required className={`p-2 border rounded ${inputClass}`} />
          
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className={`flex-1 text-white py-2 rounded font-bold ${editingId ? 'bg-yellow-600' : 'bg-indigo-600'}`}>
                {editingId ? 'Update Faculty' : 'Add Faculty'}
            </button>
            {editingId && <button onClick={() => { setEditingId(null); setFormData({name: '', email: '', password: 'svm123', employeeId: '', department: '', designation: '', qualifications: ''}); }} type="button" className="px-4 bg-gray-500 text-white rounded"><FaTimes/></button>}
          </div>
        </form>
      </div>

      <div className={`p-6 rounded-xl shadow-md ${themeClass}`}>
        <h2 className="text-xl font-bold mb-4">Faculty List</h2>
        <table className="min-w-full text-left">
          <thead className={isDark ? 'bg-gray-700' : 'bg-gray-100'}><tr><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Dept</th><th className="p-3">Action</th></tr></thead>
          
          {/* SORTED FACULTY LIST */}
          <tbody>
            {facultyList.map((fac) => (
              <tr key={fac._id} className="border-b border-gray-700/20">
                <td className="p-3 font-bold">{fac.employeeId}</td>
                <td className="p-3">{fac.userId?.name}</td>
                <td className="p-3">{fac.department}</td>
                <td className="p-3 flex space-x-2">
                    <button onClick={() => handleEdit(fac)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                    <button onClick={() => handleDelete(fac._id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageFaculty;