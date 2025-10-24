import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, ChevronRight, Flag, Maximize, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  question_id: number;
  text: string;
  options: string[];
  marks: number;
  sub_topic_title: string;
  topic_title: string;
}

interface TestInfo {
  test_id: number;
  title: string;
  description: string;
  subject: string;
  duration_minutes: number;
  total_questions: number;
}

interface QuizAnswer {
  questionId: number;
  selectedOption: number | null;
  status: 'answered' | 'skipped' | 'unanswered';
}

const API_BASE = import.meta.env.VITE_API_BASE;

export const QuizInterface = () => {
  const { id: testId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Quiz data states
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  // Quiz session states
  const [studentTestId, setStudentTestId] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Security states
  const [showSecurityWarning, setShowSecurityWarning] = useState(true);
  const [securityBreaches, setSecurityBreaches] = useState(0);
  const [showBreachWarning, setShowBreachWarning] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Validate testId on mount
  useEffect(() => {
    if (!testId) {
      navigate('/student');
      return;
    }
  }, [testId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && testInfo && !showResults) {
      // Auto-submit when time is up
      handleSubmitTest();
    }
  }, [timeLeft, showResults]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Security monitoring - disable keys and detect tab switching
  useEffect(() => {
    if (!quizStarted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable common shortcuts that could be used to cheat
      const forbiddenKeys = [
        'F12', // Developer tools
        'F11', // Fullscreen toggle
        'PrintScreen', // Screenshots
        'Tab', // Alt+Tab when combined with Alt
        'Escape' // Can exit fullscreen
      ];

      // Disable key combinations
      if (
        (e.altKey && e.key === 'Tab') || // Alt+Tab
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl+Shift+I (DevTools)
        (e.ctrlKey && e.shiftKey && e.key === 'C') || // Ctrl+Shift+C (DevTools)
        (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl+Shift+J (Console)
        (e.ctrlKey && e.key === 'U') || // Ctrl+U (View Source)
        (e.key === 'F12') || // F12 (DevTools)
        (e.metaKey && e.altKey && e.key === 'I') || // Cmd+Option+I (Mac DevTools)
        (e.metaKey && e.key === 'Tab') || // Cmd+Tab (Mac app switcher)
        e.key === 'Meta' // Windows key
      ) {
        e.preventDefault();
        e.stopPropagation();
        recordSecurityBreach('Attempted to use forbidden key combination');
        return false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordSecurityBreach('Tab switched or window minimized');
      }
    };

    const handleBlur = () => {
      recordSecurityBreach('Window lost focus');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Disable right-click
      recordSecurityBreach('Attempted to open context menu');
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [quizStarted]);

  // Auto-submit on window close/refresh
  useEffect(() => {
    if (!quizStarted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      handleAutoSubmit('Browser closed or page refreshed');
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [quizStarted, studentTestId]);

  const recordSecurityBreach = (reason: string) => {
    console.log('Security breach detected:', reason);
    const newBreachCount = securityBreaches + 1;
    setSecurityBreaches(newBreachCount);

    if (newBreachCount >= 3) {
      handleAutoSubmit(`Security breach limit exceeded: ${reason}`);
    } else {
      setShowBreachWarning(true);
    }
  };

  const handleAutoSubmit = async (reason: string) => {
    console.log('Auto-submitting quiz due to:', reason);
    if (studentTestId) {
      await handleSubmitTest();
    } else {
      navigate('/student');
    }
  };

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.();
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    navigate('/student');
  };

  const loadQuizData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      console.log('Starting quiz with token:', token ? 'Token exists' : 'No token');
      console.log('API Base:', API_BASE);
      console.log('Test ID:', testId);
      
      // Start test session first
      const startResponse = await fetch(`${API_BASE}/quiz/${testId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Start response status:', startResponse.status);
      
      if (!startResponse.ok) {
        if (startResponse.status === 401) {
          localStorage.removeItem('jwt_token'); // Clear invalid token
          navigate('/'); // Redirect to login
          return;
        }
        throw new Error(`HTTP ${startResponse.status}: Failed to start test session`);
      }

      const startData = await startResponse.json();
      console.log('Start response data:', startData);
      
      // Handle the case where test is already completed
      if (startData.already_completed) {
        setError('already_completed');
        setTestInfo({ 
          test_id: parseInt(testId!), 
          title: startData.title || 'Test Completed', 
          description: startData.message,
          subject: '',
          duration_minutes: 0,
          total_questions: 0
        });
        return;
      }
      
      if (!startData.success) {
        throw new Error(startData.error || 'Failed to start test session');
      }

      setStudentTestId(startData.student_test_id);

      // Get quiz questions
      const questionsResponse = await fetch(`${API_BASE}/quiz/${testId}/questions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Questions response status:', questionsResponse.status);

      if (!questionsResponse.ok) {
        if (questionsResponse.status === 401) {
          localStorage.removeItem('jwt_token'); // Clear invalid token
          navigate('/'); // Redirect to login
          return;
        }
        throw new Error(`HTTP ${questionsResponse.status}: Failed to load quiz questions`);
      }

      const questionsData = await questionsResponse.json();
      console.log('Questions response data:', questionsData);
      
      if (!questionsData.success) {
        throw new Error(questionsData.error || 'Failed to load quiz questions');
      }

      setTestInfo(questionsData.test);
      setQuestions(questionsData.questions);
      setTimeLeft(questionsData.test.duration_minutes * 60); // Convert to seconds
      
      // Initialize answers array
      setAnswers(questionsData.questions.map((q: Question) => ({
        questionId: q.question_id,
        selectedOption: null,
        status: 'unanswered' as const
      })));

    } catch (error: any) {
      setError(error.message);
      console.error('Failed to load quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = async (optionIndex: number) => {
    if (!studentTestId || !questions[currentQuestion]) return;

    // Update local state
    setAnswers(prev => prev.map((answer, index) => 
      index === currentQuestion 
        ? { ...answer, selectedOption: optionIndex, status: 'answered' as const }
        : answer
    ));

    // Save to backend
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE}/quiz/answer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_test_id: studentTestId,
          question_id: questions[currentQuestion].question_id,
          answer: optionIndex
        })
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Failed to save answer:', data.error);
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleSkip = () => {
    setAnswers(prev => prev.map((answer, index) => 
      index === currentQuestion && answer.selectedOption === null
        ? { ...answer, status: 'skipped' as const }
        : answer
    ));
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmitTest = async () => {
    if (!studentTestId) return;

    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_test_id: studentTestId
        })
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.results);
        setShowResults(true);
      } else {
        throw new Error(data.error || 'Failed to submit test');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getQuestionStatus = (index: number) => {
    const answer = answers[index];
    if (answer.selectedOption !== null) return 'answered';
    return answer.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-quiz-answered text-white';
      case 'skipped': return 'bg-quiz-skipped text-white';
      default: return 'bg-quiz-unanswered text-white';
    }
  };

  // Security warning popup (shown before starting quiz)
  if (showSecurityWarning) {
    return (
      <div className="min-h-screen bg-card-secondary flex items-center justify-center">
        <Card className="w-[600px] max-w-[90vw]">
          <CardHeader className="text-center bg-red-50 border-b">
            <CardTitle className="text-2xl text-red-700 flex items-center justify-center gap-2">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              EXAM SECURITY WARNING
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">IMPORTANT INSTRUCTIONS:</h3>
                <ul className="text-yellow-700 text-sm space-y-2">
                  <li>• This is a monitored online examination</li>
                  <li>• Do NOT switch tabs, minimize window, or leave this page</li>
                  <li>• Do NOT use keyboard shortcuts (Alt+Tab, Ctrl+Shift+I, F12, etc.)</li>
                  <li>• Do NOT right-click or open developer tools</li>
                  <li>• Your activity is being tracked for security</li>
                </ul>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">VIOLATION POLICY:</h3>
                <ul className="text-red-700 text-sm space-y-2">
                  <li>• <strong>1st & 2nd violation:</strong> Warning will be shown</li>
                  <li>• <strong>3rd violation:</strong> Test will be auto-submitted</li>
                  <li>• <strong>Closing browser/tab:</strong> Test will be auto-submitted</li>
                </ul>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/student')}
                  className="flex-1"
                >
                  Cancel & Go Back
                </Button>
                <Button 
                  onClick={() => {
                    setShowSecurityWarning(false);
                    setQuizStarted(true);
                    loadQuizData();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  I Understand - Start Exam
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Security breach warning popup
  if (showBreachWarning) {
    return (
      <div className="min-h-screen bg-card-secondary flex items-center justify-center">
        <Card className="w-[500px] max-w-[90vw]">
          <CardHeader className="text-center bg-orange-50 border-b">
            <CardTitle className="text-xl text-orange-700 flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              SECURITY VIOLATION DETECTED
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 text-lg font-semibold">
                  Warning {securityBreaches} of 2
                </p>
                <p className="text-orange-700 text-sm mt-2">
                  You have violated exam security rules. One more violation will result in automatic submission.
                </p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">
                  <strong>Reminder:</strong> Do not switch tabs, use keyboard shortcuts, or leave this page during the exam.
                </p>
              </div>

              <Button 
                onClick={() => setShowBreachWarning(false)}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                I Understand - Continue Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-card-secondary flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading quiz...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    // Special case for already completed tests
    if (error === 'already_completed') {
      return (
        <div className="min-h-screen bg-card-secondary flex items-center justify-center">
          <Card className="w-[500px]">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-amber-600 flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Test Already Completed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <p className="text-muted-foreground text-lg">
                  {testInfo?.description || 'You have already completed this test and cannot retake it.'}
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 text-sm">
                    <strong>Note:</strong> Each test can only be taken once. Please check your results in the dashboard.
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/student')} 
                  className="w-full"
                  size="lg"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // Regular error case
    return (
      <div className="min-h-screen bg-card-secondary flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => navigate('/student')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results state
  if (showResults && results) {
    return (
      <div className="min-h-screen bg-card-secondary flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-4xl font-bold text-primary">
              {results.score}%
            </div>
            <div className="text-muted-foreground">
              <p>Correct Answers: {results.correct_answers}/{results.total_questions}</p>
            </div>
            <Button onClick={() => navigate('/student')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!testInfo || questions.length === 0) {
    return (
      <div className="min-h-screen bg-card-secondary flex items-center justify-center">
        <p>No quiz data available</p>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const currentAnswer = answers[currentQuestion];

  return (
    <div className="min-h-screen bg-card-secondary">
      {/* Header with Exit Button */}
      <div className="bg-background border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">{testInfo.title}</h1>
            <Badge variant="outline">
              {testInfo.total_questions} Questions
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className={cn(
                "text-lg font-mono font-semibold",
                timeLeft <= 300 ? "text-destructive" : "text-foreground"
              )}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exitFullscreen}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Exit
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Question {currentQuestion + 1}</span>
                  <Badge variant="outline">
                    {currentQuestion + 1} of {testInfo.total_questions}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-foreground mb-4">
                    {question.text}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span>Topic: {question.topic_title}</span>
                    {question.sub_topic_title && <span>• {question.sub_topic_title}</span>}
                    <span>• Marks: {question.marks}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={cn(
                        "w-full p-4 text-left border border-border rounded-lg transition-colors",
                        "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
                        currentAnswer.selectedOption === index
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                          currentAnswer.selectedOption === index
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground"
                        )}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSkip}>
                      <Flag className="h-4 w-4 mr-1" />
                      Skip
                    </Button>
                    
                    {currentQuestion < questions.length - 1 ? (
                      <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button onClick={handleSubmitTest}>
                        Submit Quiz
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Question Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={cn(
                        "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                        index === currentQuestion 
                          ? "ring-2 ring-ring" 
                          : "",
                        getStatusColor(getQuestionStatus(index))
                      )}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-quiz-answered"></div>
                    <span>Answered: {answers.filter(a => a.selectedOption !== null).length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-quiz-skipped"></div>
                    <span>Skipped: {answers.filter(a => a.status === 'skipped').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-quiz-unanswered"></div>
                    <span>Not Answered: {answers.filter(a => a.status === 'unanswered').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};