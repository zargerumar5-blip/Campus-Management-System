import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaFileInvoiceDollar, FaPrint, FaPlusCircle, FaEdit, FaSave, FaTimes, FaTrash } from 'react-icons/fa';

const StudentList = ({ isDark }) => {
  const [students, setStudents] = useState([]);
  
  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', rollNum: '', course: '', batch: '' });

  // Fetch all students & SORT A-Z
  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students');
      
      // --- SORTING LOGIC ADDED HERE (By Name A-Z) ---
      const sortedStudents = res.data.sort((a, b) => 
        (a.userId?.name || "").localeCompare(b.userId?.name || "")
      );
      
      setStudents(sortedStudents);
    } catch (error) {
      console.error('Error fetching students');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // --- CRUD: DELETE STUDENT ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student? All fee and attendance records will be lost.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      alert("Student deleted successfully");
      fetchStudents();
    } catch (err) {
      alert("Failed to delete student");
    }
  };

  // --- CRUD: START EDITING ---
  const handleEditClick = (student) => {
    setEditingId(student._id);
    setEditForm({
      name: student.userId?.name || '',
      rollNum: student.rollNum,
      course: student.course,
      batch: student.batch
    });
  };

  // --- CRUD: SAVE CHANGES ---
  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/students/${editingId}`, editForm);
      alert("✅ Student Updated Successfully!");
      setEditingId(null);
      fetchStudents();
    } catch (err) {
      alert("Failed to update student. Roll number might be duplicate.");
    }
  };

  // --- FEE: MANUAL PAYMENT LOGIC ---
  const handleAddPayment = async (studentId) => {
    const amountStr = prompt("Enter amount to pay (e.g., 5000):");
    if (!amountStr) return;

    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid number");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/students/fees/${studentId}`, { amount });
      alert(`₹${amount} Added Successfully!`);
      fetchStudents();
    } catch (error) {
      alert("Failed to update fees");
    }
  };

  // --- FEE: PRINT RECEIPT LOGIC ---
  const printReceipt = (student) => {
    const paidAmount = student.feesPaidAmount || 0;
    const totalFee = student.feesTotal || 15000;
    const balance = totalFee - paidAmount;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Receipt - ${student.rollNum}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
            .box { border: 1px solid #ddd; padding: 20px; margin: 0 auto; max-width: 600px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .badge { padding: 5px 10px; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 20px; }
            .paid { color: green; border: 2px solid green; }
            .partial { color: orange; border: 2px solid orange; }
          </style>
        </head>
        <body>
          <div class="box">
            <div class="header">
              <div class="logo">SVM Udgir</div>
              <p>Official Fee Receipt</p>
            </div>
            <div style="margin-top: 20px;">
              <div class="row"><strong>Date:</strong> <span>${new Date().toLocaleDateString()}</span></div>
              <div class="row"><strong>Student:</strong> <span>${student.userId?.name}</span></div>
              <div class="row"><strong>Roll No:</strong> <span>${student.rollNum}</span></div>
              <div class="row"><strong>Course:</strong> <span>${student.course}</span></div>
              <hr/>
              <div class="row"><strong>Total Fee:</strong> <span>₹${totalFee}</span></div>
              <div class="row" style="color:green"><strong>Paid Amount:</strong> <span>₹${paidAmount}</span></div>
              <div class="row" style="color:red"><strong>Balance:</strong> <span>₹${balance > 0 ? balance : 0}</span></div>
            </div>
            <div style="text-align:center">
               <span class="badge ${balance <= 0 ? 'paid' : 'partial'}">
                  ${balance <= 0 ? 'FULLY PAID' : 'PARTIAL PAYMENT'}
               </span>
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Dark Mode Styles
  const themeClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const inputClass = isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300';
  const tableHeadClass = isDark ? 'bg-gray-700 text-white' : 'bg-emerald-50 text-gray-700';

  return (
    <div className={`p-6 rounded-xl shadow-md ${themeClass}`}>
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <FaFileInvoiceDollar className="mr-3 text-emerald-600" /> Student Records & Fees
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className={tableHeadClass}>
            <tr>
              <th className="p-4">Roll No</th>
              <th className="p-4">Name</th>
              <th className="p-4">Course</th>
              <th className="p-4">Fee Balance</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
               // Calculate fees safely
               const paid = student.feesPaidAmount || 0;
               const total = student.feesTotal || 15000;
               const balance = total - paid;
               const isEditing = editingId === student._id;

               return (
                <tr key={student._id} className="border-b border-gray-700/20 hover:bg-black/5 transition">
                  {/* ROLL NUMBER */}
                  <td className="p-4 font-bold">
                    {isEditing ? (
                      <input 
                        value={editForm.rollNum} 
                        onChange={e => setEditForm({...editForm, rollNum: e.target.value})} 
                        className={`w-24 p-1 rounded ${inputClass}`}
                      />
                    ) : (
                      student.rollNum
                    )}
                  </td>

                  {/* NAME */}
                  <td className="p-4">
                    {isEditing ? (
                      <input 
                        value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})} 
                        className={`w-full p-1 rounded ${inputClass}`}
                      />
                    ) : (
                      student.userId?.name
                    )}
                  </td>

                  {/* COURSE */}
                  <td className="p-4">
                    {isEditing ? (
                      <input 
                        value={editForm.course} 
                        onChange={e => setEditForm({...editForm, course: e.target.value})} 
                        className={`w-32 p-1 rounded ${inputClass}`}
                      />
                    ) : (
                      student.course
                    )}
                  </td>

                  {/* FEE BALANCE */}
                  <td className="p-4 font-bold text-red-500">
                    ₹{balance > 0 ? balance : 0}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4 flex justify-center space-x-2">
                    {isEditing ? (
                      <>
                        <button onClick={handleSaveEdit} className="p-2 bg-green-600 text-white rounded hover:bg-green-700" title="Save">
                          <FaSave />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600" title="Cancel">
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* EDIT */}
                        <button onClick={() => handleEditClick(student)} className="p-2 text-blue-500 hover:bg-blue-100 rounded" title="Edit Details">
                          <FaEdit />
                        </button>

                        {/* DELETE */}
                        <button onClick={() => handleDelete(student._id)} className="p-2 text-red-500 hover:bg-red-100 rounded" title="Delete Student">
                          <FaTrash />
                        </button>

                        {/* PAY (Show if balance > 0) */}
                        {balance > 0 && (
                          <button onClick={() => handleAddPayment(student._id)} className="p-2 text-green-600 hover:bg-green-100 rounded" title="Add Payment">
                            <FaPlusCircle />
                          </button>
                        )}

                        {/* PRINT (Show if paid > 0) */}
                        {paid > 0 && (
                          <button onClick={() => printReceipt(student)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded" title="Print Receipt">
                            <FaPrint />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {students.length === 0 && <p className="text-center p-6 opacity-50">No students found.</p>}
      </div>
    </div>
  );
};

export default StudentList;