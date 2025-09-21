import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "./stats-card";
import { BookOpen, Users, BarChart3, Plus, Edit, Eye, FileText } from "lucide-react";

const mockStats = {
  quizzesCreated: 8,
  studentsEvaluated: 156,
  avgPerformance: 78,
  activeQuizzes: 3
};

const mockQuizzes = [
  {
    id: 1,
    title: "Data Structures Mid-term",
    subject: "Computer Science",
    students: 45,
    completed: 32,
    avgScore: 76,
    status: "active",
    createdDate: "2024-09-15"
  },
  {
    id: 2,
    title: "Algorithm Analysis Quiz",
    subject: "Computer Science", 
    students: 38,
    completed: 38,
    avgScore: 82,
    status: "completed",
    createdDate: "2024-09-10"
  },
  {
    id: 3,
    title: "Database Fundamentals",
    subject: "Computer Science",
    students: 42,
    completed: 0,
    avgScore: 0,
    status: "draft",
    createdDate: "2024-09-20"
  }
];

export const FacultyDashboard = () => {
  return (
    <div className="min-h-screen bg-card-secondary">
      {/* Header */}
      <div className="bg-background border-b border-border p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">Faculty Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage quizzes and monitor student progress</p>
            </div>
            <div className="flex gap-3">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Upload Questions
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Message */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Welcome back, Alex!</h2>
                <p className="text-muted-foreground">Manage your quizzes and monitor student progress.</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">This semester</p>
                <p className="text-lg font-semibold text-success">+12% from last semester</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Quizzes Created"
            value={mockStats.quizzesCreated}
            change="This semester"
            changeType="positive"
            icon={BookOpen}
          />
          <StatsCard
            title="Students Evaluated"
            value={mockStats.studentsEvaluated}
            change="Total this month"
            changeType="positive"
            icon={Users}
          />
          <StatsCard
            title="Avg. Performance"
            value={`${mockStats.avgPerformance}%`}
            change="Class average"
            changeType="positive"
            icon={BarChart3}
          />
          <StatsCard
            title="Active Quizzes"
            value={mockStats.activeQuizzes}
            change="Currently running"
            changeType="neutral"
            icon={BookOpen}
          />
        </div>

        {/* Recent Quizzes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Quizzes</CardTitle>
            <CardDescription>
              Manage your created quizzes and view student performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockQuizzes.map((quiz) => (
                <div key={quiz.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-foreground">{quiz.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        quiz.status === 'active' ? 'bg-primary/10 text-primary' :
                        quiz.status === 'completed' ? 'bg-success/10 text-success' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{quiz.students} students assigned</span>
                      <span>{quiz.completed} completed</span>
                      {quiz.avgScore > 0 && <span>Avg. score: {quiz.avgScore}%</span>}
                      <span>Created: {quiz.createdDate}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {quiz.completed > 0 && (
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Reports
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