import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  
  // State for interactivity
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Custom Purple Gradient
  const purpleGradient = { background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)' };

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-white relative overflow-x-hidden">
      
      {/* --- NAVIGATION --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 shadow-lg backdrop-blur-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-white" style={purpleGradient}>
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" /></svg>
              </div>
              <div className="hidden sm:block">
                <p className={`font-bold text-lg leading-tight ${isScrolled ? 'text-slate-800' : 'text-white'}`}>SVM Udgir</p>
                <p className={`text-xs ${isScrolled ? 'text-purple-600' : 'text-purple-200'}`}>Excellence in Education</p>
              </div>
            </div>

            {/* Desktop Menu - Login Button Removed */}
            <div className="hidden md:flex items-center space-x-8">
              {['Home', 'About', 'Contact'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className={`font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-purple-600' : 'text-white/90 hover:text-white'}`}
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`md:hidden p-2 ${isScrolled ? 'text-slate-800' : 'text-white'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="px-4 py-4 space-y-3">
              {['Home', 'About', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMobileMenuOpen(false)} className="block text-slate-600 font-medium py-2 hover:text-purple-600">{item}</a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#2e1065]">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#2e1065]"></div>
        
        {/* Decorative Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl bg-purple-500"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl bg-fuchsia-500"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 mr-2"></span>
            <span className="text-fuchsia-100 text-sm font-medium">Established Excellence Since 1990</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Swami Vivekanand<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">
              Mahavidyalaya Udgir
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-purple-100 mb-10 max-w-3xl mx-auto font-light">
            Empowering minds, shaping futures — Where tradition meets innovation in the pursuit of academic excellence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#portals" className="px-8 py-4 rounded-full font-semibold text-white text-lg transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105" style={purpleGradient}>
              Login to Portal
            </a>
            <a href="#contact" className="px-8 py-4 rounded-full font-semibold text-white text-lg bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white/20">
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* --- PORTALS SECTION (Hidden from nav but accessible via Login button) --- */}
      <section id="portals" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6 bg-white text-purple-700 shadow-sm border border-purple-100">Login Area</span>
                <h2 className="text-4xl font-bold text-slate-900 mb-4">Select Your Portal</h2>
                <p className="text-slate-600">Secure access for Administration, Faculty, and Students.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Admin Card */}
                <div onClick={() => navigate('/login/admin')} className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-transparent hover:border-blue-500 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                        <FaUserShield size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Admin Portal</h3>
                    <p className="text-slate-500 mb-6">Manage institute data, admissions, and system settings.</p>
                    <span className="text-blue-600 font-semibold group-hover:underline">Login as Admin &rarr;</span>
                </div>

                {/* Faculty Card */}
                <div onClick={() => navigate('/login/faculty')} className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-transparent hover:border-indigo-500 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                        <FaChalkboardTeacher size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">Faculty Portal</h3>
                    <p className="text-slate-500 mb-6">Mark attendance, view schedules, and manage classes.</p>
                    <span className="text-indigo-600 font-semibold group-hover:underline">Login as Faculty &rarr;</span>
                </div>

                {/* Student Card */}
                <div onClick={() => navigate('/login/student')} className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-transparent hover:border-emerald-500 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
                        <FaUserGraduate size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">Student Portal</h3>
                    <p className="text-slate-500 mb-6">Access your profile, attendance records, and fee status.</p>
                    <span className="text-emerald-600 font-semibold group-hover:underline">Login as Student &rarr;</span>
                </div>

            </div>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6 bg-purple-50 text-purple-700 border border-purple-100">About Us</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">A Legacy of Academic Excellence</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Swami Vivekanand Mahavidyalaya Udgir stands as a beacon of educational excellence in the Latur district of Maharashtra. Founded on the principles of Swami Vivekananda's teachings, we are committed to nurturing holistic development.
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white border border-purple-100 rounded-[1.5rem] overflow-hidden shadow-2xl p-8 md:p-12 text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
                  <p className="text-slate-600 leading-relaxed italic">"To be a center of excellence that transforms students into responsible citizens."</p>
                  <div className="mt-8 pt-8 border-t border-purple-50">
                    <p className="text-purple-700 font-semibold">"Arise, awake and stop not till the goal is reached"</p>
                  </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Contact Us</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
             {[
               { title: 'Visit Us', text: 'Bodhan Nagar, Jalkot Road, Udgir' },
               { title: 'Email Us', text: 'zargerumar5@gmail.com' },
               { title: 'Call Us', text: '+91 93733 16343' }
             ].map((contact, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-8 shadow-xl shadow-purple-500/5 hover:-translate-y-2 transition-all duration-300 text-center border border-purple-50">
                  <h3 className="text-xl font-bold mb-4 text-slate-900">{contact.title}</h3>
                  <p className="text-slate-600">{contact.text}</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <p className="text-slate-500 text-sm">© 2026 Swami Vivekanand Mahavidyalaya. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default Home;