import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUserGraduate, FaClipboardList, FaCalendarAlt, FaChartPie, 
  FaBolt, FaSignOutAlt, FaMoneyCheckAlt, FaExclamationCircle, FaArrowRight, FaCamera,
  FaBars, FaTimes 
} from 'react-icons/fa';

// --- IMPORT REAL COMPONENTS ---
import MyAttendance from '../components/Student/MyAttendance';
import ExamResults from '../components/Student/ExamResults';
import StudentTimetable from '../components/Student/StudentTimetable';
import StudentProfile from '../components/Student/StudentProfile';
import Settings from '../components/Settings';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Stats State
  const [studentStats, setStudentStats] = useState({ 
    attendance: 0, 
    feesStatus: 'Checking...' 
  });
  
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile Sidebar State

  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('English'); 
  const isDark = theme === 'dark';

  // --- LOAD USER ---
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'Student', _id: 'dummy', role: 'student' });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImg', file);

    try {
      const res = await axios.post(`https://campusmanagementsystem-9kkd.onrender.com/api/upload/student/${user._id}`, formData, {
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

  // --- TRANSLATIONS ---
  const translations = {
    English: {
      title: "Student Dashboard", subtitle: "Welcome back to your academic portal.",
      dashboard: "Dashboard", academics: "ACADEMICS", attendance: "My Attendance", results: "Exam Results", timetable: "Timetable", profile: "My Profile", settings: "Settings", logout: "Logout",
      hello: "Hello", attMessage: "You have", keepUp: "Attendance. Keep it up!", overallAtt: "Overall Attendance", feesStatus: "Fees Status", upcomingExams: "Upcoming Exams", loadingSchedule: "Loading schedule...", noExams: "No exams scheduled yet.", date: "DATE"
    },
    Hindi: {
      title: "छात्र डैशबोर्ड", subtitle: "आपके शैक्षणिक पोर्टल में पुनः स्वागत है।",
      dashboard: "डैशबोर्ड", academics: "शैक्षणिक", attendance: "मेरी उपस्थिति", results: "परीक्षा परिणाम", timetable: "समय सारिणी", profile: "मेरी प्रोफ़ाइल", settings: "सेटिंग्स", logout: "लॉग आउट",
      hello: "नमस्ते", attMessage: "आपकी", keepUp: "उपस्थिति है। इसे बनाए रखें!", overallAtt: "कुल उपस्थिति", feesStatus: "शुल्क स्थिति", upcomingExams: "आगामी परीक्षाएँ", loadingSchedule: "समय सारिणी लोड हो रही है...", noExams: "कोई परीक्षा निर्धारित नहीं है।", date: "दिनांक"
    },
    Marathi: {
      title: "विद्यार्थी डॅशबोर्ड", subtitle: "तुमच्या शैक्षणिक पोर्टलवर परत स्वागत आहे.",
      dashboard: "डैशबोर्ड", academics: "शैक्षणिक", attendance: "माझी उपस्थिती", results: "परीक्षा निकाल", timetable: "वेळापत्रक", profile: "माझी प्रोफाइल", settings: "सेटिंग्स", logout: "लॉग आउट",
      hello: "नमस्कार", attMessage: "तुमची", keepUp: "उपस्थिती आहे. अशीच ठेवा!", overallAtt: "एकूण उपस्थिती", feesStatus: "फी स्थिती", upcomingExams: "आगामी परीक्षा", loadingSchedule: "वेळापत्रक लोड होत आहे...", noExams: "कोणतीही परीक्षा नियोजित नाही.", date: "दिनांक"
    }
  };

  const t = translations[lang] || translations['English'];

  // --- FETCH REAL DATA (UPDATED LOGIC) ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Exams
        const examRes = await axios.get('https://campusmanagementsystem-9kkd.onrender.com/api/exams');
        const sortedExams = examRes.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setExams(sortedExams);

        // 2. Fetch Student Profile for Fees
        const allStudentsRes = await axios.get('https://campusmanagementsystem-9kkd.onrender.com/api/students');
        const myProfile = allStudentsRes.data.find(s => s.userId?._id === user._id);

        let calculatedFeesStatus = "Checking...";
        let calculatedAttendance = 0;

        if (myProfile) {
            if (myProfile.language) setLang(myProfile.language);
            
            // --- UPDATED FEE LOGIC ---
            // Agar backend mein value nahi hai toh default 20000 maan lenge demo ke liye
            const totalFee = Number(myProfile.feesTotal) || 20000; 
            const paidFee = Number(myProfile.feesPaidAmount) || 0;
            const balance = totalFee - paidFee;

            if (balance <= 0) {
              calculatedFeesStatus = "Paid ✅";
            } else {
              calculatedFeesStatus = `Pending (₹${balance})`;
            }

            // --- UPDATED ATTENDANCE LOGIC ---
            try {
                const attRes = await axios.get(`https://campusmanagementsystem-9kkd.onrender.com/api/attendance/${myProfile._id}`);
                const records = attRes.data;
                const totalDays = records.length;
                
                // Case-insensitive check (Present, present, P)
                const presentDays = records.filter(r => 
                  r.status === 'Present' || r.status === 'present' || r.status === 'P'
                ).length;
                
                calculatedAttendance = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
            } catch (attErr) {
                console.warn("Attendance data fetch failed, showing 0%");
            }
        }
        
        // Update State
        setStudentStats({ 
          attendance: calculatedAttendance, 
          feesStatus: calculatedFeesStatus 
        });

      } catch (err) { 
        console.error("Error loading dashboard data:", err); 
        setStudentStats({ attendance: 0, feesStatus: "Error" });
      } finally { 
        setLoading(false); 
      }
    };
    fetchDashboardData();
  }, [user._id]);

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

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
        
        <div className="md:hidden absolute top-4 right-4 z-50">
          <button onClick={closeSidebar} className={`text-xl ${isDark ? 'text-white' : 'text-gray-600'}`}>
            <FaTimes />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-700">
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white dark:border-gray-700">
              {user.profileImg ? (
                <img src={`https://campusmanagementsystem-9kkd.onrender.com${user.profileImg}`} alt="Profile" className="w-full h-full object-cover" onError={(e) => {e.target.onerror = null; e.target.src=""}} />
              ) : (
                <span>{user?.name?.charAt(0) || 'S'}</span>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all">
              <FaCamera size={20} />
              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
          </div>
          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{user?.name}</h3>
          <p className="text-xs text-gray-400">Student Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarBtn label={t.dashboard} icon={<FaBolt />} active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); closeSidebar(); }} isDark={isDark} />
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase mt-4 mb-2">{t.academics}</p>
          <SidebarBtn label={t.attendance} icon={<FaChartPie />} active={activeTab === 'attendance'} onClick={() => { setActiveTab('attendance'); closeSidebar(); }} isDark={isDark} />
          <SidebarBtn label={t.results} icon={<FaClipboardList />} active={activeTab === 'results'} onClick={() => { setActiveTab('results'); closeSidebar(); }} isDark={isDark} />
          <SidebarBtn label={t.timetable} icon={<FaCalendarAlt />} active={activeTab === 'timetable'} onClick={() => { setActiveTab('timetable'); closeSidebar(); }} isDark={isDark} />
          <div className={`border-t my-2 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}></div>
          <SidebarBtn label={t.profile} icon={<FaUserGraduate />} active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); closeSidebar(); }} isDark={isDark} />
          <SidebarBtn label={t.settings} icon={<FaBolt />} active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); closeSidebar(); }} isDark={isDark} />
          <button onClick={handleLogout} className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 font-medium mb-1 mt-2 text-red-500 hover:bg-red-50 hover:text-red-600`}>
            <span className="text-lg"><FaSignOutAlt /></span><span>{t.logout}</span>
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* MOBILE HEADER */}
        <div className={`md:hidden p-4 flex items-center justify-between shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
           <h1 className="font-bold text-lg text-blue-600">Student Portal</h1>
           <button onClick={() => setSidebarOpen(true)} className={`text-2xl ${isDark ? 'text-white' : 'text-gray-700'}`}>
             <FaBars />
           </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          
          <header className="hidden md:flex flex-col md:flex-row justify-between items-center mb-8 bg-transparent">
            <div>
               <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.title}</h1>
               <p className="text-sm text-gray-500">{t.subtitle}</p>
            </div>
          </header>

          {activeTab === 'dashboard' && (
             <div className="fade-in space-y-6">
              {/* Banner */}
              <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl">
                <div className="relative z-10">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{t.hello}, {user.name.split(' ')[0]}! 🚀</h1>
                  <p className="opacity-90">{t.attMessage} <strong>{studentStats.attendance}% {t.keepUp}</strong></p>
                </div>
              </div>

              {/* Stats Cards - Updated with real data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard icon={<FaChartPie />} title={t.overallAtt} value={`${studentStats.attendance}%`} color="blue" isDark={isDark} />
                <DashboardCard icon={<FaMoneyCheckAlt />} title={t.feesStatus} value={studentStats.feesStatus} color="green" isDark={isDark} />
              </div>

              {/* Upcoming Exams */}
              <div className={`rounded-3xl p-6 shadow-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-white'}`}>
                  <h3 className={`font-bold text-lg mb-6 flex items-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    <FaCalendarAlt className="mr-2 text-orange-500" /> {t.upcomingExams}
                  </h3>
                  
                  <div className="space-y-4">
                     {loading ? (
                       <p className="text-sm text-gray-500 animate-pulse">{t.loadingSchedule}</p>
                     ) : exams.length > 0 ? (
                       exams.map((exam) => (
                         <ExamItem key={exam._id} dateLabel={t.date} date={formatDate(exam.date)} subject={`${exam.subject} (${exam.title})`} time={`${exam.startTime} - ${exam.endTime} • Room: ${exam.room || 'TBD'}`} isDark={isDark} />
                       ))
                     ) : (
                       <div className="text-center py-8 opacity-50 border-2 border-dashed rounded-xl">
                          <FaExclamationCircle className="mx-auto mb-2 text-xl" />
                          <p>{t.noExams}</p>
                       </div>
                     )}
                  </div>
               </div>
             </div>
          )}

          <div className="fade-in">
            {activeTab === 'profile' && <StudentProfile isDark={isDark} />}
            {activeTab === 'attendance' && <MyAttendance isDark={isDark} />}
            {activeTab === 'results' && <ExamResults isDark={isDark} />}
            {activeTab === 'timetable' && <StudentTimetable isDark={isDark} />}
            {activeTab === 'settings' && <Settings isDark={isDark} currentLang={lang} setLanguage={setLang} currentTheme={theme} toggleTheme={setTheme} />}
          </div>
        </div>
      </main>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const SidebarBtn = ({ label, icon, active, onClick, isDark }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 font-medium mb-1 ${active ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : isDark ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}>
    <span className="text-lg">{icon}</span><span>{label}</span>
  </button>
);

const DashboardCard = ({ icon, title, value, color, isDark }) => {
  // Logic to change color if fees are pending
  const isPending = typeof value === 'string' && value.includes('Pending');
  const dynamicColor = isPending ? 'text-red-600 bg-red-100' : (color === 'blue' ? 'text-blue-600 bg-blue-100' : 'text-green-600 bg-green-100');
  
  return (
    <div className={`p-6 rounded-3xl shadow-lg border border-transparent ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
       <div className="flex justify-between items-start mb-4"><div className={`p-3 rounded-2xl ${dynamicColor}`}>{icon}</div></div>
       <div>
         <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} ${isPending ? 'text-red-500' : ''}`}>{value}</h3>
         <p className="text-sm text-gray-400">{title}</p>
       </div>
    </div>
  );
};

const ExamItem = ({ dateLabel, date, subject, time, isDark }) => (
  <div className={`flex items-center p-4 rounded-2xl border-l-4 border-blue-500 ${isDark ? 'bg-gray-700' : 'bg-slate-50'}`}>
     <div className="mr-4 text-center min-w-[80px]">
        <p className="text-xs font-bold text-blue-500 uppercase">{dateLabel}</p>
        <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{date}</p>
     </div>
     <div className="flex-1">
        <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{subject}</h4>
        <p className="text-xs text-gray-400 flex items-center">{time}</p>
     </div>
  </div>
);

export default StudentDashboard;