import { useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE ;
import { useAuth } from "@/components/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Eye, EyeOff, Lock, User } from "lucide-react";

const roles = [
  { value: "student", label: "Student" },
  { value: "faculty", label: "Faculty" },
  { value: "hod", label: "HOD" }, 
  { value: "admin", label: "Admin" },

];

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    rollNo: "",
    password: "",
    role: ""
  });
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [signupData, setSignupData] = useState({
    departmentId: '',
    firstName: '',
    registerEmail: '',
    department: '',
    dbPassword: '', // password from DB
    password: '' // password user enters
  });


    // Fetch user details from backend for signup
    const fetchUserDetails = async (userId: string) => {
      if (!userId) return;
      try {
        const res = await fetch(`${API_BASE}/auth/user/${userId}`);
        if (!res.ok) {
          setSignupData(prev => ({
            ...prev,
            departmentId: userId,
            firstName: '',
            registerEmail: '',
            department: '',
            dbPassword: '',
            password: ''
          }));
          return;
        }
        const data = await res.json();
        setSignupData(prev => ({
          ...prev,
          departmentId: data.roll_no,
          firstName: data.name,
          registerEmail: data.email,
          department: data.department,
          dbPassword: data.password || '',
          password: ''
        }));
      } catch (e) {
        setSignupData(prev => ({
          ...prev,
          departmentId: userId,
          firstName: '',
          registerEmail: '',
          department: '',
          dbPassword: '',
          password: ''
        }));
      }
    };


    const { login: setAuthLogin } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (activeTab === 'login') {
        // Login API call
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollNo: formData.rollNo, password: formData.password })
          });
          const data = await res.json();
          if (res.ok) {
            // Set auth context role based on backend data
            let role: any = formData.role || null;
            // Optionally, fetch role from backend if available
            setAuthLogin(role);
          } else {
            alert(data.error || 'Login failed');
          }
        } catch (err) {
          alert('Login failed');
        }
      } else {
        // Signup API call
        if (!signupData.departmentId || !signupData.password) {
          alert('User ID and password required');
          return;
        }
        if (signupData.dbPassword && signupData.dbPassword.trim() !== '') {
          alert('Password already set for this user.');
          return;
        }
        try {
          const res = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollNo: signupData.departmentId, password: signupData.password })
          });
          const data = await res.json();
          if (res.ok) {
            alert('Password set successfully! You can now login.');
            setSignupData(prev => ({ ...prev, password: '' }));
            setActiveTab('login');
          } else {
            alert(data.error || 'Signup failed');
          }
        } catch (err) {
          alert('Signup failed');
        }
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-card-secondary p-4 ">
        <Card className="w-full max-w-md border-2 border-orange-300">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>
            <div className="flex justify-center gap-2 mt-2">
              <Button
                type="button"
                variant={activeTab === 'login' ? 'default' : 'outline'}
                className={`rounded-full px-6 font-semibold ${activeTab === 'login' ? 'bg-orange-500 text-white' : 'border-orange-500 text-orange-500'}`}
                onClick={() => setActiveTab('login')}
              >
                Login
              </Button>
              <Button
                type="button"
                variant={activeTab === 'signup' ? 'default' : 'outline'}
                className={`rounded-full px-6 font-semibold ${activeTab === 'signup' ? 'bg-orange-500 text-white' : 'border-orange-500 text-orange-500'}`}
                onClick={() => setActiveTab('signup')}
              >
                Signup
              </Button>
            </div>
            <div>
              <CardTitle className="text-2xl mt-2">
                {activeTab === 'login' ? 'Welcome Back!' : 'Create your account'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'login' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rollNo">User ID </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="rollNo"
                      type="text"
                      placeholder="Enter your User ID"
                      value={formData.rollNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, rollNo: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Select Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Select Role --" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-end">
                  <Button variant="link" className="p-0 h-auto text-sm text-primary">
                    Forgot password?
                  </Button>
                </div>
                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" size="lg">
                  Login
                </Button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">User ID*</Label>
                    <Input
                      type="text"
                      id="departmentId"
                      className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="921022205011"
                      value={signupData.departmentId}
                      onChange={e => setSignupData(prev => ({ ...prev, departmentId: e.target.value }))}
                      onBlur={e => fetchUserDetails(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name*</Label>
                    <Input
                      type="text"
                      id="firstName"
                      className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="John"
                      value={signupData.firstName}
                      disabled
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-1">Email*</Label>
                    <Input
                      type="email"
                      id="registerEmail"
                      className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="student@university.edu"
                      value={signupData.registerEmail}
                      disabled
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department*</Label>
                    <Input
                      type="text"
                      id="department"
                      className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Department"
                      value={signupData.department}
                      disabled
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupPassword" className="block text-sm font-medium text-gray-700 mb-1">Password*</Label>
                    <Input
                      type="password"
                      id="signupPassword"
                      className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Set your password"
                      value={signupData.password}
                      onChange={e => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={signupData.dbPassword && signupData.dbPassword.trim() !== ''}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" size="lg">
                  Signup
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };