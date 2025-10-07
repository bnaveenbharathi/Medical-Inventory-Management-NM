import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { 
  Search, 
  Download, 
  FileText, 
  BarChart3, 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Eye,
  RefreshCw,
  Filter,
  Calendar,
  Award,
  Target,
  Activity,
  PieChart,
  LineChart
} from "lucide-react";

// Types
interface Student {
  id: number;
  name: string;
  rollNo: string;
  department: string;
  batch: string;
  email: string;
}

interface StudentTest {
  test: string;
  date: string;
  score: number;
  maxScore: number;
  accuracy: number;
  timeTaken: number;
  totalTime: number;
  rank: number;
  totalStudents: number;
  weakAreas: string[];
}

interface Test {
  id: number;
  title: string;
  date: string;
  students: number;
  duration: number;
  totalQuestions?: number;
}

interface TestAnalysis {
  testInfo: {
    title: string;
    date: string;
    totalQuestions: number;
    duration: number;
  };
  stats: {
    avgScore: number;
    highestScore: number;
    lowestScore: number;
    passRate: number;
  };
  topPerformers: Array<{
    name: string;
    score: number;
    rank: number;
  }>;
  questionAnalysis: Array<{
    question: string;
    correctAnswers: number;
    totalAnswers: number;
    difficulty: string;
  }>;
}

interface QuestionData {
  question: string;
  correctAnswers: number;
  totalAnswers: number;
  avgTimeSpent: number;
  difficulty: string;
  optionDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
}

interface DepartmentData {
  department?: string;
  batch?: string;
  students: number;
  testsAttended: number;
  avgScore: number;
  passRate: number;
  attendance: number;
}

interface LiveTest {
  id: number;
  title: string;
  startTime: string;
  duration: number;
  totalStudents: number;
  submitted: number;
  inProgress: number;
  notStarted: number;
  studentsInProgress: Array<{
    name: string;
    timeLeft: number;
    progress: number;
  }>;
}

interface QuestionAnalysisTest {
  id: number;
  title: string;
  totalQuestions: number;
}

const API_BASE = import.meta.env.VITE_API_BASE;

// Individual Student Report Component
const IndividualStudentReport = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentTests, setStudentTests] = useState<StudentTest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`${API_BASE}/reports/students`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setStudents(data.students);
        } else {
          console.error('Failed to fetch students:', data.error);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleStudentSelect = async (student: Student) => {
    setSelectedStudent(student);
    setStudentLoading(true);
    
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE}/reports/student/${student.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setStudentTests(data.testResults);
      } else {
        console.error('Failed to fetch student tests:', data.error);
        setStudentTests([]);
      }
    } catch (error) {
      console.error('Error fetching student tests:', error);
      setStudentTests([]);
    } finally {
      setStudentLoading(false);
    }
  };

  const exportStudentReport = () => {
    // Implement PDF/Excel export
    alert("Exporting student report...");
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          Individual Student Report
        </h2>
        {selectedStudent && (
          <Button onClick={exportStudentReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Student</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or roll no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500">Loading students...</div>
                  </div>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStudent?.id === student.id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.rollNo}</div>
                    <div className="text-xs text-gray-500">{student.department}</div>
                  </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>No students found</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Details & Performance */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="space-y-6">
              {/* Student Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    {selectedStudent.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Roll No</div>
                      <div className="font-medium">{selectedStudent.rollNo}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Department</div>
                      <div className="font-medium">{selectedStudent.department}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Batch</div>
                      <div className="font-medium">{selectedStudent.batch}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Tests Taken</div>
                      <div className="font-medium">{studentTests.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Average Score</div>
                        <div className="text-xl font-bold text-green-600">
                          {studentTests.length > 0 ? 
                            Math.round(studentTests.reduce((sum, test) => sum + test.score, 0) / studentTests.length) 
                            : 0}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Award className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Best Rank</div>
                        <div className="text-xl font-bold text-blue-600">
                          #{studentTests.length > 0 ? Math.min(...studentTests.map(t => t.rank)) : '-'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Target className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Avg Accuracy</div>
                        <div className="text-xl font-bold text-orange-600">
                          {studentTests.length > 0 ? 
                            Math.round(studentTests.reduce((sum, test) => sum + test.accuracy, 0) / studentTests.length) 
                            : 0}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Test History */}
              <Card>
                <CardHeader>
                  <CardTitle>Test History</CardTitle>
                </CardHeader>
                <CardContent>
                  {studentLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-gray-500">Loading test history...</div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Test</th>
                          <th className="text-left py-3 px-2">Date</th>
                          <th className="text-left py-3 px-2">Score</th>
                          <th className="text-left py-3 px-2">Accuracy</th>
                          <th className="text-left py-3 px-2">Time</th>
                          <th className="text-left py-3 px-2">Rank</th>
                          <th className="text-left py-3 px-2">Weak Areas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentTests.map((test, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2 font-medium">{test.test}</td>
                            <td className="py-3 px-2 text-gray-600">{new Date(test.date).toLocaleDateString()}</td>
                            <td className="py-3 px-2">
                              <Badge variant={test.score >= 80 ? "default" : test.score >= 60 ? "secondary" : "destructive"}>
                                {test.score}/{test.maxScore}
                              </Badge>
                            </td>
                            <td className="py-3 px-2">{test.accuracy}%</td>
                            <td className="py-3 px-2">{test.timeTaken}/{test.totalTime} min</td>
                            <td className="py-3 px-2">#{test.rank}/{test.totalStudents}</td>
                            <td className="py-3 px-2">
                              <div className="flex flex-wrap gap-1">
                                {test.weakAreas && test.weakAreas.map((area, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a student to view their performance report</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Test-wise Report Component
const TestWiseReport = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testAnalysis, setTestAnalysis] = useState<TestAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Fetch tests from API
  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`${API_BASE}/reports/tests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setTests(data.tests);
        } else {
          console.error('Failed to fetch tests:', data.error);
        }
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleTestSelect = async (test: Test) => {
    setSelectedTest(test);
    setAnalysisLoading(true);
    
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE}/reports/test-analysis/${test.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setTestAnalysis(data.testAnalysis);
      } else {
        console.error('Failed to fetch test analysis:', data.error);
        setTestAnalysis(null);
      }
    } catch (error) {
      console.error('Error fetching test analysis:', error);
      setTestAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const exportTestReport = () => {
    alert("Exporting test report...");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-green-600" />
          Test-wise Report
        </h2>
        {selectedTest && (
          <Button onClick={exportTestReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Test Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <div className="text-center text-gray-500 py-4">Loading tests...</div>
              ) : tests.length > 0 ? (
                tests.map((test) => (
                <div
                  key={test.id}
                  onClick={() => handleTestSelect(test)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTest?.id === test.id 
                      ? 'bg-green-50 border-green-300' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-800">{test.title}</div>
                  <div className="text-sm text-gray-600">{new Date(test.date).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500">{test.students} students</div>
                </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">No tests found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Analysis */}
        <div className="lg:col-span-3">
          {analysisLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <div className="text-lg">Loading test analysis...</div>
                </div>
              </CardContent>
            </Card>
          ) : selectedTest && testAnalysis ? (
            <div className="space-y-6">
              {/* Test Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{testAnalysis.stats.avgScore}</div>
                      <div className="text-sm text-gray-500">Average Score</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{testAnalysis.stats.highestScore}</div>
                      <div className="text-sm text-gray-500">Highest Score</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{testAnalysis.stats.lowestScore}</div>
                      <div className="text-sm text-gray-500">Lowest Score</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{testAnalysis.stats.passRate}%</div>
                      <div className="text-sm text-gray-500">Pass Rate</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testAnalysis.topPerformers.map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                          }`}>
                            {student.rank}
                          </div>
                          <div className="font-medium">{student.name}</div>
                        </div>
                        <div className="text-lg font-bold text-green-600">{student.score}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Question Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    Question-wise Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Question</th>
                          <th className="text-left py-3 px-2">Correct Answers</th>
                          <th className="text-left py-3 px-2">Success Rate</th>
                          <th className="text-left py-3 px-2">Difficulty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testAnalysis.questionAnalysis.map((q, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2 font-medium">{q.question}</td>
                            <td className="py-3 px-2">{q.correctAnswers}/{q.totalAnswers}</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${(q.correctAnswers / q.totalAnswers) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm">{Math.round((q.correctAnswers / q.totalAnswers) * 100)}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <Badge variant={
                                q.difficulty === 'Easy' ? 'default' : 
                                q.difficulty === 'Medium' ? 'secondary' : 'destructive'
                              }>
                                {q.difficulty}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a test to view detailed analysis report</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Department/Batch Report Component
const DepartmentBatchReport = () => {
  const [reportType, setReportType] = useState("department");
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [batchData, setBatchData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch department data
  const fetchDepartmentData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE}/reports/department-report`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setDepartmentData(data.departmentData);
      } else {
        console.error('Failed to fetch department data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching department data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch batch data
  const fetchBatchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE}/reports/batch-report`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setBatchData(data.batchData);
      } else {
        console.error('Failed to fetch batch data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching batch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or report type changes
  useEffect(() => {
    if (reportType === "department") {
      fetchDepartmentData();
    } else {
      fetchBatchData();
    }
  }, [reportType]);

  const exportDepartmentReport = () => {
    alert("Exporting department/batch report...");
  };

  const data = reportType === "department" ? departmentData : batchData;
  const keyField = reportType === "department" ? "department" : "batch";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-purple-600" />
          Department/Batch Report
        </h2>
        <Button onClick={exportDepartmentReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Report Type Selection */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportType("department")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              reportType === "department" 
                ? "bg-purple-500 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            By Department
          </button>
          <button
            onClick={() => setReportType("batch")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              reportType === "batch" 
                ? "bg-purple-500 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            By Batch
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.reduce((sum, item) => sum + item.students, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Students</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(data.reduce((sum, item) => sum + item.avgScore, 0) / data.length)}%
              </div>
              <div className="text-sm text-gray-500">Overall Average</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(data.reduce((sum, item) => sum + item.passRate, 0) / data.length)}%
              </div>
              <div className="text-sm text-gray-500">Pass Rate</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(data.reduce((sum, item) => sum + item.attendance, 0) / data.length)}%
              </div>
              <div className="text-sm text-gray-500">Attendance</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {reportType === "department" ? "Department-wise" : "Batch-wise"} Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading {reportType} data...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">
                    {reportType === "department" ? "Department" : "Batch"}
                  </th>
                  <th className="text-left py-3 px-2">Total Students</th>
                  <th className="text-left py-3 px-2">Tests Attended</th>
                  <th className="text-left py-3 px-2">Average Score</th>
                  <th className="text-left py-3 px-2">Pass Rate</th>
                  <th className="text-left py-3 px-2">Attendance</th>
                  <th className="text-left py-3 px-2">Performance</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{item[keyField]}</td>
                    <td className="py-3 px-2">{item.students}</td>
                    <td className="py-3 px-2">{item.testsAttended}</td>
                    <td className="py-3 px-2">
                      <Badge variant={item.avgScore >= 80 ? "default" : item.avgScore >= 70 ? "secondary" : "destructive"}>
                        {item.avgScore}%
                      </Badge>
                    </td>
                    <td className="py-3 px-2">{item.passRate}%</td>
                    <td className="py-3 px-2">{item.attendance}%</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.avgScore >= 80 ? 'bg-green-500' : 
                              item.avgScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.avgScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{item.avgScore}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Question Analysis Report Component
const QuestionAnalysisReport = () => {
  const [selectedTest, setSelectedTest] = useState<QuestionAnalysisTest | null>(null);
  const [questionData, setQuestionData] = useState<QuestionData[]>([]);
  const [tests, setTests] = useState<QuestionAnalysisTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Fetch tests for question analysis
  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`${API_BASE}/reports/tests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data.success) {
          // Transform tests for question analysis
          const testList = data.tests.map((test: Test) => ({
            id: test.id,
            title: test.title,
            totalQuestions: test.totalQuestions || 0
          }));
          setTests(testList);
        } else {
          console.error('Failed to fetch tests:', data.error);
        }
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleTestSelect = async (test: QuestionAnalysisTest) => {
    setSelectedTest(test);
    setAnalysisLoading(true);
    
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE}/reports/question-analysis/${test.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setQuestionData(data.questionData);
      } else {
        console.error('Failed to fetch question analysis:', data.error);
        setQuestionData([]);
      }
    } catch (error) {
      console.error('Error fetching question analysis:', error);
      setQuestionData([]);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const exportQuestionReport = () => {
    alert("Exporting question analysis report...");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <PieChart className="h-6 w-6 text-indigo-600" />
          Question Analysis Report
        </h2>
        {selectedTest && (
          <Button onClick={exportQuestionReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        )}
      </div>

      {/* Test Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Test for Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-3 text-center text-gray-500 py-4">Loading tests...</div>
            ) : tests.length > 0 ? (
              tests.map((test) => (
              <div
                key={test.id}
                onClick={() => handleTestSelect(test)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTest?.id === test.id 
                    ? 'bg-indigo-50 border-indigo-300' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-800">{test.title}</div>
                <div className="text-sm text-gray-600">{test.totalQuestions} questions</div>
              </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 py-4">No tests found</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Analysis */}
      {selectedTest && (
        <Card>
          <CardHeader>
            <CardTitle>Question Analysis: {selectedTest.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {analysisLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">Loading question analysis...</div>
              </div>
            ) : questionData.length > 0 ? (
            <div className="space-y-6">
              {questionData.map((q, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
                      <Badge variant={
                        q.difficulty === 'Easy' ? 'default' : 
                        q.difficulty === 'Medium' ? 'secondary' : 'destructive'
                      }>
                        {q.difficulty}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{q.question}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Success Rate */}
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((q.correctAnswers / q.totalAnswers) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                      <div className="text-xs text-gray-500">
                        {q.correctAnswers}/{q.totalAnswers} correct
                      </div>
                    </div>

                    {/* Average Time */}
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.floor(q.avgTimeSpent / 60)}:{String(q.avgTimeSpent % 60).padStart(2, '0')}
                      </div>
                      <div className="text-sm text-gray-600">Avg Time</div>
                      <div className="text-xs text-gray-500">
                        {q.avgTimeSpent} seconds
                      </div>
                    </div>

                    {/* Option Distribution */}
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-600 mb-2">Option Distribution</div>
                      <div className="space-y-1">
                        {Object.entries(q.optionDistribution).map(([option, count]) => (
                          <div key={option} className="flex items-center justify-between text-xs">
                            <span>Option {option}:</span>
                            <span className="font-medium">{count} ({Math.round((Number(count) / q.totalAnswers) * 100)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No question data available for this test</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Test Progress Report Component
const TestProgressReport = () => {
  const [liveTests, setLiveTests] = useState<LiveTest[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Fetch live tests from API
  const fetchLiveTests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE}/reports/live-tests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setLiveTests(data.liveTests);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch live tests:', data.error);
      }
    } catch (error) {
      console.error('Error fetching live tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTests();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLiveTests();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const refreshData = () => {
    fetchLiveTests();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="h-6 w-6 text-red-600" />
          Test Progress Report
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-600">
              Auto-refresh (30s)
            </label>
          </div>
          <Button onClick={refreshData} size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Now
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>

      {/* Live Tests */}
      <div className="space-y-6">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center text-gray-500">
                <div className="text-lg">Loading live tests...</div>
              </div>
            </CardContent>
          </Card>
        ) : liveTests.length > 0 ? (
          liveTests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  {test.title}
                </CardTitle>
                <Badge variant="default" className="bg-green-500">
                  LIVE
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                Started: {new Date(test.startTime).toLocaleString()} | Duration: {test.duration} minutes
              </div>
            </CardHeader>
            <CardContent>
              {/* Status Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{test.totalStudents}</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{test.submitted}</div>
                  <div className="text-sm text-gray-600">Submitted</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{test.inProgress}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{test.notStarted}</div>
                  <div className="text-sm text-gray-600">Not Started</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(((test.submitted + test.inProgress) / test.totalStudents) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${(test.submitted / test.totalStudents) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-orange-500" 
                      style={{ width: `${(test.inProgress / test.totalStudents) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Submitted: {test.submitted}</span>
                  <span>In Progress: {test.inProgress}</span>
                  <span>Not Started: {test.notStarted}</span>
                </div>
              </div>

              {/* Students Currently Taking Test */}
              {test.studentsInProgress.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Students Currently Taking Test
                  </h4>
                  <div className="space-y-2">
                    {test.studentsInProgress.map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="font-medium">{student.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-600">
                            Progress: {student.progress}%
                          </div>
                          <div className="text-sm font-medium text-orange-600">
                            {student.timeLeft} min left
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No live tests at the moment</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Main Reports Component
export function ReportsSectionUI() {
  const [activeReport, setActiveReport] = useState("individual");

  const reportTabs = [
    { id: "individual", label: "Individual Student", icon: Users, component: IndividualStudentReport },
    { id: "testwise", label: "Test-wise", icon: BarChart3, component: TestWiseReport },
    { id: "department", label: "Department/Batch", icon: BookOpen, component: DepartmentBatchReport },
    { id: "question", label: "Question Analysis", icon: PieChart, component: QuestionAnalysisReport },
    { id: "progress", label: "Test Progress", icon: Activity, component: TestProgressReport }
  ];

  const ActiveComponent = reportTabs.find(tab => tab.id === activeReport)?.component || IndividualStudentReport;

  return (
    <div className="space-y-6">
      {/* Report Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8 overflow-x-auto">
          {reportTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveReport(id)}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeReport === id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Report Component */}
      <div className="min-h-[600px]">
        <ActiveComponent />
      </div>
    </div>
  );
}