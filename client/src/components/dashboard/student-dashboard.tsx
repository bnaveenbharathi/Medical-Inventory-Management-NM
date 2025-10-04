import { ReportsSectionUI } from "./ReportsSectionUI"; // Assuming this exists for reports, or placeholder
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "./stats-card";
import { BookOpen, Clock, Trophy, User, Play, Pause, CheckCircle, Users, BarChart3, Eye, Edit, FileText } from "lucide-react";
import Header from "./student/Header"; 
import { useState } from "react";

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

export const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

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
                <h2 className="text-xl font-semibold text-foreground">Welcome back, Student!</h2> 
              </div>
              <nav className="flex gap-4 items-center mb-2">
                <Button variant={activeSection === "dashboard" ? "default" : "ghost"} size="sm" onClick={() => setActiveSection("dashboard")}>Dashboard</Button>
                <Button variant={activeSection === "quizzes" ? "default" : "ghost"} size="sm" onClick={() => setActiveSection("quizzes")}>My Quizzes</Button>
                <Button variant={activeSection === "leaderboard" ? "default" : "ghost"} size="sm" onClick={() => setActiveSection("leaderboard")}>Leaderboard</Button>
                <Button variant={activeSection === "reports" ? "default" : "ghost"} size="sm" onClick={() => setActiveSection("reports")}>Reports</Button>
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
      </div>
         
      <div className='bg-orange-500 p-4 text-center'>
        <h2 className='uppercase text-xl text-white'>
            Developed By <a href="https://www.nscet.org/ispin">Innovative Software Product Industry of NSCET</a>
        </h2>
      </div>
    </div>
  );
};