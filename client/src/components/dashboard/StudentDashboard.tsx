import { ReportsSectionUI } from "./ReportsSectionUI"; // Assuming this exists for reports, or placeholder
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "./stats-card";
import { BookOpen, Clock, Trophy, User, Play, Pause, CheckCircle, Users, BarChart3, Eye, Edit, FileText } from "lucide-react";
import Header from "./student/Header"; 
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockQuizzes = [
  {
    id: 1,
    title: "Data Structures & Algorithms",
    subject: "Computer Science",
    duration: 60,
    questions: 25,
    status: "available" as const,
    dueDate: "2025-10-15",
    attempts: 0,
    maxAttempts: 2
  },
  {
    id: 2,
    title: "Database Management Systems",
    subject: "Computer Science", 
    duration: 45,
    questions: 20,
    status: "in-progress" as const,
    dueDate: "2025-10-10",
    attempts: 1,
    maxAttempts: 2,
    progress: 65
  },
  {
    id: 3,
    title: "Operating Systems Fundamentals",
    subject: "Computer Science",
    duration: 90,
    questions: 30,
    status: "completed" as const,
    dueDate: "2025-10-05",
    attempts: 1,
    maxAttempts: 1,
    score: 85
  }
];

const mockStats = {
  totalQuizzes: 15,
  completedQuizzes: 8,
  averageScore: 78,
  rank: 12
};

const getStatusBadge = (status: string) => {
  const variants = {
    available: "default",
    "in-progress": "secondary", 
    completed: "outline"
  } as const;

  const colors = {
    available: "bg-primary text-primary-foreground",
    "in-progress": "bg-warning text-warning-foreground",
    completed: "bg-success text-success-foreground"
  };

  return (
    <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
      {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const mockQuizzesSection = ({ quizzes }: { quizzes: typeof mockQuizzes }) => (
  <div className="space-y-4">
    {quizzes.map((quiz) => (
      <div key={quiz.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium text-foreground">{quiz.title}</h3>
            {getStatusBadge(quiz.status)}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {quiz.questions} questions
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {quiz.duration} minutes
            </span>
            <span>Due: {quiz.dueDate}</span>
            <span>Attempts: {quiz.attempts}/{quiz.maxAttempts}</span>
          </div>
          {quiz.status === "in-progress" && quiz.progress && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground">{quiz.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-warning h-2 rounded-full" 
                  style={{ width: `${quiz.progress}%` }}
                />
              </div>
            </div>
          )}
          {quiz.status === "completed" && quiz.score && (
            <div className="mt-2">
              <span className="text-sm text-success font-medium">
                Score: {quiz.score}%
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {quiz.status === "available" && (
            <Button size="sm">
              <Play className="h-4 w-4 mr-1" />
              Start Quiz
            </Button>
          )}
          {quiz.status === "in-progress" && (
            <Button size="sm" variant="secondary">
              <Pause className="h-4 w-4 mr-1" />
              Resume
            </Button>
          )}
          {quiz.status === "completed" && (
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-1" />
              View Results
            </Button>
          )}
        </div>
      </div>
    ))}
  </div>
);

const API_BASE = import.meta.env.VITE_API_BASE;

interface Profile {
  user_id: number;
  name: string;
  email: string;
  role: string;
  department: string;
}

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  
  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  
  // Profile editing states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  type ProfileData = {
    name: string;
    email: string;
  };

  const [profileData, setProfileData] = useState({
    name: "",
    email: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{ [key: string]: string }>({});
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch student profile
  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileError("");
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch profile");
      }
      
      const user = data.profile;
      console.log('Profile data received:', user); // Debug log
      setProfile({ 
        user_id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_id === 1 ? "Student" : user.role_id === 2 ? "Faculty" : "Admin",
        department: user.department_name || "Not Assigned"
      });
      console.log('Profile state set successfully'); // Debug log
    } catch (error: any) {
      console.error('Profile fetch error:', error); // Debug log
      setProfileError(error.message || "Failed to fetch profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (profileData: { name: string; email: string }) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile");
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData)
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset password");
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Profile handlers
  const handleEditProfile = () => {
    if (profile) {
      setProfileData({
        name: profile.name || "",
        email: profile.email || ""
      });
      setProfileErrors({});
      setShowEditProfileModal(true);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: { [key: string]: string } = {};
    if (!profileData.name.trim()) newErrors.name = "Name is required";
    if (!profileData.email.trim()) newErrors.email = "Email is required";
    if (profileData.email && !/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    setProfileErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setProfileSubmitting(true);
    try {
      await updateProfile(profileData);
      alert('Profile updated successfully!');
      setShowEditProfileModal(false);
      fetchProfile(); // Refresh profile data
    } catch (error: any) {
      alert(error.message || 'Failed to update profile');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: { [key: string]: string } = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!passwordData.newPassword) newErrors.newPassword = "New password is required";
    if (passwordData.newPassword && passwordData.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters long";
    }
    if (!passwordData.confirmPassword) newErrors.confirmPassword = "Please confirm your new password";
    if (passwordData.newPassword && passwordData.confirmPassword && 
        passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setPasswordErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setPasswordSubmitting(true);
    try {
      await resetPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      alert('Password reset successfully!');
      setShowResetPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      alert(error.message || 'Failed to reset password');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Message */}
        <Card>
          <CardContent className="p-3 sticky top-0">
            <div className="flex items-center justify-between">
              <div className="items-center flex">
                <h2 className="text-xl font-semibold text-foreground">Welcome back, {profile?.name || "Student"}!</h2> 
              </div>
              <nav className="flex gap-4 items-center mb-2">
                <Button variant={activeSection === "dashboard" ? "default" : "ghost"} size="sm" onClick={() => setActiveSection("dashboard")}>Dashboard</Button>
                <Button variant={activeSection === "quizzes" ? "default" : "ghost"} size="sm" onClick={() => setActiveSection("quizzes")}>My Quizzes</Button>
                <Button variant={activeSection === "leaderboard" ? "default" : "ghost"} size="sm" onClick={() => setActiveSection("leaderboard")}>Leaderboard</Button>
                <Button variant={activeSection === "reports" ? "default" : "ghost"} size="sm" onClick={() => setActiveSection("reports")}>Reports</Button>
                <Button variant={activeSection === "profile" ? "default" : "ghost"} size="sm" onClick={() => setActiveSection("profile")}>Profile</Button>
              </nav>
            </div>
          </CardContent>
        </Card>

        {/* Section Content */}
        {activeSection === "dashboard" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Quizzes"
                value={mockStats.totalQuizzes}
                icon={BookOpen}
              />
              <StatsCard
                title="Completed"
                value={mockStats.completedQuizzes}
                change="+2 this week"
                changeType="positive"
                icon={CheckCircle}
              />
              <StatsCard
                title="Average Score"
                value={`${mockStats.averageScore}%`}
                change="+5% from last month"
                changeType="positive"
                icon={Trophy}
              />
              <StatsCard
                title="Class Rank"
                value={`#${mockStats.rank}`}
                change="↑3 positions"
                changeType="positive"
                icon={User}
              />
            </div>
            {/* Recent Quizzes */}
            <Card>
              <CardHeader>
                <CardTitle>Available Quizzes</CardTitle>
                <CardDescription>
                  Complete your assigned quizzes before the due date
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mockQuizzesSection({ quizzes: mockQuizzes })}
              </CardContent>
            </Card>
          </>
        )}
        {activeSection === "quizzes" && (
          <Card>
            <CardHeader>
              <CardTitle>My Quizzes</CardTitle>
              <CardDescription>
                View all your quizzes and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockQuizzesSection({ quizzes: mockQuizzes })}
            </CardContent>
          </Card>
        )}
        {activeSection === "leaderboard" && (
          <Card>
            <CardContent className="p-6">Leaderboard Section (implement leaderboard here)</CardContent>
          </Card>
        )}
        {activeSection === "reports" && (
          <Card>
            <CardContent className="">
              <ReportsSectionUI />
            </CardContent>
          </Card>
        )}

        {activeSection === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
            
              
              {profileLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-gray-500">Loading profile...</div>
                </div>
              ) : profileError ? (
                <div className="flex justify-center items-center py-12 text-red-500">
                  <p>{profileError}</p>
                </div>
              ) : profile ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-2xl">
                        {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'ST'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold">{profile.name}</h3>
                     
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium">Personal Information</h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                          <p className="text-sm">{profile.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                          <p className="text-sm">{profile.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-medium">Academic Information</h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                          <p className="text-sm">{profile.role}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                          <p className="text-sm">{profile.department}</p>
                        </div>
                      
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t">
                    <Button onClick={handleEditProfile}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" onClick={() => setShowResetPasswordModal(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No profile data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={showEditProfileModal} onOpenChange={setShowEditProfileModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                placeholder="Enter your full name"
              />
              {profileErrors.name && <p className="text-red-500 text-sm mt-1">{profileErrors.name}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                placeholder="Enter your email address"
              />
              {profileErrors.email && <p className="text-red-500 text-sm mt-1">{profileErrors.email}</p>}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={profileSubmitting}>
                {profileSubmitting ? 'Updating...' : 'Update Profile'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowEditProfileModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={showResetPasswordModal} onOpenChange={setShowResetPasswordModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                placeholder="Enter current password"
              />
              {passwordErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>}
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                placeholder="Enter new password"
              />
              {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                placeholder="Confirm new password"
              />
              {passwordErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>}
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={passwordSubmitting}>
                {passwordSubmitting ? 'Updating...' : 'Change Password'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowResetPasswordModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
         
      <div className='bg-orange-500 p-4 text-center'>
        <h2 className='uppercase text-xl text-white'>
            Developed By <a href="https://www.nscet.org/ispin">Innovative Software Product Industry of NSCET</a>
        </h2>
      </div>
    </div>
  );
};

export default StudentDashboard;