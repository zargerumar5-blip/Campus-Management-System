import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrophy, FaChartLine, FaDownload, FaFileAlt, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ExamResults = ({ isDark }) => {
  const [results, setResults] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('Student');

  // Styles
  const cardClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-100';

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user._id) return;

        // 1. Get Student ID from Profile
        const profileRes = await axios.get(`http://localhost:5000/api/students/profile/${user._id}`);
        const studentId = profileRes.data._id; // This is the ID used in Exam results
        setStudentName(profileRes.data.userId?.name || user.name);

        // 2. Fetch All Exams from Source of Truth
        const examsRes = await axios.get('http://localhost:5000/api/exams');
        const allExams = examsRes.data;

        // 3. Filter & Group Exams by Title (e.g., "Semester 1" might have Math, Science, etc.)
        const grouped = {};

        allExams.forEach(exam => {
          // Check if this exam has a result for the logged-in student
          const studentResult = exam.results?.find(r => r.studentId === studentId);

          if (studentResult) {
            if (!grouped[exam.title]) {
              grouped[exam.title] = {
                id: exam._id, // Use first ID found as group ID
                examName: exam.title,
                subjects: [],
                totalMax: 0,
                totalObtained: 0
              };
            }

            // Calculate Marks
            const obtained = studentResult.marksObtained || 0;
            const total = 100; // Default total (or fetch if available)
            const percentage = (obtained / total) * 100;

            // Determine Subject Grade
            let grade = 'F';
            if (percentage >= 90) grade = 'O';
            else if (percentage >= 80) grade = 'A+';
            else if (percentage >= 70) grade = 'A';
            else if (percentage >= 60) grade = 'B';
            else if (percentage >= 50) grade = 'C';
            else if (percentage >= 40) grade = 'P';

            grouped[exam.title].subjects.push({
              name: exam.subject,
              marks: obtained,
              total: total,
              grade: grade
            });

            grouped[exam.title].totalMax += total;
            grouped[exam.title].totalObtained += obtained;
          }
        });

        // 4. Process Groups into Final Array
        const processedResults = Object.values(grouped).map(exam => {
          const percentage = Math.round((exam.totalObtained / exam.totalMax) * 100) || 0;
          
          let overallGrade = 'F';
          if (percentage >= 90) overallGrade = 'O';
          else if (percentage >= 80) overallGrade = 'A+';
          else if (percentage >= 70) overallGrade = 'A';
          else if (percentage >= 60) overallGrade = 'B';
          else if (percentage >= 50) overallGrade = 'C';
          else if (percentage >= 40) overallGrade = 'P';

          return {
            ...exam,
            percentage,
            grade: overallGrade,
            status: percentage >= 40 ? 'Passed' : 'Failed'
          };
        });

        setResults(processedResults);
        if (processedResults.length > 0) {
          setSelectedExam(processedResults[0]);
        } else {
          setSelectedExam(null);
        }

      } catch (err) {
        console.error("Error fetching marks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  const handleDownloadPDF = () => {
    if (!selectedExam) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.text("OFFICIAL REPORT CARD", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.text("Student Management System", 105, 28, null, null, "center");
    doc.setDrawColor(200);
    doc.line(14, 35, 196, 35);

    // Info
    doc.text(`Student Name:  ${studentName}`, 14, 45);
    doc.text(`Examination:   ${selectedExam.examName}`, 14, 52);
    doc.text(`Result Status:  ${selectedExam.status.toUpperCase()}`, 140, 45);
    doc.text(`Overall Grade:  ${selectedExam.grade}`, 140, 52);

    // Table
    const tableColumn = ["Subject", "Max Marks", "Obtained", "Grade", "Result"];
    const tableRows = selectedExam.subjects.map(sub => {
      const isPass = sub.marks >= (sub.total * 0.40);
      return [sub.name, sub.total, sub.marks, sub.grade, isPass ? "PASS" : "FAIL"];
    });

    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [66, 133, 244] },
    });

    doc.save(`${studentName}_Report.pdf`);
  };

  if (loading) return <div className="p-10 text-center"><FaSpinner className="animate-spin text-4xl mx-auto text-blue-500"/></div>;

  if (results.length === 0) {
    return (
      <div className={`p-10 text-center rounded-3xl shadow-lg ${cardClass}`}>
        <FaFileAlt className="text-6xl mx-auto opacity-20 mb-4"/>
        <h2 className="text-xl font-bold">No Exam Results Yet</h2>
        <p className={textMuted}>Marks will appear here once faculty uploads them.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in">
      
      {/* HEADER & DROPDOWN */}
      <div className={`p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center ${cardClass}`}>
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold flex items-center">
            <FaTrophy className="mr-3 text-yellow-500" /> Academic Performance
          </h2>
          <p className={`text-sm mt-1 ${textMuted}`}>Select an exam to view detailed results.</p>
        </div>

        <div className="flex gap-4">
           {/* EXAM DROPDOWN */}
           <select 
             className={`p-3 rounded-xl border outline-none font-bold cursor-pointer ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
             onChange={(e) => {
               const exam = results.find(r => r.examName === e.target.value);
               setSelectedExam(exam);
             }}
             value={selectedExam?.examName || ''}
           >
             {results.map(r => <option key={r.id} value={r.examName}>{r.examName}</option>)}
           </select>

           <button 
             onClick={handleDownloadPDF} 
             className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center"
           >
             <FaDownload className="mr-2" /> Report PDF
           </button>
        </div>
      </div>

      {selectedExam && (
        <>
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-3xl shadow-lg border-l-8 border-blue-500 relative overflow-hidden ${cardClass}`}>
              <h3 className={`text-sm font-bold uppercase ${textMuted}`}>Percentage</h3>
              <div className="flex items-end gap-2 mt-2">
                  <span className="text-5xl font-bold text-blue-500">{selectedExam.percentage}%</span>
              </div>
              <FaChartLine className="absolute right-4 bottom-4 text-blue-500 opacity-10 text-6xl" />
            </div>

            <div className={`p-6 rounded-3xl shadow-lg border-l-8 border-purple-500 relative overflow-hidden ${cardClass}`}>
              <h3 className={`text-sm font-bold uppercase ${textMuted}`}>Overall Grade</h3>
              <div className="flex items-end gap-2 mt-2">
                  <span className="text-5xl font-bold text-purple-500">{selectedExam.grade}</span>
              </div>
              <FaTrophy className="absolute right-4 bottom-4 text-purple-500 opacity-10 text-6xl" />
            </div>

            <div className={`p-6 rounded-3xl shadow-lg border-l-8 ${selectedExam.status === 'Passed' ? 'border-green-500' : 'border-red-500'} relative overflow-hidden ${cardClass}`}>
              <h3 className={`text-sm font-bold uppercase ${textMuted}`}>Result Status</h3>
              <div className="flex items-center gap-3 mt-4">
                  {selectedExam.status === 'Passed' 
                    ? <FaCheckCircle className="text-4xl text-green-500" /> 
                    : <FaTimesCircle className="text-4xl text-red-500" />
                  }
                  <span className={`text-3xl font-bold ${selectedExam.status === 'Passed' ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedExam.status}
                  </span>
              </div>
            </div>
          </div>

          {/* MARKSHEET TABLE */}
          <div className={`rounded-3xl shadow-xl overflow-hidden ${cardClass}`}>
            <div className={`p-6 border-b ${borderClass}`}>
              <h3 className="font-bold text-lg flex items-center">
                <FaFileAlt className="mr-2 text-gray-400" /> Detailed Marksheet: {selectedExam.examName}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className={`bg-opacity-50 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`p-4 text-sm font-bold uppercase ${textMuted}`}>Subject</th>
                    <th className={`p-4 text-sm font-bold uppercase ${textMuted}`}>Max</th>
                    <th className={`p-4 text-sm font-bold uppercase ${textMuted}`}>Obtained</th>
                    <th className={`p-4 text-sm font-bold uppercase ${textMuted}`}>Grade</th>
                    <th className={`p-4 text-sm font-bold uppercase ${textMuted}`}>Result</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${borderClass}`}>
                  {selectedExam.subjects.map((sub, idx) => (
                    <tr key={idx} className={`transition ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                      <td className="p-4 font-semibold">{sub.name}</td>
                      <td className="p-4">{sub.total}</td>
                      <td className="p-4 font-bold">{sub.marks}</td>
                      <td className="p-4">{sub.grade}</td>
                      <td className="p-4 font-bold">{sub.marks >= (sub.total * 0.40) ? <span className="text-green-500">PASS</span> : <span className="text-red-500">FAIL</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamResults;