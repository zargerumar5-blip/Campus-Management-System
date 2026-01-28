import React, { useState } from 'react';
import axios from 'axios';
import { FaUserCircle, FaLock, FaSave, FaCog } from 'react-icons/fa';

// ACCEPT isDark PROP
const AdminProfile = ({ isDark }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [formData, setFormData] = useState({
    name: user?.name || '', email: user?.email || '', password: '', confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage('❌ Passwords do not match!'); return;
    }
    try {
      const res = await axios.put(`http://localhost:5000/api/auth/update/${user._id}`, {
        name: formData.name, email: formData.email, password: formData.password || undefined
      });
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      setMessage('✅ Updated!');
    } catch (err) { setMessage('❌ Failed'); }
  };

  // Dynamic Classes based on Dark Mode
  const cardClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const inputClass = isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300';
  const headerClass = isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Profile Card - Always Blue/Gradient, Text is White */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-8 text-white flex items-center shadow-lg">
        <FaUserCircle size={80} className="text-blue-200" />
        <div className="ml-6">
          <h2 className="text-3xl font-bold">{user.name}</h2>
          <p className="text-blue-200 uppercase tracking-wider font-semibold">{user.role}</p>
          <p className="text-sm opacity-75 mt-1">{user.email}</p>
        </div>
      </div>

      {/* Settings Form - Colors depend on Dark Mode */}
      <div className={`rounded-xl shadow-md overflow-hidden ${cardClass}`}>
        <div className={`p-4 border-b flex items-center font-bold ${headerClass}`}>
          <FaCog className="mr-2" /> Account Settings
        </div>
        
        <div className="p-8">
          {message && <div className={`p-3 rounded mb-6 text-sm font-bold text-center ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">Personal Details</h3>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full p-2 border rounded ${inputClass}`} />
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`w-full p-2 border rounded ${inputClass}`} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">Security</h3>
              <input type="password" placeholder="New Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={`w-full p-2 border rounded ${inputClass}`} />
              <input type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className={`w-full p-2 border rounded ${inputClass}`} />
            </div>

            <div className="md:col-span-2 pt-6 border-t flex justify-end">
              <button type="submit" className="flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg font-bold">
                <FaSave className="mr-2" /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;