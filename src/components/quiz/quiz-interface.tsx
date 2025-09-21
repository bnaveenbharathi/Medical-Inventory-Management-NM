import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

const mockQuiz = {
  id: 1,
  title: "General Knowledge Quiz",
  totalQuestions: 10,
  timeLimit: 600, // 10 minutes in seconds
  questions: [
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["Berlin", "Madrid", "Paris", "Rome"],
      correctAnswer: 2
    },
    {
      id: 2,
      question: "Which programming language is known as the 'language of the web'?",
      options: ["Python", "JavaScript", "Java", "C++"],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
      correctAnswer: 0
    }
  ]
};

interface QuizAnswer {
  questionId: number;
  selectedOption: number | null;
  status: 'answered' | 'skipped' | 'unanswered';
}

export const QuizInterface = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(mockQuiz.timeLimit);
  const [answers, setAnswers] = useState<QuizAnswer[]>(
    mockQuiz.questions.map(q => ({
      questionId: q.id,
      selectedOption: null,
      status: 'unanswered' as const
    }))
  );

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => prev.map((answer, index) => 
      index === currentQuestion 
        ? { ...answer, selectedOption: optionIndex, status: 'answered' as const }
        : answer
    ));
  };

  const handleSkip = () => {
    setAnswers(prev => prev.map((answer, index) => 
      index === currentQuestion && answer.selectedOption === null
        ? { ...answer, status: 'skipped' as const }
        : answer
    ));
    if (currentQuestion < mockQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < mockQuiz.questions.length - 1) {
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

  const question = mockQuiz.questions[currentQuestion];
  const currentAnswer = answers[currentQuestion];

  return (
    <div className="min-h-screen bg-card-secondary">
      {/* Header */}
      <div className="bg-background border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">{mockQuiz.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-lg font-mono font-semibold text-foreground">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Question {currentQuestion + 1}</span>
                  <Badge variant="outline">
                    {currentQuestion + 1} of {mockQuiz.totalQuestions}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-foreground mb-4">
                    {question.question}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Choose the best answer from the options below.
                  </p>
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
                    
                    {currentQuestion < mockQuiz.questions.length - 1 ? (
                      <Button onClick={handleNext}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button>
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
                  {mockQuiz.questions.map((_, index) => (
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