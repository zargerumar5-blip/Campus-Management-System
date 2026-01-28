import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock } from 'react-icons/fa';

const Login = () => {
  const { role } = useParams(); // Gets "admin", "faculty", or "student"
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Define colors based on the role
  const theme = {
    admin: 'bg-blue-600 hover:bg-blue-700',
    faculty: 'bg-indigo-600 hover:bg-indigo-700',
    student: 'bg-emerald-600 hover:bg-emerald-700',
  };

  const titles = {
    admin: 'Admin Login',
    faculty: 'Faculty Login',
    student: 'Student Login',
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Send credentials to Backend
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      // 2. Check if the user has the correct role
      if (res.data.role === role) {
        localStorage.setItem('user', JSON.stringify(res.data));
        
        // --- THIS IS THE FIX ---
        // Redirect to the specific dashboard based on role
        if (role === 'admin') {
          navigate('/admin-dashboard');
        } else if (role === 'faculty') {
          navigate('/faculty-dashboard');
        } else {
          navigate('/student-dashboard');
        }
        // -----------------------

      } else {
        setError('Access Denied: You are trying to login with the wrong role.');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-gray-300">
        
        <h2 className={`text-3xl font-bold text-center mb-8 capitalize ${role === 'admin' ? 'text-blue-600' : role === 'faculty' ? 'text-indigo-600' : 'text-emerald-600'}`}>
          {titles[role] || 'Login'}
        </h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="relative">
            <FaUser className="absolute top-3 left-3 text-gray-400" />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400" />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className={`w-full py-2 text-white font-bold rounded-lg transition duration-200 ${theme[role] || 'bg-gray-600'}`}
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          <a href="/" className="hover:underline">Back to Home</a>
        </p>

      </div>
    </div>
  );
};

export default Login;