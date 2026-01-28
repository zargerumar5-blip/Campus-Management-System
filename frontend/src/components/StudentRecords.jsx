import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserGraduate, FaTrash, FaEdit, FaPlusCircle, FaPrint, FaSearch } from 'react-icons/fa';

const StudentRecords = ({ isDark }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Styles
  const cardClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const tableHeaderClass = isDark ? 'bg-gray-700 text-gray-200' : 'bg-emerald-50 text-emerald-800';
  const rowClass = isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-emerald-50';

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students');
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLE EDIT STUDENT (Fixes 404 Issue) ---
  const handleEdit = async (student) => {
    const newName = prompt("Enter new Name:", student.userId?.name);
    const newRoll = prompt("Enter new Roll No:", student.rollNum);
    const newBatch = prompt("Enter new Batch:", student.batch);
    const newCourse = prompt("Enter new Course:", student.course);

    if (!newName || !newRoll || !newBatch || !newCourse) return; // Cancelled

    try {
      await axios.put(`http://localhost:5000/api/students/${student._id}`, {
        name: newName,
        rollNum: newRoll,
        batch: newBatch,
        course: newCourse
      });
      alert("✅ Student Updated Successfully!");
      fetchStudents(); // Refresh List
    } catch (err) {
      console.error(err);
      alert("❌ Update Failed. Check server console.");
    }
  };

  // --- HANDLE ADD FEE ---
  const handleAddFee = async (id, currentName) => {
    const amountStr = prompt(`Enter Fee Amount to add for ${currentName}:`);
    if (!amountStr) return; 

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/students/fees/${id}`, { amount });
      alert("✅ Fees Updated Successfully!");
      fetchStudents();
    } catch (err) {
      alert("❌ Failed to update fees.");
    }
  };

  // --- HANDLE DELETE ---
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      fetchStudents();
    } catch (err) {
      alert("Error deleting student");
    }
  };

  // --- HANDLE PRINT RECEIPT ---
  const handlePrint = (student) => {
    const balance = student.feesTotal - (student.feesPaidAmount || 0);
    const text = `
      RECEIPT
      -----------------------
      Student: ${student.userId?.name}
      Roll No: ${student.rollNum}
      
      Total Fees: ₹${student.feesTotal}
      Paid Amount: ₹${student.feesPaidAmount || 0}
      Remaining: ₹${balance}
      
      Status: ${balance <= 0 ? 'PAID' : 'PENDING'}
    `;
    alert(text);
  };

  const filteredStudents = students.filter(s => 
    s.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNum.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <div className={`p-8 rounded-3xl shadow-xl ${cardClass}`}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center mb-4 md:mb-0">
            <FaUserGraduate className="mr-3 text-emerald-500" /> Student Records & Fees
          </h2>
          
          <div className="relative">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Name or Roll No..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead className={tableHeaderClass}>
              <tr>
                <th className="p-4 font-bold">Roll No</th>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">Course</th>
                <th className="p-4 font-bold">Paid / Total</th>
                <th className="p-4 font-bold text-red-500">Balance</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredStudents.length > 0 ? filteredStudents.map(student => {
                const total = student.feesTotal || 50000;
                const paid = student.feesPaidAmount || 0;
                const balance = total - paid;

                return (
                  <tr key={student._id} className={`transition ${rowClass}`}>
                    <td className="p-4 font-bold">{student.rollNum}</td>
                    <td className="p-4">{student.userId?.name || 'Unknown'}</td>
                    <td className="p-4 opacity-70">{student.course}</td>
                    
                    <td className="p-4">
                       <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">₹{paid}</span>
                       <span className="text-xs opacity-50 ml-1">/ ₹{total}</span>
                    </td>

                    <td className="p-4 font-bold text-red-500">
                      ₹{balance > 0 ? balance : 0}
                    </td>

                    <td className="p-4 flex justify-center gap-3">
                      
                      {/* --- EDIT BUTTON --- */}
                      <button 
                        onClick={() => handleEdit(student)} 
                        className="text-blue-400 hover:text-blue-600 transition p-2 rounded-lg hover:bg-blue-50"
                        title="Edit Student"
                      >
                        <FaEdit />
                      </button>

                      <button onClick={() => handleDelete(student._id)} className="text-red-400 hover:text-red-600 transition p-2 rounded-lg hover:bg-red-50" title="Delete">
                        <FaTrash />
                      </button>

                      <button onClick={() => handleAddFee(student._id, student.userId?.name)} className="text-emerald-500 hover:text-emerald-700 transition p-2 rounded-lg hover:bg-emerald-50" title="Add Fee">
                        <FaPlusCircle className="text-xl" />
                      </button>

                      <button onClick={() => handlePrint(student)} className="text-purple-400 hover:text-purple-600 transition p-2 rounded-lg hover:bg-purple-50" title="Print">
                        <FaPrint />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="6" className="p-8 text-center opacity-50">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default StudentRecords;