import { Toaster } from "@/components/ui/toaster";
import { Toaster as HotToaster } from "react-hot-toast";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import FacultyDashboardPage from "./pages/FacultyDashboardPage";
import HODDashboardPage from "./pages/HODDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import SuperAdminDashboardPage from "./pages/SuperAdminDashboardPage";
import QuizPage from "./pages/QuizPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "@/components/auth/auth-context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();


// Redirect logic for login page
function LoginRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) {
    if (role === "student") return <Navigate to="/student" replace />;
    if (role === "faculty") return <Navigate to="/faculty" replace />;
    if (role === "hod") return <Navigate to="/hod" replace />;
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "super-admin") return <Navigate to="/super-admin" replace />;
    return <Navigate to="/" replace />;
  }
  return <Index />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
  <HotToaster position="top-center" />
  <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginRedirect />} />
            <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
              <Route path="/student" element={<StudentDashboardPage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["faculty"]} />}>
              <Route path="/faculty" element={<FacultyDashboardPage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["hod"]} />}>
              <Route path="/hod" element={<HODDashboardPage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["secretary","principal","vp"]} />}>
              <Route path="/super-admin" element={<SuperAdminDashboardPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/quiz/:id" element={<QuizPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
