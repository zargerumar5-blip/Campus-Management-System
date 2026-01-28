import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle, FaEnvelope, FaLock, FaSave, FaEdit, FaExclamationTriangle } from 'react-icons/fa';

const StudentProfile = ({ isDark }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Styles
  const cardClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const inputClass = isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200';

  // 1. Fetch Profile Data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Safety Check: If no user is logged in
      if (!user || !user._id) {
        setError("User not found in local storage. Please login again.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`http://localhost:5000/api/students/profile/${user._id}`);
      
      if (res.data) {
        setStudent(res.data);
        setFormData(prev => ({ ...prev, email: res.data.email || '' }));
      } else {
        setError("Profile data is empty.");
      }

    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Save
  const handleSave = async () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/students/update/${student._id}`, {
        email: formData.email,
        password: formData.password ? formData.password : undefined
      });

      alert("✅ Profile Updated Successfully!");
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      fetchProfile(); // Refresh
    } catch (err) {
      console.error(err);
      alert("❌ Error updating profile.");
    }
  };

  // --- RENDERING STATES ---

  if (loading) {
    return <div className="p-10 text-center opacity-50">Loading Profile...</div>;
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500 bg-red-50 rounded-xl border border-red-200 m-4">
        <FaExclamationTriangle className="mx-auto text-3xl mb-2" />
        <h3 className="font-bold">Error Loading Profile</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Safety: Even if loading is false, ensure 'student' exists before rendering
  if (!student) {
    return <div className="p-10 text-center">No student data found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className={`p-8 rounded-3xl shadow-xl ${cardClass} relative overflow-hidden`}>
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500 to-cyan-400"></div>

        <div className="relative pt-16 flex flex-col md:flex-row items-start gap-6">
          
          {/* Avatar Area */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center text-6xl text-gray-400">
              <FaUserCircle />
            </div>
            {/* Added Safe Access Checks (?.) */}
            <h2 className="mt-4 text-2xl font-bold">{student?.name || 'Student'}</h2>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mt-2">
              {student?.rollNum || 'N/A'}
            </span>
          </div>

          {/* Details Area */}
          <div className="flex-1 w-full space-y-6 mt-4 md:mt-12">
            
            <div className="flex justify-between items-center border-b pb-4 border-gray-100 dark:border-gray-700">
               <h3 className="text-xl font-bold">Personal Information</h3>
               {!isEditing ? (
                 <button 
                   onClick={() => setIsEditing(true)}
                   className="flex items-center gap-2 text-blue-500 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition"
                 >
                   <FaEdit /> Edit Profile
                 </button>
               ) : (
                 <div className="flex gap-2">
                   <button 
                     onClick={() => setIsEditing(false)}
                     className="px-4 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleSave}
                     className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-lg"
                   >
                     <FaSave /> Save Changes
                   </button>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Read-Only Fields */}
               <div>
                  <label className="text-xs font-bold opacity-70 mb-1 block">Course</label>
                  <div className={`p-3 rounded-xl border opacity-70 ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                    {student?.course || 'Not Assigned'}
                  </div>
               </div>
               <div>
                  <label className="text-xs font-bold opacity-70 mb-1 block">Batch</label>
                  <div className={`p-3 rounded-xl border opacity-70 ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                    {student?.batch || 'Not Assigned'}
                  </div>
               </div>

               {/* Editable: Email */}
               <div className="md:col-span-2">
                  <label className="text-xs font-bold opacity-70 mb-1 block">Email Address (Gmail)</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3.5 opacity-50" />
                    <input 
                      type="email" 
                      disabled={!isEditing}
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className={`w-full pl-10 p-3 rounded-xl border outline-none transition-all ${isEditing ? 'ring-2 ring-blue-500' : 'opacity-70'} ${inputClass}`}
                    />
                  </div>
               </div>

               {/* Editable: Password */}
               {isEditing && (
                 <>
                   <div>
                      <label className="text-xs font-bold opacity-70 mb-1 block text-blue-500">New Password</label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-3.5 opacity-50" />
                        <input 
                          type="password" 
                          placeholder="Leave blank to keep current"
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          className={`w-full pl-10 p-3 rounded-xl border outline-none ring-2 ring-blue-500 ${inputClass}`}
                        />
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-bold opacity-70 mb-1 block text-blue-500">Confirm Password</label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-3.5 opacity-50" />
                        <input 
                          type="password" 
                          placeholder="Confirm new password"
                          value={formData.confirmPassword}
                          onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                          className={`w-full pl-10 p-3 rounded-xl border outline-none ring-2 ring-blue-500 ${inputClass}`}
                        />
                      </div>
                   </div>
                 </>
               )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;