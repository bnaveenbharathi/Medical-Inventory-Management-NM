import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Edit, Trash, Eye, Key, BarChart3, BookOpen, Users, TrendingUp } from "lucide-react";
const API_BASE = import.meta.env.VITE_API_BASE;

export const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [showStaffDetailsModal, setShowStaffDetailsModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const [staffFormData, setStaffFormData] = useState({
    name: "",
    email: "",
    roll_no: "",
    password: ""
  });
  const [staffErrors, setStaffErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/users/department-staff`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch staff");
      }
      
      setStaff(data.staff || []);
    } catch (error: any) {
      console.error('Failed to fetch staff:', error);
      alert('Failed to fetch staff: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffDetails = async (staffId: number) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/users/department-staff/${staffId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch staff details");
      }
      
      setSelectedStaffDetails(data);
    } catch (error: any) {
      console.error('Failed to fetch staff details:', error);
      alert('Failed to fetch staff details: ' + error.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = async (staffMember: any) => {
    setShowStaffDetailsModal(true);
    setSelectedStaffDetails(null);
    await fetchStaffDetails(staffMember.id);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    if (!staffFormData.name.trim()) newErrors.name = "Name is required";
    if (!staffFormData.email.trim()) newErrors.email = "Email is required";
    if (!staffFormData.roll_no.trim()) newErrors.roll_no = "Roll number is required";
    
    setStaffErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/users/department-staff/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(staffFormData)
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add staff");
      }
      
      alert('Staff added successfully!');
      setShowAddStaffModal(false);
      setStaffFormData({ name: "", email: "", roll_no: "", password: "" });
      setStaffErrors({});
      fetchStaff();
    } catch (error: any) {
      alert(error.message || 'Failed to add staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStaff = (staffMember: any) => {
    setEditingStaff(staffMember);
    setStaffFormData({
      name: staffMember.name || "",
      email: staffMember.email || "",
      roll_no: staffMember.roll_no || "",
      password: ""
    });
    setStaffErrors({});
    setShowEditStaffModal(true);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    if (!staffFormData.name.trim()) newErrors.name = "Name is required";
    if (!staffFormData.email.trim()) newErrors.email = "Email is required";
    if (!staffFormData.roll_no.trim()) newErrors.roll_no = "Roll number is required";
    
    setStaffErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/users/department-staff/${editingStaff.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: staffFormData.name,
          email: staffFormData.email,
          roll_no: staffFormData.roll_no
        })
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update staff");
      }
      
      alert('Staff updated successfully!');
      setShowEditStaffModal(false);
      setEditingStaff(null);
      setStaffFormData({ name: "", email: "", roll_no: "", password: "" });
      setStaffErrors({});
      fetchStaff();
    } catch (error: any) {
      alert(error.message || 'Failed to update staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    if (!confirm('Are you sure you want to remove this staff member? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/users/department-staff/${staffId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete staff");
      }
      
      alert('Staff removed successfully!');
      fetchStaff();
    } catch (error: any) {
      alert(error.message || 'Failed to remove staff');
    }
  };

  const handleResetPassword = async (staffId: number) => {
    if (!confirm('Are you sure you want to reset this staff member\'s password to "nscet123"?')) return;
    
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/users/department-staff/${staffId}/reset-password`, {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading staff...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-2xl font-semibold">Department Staff Management</h3>
          <p className="text-sm text-gray-600 mt-1">Manage faculty members in your department</p>
        </div>
        <Dialog open={showAddStaffModal} onOpenChange={setShowAddStaffModal}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 text-white hover:bg-orange-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="staff-name" className="text-sm font-medium">
                  Name *
                </label>
                <input
                  type="text"
                  id="staff-name"
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                  placeholder="Enter staff name"
                  required
                />
                {staffErrors.name && <p className="text-red-500 text-sm">{staffErrors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="staff-roll-no" className="text-sm font-medium">
                  Staff ID / Roll Number *
                </label>
                <input
                  type="text"
                  id="staff-roll-no"
                  value={staffFormData.roll_no}
                  onChange={(e) => setStaffFormData(prev => ({ ...prev, roll_no: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                  placeholder="Enter staff ID"
                  required
                />
                {staffErrors.roll_no && <p className="text-red-500 text-sm">{staffErrors.roll_no}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="staff-email" className="text-sm font-medium">
                  Email *
                </label>
                <input
                  type="email"
                  id="staff-email"
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                  placeholder="Enter staff email"
                  required
                />
                {staffErrors.email && <p className="text-red-500 text-sm">{staffErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="staff-password" className="text-sm font-medium">
                  Password (Optional)
                </label>
                <input
                  type="password"
                  id="staff-password"
                  value={staffFormData.password}
                  onChange={(e) => setStaffFormData(prev => ({ ...prev, password: e.target.value }))}
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
                    setShowAddStaffModal(false);
                    setStaffFormData({ name: "", email: "", roll_no: "", password: "" });
                    setStaffErrors({});
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Staff"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {staff.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 text-lg">No staff members found</div>
          <p className="text-gray-400 mt-2">Add your first staff member to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staff.map((member: any) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold">
                      {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-foreground">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>ID: {member.roll_no}</span>
                        <span>•</span>
                        <span>{member.department_name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Joined: {new Date(member.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4 flex-wrap">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewDetails(member)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditStaff(member)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleResetPassword(member.id)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Key className="h-3 w-3 mr-1" />
                    Reset Password
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteStaff(member.id)}
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
      )}

      {/* Edit Staff Modal */}
      <Dialog open={showEditStaffModal} onOpenChange={setShowEditStaffModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateStaff} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-staff-name" className="text-sm font-medium">
                Name *
              </label>
              <input
                type="text"
                id="edit-staff-name"
                value={staffFormData.name}
                onChange={(e) => setStaffFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                placeholder="Enter staff name"
                required
              />
              {staffErrors.name && <p className="text-red-500 text-sm">{staffErrors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-staff-roll-no" className="text-sm font-medium">
                Staff ID / Roll Number *
              </label>
              <input
                type="text"
                id="edit-staff-roll-no"
                value={staffFormData.roll_no}
                onChange={(e) => setStaffFormData(prev => ({ ...prev, roll_no: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                placeholder="Enter staff ID"
                required
              />
              {staffErrors.roll_no && <p className="text-red-500 text-sm">{staffErrors.roll_no}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-staff-email" className="text-sm font-medium">
                Email *
              </label>
              <input
                type="email"
                id="edit-staff-email"
                value={staffFormData.email}
                onChange={(e) => setStaffFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                placeholder="Enter staff email"
                required
              />
              {staffErrors.email && <p className="text-red-500 text-sm">{staffErrors.email}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditStaffModal(false);
                  setEditingStaff(null);
                  setStaffFormData({ name: "", email: "", roll_no: "", password: "" });
                  setStaffErrors({});
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Staff"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Staff Details Modal */}
      <Dialog open={showStaffDetailsModal} onOpenChange={setShowStaffDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Staff Details & Statistics</DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading staff details...</div>
            </div>
          ) : selectedStaffDetails ? (
            <div className="space-y-6">
              {/* Staff Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Staff Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-foreground font-medium">{selectedStaffDetails.staff.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-foreground">{selectedStaffDetails.staff.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Staff ID</label>
                      <p className="text-foreground">{selectedStaffDetails.staff.roll_no}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Department</label>
                      <p className="text-foreground">{selectedStaffDetails.staff.department_full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <p className="text-foreground">{selectedStaffDetails.staff.role}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Joined Date</label>
                      <p className="text-foreground">{new Date(selectedStaffDetails.staff.joined_date).toLocaleDateString()}</p>
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
                        <p className="text-sm text-muted-foreground">Total Tests</p>
                        <p className="text-2xl font-bold">{selectedStaffDetails.statistics.total_tests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Active Tests</p>
                        <p className="text-2xl font-bold">{selectedStaffDetails.statistics.active_tests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Students Participated</p>
                        <p className="text-2xl font-bold">{selectedStaffDetails.statistics.total_students_participated}</p>
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
                        <p className="text-2xl font-bold">{selectedStaffDetails.statistics.average_score.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tests Created */}
              <Card>
                <CardHeader>
                  <CardTitle>Tests Created</CardTitle>
                  <CardDescription>List of all tests conducted by this staff member</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedStaffDetails.tests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No tests created yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedStaffDetails.tests.map((test: any) => (
                        <div key={test.test_id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-foreground">{test.title}</h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  test.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {test.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>Subject: {test.subject}</p>
                                {test.topic_title && <p>Topic: {test.topic_title}</p>}
                                {test.sub_topic_title && <p>Subtopic: {test.sub_topic_title}</p>}
                                <div className="flex gap-4 mt-2">
                                  <span>📝 {test.num_questions} questions</span>
                                  <span>⏱️ {test.duration_minutes} min</span>
                                  <span>👥 {test.students_attended} attended</span>
                                  <span>✅ {test.students_completed} completed</span>
                                </div>
                                {test.date && (
                                  <p className="text-xs mt-1">
                                    Date: {new Date(test.date).toLocaleDateString()}
                                    {test.time_slot && ` | Time: ${test.time_slot}`}
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
