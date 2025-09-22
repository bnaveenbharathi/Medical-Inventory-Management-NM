import { ReportsSectionUI } from "./ReportsSectionUI";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "./stats-card";
import { BookOpen, Users, BarChart3, Plus, Edit, Eye, FileText } from "lucide-react";
import Header from "./faculty/header"
import { TopicsSection } from "./faculty/Topic";
import { useState } from "react";
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
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Message */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="items-center flex">
                <h2 className="text-xl font-semibold text-foreground ">Welcome back, Alex!</h2> 
              </div>
              <nav className="flex gap-4 items-center mb-2">
                <Button variant={activeSection === "dashboard" ? "default" : "ghost"} size="sm" onClick={() => setActiveSection("dashboard")}>Dashboard</Button>
                <Button variant={activeSection === "create" ? "default" : "ghost"} size="sm" onClick={() => setActiveSection("create")}>Create Test</Button>
                <Button variant={activeSection === "recent" ? "default" : "ghost"} size="sm" onClick={() => setActiveSection("recent")}>Recent Test</Button>
                <Button variant={activeSection === "topics" ? "default" : "ghost"} size="sm" onClick={() => setActiveSection("topics")}>Topics</Button>
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
          </>
        )}
        {activeSection === "create" && (
            <Card>
              <CardContent className="p-6">
                <form id="create-test-form" className="grid grid-cols-1 md:grid-cols-2 gap-6" action="./create-test.php" method="post">
                  <div className="flex flex-col md:col-span-2 relative">
                    <label className="font-semibold text-gray-700 mb-2">Select Topic</label>
                    <div className="relative">
                      <select
                        name="topic"
                        id="topic"
                        required
                        className="w-full p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200">
                        <option value="" selected disabled>--Select Topic--</option>
                        <option value="3">python 2</option>
                        <option value="5">python 2</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col md:col-span-2 relative">
                    <label className="font-semibold text-gray-700 mb-2">Sub Topic</label>
                    <div className="relative">
                      <select
                        name="sub_topic"
                        id="subTopicSelect"
                        required
                        className="w-full p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200">
                        <option value="">--Select Sub Topic--</option>
                      </select>
                    </div>
                  </div>
                  {/* Test Title */}
                  <div className="flex flex-col md:col-span-2">
                    <label htmlFor="title" className="font-semibold text-gray-700 mb-2">Test Title</label>
                    <input type="text" name="title" id="title" placeholder="Enter test title" required className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full" />
                  </div>
                  {/* Subject */}
                  <div className="flex flex-col md:col-span-2">
                    <label htmlFor="subject" className="font-semibold text-gray-700 mb-2">Subject</label>
                    <input type="text" name="domain" id="subject" placeholder="Enter subject" required className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full" />
                  </div>
                  {/* Timing Dropdown */}
                  <div className="flex flex-col md:col-span-1 relative">
                    <label className="font-semibold text-gray-700 mb-2">Timing</label>
                    <div className="relative">
                      <select
                        name="timing"
                        id="timingSelect"
                        required
                        className="w-full p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200">
                        <option value="">--Select Timing--</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                        <option value="full_day">Full Day</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col md:col-span-1">
                    <label htmlFor="Duration" className="font-semibold text-gray-700 mb-2">Duration ( In Minutes )</label>
                    <input type="number" name="Duration" id="Duration" placeholder="Enter Duration" required className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full" />
                  </div>
                  {/* Total Marks */}
                  <div className="flex flex-col md:col-span-1">
                    <label htmlFor="totalMarks" className="font-semibold text-gray-700 mb-2">Total Marks</label>
                    <input type="number" name="total_marks" id="totalMarks" placeholder="Enter marks" required className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full" />
                  </div>
                  {/* Total Questions */}
                  <div className="flex flex-col md:col-span-1">
                    <label htmlFor="totalQuestion" className="font-semibold text-gray-700 mb-2">Total Questions</label>
                    <input type="number" name="num_questions" id="totalQuestion" placeholder="Enter total questions" required className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full" />
                  </div>
                  {/* Year & Department */}
                  <div className="flex flex-col md:flex-row gap-4 md:col-span-2">
                    {/* Year */}
                    <div className="flex-1 flex flex-col relative">
                      <label className="font-semibold text-gray-700 mb-2">Year</label>
                      <div className="relative">
                        <select
                          name="year"
                          id="yearSelect"
                          required
                          className="w-full p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200">
                          <option value="">--Select Year--</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      </div>
                    </div>
                    {/* Department */}
                    <div className="flex-1 flex flex-col relative">
                      <label className="font-semibold text-gray-700 mb-2">Department</label>
                      <div className="relative">
                        <select
                          name="department"
                          id="departmentSelect"
                          required
                          className="w-full p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200">
                          <option value="" className="py-3">--Select Department--</option>
                          <option value="1">B.E. Computer Science & Engineering</option>
                          <option value="2">B.E. Civil Engineering</option>
                          <option value="3">B.E. Electronics & Communication Engineering</option>
                          <option value="4">B.E. Electrical and Electronics Engineering</option>
                          <option value="5">B.E. Mechanical Engineering</option>
                          <option value="6">B.Tech. Artificial Intelligence & Data Science</option>
                          <option value="7">B.Tech. Information Technology</option>
                          <option value="8">Structural Engineering</option>
                          <option value="9">Manufacturing Engineering</option>
                          <option value="10">Science and Humanities</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* Description */}
                  <div className="flex flex-col md:col-span-2">
                    <label htmlFor="description" className="font-semibold text-gray-700 mb-2">Description</label>
                    <textarea name="description" id="description" rows={4} placeholder="Enter description..." className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full"></textarea>
                  </div>
                  <div className="md:col-span-2 flex justify-center mt-6">
                    <button type="submit" className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white rounded-2xl shadow-lg font-semibold transition duration-200">
                      Create Test
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
        )}
        {activeSection === "recent" && (
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
        )}
  
{activeSection === "topics" && (
        <div className="min-h-[400px]">
              <TopicsSection />
   </div>
      
        )}
       
        {activeSection === "leaderboard" && (
          <Card><CardContent className="p-6">Leaderboard Section (implement leaderboard here)</CardContent></Card>
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