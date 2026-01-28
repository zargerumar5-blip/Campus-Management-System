import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaGlobe, FaCheckCircle, FaMoon, FaSun } from 'react-icons/fa';

const Settings = ({ isDark, currentLang, setLanguage, currentTheme, toggleTheme }) => {
  const [studentId, setStudentId] = useState(null);
  const [message, setMessage] = useState('');

  // Styles
  const cardClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';

  // 1. Fetch Student ID (To save to DB)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user._id) {
       axios.get(`http://localhost:5000/api/students/profile/${user._id}`)
         .then(res => setStudentId(res.data._id))
         .catch(err => console.error(err));
    }
  }, []);

  // 2. Handle Click (Updates UI + Saves to DB Instantly)
  const handleLanguageClick = async (lang) => {
    // 1. Update UI Immediately
    setLanguage(lang); 
    setMessage('');

    // 2. Save to Database Automatically
    if (studentId) {
      try {
        await axios.put(`http://localhost:5000/api/students/${studentId}`, {
          language: lang
        });
        // Optional: Show a small "Saved" feedback text
        setMessage({ type: 'success', text: 'Saved' });
        setTimeout(() => setMessage(''), 2000); // Hide after 2s
      } catch (err) {
        console.error("Failed to save language", err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto fade-in">
      
      <div className={`p-8 rounded-3xl shadow-xl ${cardClass}`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <FaGlobe className="mr-3 text-blue-500" /> System Settings
        </h2>

        <div className="grid grid-cols-1 gap-8">
          
          {/* THEME TOGGLE */}
          {toggleTheme && (
            <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
               <h3 className="font-bold text-lg mb-4 flex items-center">
                 {currentTheme === 'dark' ? <FaMoon className="mr-2 text-yellow-400"/> : <FaSun className="mr-2 text-orange-500"/>}
                 App Theme
               </h3>
               <div className="flex gap-4">
                  <button onClick={() => toggleTheme('light')} className={`flex-1 p-4 rounded-xl border-2 font-bold transition ${currentTheme === 'light' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 dark:border-gray-700'}`}>
                    ☀ Light Mode
                  </button>
                  <button onClick={() => toggleTheme('dark')} className={`flex-1 p-4 rounded-xl border-2 font-bold transition ${currentTheme === 'dark' ? 'border-blue-500 bg-gray-700 text-white' : 'border-gray-200 dark:border-gray-700'}`}>
                    🌙 Dark Mode
                  </button>
               </div>
            </div>
          )}

          {/* LANGUAGE PREFERENCE (Auto-Save) */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center"><FaGlobe className="mr-2 text-green-500"/> Language Preference</h3>
                {message && <span className="text-xs font-bold text-green-500 bg-green-100 px-2 py-1 rounded fade-in">✓ Saved</span>}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {['English', 'Hindi', 'Marathi'].map((lang) => (
                 <button
                   key={lang}
                   onClick={() => handleLanguageClick(lang)}
                   className={`relative p-4 rounded-xl font-bold transition-all border-2 flex items-center justify-between ${
                     currentLang === lang 
                     ? 'border-blue-500 bg-blue-600 text-white shadow-lg scale-105' 
                     : `border-transparent ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`
                   }`}
                 >
                   <span>
                     {lang === 'English' && 'English'}
                     {lang === 'Hindi' && 'हिंदी'}
                     {lang === 'Marathi' && 'मराठी'}
                     <br/>
                     <span className="text-xs opacity-60 font-normal">{lang}</span>
                   </span>
                   {currentLang === lang && <FaCheckCircle className="text-white"/>}
                 </button>
               ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;