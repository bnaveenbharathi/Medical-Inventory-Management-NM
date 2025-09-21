import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "./stats-card";
import { BookOpen, Clock, Trophy, User, Play, Pause, CheckCircle } from "lucide-react";

const mockQuizzes = [
  {
    id: 1,
    title: "Data Structures & Algorithms",
    subject: "Computer Science",
    duration: 60,
    questions: 25,
    status: "available" as const,
    dueDate: "2024-09-25",
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
    dueDate: "2024-09-24",
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
    dueDate: "2024-09-20",
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

export const StudentDashboard = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);

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

  return (
    <div className="min-h-screen bg-card-secondary">
      {/* Header */}
      <div className="bg-background border-b border-border p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">Welcome back, Student!</h1>
              <p className="text-muted-foreground mt-1">Ready to test your knowledge today?</p>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
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

        {/* Available Quizzes */}
        <Card>
          <CardHeader>
            <CardTitle>Available Quizzes</CardTitle>
            <CardDescription>
              Complete your assigned quizzes before the due date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockQuizzes.map((quiz) => (
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
                        View Results
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};