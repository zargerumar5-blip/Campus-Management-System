import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaClipboardList, FaSearch, FaSave, FaTrophy, FaTimesCircle, FaCheckCircle, 
  FaSpinner, FaLock, FaCloudUploadAlt, FaHistory, FaEdit, FaFileDownload, FaCalendarDay 
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const UploadMarks = ({ isDark }) => {
  // Data States
  const [students, setStudents] = useState([]); 
  const [filteredStudents, setFilteredStudents] = useState([]); 
  const [exams, setExams] = useState([]); 
  
  // Selection States
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [enteredBatch, setEnteredBatch] = useState('');
  const [examDate, setExamDate] = useState(''); // To store the scheduled date from ManageExams
  
  // Marks State
  const [marksMap, setMarksMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 

  // 1. Fetch Initial Data
  const fetchInitData = async () => {
    try {
      const [sRes, eRes] = await Promise.all([
        axios.get('http://localhost:5000/api/students'),
        axios.get('http://localhost:5000/api/exams')
      ]);

      setStudents(sRes.data.sort((a, b) => (a.userId?.name || "").localeCompare(b.userId?.name || "")));
      setExams(eRes.data.sort((a, b) => a.title.localeCompare(b.title)));

    } catch (err) { console.error("Error fetching init data"); }
  };

  useEffect(() => {
    fetchInitData();
  }, []);

  // --- AUTO-SELECT COURSE & EXAM DATE ---
  const handleExamSelect = (e) => {
    const examTitle = e.target.value;
    setSelectedExam(examTitle);
    
    // Clear previous data
    setFilteredStudents([]); 
    setMarksMap({});         
    setIsEditing(false);     

    const targetExam = exams.find(ex => ex.title === examTitle);
    
    if (targetExam) {
      // Set Course
      if (targetExam.batch) setSelectedCourse(targetExam.batch);
      
      // Set Exam Date (From ManageExams)
      if (targetExam.date) {
        setExamDate(new Date(targetExam.date).toLocaleDateString('en-GB'));
      } else {
        setExamDate('N/A');
      }
    } else {
      setSelectedCourse('');
      setExamDate('');
    }
  };

  // 2. Load / Filter Students & PRE-FILL MARKS
  const handleLoadStudents = (e) => {
    e.preventDefault();
    if (!selectedCourse || !selectedExam) {
      alert("Please select a valid Exam first.");
      return;
    }

    setIsEditing(false);
    setLoading(true);
    
    // A. Filter Students
    const filtered = students.filter(s => {
      const courseMatch = s.course === selectedCourse;
      const batchMatch = enteredBatch ? s.batch?.includes(enteredBatch) : true;
      return courseMatch && batchMatch;
    });

    filtered.sort((a, b) => (a.userId?.name || "").localeCompare(b.userId?.name || ""));
    setFilteredStudents(filtered);
    
    // B. Pre-fill Existing Marks
    const targetExam = exams.find(ex => ex.title === selectedExam);
    const initialMarks = {};

    filtered.forEach(s => {
        const existingResult = targetExam?.results?.find(r => r.studentId === s._id);
        initialMarks[s._id] = existingResult ? existingResult.marksObtained : '';
    });

    setMarksMap(initialMarks);
    setLoading(false);
  };

  const handleMarkChange = (studentId, value) => {
    setMarksMap(prev => ({ ...prev, [studentId]: value }));
  };

  // 3. Submit All Marks
  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to upload/update these results?")) return;

    try {
      const promises = filteredStudents.map(student => {
        const marks = marksMap[student._id];
        if (marks === '' || marks === undefined) return null;

        return axios.post('http://localhost:5000/api/exams/upload-result', {
          examId: exams.find(e => e.title === selectedExam)?._id,
          studentRoll: student.rollNum,
          marks: parseInt(marks)
        });
      }).filter(p => p !== null);

      await Promise.all(promises);
      alert("✅ Results Uploaded Successfully!");
      
      fetchInitData();
      setIsEditing(false);

    } catch (err) { console.error(err); alert("❌ Error uploading results."); }
  };

  // --- DERIVE SUBMITTED LIST ---
  const getSubmittedRecords = () => {
    if (!selectedExam) return [];
    const targetExam = exams.find(e => e.title === selectedExam);
    if (!targetExam || !targetExam.results) return [];

    return targetExam.results.map(result => {
       const studentProfile = students.find(s => s._id === result.studentId);
       if (studentProfile && studentProfile.course === selectedCourse) {
          return {
             ...result,
             name: studentProfile.userId?.name || 'Unknown',
             rollNum: studentProfile.rollNum
          };
       }
       return null;
    }).filter(item => item !== null)
      .sort((a, b) => a.rollNum.localeCompare(b.rollNum));
  };

  const submittedRecords = getSubmittedRecords();

  // --- 4. GENERATE PDF REPORT (WITH EXAM DATE) ---
  const handleDownloadPDF = () => {
    if (submittedRecords.length === 0) return alert("No results to download.");

    const doc = new jsPDF();
    
    // Use the fetched Exam Date
    const displayDate = examDate || 'N/A';

    // Header
    doc.setFontSize(18);
    doc.text("EXAM RESULT SHEET", 105, 20, null, null, "center");
    
    doc.setFontSize(12);
    doc.text(`Exam: ${selectedExam}`, 14, 28);
    doc.text(`Course: ${selectedCourse} ${enteredBatch ? `(${enteredBatch})` : ''}`, 14, 34);
    
    // --- USE ACTUAL EXAM DATE ---
    doc.text(`Exam Date: ${displayDate}`, 150, 34); 
    // ---------------------------

    doc.line(14, 38, 196, 38);

    // Table Data
    const tableRows = submittedRecords.map(record => [
      record.rollNum,
      record.name,
      record.marksObtained,
      record.status
    ]);

    // Generate Table
    autoTable(doc, {
      startY: 42,
      head: [['Roll No', 'Student Name', 'Marks', 'Status']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, 
      styles: { halign: 'center' },
      columnStyles: { 1: { halign: 'left' } } 
    });

    doc.save(`${selectedExam}_Results.pdf`);
  };

  const cardClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const inputClass = isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200';

  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in">
      
      {/* 1. HEADER & FILTERS */}
      <div className={`p-8 rounded-3xl shadow-xl ${cardClass}`}>
        <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
          <div className="flex items-center">
             <FaClipboardList className="mr-3 text-blue-500" /> Upload Marks
          </div>
          {/* EXAM DATE BADGE */}
          {examDate && (
             <div className="text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-full flex items-center">
               <FaCalendarDay className="mr-2" /> Conducted: {examDate}
             </div>
          )}
        </h2>

        <form onSubmit={handleLoadStudents} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          <div className="md:col-span-1">
             <label className="text-xs font-bold opacity-70 mb-1 block">Select Exam</label>
             <select 
               value={selectedExam} 
               onChange={handleExamSelect} 
               className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
               required
             >
               <option value="">-- Choose Exam --</option>
               {exams.length > 0 ? (
                 exams.map((exam) => <option key={exam._id} value={exam.title}>{exam.title}</option>)
               ) : <option disabled>No exams found</option>}
             </select>
          </div>

          <div>
            <label className="text-xs font-bold opacity-70 mb-1 block flex items-center">
              Target Course <FaLock className="ml-1 opacity-50 text-[10px]" />
            </label>
            <input 
              type="text" value={selectedCourse || 'Select Exam First'} readOnly
              className={`w-full p-3 rounded-xl border outline-none opacity-60 cursor-not-allowed ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
            />
          </div>

          <div>
            <label className="text-xs font-bold opacity-70 mb-1 block">Batch Year (Optional)</label>
            <input 
              type="text" placeholder="e.g. 2024" value={enteredBatch} onChange={e => setEnteredBatch(e.target.value)} 
              className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
            />
          </div>

          <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center">
            <FaSearch className="mr-2" /> Load List
          </button>
        </form>
      </div>

      {/* 2. SUBMITTED LIST (SHOWS IF MARKS EXIST) */}
      {submittedRecords.length > 0 && !isEditing && (
        <div className={`p-8 rounded-3xl shadow-xl border-t-4 border-green-500 ${cardClass}`}>
           <div className="flex flex-col md:flex-row justify-between items-center mb-6">
             <div>
               <h3 className="text-xl font-bold flex items-center text-green-600 dark:text-green-400">
                 <FaHistory className="mr-2"/> Results Submitted
               </h3>
               <p className="text-sm opacity-60">Marks have been successfully published.</p>
             </div>
             
             <div className="flex gap-2 mt-4 md:mt-0">
               {/* DOWNLOAD BUTTON */}
               <button 
                  onClick={handleDownloadPDF}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center hover:bg-blue-700 shadow-lg transition"
               >
                 <FaFileDownload className="mr-2" /> Download List
               </button>

               <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 px-4 py-2 rounded-xl font-bold text-sm flex items-center hover:scale-105 transition"
               >
                 <FaEdit className="mr-2" /> Edit Results
               </button>
             </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                   <th className="p-3 opacity-70">Roll No</th>
                   <th className="p-3 opacity-70">Name</th>
                   <th className="p-3 opacity-70">Marks</th>
                   <th className="p-3 opacity-70">Status</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {submittedRecords.map((record, idx) => (
                   <tr key={idx} className={`border-b last:border-0 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                     <td className="p-3 font-mono">{record.rollNum}</td>
                     <td className="p-3">{record.name}</td>
                     <td className="p-3 font-bold">{record.marksObtained}</td>
                     <td className="p-3">
                       {record.status === 'Pass' 
                         ? <span className="text-green-500 font-bold flex items-center"><FaCheckCircle className="mr-1"/> Pass</span> 
                         : <span className="text-red-500 font-bold flex items-center"><FaTimesCircle className="mr-1"/> Fail</span>
                       }
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* 3. ENTRY FORM (ONLY SHOWS IF NO MARKS EXIST OR 'EDIT' IS CLICKED) */}
      {filteredStudents.length > 0 && (submittedRecords.length === 0 || isEditing) && (
        <div className={`p-8 rounded-3xl shadow-xl ${cardClass}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              {isEditing ? 'Editing Results' : 'Enter Marks'}
            </h3>
            <span className="text-sm opacity-60 bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
              {filteredStudents.length} Candidates
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <th className="p-4 opacity-70">Roll No</th>
                  <th className="p-4 opacity-70">Student Name</th>
                  <th className="p-4 opacity-70 w-48">Marks Obtained</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const marks = marksMap[student._id];
                  return (
                    <tr key={student._id} className={`border-b last:border-0 hover:bg-black/5 transition ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className="p-4 font-bold opacity-70">{student.rollNum}</td>
                      <td className="p-4 font-bold">{student.userId?.name}</td>
                      <td className="p-4 relative">
                        <input 
                          type="number" placeholder="00" value={marks || ''}
                          onChange={(e) => handleMarkChange(student._id, e.target.value)}
                          className={`w-full p-2 text-center font-bold text-lg rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${inputClass}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            {isEditing && (
              <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl">
                 Cancel
              </button>
            )}
            <button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition transform flex items-center">
              <FaCloudUploadAlt className="mr-2" /> {isEditing ? 'Update Results' : 'Publish Results'}
            </button>
          </div>
        </div>
      )}
      
      {loading && <div className="text-center p-10 opacity-50 flex items-center justify-center gap-2"><FaSpinner className="animate-spin"/> Loading...</div>}
    </div>
  );
};

export default UploadMarks;