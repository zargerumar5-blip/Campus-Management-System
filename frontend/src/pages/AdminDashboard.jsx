import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUserGraduate, FaChalkboardTeacher, FaMoneyBillWave, FaBook, 
  FaPlus, FaBolt, FaSignOutAlt, FaCog, FaUserCircle, FaCamera, FaBars, FaTimes 
} from 'react-icons/fa';

// Import All Components
import AddStudent from '../components/Admin/AddStudent';
import AdminProfile from '../components/Admin/AdminProfile';
import FeesAndRecords from '../components/Admin/FeesAndRecords';
import ManageFaculty from '../components/Admin/ManageFaculty';
import Settings from '../components/Settings';
import ManageCourses from '../components/Admin/ManageCourses';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ students: 0, faculty: 0, totalFees: 0 });
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('English');
  const [sidebarOpen, setSidebarOpen] = useState(false); // New State for Mobile Sidebar

  const isDark = theme === 'dark';

  // --- LOAD USER ---
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'Administrator', _id: 'dummy', role: 'admin' });

  // Handle Profile Picture Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImg', file);

    try {
      const res = await axios.post(`https://my-first-deploy-n8du.onrender.com/api/upload/admin/${user._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const updatedUser = { ...user, profileImg: res.data.filePath };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('✅ Profile Picture Updated!');
    } catch (err) {
      console.error(err);
      alert('Note: Image uploaded locally (Backend requires Admin Model for permanent save).');
    }
  };

  const translations = {
    English: {
      title: "SVM Admin", dashboard: "Dashboard", admission: "Admission", 
      fees: "Fees & Records", faculty: "Manage Faculty",
      library: "Library", courses: "Manage Courses",
      profile: "Profile", settings: "Settings", logout: "Logout",
      overview: "Dashboard Overview", totalStudents: "Total Students", 
      totalFaculty: "Total Faculty", feesCollected: "Fees Collected"
    },
    Hindi: {
      title: "एसवीएम एडमिन", dashboard: "डैशबोर्ड", admission: "प्रवेश", 
      fees: "शुल्क और रिकॉर्ड", faculty: "शिक्षक प्रबंधन",
      library: "पुस्तकालय", courses: "कोर्स प्रबंधन",
      profile: "प्रोफ़ाइल", settings: "सेटिंग्स", logout: "लॉग आउट",
      overview: "डैशबोर्ड अवलोकन", 
      totalStudents: "कुल छात्र", totalFaculty: "कुल शिक्षक", feesCollected: "कुल शुल्क जमा"
    },
    Marathi: {
      title: "एसव्हीएम प्रशासन", dashboard: "डॅशबोर्ड", admission: "प्रवेश", 
      fees: "शुल्क आणि रेकॉर्ड", faculty: "प्राध्यापक व्यवस्थापन",
      library: "ग्रंथालय", courses: "अभ्यासक्रम व्यवस्थापन",
      profile: "प्रोफाइल", settings: "सेटिंग्ज", logout: "लॉग आउट",
      overview: "डॅशबोर्ड आढावा", 
      totalStudents: "एकूण विद्यार्थी", totalFaculty: "एकूण प्राध्यापक", feesCollected: "एकूण फी"
    }
  };

  const t = translations[lang] || translations['English'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('https://my-first-deploy-n8du.onrender.com/api/dashboard/stats');
        setStats(res.data);
      } catch (err) { console.error(err); }
    };
    if(activeTab === 'dashboard') fetchStats();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('user'); 
    window.location.href = '/';      
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 font-sans ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      
      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR (Fixed on Mobile, Relative on Desktop) --- */}
      <aside className={`
        fixed md:relative z-30 w-64 h-full flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isDark ? 'bg-gray-800 border-r border-gray-700' : 'bg-blue-900 text-white'}
      `}>
        
        {/* Close Button for Mobile */}
        <div className="md:hidden absolute top-4 right-4 z-50">
          <button onClick={() => setSidebarOpen(false)} className="text-white text-2xl">
            <FaTimes />
          </button>
        </div>

        {/* Profile Section */}
        <div className={`p-6 flex flex-col items-center border-b ${isDark ? 'border-gray-700 text-white' : 'border-blue-800'}`}>
           <div className="relative group mb-3">
             <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-3xl font-bold shadow-lg border-2 border-white/20">
               {user.profileImg ? (
                 <img 
                   src={`https://my-first-deploy-n8du.onrender.com${user.profileImg}`} 
                   alt="Profile" 
                   className="w-full h-full object-cover" 
                   onError={(e) => {e.target.onerror = null; e.target.src=""}} 
                 />
               ) : (
                 <span className={isDark ? 'text-white' : 'text-blue-100'}>{user?.name?.charAt(0) || 'A'}</span>
               )}
             </div>
             
             <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all">
               <FaCamera size={18} />
               <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
             </label>
           </div>
           
           <h3 className="font-bold text-lg">{user?.name}</h3>
           <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-blue-200'}`}>Administrator</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarBtn label={t.dashboard} icon={<FaBolt />} active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} isDark={isDark} />
          <SidebarBtn label={t.admission} icon={<FaPlus />} active={activeTab === 'add-student'} onClick={() => { setActiveTab('add-student'); setSidebarOpen(false); }} isDark={isDark} />
          <SidebarBtn label={t.fees} icon={<FaMoneyBillWave />} active={activeTab === 'all-students'} onClick={() => { setActiveTab('all-students'); setSidebarOpen(false); }} isDark={isDark} />
          <SidebarBtn label={t.faculty} icon={<FaChalkboardTeacher />} active={activeTab === 'manage-faculty'} onClick={() => { setActiveTab('manage-faculty'); setSidebarOpen(false); }} isDark={isDark} />
          <SidebarBtn label={t.courses} icon={<FaBook />} active={activeTab === 'courses'} onClick={() => { setActiveTab('courses'); setSidebarOpen(false); }} isDark={isDark} />
          
          <div className={`border-t my-2 ${isDark ? 'border-gray-700' : 'border-blue-800'}`}></div>
          
          <SidebarBtn label={t.profile} icon={<FaUserCircle />} active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }} isDark={isDark} />
          <SidebarBtn label={t.settings} icon={<FaCog />} active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }} isDark={isDark} />

          <button 
            onClick={handleLogout} 
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 font-medium mb-1 mt-4 
              ${isDark ? 'text-red-400 hover:bg-gray-700' : 'text-red-200 hover:bg-blue-800 hover:text-white'}`}
          >
            <span className="mr-3"><FaSignOutAlt /></span>
            {t.logout}
          </button>
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Mobile Header (Hamburger Menu) */}
        <div className={`md:hidden p-4 flex items-center justify-between shadow-md ${isDark ? 'bg-gray-800' : 'bg-blue-900 text-white'}`}>
          <h1 className="font-bold text-lg">SVM Admin</h1>
          <button onClick={() => setSidebarOpen(true)} className="text-2xl focus:outline-none">
            <FaBars />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          
          {activeTab === 'dashboard' && (
             <div className="fade-in space-y-8 max-w-7xl mx-auto">
              
              {/* Welcome Banner */}
              <div className={`relative overflow-hidden rounded-3xl p-6 md:p-8 ${isDark ? 'bg-gradient-to-r from-blue-900 to-indigo-900' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} text-white shadow-xl`}>
                <div className="relative z-10">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome Back, {user.name.split(' ')[0]}! 👋</h1>
                  <p className="opacity-90 text-sm md:text-base">Here's what's happening in your institute today.</p>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard icon={<FaUserGraduate size={28} />} title={t.totalStudents} value={stats.students} color="blue" isDark={isDark} trend="+12% this month" />
                <DashboardCard icon={<FaChalkboardTeacher size={28} />} title={t.totalFaculty} value={stats.faculty} color="purple" isDark={isDark} trend="+2 new hired" />
                <DashboardCard icon={<FaMoneyBillWave size={28} />} title={t.feesCollected} value={`₹ ${stats.totalFees.toLocaleString()}`} color="emerald" isDark={isDark} trend="Updated just now" />
              </div>

              {/* Quick Actions */}
              <div className={`rounded-2xl p-6 shadow-lg border border-transparent ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <FaBolt className="mr-2 text-yellow-500" /> Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <QuickActionBtn label="Add Student" icon={<FaUserGraduate />} onClick={() => setActiveTab('add-student')} color="blue" isDark={isDark} />
                  <QuickActionBtn label="Add Faculty" icon={<FaChalkboardTeacher />} onClick={() => setActiveTab('manage-faculty')} color="purple" isDark={isDark} />
                  <QuickActionBtn label="Add Course" icon={<FaBook />} onClick={() => setActiveTab('courses')} color="pink" isDark={isDark} />
                  <QuickActionBtn label="Settings" icon={<FaPlus />} onClick={() => setActiveTab('settings')} color="emerald" isDark={isDark} />
                </div>
              </div>

            </div>
          )}

          {activeTab === 'add-student' && <div className="fade-in"><AddStudent isDark={isDark} /></div>}
          {activeTab === 'all-students' && <div className="fade-in"><FeesAndRecords isDark={isDark} /></div>}
          {activeTab === 'manage-faculty' && <div className="fade-in"><ManageFaculty isDark={isDark} /></div>}
          {activeTab === 'courses' && <div className="fade-in"><ManageCourses isDark={isDark} /></div>}
          {activeTab === 'profile' && <div className="fade-in"><AdminProfile isDark={isDark} /></div>}
          {activeTab === 'settings' && <div className="fade-in"><Settings currentTheme={theme} toggleTheme={setTheme} currentLang={lang} setLanguage={setLang} /></div>}

        </div>
      </main>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const SidebarBtn = ({ label, icon, active, onClick, isDark }) => (
  <button onClick={onClick} className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 font-medium mb-1 ${active ? (isDark ? 'bg-gray-700 text-white shadow-md' : 'bg-blue-800 text-white shadow-md transform translate-x-1') : (isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'hover:bg-blue-800 hover:pl-4 text-white')}`}>
    <span className="mr-3 text-lg">{icon}</span>
    {label}
  </button>
);

const DashboardCard = ({ icon, title, value, color, isDark, trend }) => {
  const colors = {
    blue: { bg: isDark ? 'bg-blue-900/40' : 'bg-blue-50', text: 'text-blue-500' },
    purple: { bg: isDark ? 'bg-purple-900/40' : 'bg-purple-50', text: 'text-purple-500' },
    emerald: { bg: isDark ? 'bg-emerald-900/40' : 'bg-emerald-50', text: 'text-emerald-500' },
  };
  const theme = colors[color] || colors.blue;

  return (
    <div className={`p-6 rounded-2xl shadow-lg border border-transparent flex flex-col justify-between transform hover:-translate-y-1 transition duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${theme.bg} ${theme.text}`}>{icon}</div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{trend}</span>
      </div>
      <div>
        <p className={`font-medium text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
        <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{value}</h3>
      </div>
    </div>
  );
};

const QuickActionBtn = ({ label, icon, onClick, color, isDark }) => {
  const colors = {
    blue: 'hover:bg-blue-50 hover:border-blue-200 text-blue-600',
    purple: 'hover:bg-purple-50 hover:border-purple-200 text-purple-600',
    pink: 'hover:bg-pink-50 hover:border-pink-200 text-pink-600',
    emerald: 'hover:bg-emerald-50 hover:border-emerald-200 text-emerald-600',
  };
  const darkColors = {
    blue: 'hover:bg-blue-900/20 hover:border-blue-800 text-blue-400',
    purple: 'hover:bg-purple-900/20 hover:border-purple-800 text-purple-400',
    pink: 'hover:bg-pink-900/20 hover:border-pink-800 text-pink-400',
    emerald: 'hover:bg-emerald-900/20 hover:border-emerald-800 text-emerald-400',
  };

  const themeColor = isDark ? darkColors[color] : colors[color];

  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center p-4 rounded-xl border border-transparent transition-all duration-200 ${isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600'} ${themeColor}`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
};

export default AdminDashboard;