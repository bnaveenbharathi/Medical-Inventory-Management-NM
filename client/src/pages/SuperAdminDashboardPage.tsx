import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import icon from "../../public/icon.png"
const API_BASE = import.meta.env.VITE_API_BASE;

function parseCSV(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cols[i] ?? ""));
    return obj;
  });
}

// Client-side CSV -> JSON exporter
function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Small inline Modal component to avoid external dependencies
const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Simple Table component (very lightweight)
const Table = ({ columns, rows, actions }) => {
  return (
    <div className="overflow-auto border rounded">
      <table className="w-full text-left table-auto">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 text-sm font-medium text-gray-600">{c.title}</th>
            ))}
            {actions && <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-6 text-center text-gray-500">No records</td>
            </tr>
          )}
          {rows.map((r, idx) => (
            <tr key={idx} className="odd:bg-white even:bg-gray-50">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-sm text-gray-700 align-top">{c.render ? c.render(r) : r[c.key]}</td>
              ))}
              {actions && <td className="px-4 py-3">{actions(r)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Sample initial data (replace with API calls)
const initialDepartments = [
  { id: 1, code: "CSE", name: "Computer Science", hodId: 101, facultyCount: 12, studentCount: 400 },
  { id: 2, code: "ECE", name: "Electronics & Comm", hodId: 201, facultyCount: 8, studentCount: 320 },
];
const initialFaculty = [
  { id: 101, name: "Dr. Arasakumar", email: "aras@nscet.edu", department: "CSE" },
  { id: 201, name: "Ms. Kavya", email: "kavya@nscet.edu", department: "ECE" },
];
const initialStudents = [
  { id: 1001, roll: "CSE1001", name: "S. Kumar", email: "kumar@nscet.edu", department: "CSE", year: 3 },
];
const initialQuestions = [
  { id: 1, text: "What is React?", a: "Library", b: "Database", c: "Protocol", d: "Language", correct: "A", subject: "Web", difficulty: "Easy", approved: true },
];
const initialTests = [
  { id: 1, title: "CSE Midterm 1", department: "CSE", scheduledFor: "2025-09-30T10:00:00", duration: 60, status: "Published", active: false },
];

export default function SuperAdminApp() {
  const [view, setView] = useState("dashboard");

  function handleLogout() {
    // Clear session and redirect to login
    localStorage.removeItem("jwt_token");
    window.location.href = "/";
  }

  // Data stores: in real app these will be fetched from APIs
  const [departments, setDepartments] = useState([]);
  // Fetch departments from API on mount
  useEffect(() => {
    fetch(`${API_BASE}/dept/departments`)
      .then(res => res.json())
      .then(data => {
        // Map API fields to expected shape
        setDepartments(data.map(d => ({ id: d.id, code: d.short_name, name: d.full_name })));
      })
      .catch(() => setDepartments([]));
  }, []);
  const [faculty, setFaculty] = useState(initialFaculty);
  const [students, setStudents] = useState([]);
  // Fetch students from API on mount
  useEffect(() => {
    fetch(`${API_BASE}/student/list`)
      .then(res => res.json())
      .then(data => {
        setStudents(data.map(s => ({
          id: s.id,
          roll: s.roll_no,
          name: s.name,
          email: s.email,
          department: s.department_name,
          year: s.year
        })));
      })
      .catch(() => setStudents([]));
  }, []);
  const [questions, setQuestions] = useState(initialQuestions);
  const [tests, setTests] = useState(initialTests);

  // UI state for modals/forms
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [facultyModalOpen, setFacultyModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const [studentsModalOpen, setStudentsModalOpen] = useState(false);
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvDept, setCsvDept] = useState("");
  const [csvYear, setCsvYear] = useState("");
  const [csvRole, setCsvRole] = useState("Student");
  const [csvEditRows, setCsvEditRows] = useState([]);
  const [csvFile, setCsvFile] = useState(null);

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [testWizardOpen, setTestWizardOpen] = useState(false);
  const [activeTestMonitor, setActiveTestMonitor] = useState([]);

  const stats = useMemo(() => ({
    departments: departments.length,
    faculty: faculty.length,
    students: students.length,
    activeTests: tests.filter((t) => t.active).length,
    reports: 0,
  }), [departments, faculty, students, tests]);

  useEffect(() => {
    // Placeholder: poll active tests for monitor
    const interval = setInterval(() => {
      // fetch active tests from API and setActiveTestMonitor
      setActiveTestMonitor(tests.filter((t) => t.active));
    }, 5000);
    return () => clearInterval(interval);
  }, [tests]);

  /* -------------------- Departments UI -------------------- */
  function openAddDept() {
    setEditingDept({ code: "", name: "", hodId: null });
    setDeptModalOpen(true);
  }

  function saveDepartment(data) {
    if (!data.name || !data.code) return alert("Please enter department name and code");
    if (data.id) {
      setDepartments((d) => d.map((x) => (x.id === data.id ? { ...x, ...data } : x)));
    } else {
      const id = Math.max(0, ...departments.map((d) => d.id)) + 1;
      setDepartments((d) => [...d, { ...data, id }]);
    }
    setDeptModalOpen(false);
  }

  function removeDepartment(id) {
    if (!confirm("Delete department? This will not delete faculty/students automatically.")) return;
    setDepartments((d) => d.filter((x) => x.id !== id));
  }

  /* -------------------- Faculty UI -------------------- */
  function openAddFaculty() {
    setEditingFaculty({ id: null, name: "", email: "", department: "" });
    setFacultyModalOpen(true);
  }

  function saveFaculty(data) {
    if (!data.name || !data.email) return alert("Please provide name and email");
    if (data.id) {
      setFaculty((f) => f.map((x) => (x.id === data.id ? { ...x, ...data } : x)));
    } else {
      const id = Math.max(0, ...faculty.map((f) => f.id)) + 1;
      setFaculty((f) => [...f, { ...data, id }]);
    }
    setFacultyModalOpen(false);
  }

  function resetFacultyPassword(id) {
    const f = faculty.find((x) => x.id === id);
    alert(`Password reset initiated for ${f?.name || id}. Email will be sent.`);
  }

  function deleteFaculty(id) {
    if (!confirm("Remove faculty profile?")) return;
    setFaculty((f) => f.filter((x) => x.id !== id));
  }

  /* -------------------- Students CSV upload workflow -------------------- */
  function handleStudentCSVUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);
      setCsvPreview(parsed);
      setCsvEditRows(parsed.map((row) => ({ ...row })));
      setCsvHeaders(parsed.length ? Object.keys(parsed[0]) : []);
      setCsvDept("");
      setCsvYear("");
      setCsvRole("Student");
      setStudentsModalOpen(true);
    };
    reader.readAsText(file);
  }

  async function commitCsvStudents() {
    if (!csvEditRows.length) return alert("No CSV data to import");
    if (!csvDept) return alert("Please select department");
    if (!csvYear) return alert("Please select year");
    const newStudents = csvEditRows.map((r, idx) => ({
      roll: r.roll || r.roll_no || r.roll_number || r.Roll || `R${Date.now() + idx}`,
      name: r.name || r.fullname || r.Name || "Unknown",
      email: r.email || r.Email || "",
      department: csvDept,
      year: parseInt(csvYear, 10),
  role: 1
    }));
    try {
      const res = await fetch(`${API_BASE}/student/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: newStudents })
      });
      const result = await res.json();
      if (result.success) {
        // Add generated id for local state
        const studentsWithId = newStudents.map((stu, idx) => ({
          ...stu,
          id: Date.now() + idx
        }));
        setStudents((s) => [...studentsWithId, ...s]);
        setCsvPreview([]);
        setCsvEditRows([]);
        setStudentsModalOpen(false);
        setCsvDept("");
        setCsvYear("");
        setCsvRole("1");
        alert(`Imported ${newStudents.length} students successfully.`);
      } else {
        alert(`Import failed: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
  }

  function removeStudent(id) {
    if (!confirm("Remove student?")) return;
    setStudents((s) => s.filter((x) => x.id !== id));
  }

  function resetStudentPassword(id) {
    const s = students.find((x) => x.id === id);
    alert(`Password reset initiated for ${s?.name || id}. Email will be sent.`);
  }

  /* -------------------- Questions -------------------- */
  function openAddQuestion(q) {
    setEditingQuestion(q ?? { text: "", a: "", b: "", c: "", d: "", correct: "A", subject: "", difficulty: "Medium", approved: false });
    setQuestionModalOpen(true);
  }

  function saveQuestion(q) {
    if (!q.text) return alert("Question text required");
    if (q.id) {
      setQuestions((qs) => qs.map((x) => (x.id === q.id ? { ...x, ...q } : x)));
    } else {
      const id = Math.max(0, ...questions.map((x) => x.id)) + 1;
      setQuestions((qs) => [...qs, { ...q, id }]);
    }
    setQuestionModalOpen(false);
  }

  function bulkUploadQuestions(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result);
      const prepared = parsed.map((r, idx) => ({ id: Date.now() + idx, text: r.question_text || r.text, a: r.option_a, b: r.option_b, c: r.option_c, d: r.option_d, correct: r.correct_option || r.correct, subject: r.subject || r.category, difficulty: r.difficulty || "Medium", approved: false }));
      setQuestions((q) => [...prepared, ...q]);
      alert(`Parsed ${prepared.length} questions - pending review.`);
    };
    reader.readAsText(file);
  }

  function approveQuestion(id) {
    setQuestions((q) => q.map((x) => (x.id === id ? { ...x, approved: true } : x)));
  }

  function deleteQuestion(id) {
    if (!confirm("Delete question?")) return;
    setQuestions((q) => q.filter((x) => x.id !== id));
  }

  /* -------------------- Tests wizard -------------------- */
  const testWizardInit = { title: "", department: "", scheduledFor: "", duration: 30, questions: [] };
  const [testDraft, setTestDraft] = useState(testWizardInit);
  const [testStep, setTestStep] = useState(1);

  function openTestWizard() {
    setTestDraft(testWizardInit);
    setTestStep(1);
    setTestWizardOpen(true);
  }

  function addQuestionToTest(q) {
    setTestDraft((t) => ({ ...t, questions: [...t.questions, q] }));
  }

  function publishTest() {
    if (!testDraft.title || !testDraft.department || !testDraft.scheduledFor) return alert("Please fill basic test info");
    const id = Math.max(0, ...tests.map((t) => t.id)) + 1;
    setTests((ts) => [...ts, { ...testDraft, id, status: "Published", active: false }]);
    setTestWizardOpen(false);
    alert("Test published (client-side placeholder). Schedule worker should activate test at start time.");
  }

  function toggleTestActive(id) {
    setTests((ts) => ts.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  }

  /* -------------------- Reports -------------------- */
  const [reportFilter, setReportFilter] = useState({ department: "", testId: "", from: "", to: "" });
  function generateReportCSV() {
    // For demo: produce student-wise scores mock
    const rows = students.map((s) => ({ roll: s.roll, name: s.name, department: s.department, avg: Math.floor(Math.random() * 50) + 50 }));
    exportToCSV("iqarena_report_students.csv", rows);
  }
const [studentFilters, setStudentFilters] = useState({ roll: "", name: "", department: "", year: "" });

const filteredStudents = useMemo(() => {
  return students.filter(s =>
    (!studentFilters.roll || s.roll?.toLowerCase().includes(studentFilters.roll.toLowerCase())) &&
    (!studentFilters.name || s.name?.toLowerCase().includes(studentFilters.name.toLowerCase())) &&
    (!studentFilters.department || s.department === studentFilters.department) &&
    (!studentFilters.year || String(s.year) === String(studentFilters.year))
  );
}, [students, studentFilters]);
  /* -------------------- Render -------------------- */
  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm hidden md:block">
        <nav className="flex flex-col h-full p-6 gap-3">
          <div className="font-extrabold flex flex-col items-center text-2xl mb-4 text-orange-600">
            <img src={icon} alt="" width={50} />
            <h2>
              IQARENA
            </h2>
          </div>
          <SidebarLink active={view === "dashboard"} onClick={() => setView("dashboard")}>Dashboard</SidebarLink>
          <SidebarLink active={view === "departments"} onClick={() => setView("departments")}>Departments</SidebarLink>
          <SidebarLink active={view === "staff"} onClick={() => setView("staff")}>Staff</SidebarLink>
          <SidebarLink active={view === "students"} onClick={() => setView("students")}>Students</SidebarLink>
          <SidebarLink active={view === "questions"} onClick={() => setView("questions")}>Question Bank</SidebarLink>
          <SidebarLink active={view === "tests"} onClick={() => setView("tests")}>Tests</SidebarLink>
          <SidebarLink active={view === "reports"} onClick={() => setView("reports")}>Reports</SidebarLink>
          <SidebarLink active={view === "settings"} onClick={() => setView("settings")}>Settings</SidebarLink>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-end px-6 py-4 bg-white border-b">
         
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">Super Admin</div>
            <Button variant="outline" size="sm" className="flex items-center gap-2" title="Reset Password">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V7a6 6 0 10-12 0v3a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-8-3a4 4 0 118 0v3" /></svg>
            
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleLogout} title="Logout">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
            
            </Button>
          </div>
        </header>

        <main className="p-6 flex-1 overflow-auto">
          {view === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.departments}</div>
                  <div className="text-sm text-slate-500">Departments</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.faculty}</div>
                  <div className="text-sm text-slate-500">Faculty</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.students}</div>
                  <div className="text-sm text-slate-500">Students</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.activeTests}</div>
                  <div className="text-sm text-slate-500">Active Tests</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.reports}</div>
                  <div className="text-sm text-slate-500">Reports Generated</div>
                </Card>
              </div>

              <div className="flex gap-3">
                <Button onClick={openAddDept} className="bg-orange-500 text-white">Add Department</Button>
                <input id="bulkQ" type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && bulkUploadQuestions(e.target.files[0])} />
                <label htmlFor="bulkQ" className="cursor-pointer"><Button className="border">Upload Questions (CSV)</Button></label>
                <Button onClick={() => setView("reports")}>Generate Report</Button>
                <Button onClick={openTestWizard}>Create Test</Button>
              </div>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">Active Test Monitor</div>
                  <div className="text-sm text-slate-500">Auto-updates every 5s (client-demo)</div>
                </div>
                <Table
                  columns={[{ key: "title", title: "Title" }, { key: "department", title: "Department" }, { key: "scheduledFor", title: "Scheduled For", render: (r) => new Date(r.scheduledFor).toLocaleString() }, { key: "duration", title: "Duration (mins)" }]}
                  rows={activeTestMonitor}
                  actions={(r) => (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleTestActive(r.id)}>{r.active ? "Deactivate" : "Activate"}</Button>
                    </div>
                  )}
                />
              </Card>
            </div>
          )}

          {view === "departments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Departments</h2>
                <div className="flex gap-2">
                  <Button onClick={openAddDept}>Add Department</Button>
                </div>
              </div>
              <Card>
                <Table
                  columns={[{ key: "code", title: "Code" }, { key: "name", title: "Name" }, { key: "hodId", title: "HOD" }, { key: "facultyCount", title: "Faculty" }, { key: "studentCount", title: "Students" }]}
                  rows={departments}
                  actions={(r) => (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { setEditingDept(r); setDeptModalOpen(true); }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => removeDepartment(r.id)}>Delete</Button>
                    </div>
                  )}
                />
              </Card>
            </div>
          )}

          {view === "staff" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Faculty / Staff</h2>
                <div className="flex gap-2">
                  <Button onClick={openAddFaculty}>Add Faculty</Button>
                </div>
              </div>
              <Card>
                <Table
                  columns={[{ key: "name", title: "Name" }, { key: "email", title: "Email" }, { key: "department", title: "Department" }]}
                  rows={faculty}
                  actions={(r) => (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { setEditingFaculty(r); setFacultyModalOpen(true); }}>Edit</Button>
                      <Button size="sm" onClick={() => resetFacultyPassword(r.id)}>Reset Password</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteFaculty(r.id)}>Remove</Button>
                    </div>
                  )}
                />
              </Card>
            </div>
          )}
{view === "students" && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">Students</h2>
      <div className="flex gap-2 uploadcsv-students">
        <label htmlFor="studentsCSV" className="cursor-pointer"><Button onClick={() => setStudentsModalOpen(true)}>Upload CSV</Button></label>
      </div>
    </div>

    {/* Filter Inputs */}
    <Card className="mb-4 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Filter by Roll No"
          className="border px-3 py-2 rounded"
          value={studentFilters.roll}
          onChange={e => setStudentFilters(f => ({ ...f, roll: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Filter by Name"
          className="border px-3 py-2 rounded"
          value={studentFilters.name}
          onChange={e => setStudentFilters(f => ({ ...f, name: e.target.value }))}
        />
        <select
          className="border px-3 py-2 rounded"
          value={studentFilters.department}
          onChange={e => setStudentFilters(f => ({ ...f, department: e.target.value }))}
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <input
          type="number"
          placeholder="Year"
          className="border px-3 py-2 rounded"
          value={studentFilters.year}
          onChange={e => setStudentFilters(f => ({ ...f, year: e.target.value }))}
        />
      </div>
    </Card>

    <input
      id="studentsCSV"
      type="file"
      accept=".csv"
      className="hidden"
      onChange={(e) => e.target.files?.[0] && handleStudentCSVUpload(e.target.files[0])}
    />
    {/* Students CSV Modal */}
    <Modal open={studentsModalOpen} title="Import Students CSV" onClose={() => setStudentsModalOpen(false)}>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Upload CSV File</label>
          <input
            type="file"
            accept=".csv"
            className="border px-3 py-2 rounded w-full"
            onChange={e => {
              if (e.target.files?.[0]) {
                setCsvPreview([]);
                setCsvEditRows([]);
                setCsvHeaders([]);
                setCsvFile(e.target.files[0]);
              }
            }}
          />
          <Button className="mt-2" onClick={() => {
            if (csvFile) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const text = e.target.result;
                const parsed = parseCSV(text);
                setCsvPreview(parsed);
                setCsvEditRows(parsed.map((row) => ({ ...row })));
                setCsvHeaders(parsed.length ? Object.keys(parsed[0]) : []);
              };
              reader.readAsText(csvFile);
            } else {
              alert('Please upload a CSV file first.');
            }
          }}>Preview</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Select Department</label>
            <select className="border px-3 py-2 rounded w-full" value={csvDept} onChange={e => setCsvDept(e.target.value)}>
              <option value="">-- select department --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Select Year</label>
            <select className="border px-3 py-2 rounded w-full" value={csvYear} onChange={e => setCsvYear(e.target.value)}>
              <option value="">-- select year --</option>
              {[1,2,3,4].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Role</label>
            <select className="border px-3 py-2 rounded w-full" value={csvRole} onChange={e => setCsvRole(e.target.value)}>
              <option value="1">Student</option>
             
            </select>
          </div>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Preview & Edit CSV Data</label>
          <div className="overflow-auto border rounded max-h-48">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1 border-b">Roll No</th>
                  <th className="px-2 py-1 border-b">Name</th>
                  <th className="px-2 py-1 border-b">Email</th>
                  <th className="px-2 py-1 border-b">Department</th>
                  <th className="px-2 py-1 border-b">Year</th>
                  <th className="px-2 py-1 border-b">Role</th>
                  <th className="px-2 py-1 border-b">Edit</th>
                </tr>
              </thead>
              <tbody>
                {csvEditRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1 border-b">
                      <input
                        className="border px-1 py-0.5 rounded w-full text-xs"
                         value={row.roll_no || row.roll_number || row.Roll || ""}                        onChange={e => { 
                          const val = e.target.value;
                          setCsvEditRows(rows => rows.map((r, i) => i === idx ? { ...r, roll: val } : r));
                        }}
                      />
                    </td>
                    <td className="px-2 py-1 border-b">
                      <input
                        className="border px-1 py-0.5 rounded w-full text-xs"
                        value={row.name || row.fullname || row.Name || ""}                        onChange={e => {
                          const val = e.target.value;
                          setCsvEditRows(rows => rows.map((r, i) => i === idx ? { ...r, name: val } : r));
                        }}
                      />
                    </td>
                    <td className="px-2 py-1 border-b">
                      <input
                        className="border px-1 py-0.5 rounded w-full text-xs"
                        value={row.email || row.Email || ""}
                        onChange={e => {
                          const val = e.target.value;
                          setCsvEditRows(rows => rows.map((r, i) => i === idx ? { ...r, email: val } : r));
                        }}
                      />
                    </td>
                    <td className="px-2 py-1 border-b">{csvDept || row.department || ""}</td>
                    <td className="px-2 py-1 border-b">{csvYear || row.year || ""}</td>
                    <td className="px-2 py-1 border-b">{csvRole}</td>
                    <td className="px-2 py-1 border-b">
                      <Button size="sm" variant="destructive" onClick={() => setCsvEditRows(rows => rows.filter((_, i) => i !== idx))}>Remove</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!csvEditRows.length && <div className="p-2 text-gray-500">No data</div>}
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button onClick={commitCsvStudents}>Import Students</Button>
          <Button variant="outline" onClick={() => setStudentsModalOpen(false)}>Cancel</Button>
        </div>
      </div>
    </Modal>

    {/* Students table */}
    <Card>
      <Table
        columns={[
          { key: "roll", title: "Roll No" },
          { key: "name", title: "Name" },
          { key: "email", title: "Email" },
          { key: "department", title: "Department" },
          { key: "year", title: "Year" }
        ]}
        rows={filteredStudents}
        actions={(r) => (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" title="View">👁</Button>
            <Button size="sm" variant="ghost" title="Reset Password" onClick={() => resetStudentPassword(r.id)}>🔑</Button>
            <Button size="sm" variant="destructive" title="Remove" onClick={() => removeStudent(r.id)}>❌</Button>
          </div>
        )}
      />
    </Card>

  
  </div>
)}
{/* questios section */}
          {view === "questions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Question Bank</h2>
                <div className="flex gap-2">
                  <Button onClick={() => openAddQuestion(null)}>Add Question</Button>
                  <input id="qcsv" type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && bulkUploadQuestions(e.target.files[0])} />
                  <label htmlFor="qcsv" className="cursor-pointer"><Button>Bulk Upload (CSV)</Button></label>
                </div>
              </div>

              <Card>
                <Table
                  columns={[{ key: "text", title: "Question" }, { key: "subject", title: "Subject" }, { key: "difficulty", title: "Difficulty" }, { key: "approved", title: "Approved", render: (r) => (r.approved ? "Yes" : "No") }]}
                  rows={questions}
                  actions={(r) => (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => openAddQuestion(r)}>Edit</Button>
                      {!r.approved && <Button size="sm" onClick={() => approveQuestion(r.id)}>Approve</Button>}
                      <Button size="sm" variant="destructive" onClick={() => deleteQuestion(r.id)}>Delete</Button>
                    </div>
                  )}
                />
              </Card>
            </div>
          )}

          {view === "tests" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Tests Management</h2>
                <div className="flex gap-2">
                  <Button onClick={openTestWizard}>Create / Schedule Test</Button>
                </div>
              </div>

              <Card>
                <Table
                  columns={[{ key: "title", title: "Title" }, { key: "department", title: "Department" }, { key: "scheduledFor", title: "Scheduled For", render: (r) => new Date(r.scheduledFor).toLocaleString() }, { key: "duration", title: "Duration" }, { key: "status", title: "Status" }]}
                  rows={tests}
                  actions={(r) => (
                    <div className="flex gap-2">
                      <Button size="sm">Edit</Button>
                      <Button size="sm" onClick={() => toggleTestActive(r.id)}>{r.active ? "Stop" : "Start"}</Button>
                      <Button size="sm" variant="destructive">Remove</Button>
                    </div>
                  )}
                />
              </Card>
            </div>
          )}

          {view === "reports" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Reports & Analytics</h2>
                <div className="flex gap-2">
                  <Button onClick={generateReportCSV}>Export Student CSV</Button>
                  <Button onClick={() => alert("PDF export stub - implement server-side PDF generation")}>Export PDF (server)</Button>
                </div>
              </div>

              <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded">
                    <div className="text-sm text-slate-500">Average Score (last 30 days)</div>
                    <div className="text-2xl font-bold">72%</div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="text-sm text-slate-500">Pass Rate</div>
                    <div className="text-2xl font-bold">88%</div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="text-sm text-slate-500">Topper Avg</div>
                    <div className="text-2xl font-bold">94%</div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="text-sm text-slate-500">Exported Reports</div>
                    <div className="text-2xl font-bold">{stats.reports}</div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="text-sm text-slate-600 mb-2">Generate custom report</div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select className="border px-3 py-2 rounded w-full sm:w-64" onChange={(e) => setReportFilter((p) => ({ ...p, department: e.target.value }))}>
                    <option value="">All Departments</option>
                    {departments.map((d) => <option key={d.id} value={d.code}>{d.name}</option>)}
                  </select>
                  <select className="border px-3 py-2 rounded w-full sm:w-64" onChange={(e) => setReportFilter((p) => ({ ...p, testId: e.target.value }))}>
                    <option value="">All Tests</option>
                    {tests.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                  <Button onClick={() => alert("Generate stub report - replace with server-side query")}>Run</Button>
                </div>
              </Card>
            </div>
          )}

          {view === "settings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Settings & Access Control</h2>
              </div>
              <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium mb-2">Global Defaults</div>
                    <label className="block text-sm mb-1">Default Exam Duration (mins)</label>
                    <input type="number" defaultValue={60} className="border px-3 py-2 rounded w-40" />
                    <div className="mt-3 text-sm text-slate-500">Change system-level defaults here.</div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Roles</div>
                    <div className="text-sm text-slate-600">Super Admin, Faculty, HOD, Student, VP, Principal</div>
                    <div className="mt-2">
                      <Button onClick={() => alert("Role editor - implement granular RBAC on server")}>Edit Roles & Permissions</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

        </main>
      </div>

      {/* Modals */}
      <Modal open={deptModalOpen} title={editingDept?.id ? "Edit Department" : "Add Department"} onClose={() => setDeptModalOpen(false)}>
        <DeptForm initial={editingDept} onCancel={() => setDeptModalOpen(false)} onSave={(data) => saveDepartment(data)} faculties={faculty} />
      </Modal>

      <Modal open={facultyModalOpen} title={editingFaculty?.id ? "Edit Faculty" : "Add Faculty"} onClose={() => setFacultyModalOpen(false)}>
        <FacultyForm initial={editingFaculty} onCancel={() => setFacultyModalOpen(false)} onSave={(data) => saveFaculty(data)} departments={departments} />
      </Modal>

      <Modal open={questionModalOpen} title={editingQuestion?.id ? "Edit Question" : "Add Question"} onClose={() => setQuestionModalOpen(false)}>
        <QuestionForm initial={editingQuestion} onCancel={() => setQuestionModalOpen(false)} onSave={(q) => saveQuestion(q)} />
      </Modal>

      <Modal open={testWizardOpen} title={`Create Test - Step ${testStep}/3`} onClose={() => setTestWizardOpen(false)}>
        <div>
          {testStep === 1 && (
            <div>
              <div className="mb-3">Step 1: Basic Info</div>
              <input className="border px-3 py-2 rounded w-full mb-2" placeholder="Test title" value={testDraft.title} onChange={(e) => setTestDraft((t) => ({ ...t, title: e.target.value }))} />
              <select className="border px-3 py-2 rounded w-full mb-2" value={testDraft.department} onChange={(e) => setTestDraft((t) => ({ ...t, department: e.target.value }))}>
                <option value="">Select department</option>
                {departments.map((d) => <option key={d.id} value={d.code}>{d.name}</option>)}
              </select>
              <input type="datetime-local" className="border px-3 py-2 rounded w-full mb-2" value={testDraft.scheduledFor} onChange={(e) => setTestDraft((t) => ({ ...t, scheduledFor: e.target.value }))} />
              <input type="number" className="border px-3 py-2 rounded w-full mb-2" value={testDraft.duration} onChange={(e) => setTestDraft((t) => ({ ...t, duration: parseInt(e.target.value || "0", 10) }))} />
              <div className="flex gap-2 mt-2">
                <Button onClick={() => setTestStep(2)}>Next: Add Questions</Button>
                <Button variant="outline" onClick={() => setTestWizardOpen(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {testStep === 2 && (
            <div>
              <div className="mb-3">Step 2: Add Questions (select from question bank)</div>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-auto">
                {questions.map((q) => (
                  <div key={q.id} className="p-3 border rounded flex justify-between items-center">
                    <div className="text-sm">{q.text}</div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => addQuestionToTest(q)}>Add</Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3">Selected: {testDraft.questions.length} questions</div>
              <div className="flex gap-2 mt-2">
                <Button onClick={() => setTestStep(3)}>Next: Assign & Publish</Button>
                <Button variant="outline" onClick={() => setTestStep(1)}>Back</Button>
              </div>
            </div>
          )}

          {testStep === 3 && (
            <div>
              <div className="mb-3">Step 3: Review & Publish</div>
              <div className="mb-2">Title: {testDraft.title}</div>
              <div className="mb-2">Department: {testDraft.department}</div>
              <div className="mb-2">Scheduled For: {testDraft.scheduledFor}</div>
              <div className="mb-2">Questions: {testDraft.questions.length}</div>
              <div className="flex gap-2 mt-2">
                <Button onClick={publishTest}>Publish Test</Button>
                <Button variant="outline" onClick={() => setTestStep(2)}>Back</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

/* ---------- Small subcomponents used above ---------- */
function SidebarLink({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`text-left py-2 px-3 rounded ${active ? "bg-orange-50 font-semibold text-orange-600" : "hover:bg-orange-50"}`}>{children}</button>
  );
}

function DeptForm({ initial, onSave, onCancel, faculties }) {
  const [data, setData] = useState(initial || { code: "", name: "", hodId: null });
  useEffect(() => setData(initial || { code: "", name: "", hodId: null }), [initial]);
  return (
    <div>
      <div className="grid grid-cols-1 gap-3">
        <label className="text-sm">Department Code</label>
        <input value={data.code} onChange={(e) => setData((d) => ({ ...d, code: e.target.value }))} className="border px-3 py-2 rounded" />
        <label className="text-sm">Department Name</label>
        <input value={data.name} onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))} className="border px-3 py-2 rounded" />
        <label className="text-sm">Assign HOD</label>
        <select value={data.hodId || ""} onChange={(e) => setData((d) => ({ ...d, hodId: e.target.value }))} className="border px-3 py-2 rounded">
          <option value="">-- select --</option>
          {faculties.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.department})</option>)}
        </select>
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={() => onSave(data)}>Save</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function FacultyForm({ initial, onSave, onCancel, departments }) {
  const [data, setData] = useState(initial || { name: "", email: "", department: "" });
  useEffect(() => setData(initial || { name: "", email: "", department: "" }), [initial]);
  return (
    <div>
      <label className="text-sm">Name</label>
      <input value={data.name} onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))} className="border px-3 py-2 rounded w-full mb-2" />
      <label className="text-sm">Email</label>
      <input value={data.email} onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))} className="border px-3 py-2 rounded w-full mb-2" />
      <label className="text-sm">Department</label>
      <select value={data.department} onChange={(e) => setData((d) => ({ ...d, department: e.target.value }))} className="border px-3 py-2 rounded w-full mb-2">
        <option value="">-- select --</option>
        {departments.map((d) => <option key={d.id} value={d.code}>{d.name}</option>)}
      </select>
      <div className="flex gap-2 mt-4">
        <Button onClick={() => onSave(data)}>Save</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function QuestionForm({ initial, onSave, onCancel }) {
  const [q, setQ] = useState(initial || { text: "", a: "", b: "", c: "", d: "", correct: "A", subject: "", difficulty: "Medium", approved: false });
  useEffect(() => setQ(initial || { text: "", a: "", b: "", c: "", d: "", correct: "A", subject: "", difficulty: "Medium", approved: false }), [initial]);
  return (
    <div>
      <label className="text-sm">Question Text</label>
      <textarea value={q.text} onChange={(e) => setQ((s) => ({ ...s, text: e.target.value }))} className="border px-3 py-2 rounded w-full mb-2" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="text-sm">Option A</label>
          <input value={q.a} onChange={(e) => setQ((s) => ({ ...s, a: e.target.value }))} className="border px-3 py-2 rounded w-full mb-2" />
        </div>
        <div>
          <label className="text-sm">Option B</label>
          <input value={q.b} onChange={(e) => setQ((s) => ({ ...s, b: e.target.value }))} className="border px-3 py-2 rounded w-full mb-2" />
        </div>
        <div>
          <label className="text-sm">Option C</label>
          <input value={q.c} onChange={(e) => setQ((s) => ({ ...s, c: e.target.value }))} className="border px-3 py-2 rounded w-full mb-2" />
        </div>
        <div>
          <label className="text-sm">Option D</label>
          <input value={q.d} onChange={(e) => setQ((s) => ({ ...s, d: e.target.value }))} className="border px-3 py-2 rounded w-full mb-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
        <select value={q.correct} onChange={(e) => setQ((s) => ({ ...s, correct: e.target.value }))} className="border px-3 py-2 rounded">
          <option value="A">Correct: A</option>
          <option value="B">Correct: B</option>
          <option value="C">Correct: C</option>
          <option value="D">Correct: D</option>
        </select>
        <input placeholder="Subject" value={q.subject} onChange={(e) => setQ((s) => ({ ...s, subject: e.target.value }))} className="border px-3 py-2 rounded" />
        <select value={q.difficulty} onChange={(e) => setQ((s) => ({ ...s, difficulty: e.target.value }))} className="border px-3 py-2 rounded">
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={() => onSave(q)}>Save Question</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
