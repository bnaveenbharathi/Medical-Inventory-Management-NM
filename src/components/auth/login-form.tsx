import { useState } from "react";
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
  { value: "admin", label: "Administrator" },
  { value: "vp", label: "Vice Principal" },
  { value: "principal", label: "Principal" },
  { value: "secretary", label: "Secretary" }
];

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    rollNo: "",
    password: "",
    role: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement authentication logic
    console.log("Login attempt:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-card-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <CardDescription>
              Sign in to access your IQARENA dashboard
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rollNo">Roll No / Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="rollNo"
                  type="text"
                  placeholder="Enter your roll number or email"
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

            <Button type="submit" className="w-full" size="lg">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};