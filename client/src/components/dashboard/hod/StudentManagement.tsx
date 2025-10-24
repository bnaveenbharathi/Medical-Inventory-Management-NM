import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Edit, Trash, Eye, Key, BarChart3, BookOpen, Users, TrendingUp, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
const API_BASE = import.meta.env.VITE_API_BASE;

export const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const [studentFormData, setStudentFormData] = useState({
    name: "",
    email: "",
    roll_no: "",
    year: "",
    password: ""
  });
  const [studentErrors, setStudentErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/users/department-students`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch students");
      }
      
      setStudents(data.students || []);
    } catch (error: any) {
      console.error('Failed to fetch students:', error);
      alert('Failed to fetch students: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId: number) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/users/department-students/${studentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch student details");
      }
      
      setSelectedStudentDetails(data);
    } catch (error: any) {
      console.error('Failed to fetch student details:', error);
      alert('Failed to fetch student details: ' + error.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = async (student: any) => {
    setShowStudentDetailsModal(true);
    setSelectedStudentDetails(null);
    await fetchStudentDetails(student.id);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    if (!studentFormData.name.trim()) newErrors.name = "Name is required";
    if (!studentFormData.email.trim()) newErrors.email = "Email is required";
    if (!studentFormData.roll_no.trim()) newErrors.roll_no = "Roll number is required";
    if (!studentFormData.year.trim()) newErrors.year = "Year is required";
    
    setStudentErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/users/department-students/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(studentFormData)
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add student");
      }
      
      alert('Student added successfully!');
      setShowAddStudentModal(false);
      setStudentFormData({ name: "", email: "", roll_no: "", year: "", password: "" });
      setStudentErrors({});
      fetchStudents();
    } catch (error: any) {
      alert(error.message || 'Failed to add student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setStudentFormData({
      name: student.name || "",
      email: student.email || "",
      roll_no: student.roll_no || "",
      year: student.year?.toString() || "",
      password: ""
    });
    setStudentErrors({});
    setShowEditStudentModal(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    if (!studentFormData.name.trim()) newErrors.name = "Name is required";
    if (!studentFormData.email.trim()) newErrors.email = "Email is required";
    if (!studentFormData.roll_no.trim()) newErrors.roll_no = "Roll number is required";
    if (!studentFormData.year.trim()) newErrors.year = "Year is required";
    
    setStudentErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/users/department-students/${editingStudent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: studentFormData.name,
          email: studentFormData.email,
          roll_no: studentFormData.roll_no,
          year: studentFormData.year
        })
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update student");
      }
      
      alert('Student updated successfully!');
      setShowEditStudentModal(false);
      setEditingStudent(null);
      setStudentFormData({ name: "", email: "", roll_no: "", year: "", password: "" });
      setStudentErrors({});
      fetchStudents();
    } catch (error: any) {
      alert(error.message || 'Failed to update student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm('Are you sure you want to remove this student? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/users/department-students/${studentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete student");
      }
      
      alert('Student removed successfully!');
      fetchStudents();
    } catch (error: any) {
      alert(error.message || 'Failed to remove student');
    }
  };

  const handleResetPassword = async (studentId: number) => {
    if (!confirm('Are you sure you want to reset this student\'s password to "nscet123"?')) return;
    
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/users/department-students/${studentId}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ password: "nscet123" })
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset password");
      }
      
      alert('Password reset successfully to "nscet123"!');
    } catch (error: any) {
      alert(error.message || 'Failed to reset password');
    }
  };

  // Group students by year
  const studentsByYear = students.reduce((acc: any, student: any) => {
    const year = student.year || 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(student);
    return acc;
  }, {});

  const years = Object.keys(studentsByYear).sort();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-2xl font-semibold">Department Students Management</h3>
          <p className="text-sm text-gray-600 mt-1">Manage students in your department</p>
        </div>
        <Dialog open={showAddStudentModal} onOpenChange={setShowAddStudentModal}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 text-white hover:bg-orange-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="student-name" className="text-sm font-medium">
                  Name *
                </label>
                <input
                  type="text"
                  id="student-name"
                  value={studentFormData.name}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                  placeholder="Enter student name"
                  required
                />
                {studentErrors.name && <p className="text-red-500 text-sm">{studentErrors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="student-roll-no" className="text-sm font-medium">
                  Roll Number *
                </label>
                <input
                  type="text"
                  id="student-roll-no"
                  value={studentFormData.roll_no}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, roll_no: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                  placeholder="Enter roll number"
                  required
                />
                {studentErrors.roll_no && <p className="text-red-500 text-sm">{studentErrors.roll_no}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="student-email" className="text-sm font-medium">
                  Email *
                </label>
                <input
                  type="email"
                  id="student-email"
                  value={studentFormData.email}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                  placeholder="Enter student email"
                  required
                />
                {studentErrors.email && <p className="text-red-500 text-sm">{studentErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="student-year" className="text-sm font-medium">
                  Year *
                </label>
                <select
                  id="student-year"
                  value={studentFormData.year}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
                {studentErrors.year && <p className="text-red-500 text-sm">{studentErrors.year}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="student-password" className="text-sm font-medium">
                  Password (Optional)
                </label>
                <input
                  type="password"
                  id="student-password"
                  value={studentFormData.password}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                  placeholder="Leave blank for default (nscet123)"
                />
                <p className="text-xs text-gray-500">Default password is "nscet123" if left blank</p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setStudentFormData({ name: "", email: "", roll_no: "", year: "", password: "" });
                    setStudentErrors({});
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Student"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {years.map(year => (
          <Card key={year}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year {year}</p>
                  <p className="text-2xl font-bold">{studentsByYear[year].length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 text-lg">No students found</div>
          <p className="text-gray-400 mt-2">Add your first student to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {years.map(year => (
            <div key={year}>
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline" className="text-base px-3 py-1">
                  Year {year}
                </Badge>
                <span className="text-sm text-gray-500">({studentsByYear[year].length} students)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentsByYear[year].map((student: any) => (
                  <Card key={student.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                            {student.name ? student.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-foreground">{student.name}</h4>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>Roll: {student.roll_no}</span>
                              <span>•</span>
                              <span>{student.department_name}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Joined: {new Date(student.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4 flex-wrap">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(student)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleResetPassword(student.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Key className="h-3 w-3 mr-1" />
                          Reset Password
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Student Modal */}
      <Dialog open={showEditStudentModal} onOpenChange={setShowEditStudentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-student-name" className="text-sm font-medium">
                Name *
              </label>
              <input
                type="text"
                id="edit-student-name"
                value={studentFormData.name}
                onChange={(e) => setStudentFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                placeholder="Enter student name"
                required
              />
              {studentErrors.name && <p className="text-red-500 text-sm">{studentErrors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-student-roll-no" className="text-sm font-medium">
                Roll Number *
              </label>
              <input
                type="text"
                id="edit-student-roll-no"
                value={studentFormData.roll_no}
                onChange={(e) => setStudentFormData(prev => ({ ...prev, roll_no: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                placeholder="Enter roll number"
                required
              />
              {studentErrors.roll_no && <p className="text-red-500 text-sm">{studentErrors.roll_no}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-student-email" className="text-sm font-medium">
                Email *
              </label>
              <input
                type="email"
                id="edit-student-email"
                value={studentFormData.email}
                onChange={(e) => setStudentFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                placeholder="Enter student email"
                required
              />
              {studentErrors.email && <p className="text-red-500 text-sm">{studentErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-student-year" className="text-sm font-medium">
                Year *
              </label>
              <select
                id="edit-student-year"
                value={studentFormData.year}
                onChange={(e) => setStudentFormData(prev => ({ ...prev, year: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                required
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
              {studentErrors.year && <p className="text-red-500 text-sm">{studentErrors.year}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditStudentModal(false);
                  setEditingStudent(null);
                  setStudentFormData({ name: "", email: "", roll_no: "", year: "", password: "" });
                  setStudentErrors({});
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Student"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student Details Modal */}
      <Dialog open={showStudentDetailsModal} onOpenChange={setShowStudentDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details & Test Attendance</DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading student details...</div>
            </div>
          ) : selectedStudentDetails ? (
            <div className="space-y-6">
              {/* Student Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-foreground font-medium">{selectedStudentDetails.student.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-foreground">{selectedStudentDetails.student.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Roll Number</label>
                      <p className="text-foreground">{selectedStudentDetails.student.roll_no}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Department</label>
                      <p className="text-foreground">{selectedStudentDetails.student.department_full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Year</label>
                      <p className="text-foreground">{selectedStudentDetails.student.year}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Joined Date</label>
                      <p className="text-foreground">{new Date(selectedStudentDetails.student.joined_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tests Attended</p>
                        <p className="text-2xl font-bold">{selectedStudentDetails.statistics.total_tests_attended}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Award className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold">{selectedStudentDetails.statistics.tests_completed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">In Progress</p>
                        <p className="text-2xl font-bold">{selectedStudentDetails.statistics.tests_in_progress}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Score</p>
                        <p className="text-2xl font-bold">{selectedStudentDetails.statistics.average_score.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tests Attended */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Attendance History</CardTitle>
                  <CardDescription>All tests attended by this student</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedStudentDetails.tests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No tests attended yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedStudentDetails.tests.map((test: any) => (
                        <div key={test.test_id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-foreground">{test.title}</h4>
                                <Badge variant={test.status === 'completed' ? 'default' : 'secondary'}>
                                  {test.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>Subject: {test.subject}</p>
                                {test.topic_title && <p>Topic: {test.topic_title}</p>}
                                {test.sub_topic_title && <p>Subtopic: {test.sub_topic_title}</p>}
                                {test.created_by_name && <p>Created by: {test.created_by_name}</p>}
                                <div className="flex gap-4 mt-2">
                                  <span>📝 {test.num_questions} questions</span>
                                  <span>⏱️ {test.duration_minutes} min</span>
                                  {test.status === 'completed' && (
                                    <>
                                      <span className="font-semibold text-green-600">
                                        🏆 Score: {test.score}%
                                      </span>
                                      {test.time_taken_minutes && (
                                        <span>Time Taken: {test.time_taken_minutes} min</span>
                                      )}
                                    </>
                                  )}
                                </div>
                                {test.start_time && (
                                  <p className="text-xs mt-1">
                                    Started: {new Date(test.start_time).toLocaleString()}
                                    {test.end_time && ` | Ended: ${new Date(test.end_time).toLocaleString()}`}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No details available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
