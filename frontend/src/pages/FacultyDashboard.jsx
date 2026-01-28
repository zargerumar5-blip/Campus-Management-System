import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaChalkboardTeacher, FaUserGraduate, FaClipboardList, FaCalendarCheck, 
  FaBolt, FaSignOutAlt, FaExclamationCircle, FaCheckCircle, FaEdit, FaCamera,
  FaBars, FaTimes 
} from 'react-icons/fa';

// Import Real Components
import AdminProfile from '../components/Admin/AdminProfile';
import MarkAttendance from '../components/Faculty/MarkAttendance';
import MySchedule from '../components/Faculty/MySchedule';
import ManageExams from '../components/Faculty/ManageExams';
import Settings from '../components/Settings'; 
import UploadMarks from '../components/Faculty/UploadMarks';

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ classesToday: 0, totalStudents: 0, activeExams: 0 });
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [currentDayName, setCurrentDayName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile Sidebar State

  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('English');
  const isDark = theme === 'dark';

  // LOAD USER FROM LOCAL STORAGE
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'Faculty Member', _id: 'dummy', role: 'faculty' });

  // --- 1. HANDLE PROFILE PICTURE UPLOAD ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImg', file);

    try {
      const res = await axios.post(`https://campus-management-system-xf9a.onrender.com/api/upload/faculty/${user._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const updatedUser = { ...user, profileImg: res.data.filePath };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('✅ Profile Picture Updated!');
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    }
  };

  // --- 2. AUTO-SYNC PROFILE IMAGE FROM DB ---
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const res = await axios.get('https://campus-management-system-xf9a.onrender.com/api/faculty');
        const me = res.data.find(f => f.userId?._id === user._id);
        if (me && me.profileImg && me.profileImg !== user.profileImg) {
          const updatedUser = { ...user, profileImg: me.profileImg };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (err) { console.error("Auto-sync profile image failed", err); }
    };
    syncProfile();
  }, [user._id]);

  // --- TRANSLATION LOGIC ---
  const translations = {
    English: {
      portal: "Faculty Portal", subtitle: "Manage your classes and students efficiently.",
      dashboard: "Dashboard", academics: "Academics", schedule: "My Schedule",
      attendance: "Mark Attendance", marks: "Upload Marks", 
      exams: "Manage Exams", 
      profile: "Profile", settings: "Settings", logout: "Logout",
      hello: "Hello, Professor!", todayIs: "It's", youHave: "You have", classesToday: "Classes Today",
      totalStudents: "Total Students", activeExams: "Scheduled Exams",
      todaysSchedule: "Today's Schedule", viewFull: "View Full Week",
      noClasses: "No classes scheduled for", checkSchedule: "Check 'My Schedule' to add classes.",
      quickActions: "Quick Actions", manageTime: "Manage Timetable",
      classTime: "Class Time"
    },
    Hindi: {
      portal: "शिक्षक पोर्टल", subtitle: "अपनी कक्षाओं और छात्रों का प्रबंधन करें।",
      dashboard: "डैशबोर्ड", academics: "शैक्षणिक", schedule: "मेरी समय सारिणी",
      attendance: "उपस्थिति दर्ज करें", marks: "अंक अपलोड करें", 
      exams: "परीक्षा प्रबंधन", 
      profile: "प्रोफ़ाइल", settings: "सेटिंग्स", logout: "लॉग आउट",
      hello: "नमस्ते, प्रोफेसर!", todayIs: "आज", youHave: "आपकी", classesToday: "आज की कक्षाएं",
      totalStudents: "कुल छात्र", activeExams: "निर्धारित परीक्षाएँ",
      todaysSchedule: "आज की समय सारिणी", viewFull: "पूरा सप्ताह देखें",
      noClasses: "के लिए कोई कक्षा निर्धारित नहीं है", checkSchedule: "कक्षाएं जोड़ने के लिए 'मेरी समय सारिणी' देखें।",
      quickActions: "त्वरित कार्य", manageTime: "समय सारिणी प्रबंधन",
      classTime: "कक्षा का समय"
    },
    Marathi: {
      portal: "प्राध्यापक पोर्टल", subtitle: "आपले वर्ग आणि विद्यार्थी प्रभावीपणे व्यवस्थापित करा.",
      dashboard: "डॅशबोर्ड", academics: "शैक्षणिक", schedule: "वेळापत्रक",
      attendance: "हजेरी नोंदवा", marks: "गुण अपलोड करा", 
      exams: "परीक्षा व्यवस्थापन", 
      profile: "प्रोफाइल", settings: "सेटिंग्ज", logout: "लॉग आउट",
      hello: "नमस्कार, सर!", todayIs: "आज", youHave: "आज तुमचे", classesToday: "आजचे वर्ग",
      totalStudents: "एकूण विद्यार्थी", activeExams: "नियोजित परीक्षा",
      todaysSchedule: "आजचे वेळापत्रक", viewFull: "पूर्ण आठवडा पहा",
      noClasses: "यासाठी कोणतेही वर्ग नाहीत", checkSchedule: "वर्ग जोडण्यासाठी 'वेळापत्रक' तपासा.",
      quickActions: "क्विक ऍक्शन्स", manageTime: "वेळापत्रक व्यवस्थापन",
      classTime: "वर्गाची वेळ"
    }
  };

  const t = translations[lang] || translations['English'];

  // --- 3. FETCH SCHEDULE ---
  useEffect(() => {
    const fetchTodayData = async () => {
      try {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dateObj = new Date();
        const dayName = days[dateObj.getDay()];
        setCurrentDayName(dayName);
        const offsetDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
        const dateStr = offsetDate.toISOString().split('T')[0];

        const schRes = await axios.get('https://campus-management-system-xf9a.onrender.com/api/schedule');
        const myClassesToday = schRes.data.filter(item => item.facultyName === user.name && item.day === dayName);
        
        const classesWithStatus = await Promise.all(myClassesToday.map(async (cls) => {
          try {
            const attRes = await axios.get(`https://campus-management-system-xf9a.onrender.com/api/attendance/batch/${cls.batch}/${dateStr}`);
            return { ...cls, isMarked: attRes.data.length > 0 };
          } catch (e) { return { ...cls, isMarked: false }; }
        }));

        classesWithStatus.sort((a, b) => a.startTime.localeCompare(b.startTime));
        setTodaysSchedule(classesWithStatus);
        setStats(prev => ({ ...prev, classesToday: classesWithStatus.length }));
      } catch (err) { console.error(err); }
    };
    if (activeTab === 'dashboard') fetchTodayData();
  }, [activeTab]); 

  // --- 4. FETCH GENERAL STATS ---
  useEffect(() => {
    const fetchServerData = async () => {
      try {
        const [studentRes, examRes] = await Promise.allSettled([
          axios.get('https://campus-management-system-xf9a.onrender.com/api/students'),
          axios.get('https://campus-management-system-xf9a.onrender.com/api/exams')
        ]);
        const studentCount = studentRes.status === 'fulfilled' ? studentRes.value.data.length : 0;
        const examCount = examRes.status === 'fulfilled' ? examRes.value.data.length : 0;
        setStats(prev => ({ ...prev, totalStudents: studentCount, activeExams: examCount }));
      } catch (err) { console.error(err); }
    };
    if (activeTab === 'dashboard') fetchServerData();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden" 
          onClick={closeSidebar}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed md:relative z-40 w-72 h-full md:h-auto 
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col shadow-2xl md:m-4 md:rounded-3xl
        ${isDark ? 'bg-gray-800' : 'bg-white'}
      `}>
        
        {/* Close Button (Mobile) */}
        <div className="md:hidden absolute top-4 right-4 z-50">
          <button onClick={closeSidebar} className={`text-xl ${isDark ? 'text-white' : 'text-gray-600'}`}>
            <FaTimes />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-700">
          {/* PROFILE PICTURE */}
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white dark:border-gray-700">
              {user.profileImg ? (
                <img src={`https://campus-management-system-xf9a.onrender.com${user.profileImg}`} alt="Profile" className="w-full h-full object-cover" onError={(e) => {e.target.onerror = null; e.target.src=""}} />
              ) : (
                <span>{user?.name?.charAt(0) || 'F'}</span>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all">
              <FaCamera size={20} />
              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
          </div>
          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{user?.name}</h3>
          <p className="text-xs text-gray-400">Faculty Member</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarBtn label={t.dashboard} icon={<FaBolt />} active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); closeSidebar(); }} isDark={isDark} />
          
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase mt-4 mb-2">{t.academics}</p>
          <SidebarBtn label={t.schedule} icon={<FaCalendarCheck />} active={activeTab === 'schedule'} onClick={() => { setActiveTab('schedule'); closeSidebar(); }} isDark={isDark} />
          <SidebarBtn label={t.attendance} icon={<FaUserGraduate />} active={activeTab === 'attendance'} onClick={() => { setActiveTab('attendance'); closeSidebar(); }} isDark={isDark} />
          <SidebarBtn label={t.marks} icon={<FaClipboardList />} active={activeTab === 'marks'} onClick={() => { setActiveTab('marks'); closeSidebar(); }} isDark={isDark} />
          <SidebarBtn label={t.exams} icon={<FaEdit />} active={activeTab === 'exams'} onClick={() => { setActiveTab('exams'); closeSidebar(); }} isDark={isDark} />
          
          <div className={`border-t my-2 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}></div>
          <SidebarBtn label={t.profile} icon={<FaChalkboardTeacher />} active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); closeSidebar(); }} isDark={isDark} />
          <SidebarBtn label={t.settings} icon={<FaBolt />} active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); closeSidebar(); }} isDark={isDark} />
          <button onClick={handleLogout} className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 font-medium mb-1 mt-2 text-red-500 hover:bg-red-50 hover:text-red-600`}>
            <span className="text-lg"><FaSignOutAlt /></span><span>{t.logout}</span>
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* MOBILE HEADER */}
        <div className={`md:hidden p-4 flex items-center justify-between shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
           <h1 className="font-bold text-lg text-emerald-600">Faculty Portal</h1>
           <button onClick={() => setSidebarOpen(true)} className={`text-2xl ${isDark ? 'text-white' : 'text-gray-700'}`}>
             <FaBars />
           </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* Desktop Header */}
          <header className="hidden md:flex flex-col md:flex-row justify-between items-center mb-8 bg-transparent">
            <div>
               <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.portal}</h1>
               <p className="text-sm text-gray-500">{t.subtitle}</p>
            </div>
          </header>

          {activeTab === 'dashboard' && (
             <div className="fade-in space-y-6">
              {/* WELCOME BANNER */}
              <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl">
                <div className="relative z-10">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{t.hello} 👨‍🏫</h1>
                  <p className="opacity-90">{t.todayIs} <strong>{currentDayName}</strong>. {t.youHave} <strong>{stats.classesToday} {t.classesToday}</strong>.</p>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
              </div>

              {/* STATS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard icon={<FaCalendarCheck size={24} />} title={t.classesToday} value={stats.classesToday} color="emerald" isDark={isDark} />
                <DashboardCard icon={<FaUserGraduate size={24} />} title={t.totalStudents} value={stats.totalStudents} color="blue" isDark={isDark} />
                <DashboardCard icon={<FaClipboardList size={24} />} title={t.activeExams} value={stats.activeExams} color="orange" isDark={isDark} />
              </div>

              {/* SCHEDULE LIST */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                   <div className={`rounded-3xl p-6 shadow-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-white'}`}>
                      <div className="flex justify-between items-center mb-6">
                         <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.todaysSchedule} ({currentDayName})</h3>
                         <button onClick={() => setActiveTab('schedule')} className="text-sm text-emerald-600 font-bold hover:underline">{t.viewFull}</button>
                      </div>
                      
                      <div className="space-y-4">
                         {todaysSchedule.length > 0 ? (
                           todaysSchedule.map((cls, index) => (
                             <ScheduleItem key={index} time={`${cls.startTime} - ${cls.endTime}`} subject={cls.subject} batch={cls.batch} room={cls.room} isMarked={cls.isMarked} isDark={isDark} labelTime={t.classTime} />
                           ))
                         ) : (
                           <div className="text-center p-6 opacity-50 border-2 border-dashed rounded-xl">
                              <FaExclamationCircle className="mx-auto mb-2 text-2xl" />
                              <p>{t.noClasses} {currentDayName}.</p>
                              <p className="text-xs mt-1">{t.checkSchedule}</p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
                {/* QUICK ACTIONS */}
                <div className={`rounded-3xl p-6 shadow-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-white'}`}>
                   <h3 className={`font-bold text-lg mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.quickActions}</h3>
                   <div className="space-y-3">
                      <ActionButton label={t.attendance} icon={<FaUserGraduate />} onClick={() => setActiveTab('attendance')} color="emerald" />
                      <ActionButton label={t.marks} icon={<FaClipboardList />} onClick={() => setActiveTab('marks')} color="blue" />
                      <ActionButton label={t.manageTime} icon={<FaCalendarCheck />} onClick={() => setActiveTab('schedule')} color="purple" />
                   </div>
                </div>
              </div>
             </div>
          )}

          <div className="fade-in">
            {activeTab === 'schedule' && <MySchedule isDark={isDark} />}
            {activeTab === 'attendance' && <MarkAttendance isDark={isDark} />}
            {activeTab === 'marks' && <UploadMarks isDark={isDark} />}
            {activeTab === 'exams' && <ManageExams isDark={isDark} />}
            {activeTab === 'profile' && <AdminProfile isDark={isDark} />}
            {activeTab === 'settings' && <Settings currentTheme={theme} toggleTheme={setTheme} currentLang={lang} setLanguage={setLang} showLogout={false} />}
          </div>
        </div>
      </main>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const SidebarBtn = ({ label, icon, active, onClick, isDark }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 font-medium mb-1 ${active ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' : isDark ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'}`}>
    <span className="text-lg">{icon}</span><span>{label}</span>
  </button>
);
const DashboardCard = ({ icon, title, value, color, isDark }) => {
  const colors = { emerald: 'bg-emerald-100 text-emerald-600', blue: 'bg-blue-100 text-blue-600', orange: 'bg-orange-100 text-orange-600' };
  return (
    <div className={`p-6 rounded-3xl shadow-lg border border-transparent flex items-center gap-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
       <div className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</div>
       <div><h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</h3><p className="text-sm text-gray-400">{title}</p></div>
    </div>
  );
};
const ScheduleItem = ({ time, subject, batch, room, isMarked, isDark, labelTime }) => (
  <div className={`relative flex items-center p-4 rounded-2xl border-l-4 ${isMarked ? 'border-green-500 bg-green-50/50' : 'border-emerald-500'} ${isDark ? 'bg-gray-700' : 'bg-slate-50'}`}>
     <div className="mr-4 text-center min-w-[100px]">
        <p className="text-xs font-bold text-emerald-500 uppercase">{labelTime || 'Time'}</p>
        <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{time}</p>
     </div>
     <div className="flex-1">
        <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{subject}</h4>
        <p className="text-xs text-gray-400">{batch} • {room}</p>
     </div>
     {isMarked && (
       <div className="absolute right-4 top-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
         <FaCheckCircle className="mr-1" /> Marked
       </div>
     )}
  </div>
);
const ActionButton = ({ label, icon, onClick, color }) => {
  const colors = { emerald: 'hover:bg-emerald-50 text-emerald-600', blue: 'hover:bg-blue-50 text-blue-600', purple: 'hover:bg-purple-50 text-purple-600' };
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 rounded-xl border border-gray-100 transition-all font-semibold bg-white shadow-sm hover:shadow-md ${colors[color]}`}><span className="text-xl">{icon}</span><span>{label}</span></button>
  );
};

export default FacultyDashboard;