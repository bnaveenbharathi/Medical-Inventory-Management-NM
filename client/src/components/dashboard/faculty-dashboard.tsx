import { ReportsSectionUI } from "./ReportsSectionUI";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "./stats-card";
import { BookOpen, Users, BarChart3, Plus, Edit, Eye, FileText } from "lucide-react";
import Header from "./faculty/Header";
import { TopicsSection } from "./faculty/Topic";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
const API_BASE = import.meta.env.VITE_API_BASE;


const mockStats = {
  quizzesCreated: 8,
  studentsEvaluated: 156,
  avgPerformance: 78,
  activeQuizzes: 3,
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
    createdDate: "2024-09-15",
  },
  {
    id: 2,
    title: "Algorithm Analysis Quiz",
    subject: "Computer Science",
    students: 38,
    completed: 38,
    avgScore: 82,
    status: "completed",
    createdDate: "2024-09-10",
  },
  {
    id: 3,
    title: "Database Fundamentals",
    subject: "Computer Science",
    students: 42,
    completed: 0,
    avgScore: 0,
    status: "draft",
    createdDate: "2024-09-20",
  },
];

// Mock data for dynamic sub-topics (expand as needed)
const mockTopicsSubtopics = {
  3: ["Lists and Arrays", "Stacks and Queues"],
  5: ["Functions and Modules", "Error Handling"],
};

const TestsSection = ({ tests, loading, error, onEdit, onDelete, onToggleStatus, onViewQuestions }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading tests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No tests created yet</div>
        <p className="text-gray-400 mt-2">Create your first test to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tests.map((test) => (
        <div key={test.test_id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-medium text-foreground">{test.title}</h3>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  test.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {test.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <span>Subject: {test.subject}</span>
              {test.topic_title && <span>Topic: {test.topic_title}</span>}
              {test.sub_topic_title && <span>Subtopic: {test.sub_topic_title}</span>}
              <span>{test.num_questions} questions</span>
              <span>{test.duration_minutes} min</span>
            </div>
            {test.description && (
              <p className="text-sm text-gray-600 mb-2">{test.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {test.date && <span>Date: {new Date(test.date).toLocaleDateString()}</span>}
              {test.time_slot && <span>Time: {test.time_slot}</span>}
              <span>Created: {new Date(test.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onViewQuestions(test)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Questions
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onToggleStatus(test.test_id)}
            >
              {test.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onEdit(test)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onDelete(test.test_id)}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const FacultyDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [createTestOpen, setCreateTestOpen] = useState(false);
  const [editTestOpen, setEditTestOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  // Profile state
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Tests state
  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [testsError, setTestsError] = useState("");

  // Topics and subtopics state
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  // Create/Edit Test form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    topic_id: "",
    sub_topic_id: "",
    num_questions: "",
    department_id: "",
    year: "",
    date: "",
    time_slot: "",
    duration_minutes: "",
    is_active: true
  });
  const [subTopics, setSubTopics] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Filter states
  const [filters, setFilters] = useState({
    testName: "",
    topic: "",
    dateFrom: "",
    dateTo: "",
    timeSlot: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  // Test questions states
  const [testQuestions, setTestQuestions] = useState([]);
  const [showTestQuestionsModal, setShowTestQuestionsModal] = useState(false);
  const [selectedTestForQuestions, setSelectedTestForQuestions] = useState(null);
  const [testQuestionsLoading, setTestQuestionsLoading] = useState(false);

  // Preview questions states
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Profile editing states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{ [key: string]: string }>({});
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

  // Topic creation states
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [topicData, setTopicData] = useState({
    title: "",
    description: ""
  });
  const [topicSubmitting, setTopicSubmitting] = useState(false);
  const [topicErrors, setTopicErrors] = useState<{ [key: string]: string }>({});

  // Subtopic creation states
  const [showCreateSubTopicModal, setShowCreateSubTopicModal] = useState(false);
  const [selectedTopicForSubTopic, setSelectedTopicForSubTopic] = useState(null);
  const [subTopicData, setSubTopicData] = useState({
    topicId: "",
    title: "",
    description: ""
  });
  const [subTopicSubmitting, setSubTopicSubmitting] = useState(false);
  const [subTopicErrors, setSubTopicErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchProfile();
    fetchTests();
    fetchTopics();
  }, []);

  useEffect(() => {
    if (formData.topic_id && topics.length > 0) {
      const selectedTopic = topics.find(t => t.id.toString() === formData.topic_id);
      setSubTopics(selectedTopic?.subtopics || []);
      
      // Update question count if subtopic is already selected
      if (formData.sub_topic_id) {
        const count = getQuestionCountFromTopics(formData.sub_topic_id);
        setQuestionCount(count);
      }
    } else {
      setSubTopics([]);
      setQuestionCount(0);
      setAvailableQuestions([]);
    }
  }, [formData.topic_id, formData.sub_topic_id, topics]);

  const saveToken = (token: string) => {
    localStorage.setItem('jwt_token', token);
  };



  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileError("");
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch profile");
      }
      const user = data.profile;
      setProfile({ 
        user_id:user.id,
        name: user.name,
        email: user.email,
        department: user.department_name, 
        designation: user.role_id === 2 ? "Faculty" : user.role_id === 1 ? "Student" : "User",
        joinedDate: user.created_at,
        
        avatar: "https://via.placeholder.com/150", 
      });
    } catch (error: any) {
      setProfileError(error.message || "Failed to fetch profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchTests = async () => {
    setTestsLoading(true);
    setTestsError("");
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/test`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch tests");
      }
      
      setTests(data.tests || []);
    } catch (error: any) {
      setTestsError(error.message || "Failed to fetch tests. Please try again.");
    } finally {
      setTestsLoading(false);
    }
  };

  const fetchTopics = async () => {
    setTopicsLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/users/topics-with-subtopics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch topics");
      }
      
      setTopics(data.topics || []);
    } catch (error: any) {
      console.error('Failed to fetch topics:', error);
    } finally {
      setTopicsLoading(false);
    }
  };

  // Get question count for selected subtopic from already loaded topics data
  const getQuestionCountFromTopics = (subTopicId: string) => {
    if (!subTopicId || !topics.length) return 0;
    
    for (const topic of topics) {
      const subtopic = topic.subtopics?.find(sub => sub.id.toString() === subTopicId);
      if (subtopic) {
        return subtopic.question_count || 0;
      }
    }
    return 0;
  };

  // Fetch detailed questions for modal view only when needed
  const fetchQuestionsForModal = async (subTopicId: string) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No token found');
      
      const res = await fetch(`${API_BASE}/question/subtopics/${subTopicId}/questions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch questions");
      }

      const data = await res.json();
      if (data.success) {
        setAvailableQuestions(data.questions || []);
      } else {
        setAvailableQuestions([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch questions:', error);
      setAvailableQuestions([]);
    }
  };

  const createTest = async (testData) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(testData)
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create test");
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateTest = async (testId, testData) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/test/${testId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(testData)
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update test");
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const deleteTest = async (testId) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/test/${testId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete test");
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const toggleTestStatus = async (testId) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/test/${testId}/toggle-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to toggle test status");
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const assignQuestionsToTest = async (testId, subTopicId, numQuestions) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/test/${testId}/assign-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          sub_topic_id: subTopicId,
          num_questions: numQuestions
        })
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to assign questions");
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const fetchTestQuestions = async (testId) => {
    setTestQuestionsLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/test/${testId}/questions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch test questions");
      }
      
      setTestQuestions(data.questions || []);
      return data;
    } catch (error) {
      console.error('Failed to fetch test questions:', error);
      setTestQuestions([]);
      throw error;
    } finally {
      setTestQuestionsLoading(false);
    }
  };

  const handleViewTestQuestions = async (test) => {
    setSelectedTestForQuestions(test);
    setShowTestQuestionsModal(true);
    try {
      await fetchTestQuestions(test.test_id);
    } catch (error) {
      alert('Failed to fetch test questions: ' + error.message);
    }
  };

  const fetchPreviewQuestions = async (subTopicId, numQuestions) => {
    setPreviewLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No token found');
      
      const res = await fetch(`${API_BASE}/test/preview/${subTopicId}/questions?num_questions=${numQuestions}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch questions");
      }

      const data = await res.json();
      if (data.success) {
        setPreviewQuestions(data.questions || []);
      } else {
        setPreviewQuestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch preview questions:', error);
      setPreviewQuestions([]);
      throw error;
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePreviewQuestions = async () => {
    if (!formData.sub_topic_id || !formData.num_questions) {
      alert('Please select a subtopic and enter number of questions first.');
      return;
    }

    if (parseInt(formData.num_questions) > questionCount) {
      alert(`Cannot preview more than ${questionCount} available questions.`);
      return;
    }

    setShowPreviewModal(true);
    try {
      await fetchPreviewQuestions(formData.sub_topic_id, formData.num_questions);
    } catch (error) {
      alert('Failed to fetch preview questions: ' + error.message);
    }
  };

  const handleRandomizePreview = async () => {
    if (!formData.sub_topic_id || !formData.num_questions) return;
    
    try {
      await fetchPreviewQuestions(formData.sub_topic_id, formData.num_questions);
    } catch (error) {
      alert('Failed to randomize questions: ' + error.message);
    }
  };

  // Profile management functions
  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile");
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (passwordData) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData)
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset password");
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Create Topic API function
  const createTopic = async (topicData) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');

      const res = await fetch(`${API_BASE}/topic/create-topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(topicData)
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create topic");
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Create SubTopic API function
  const createSubTopic = async (subTopicData) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) throw new Error('No auth token found. Please login.');
      
      const res = await fetch(`${API_BASE}/topic/create-subtopics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(subTopicData)
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create subtopic");
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleEditProfile = () => {
    if (profile) {
      setProfileData({
        name: profile.name || "",
        email: profile.email || ""
      });
      setProfileErrors({});
      setShowEditProfileModal(true);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: { [key: string]: string } = {};
    if (!profileData.name.trim()) newErrors.name = "Name is required";
    if (!profileData.email.trim()) newErrors.email = "Email is required";
    if (profileData.email && !/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    setProfileErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setProfileSubmitting(true);
    try {
      await updateProfile(profileData);
      alert('Profile updated successfully!');
      setShowEditProfileModal(false);
      fetchProfile(); // Refresh profile data
    } catch (error: any) {
      alert(error.message || 'Failed to update profile');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: { [key: string]: string } = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!passwordData.newPassword) newErrors.newPassword = "New password is required";
    if (passwordData.newPassword && passwordData.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters long";
    }
    if (!passwordData.confirmPassword) newErrors.confirmPassword = "Please confirm your new password";
    if (passwordData.newPassword && passwordData.confirmPassword && 
        passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setPasswordErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setPasswordSubmitting(true);
    try {
      await resetPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      alert('Password reset successfully!');
      setShowResetPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      alert(error.message || 'Failed to reset password');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // Topic creation handlers
  const handleCreateTopic = () => {
    setTopicData({ title: "", description: "" });
    setTopicErrors({});
    setShowCreateTopicModal(true);
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopicSubmitting(true);
    setTopicErrors({});

    try {
      // Validate form
      if (!topicData.title.trim()) {
        setTopicErrors({ title: "Topic title is required" });
        return;
      }

      await createTopic(topicData);
      alert('Topic created successfully!');
      setShowCreateTopicModal(false);
      setTopicData({ title: "", description: "" });
      fetchTopics(); // Refresh the topics list
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create topic';
      if (errorMessage.includes('title')) {
        setTopicErrors({ title: errorMessage });
      } else {
        alert(errorMessage);
      }
    } finally {
      setTopicSubmitting(false);
    }
  };

  // Subtopic creation handlers
  const handleCreateSubTopic = (topic) => {
    setSelectedTopicForSubTopic(topic);
    setSubTopicData({
      topicId: topic.id.toString(),
      title: "",
      description: ""
    });
    setSubTopicErrors({});
    setShowCreateSubTopicModal(true);
  };

  const handleSubTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubTopicSubmitting(true);
    setSubTopicErrors({});

    try {
      // Validate form
      if (!subTopicData.title.trim()) {
        setSubTopicErrors({ title: "Subtopic title is required" });
        return;
      }

      const submitData = {
        topicId: parseInt(subTopicData.topicId),
        title: subTopicData.title,
        description: subTopicData.description
      };

      await createSubTopic(submitData);
      alert('Subtopic created successfully!');
      setShowCreateSubTopicModal(false);
      setSubTopicData({ topicId: "", title: "", description: "" });
      setSelectedTopicForSubTopic(null);
      fetchTopics(); // Refresh the topics list
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create subtopic';
      if (errorMessage.includes('title')) {
        setSubTopicErrors({ title: errorMessage });
      } else {
        alert(errorMessage);
      }
    } finally {
      setSubTopicSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    // Real-time validation for number of questions
    if (name === 'num_questions' && value && formData.sub_topic_id && questionCount > 0) {
      const enteredQuestions = parseInt(value);
      if (enteredQuestions > questionCount) {
        setErrors((prev) => ({ 
          ...prev, 
          num_questions: `Cannot exceed ${questionCount} questions available in selected subtopic` 
        }));
      }
    }
    
    // If subtopic is selected, get question count from topics data
    if (name === 'sub_topic_id' && value) {
      const count = getQuestionCountFromTopics(value);
      setQuestionCount(count);
      setAvailableQuestions([]); // Clear detailed questions, will be loaded when modal opens
    } else if (name === 'sub_topic_id' && !value) {
      setQuestionCount(0);
      setAvailableQuestions([]);
    }
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, topic_id: value, sub_topic_id: "" }));
    
    if (value && topics.length > 0) {
      const selectedTopic = topics.find(t => t.id.toString() === value);
      setSubTopics(selectedTopic?.subtopics || []);
    } else {
      setSubTopics([]);
    }
  };

  const handleEditTest = (test) => {
    setEditingTest(test);
    setFormData({
      title: test.title || '',
      description: test.description || '',
      subject: test.subject || '',
      topic_id: test.topic_id?.toString() || '',
      sub_topic_id: test.sub_topic_id?.toString() || '',
      num_questions: test.num_questions?.toString() || '',
      department_id: test.department_id?.toString() || '',
      year: test.year?.toString() || '',
      date: test.date || '',
      time_slot: test.time_slot || '',
      duration_minutes: test.duration_minutes?.toString() || '',
      is_active: test.is_active || false
    });
    
    // Set question count for the selected subtopic
    if (test.sub_topic_id) {
      const count = getQuestionCountFromTopics(test.sub_topic_id.toString());
      setQuestionCount(count);
    }
    
    setEditTestOpen(true);
  };

  const handleDeleteTest = async (testId) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    
    try {
      await deleteTest(testId);
      alert('Test deleted successfully!');
      fetchTests(); // Refresh the tests list
    } catch (error: any) {
      alert(error.message || 'Failed to delete test');
    }
  };

  const handleToggleStatus = async (testId) => {
    try {
      await toggleTestStatus(testId);
      fetchTests(); // Refresh the tests list
    } catch (error: any) {
      alert(error.message || 'Failed to toggle test status');
    }
  };

  // Filter tests based on filter criteria
  const filteredTests = tests.filter(test => {
    // Test name filter
    if (filters.testName && !test.title.toLowerCase().includes(filters.testName.toLowerCase())) {
      return false;
    }
    
    // Topic filter
    if (filters.topic && test.topic_title && !test.topic_title.toLowerCase().includes(filters.topic.toLowerCase())) {
      return false;
    }
    
    // Date range filter
    if (filters.dateFrom && test.date) {
      const testDate = new Date(test.date);
      const fromDate = new Date(filters.dateFrom);
      if (testDate < fromDate) return false;
    }
    
    if (filters.dateTo && test.date) {
      const testDate = new Date(test.date);
      const toDate = new Date(filters.dateTo);
      if (testDate > toDate) return false;
    }
    
    // Time slot filter
    if (filters.timeSlot && test.time_slot && !test.time_slot.toLowerCase().includes(filters.timeSlot.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      testName: "",
      topic: "",
      dateFrom: "",
      dateTo: "",
      timeSlot: ""
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      subject: "",
      topic_id: "",
      sub_topic_id: "",
      num_questions: "",
      department_id: "",
      year: "",
      date: "",
      time_slot: "",
      duration_minutes: "",
      is_active: true
    });
    setSubTopics([]);
    setQuestionCount(0);
    setAvailableQuestions([]);
    setErrors({});
    setEditingTest(null);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.num_questions) newErrors.num_questions = "Number of questions is required";
    if (!formData.duration_minutes) newErrors.duration_minutes = "Duration is required";
    if (formData.topic_id && !formData.sub_topic_id) newErrors.sub_topic_id = "Sub-topic is required when topic is selected";
    
    // Validate question count against available questions
    if (formData.sub_topic_id && questionCount > 0 && parseInt(formData.num_questions) > questionCount) {
      newErrors.num_questions = `Cannot exceed ${questionCount} questions available in selected subtopic`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Prepare data for API
      const apiData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        topic_id: formData.topic_id ? parseInt(formData.topic_id) : null,
        sub_topic_id: formData.sub_topic_id ? parseInt(formData.sub_topic_id) : null,
        num_questions: parseInt(formData.num_questions),
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        year: formData.year ? parseInt(formData.year) : null,
        date: formData.date || null,
        time_slot: formData.time_slot || null,
        duration_minutes: parseInt(formData.duration_minutes),
        is_active: formData.is_active ? 1 : 0
      };

      let testResult;
      if (editingTest) {
        testResult = await updateTest(editingTest.test_id, apiData);
        
        // If subtopic and questions are specified, reassign questions
        if (formData.sub_topic_id && formData.num_questions) {
          try {
            await assignQuestionsToTest(
              editingTest.test_id,
              parseInt(formData.sub_topic_id),
              parseInt(formData.num_questions)
            );
            alert("Test updated successfully! Questions reassigned.");
          } catch (assignError) {
            alert(`Test updated but failed to reassign questions: ${assignError.message}`);
          }
        } else {
          alert("Test updated successfully!");
        }
        setEditTestOpen(false);
      } else {
        testResult = await createTest(apiData);
        const newTestId = testResult.test_id;
        
        // Automatically assign questions if subtopic is selected
        if (formData.sub_topic_id && formData.num_questions && newTestId) {
          try {
            const assignResult = await assignQuestionsToTest(
              newTestId,
              parseInt(formData.sub_topic_id),
              parseInt(formData.num_questions)
            );
            alert(`Test created successfully! ${assignResult.assigned_count} questions assigned randomly.`);
          } catch (assignError) {
            alert(`Test created but failed to assign questions: ${assignError.message}`);
          }
        } else {
          alert("Test created successfully!");
        }
        
        setCreateTestOpen(false);
      }
      
      resetForm();
      fetchTests(); // Refresh the tests list
    } catch (error: any) {
      alert(error.message || "Error saving test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <h2 className="text-xl font-semibold text-foreground">Welcome back, {profile?.name || "User"}!</h2>
              </div>
              <nav className="flex gap-4 items-center mb-2">
                <Button
                  variant={activeSection === "dashboard" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveSection("dashboard")}
                >
                  Dashboard
                </Button>
                <Button
                  variant={activeSection === "recent" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveSection("recent")}
                >
                  Tests
                </Button>
                <Button
                  variant={activeSection === "topics" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveSection("topics")}
                >
                  Topics
                </Button>
                <Button
                  variant={activeSection === "leaderboard" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveSection("leaderboard")}
                >
                  Leaderboard
                </Button>
                <Button
                  variant={activeSection === "reports" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveSection("reports")}
                >
                  Reports
                </Button>
                <Button
                  variant={activeSection === "profile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveSection("profile")}
                >
                  Profile
                </Button>
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
            {/* Recent Quizzes on Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tests</CardTitle>
                <CardDescription>Quick view of your latest created tests.</CardDescription>
              </CardHeader>
              <CardContent>
                <TestsSection 
                  tests={tests.slice(0, 3)} 
                  loading={testsLoading}
                  error={testsError}
                  onEdit={handleEditTest}
                  onDelete={handleDeleteTest}
                  onToggleStatus={handleToggleStatus}
                  onViewQuestions={handleViewTestQuestions}
                />
                {tests.length > 3 && (
                  <div className="mt-4 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveSection("recent")}
                    >
                      View All Tests
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeSection === "recent" && (
          <Card className="min-h-[400px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tests</CardTitle>
                </div>
                <div className="flex gap-2">
                  
                  <Dialog open={createTestOpen} onOpenChange={(open) => {
                    setCreateTestOpen(open);
                    if (!open) resetForm();
                  }}>
                    <DialogTrigger asChild>
                    <Button className="bg-orange-500 text-white hover:bg-orange-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingTest ? 'Edit Test' : 'Create New Test'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                      {/* Topic Selection - Optional */}
                      <div className="flex flex-col md:col-span-2 relative">
                        <label className="font-semibold text-gray-700 mb-2">Select Topic (Optional)</label>
                        <div className="relative">
                          <select
                            name="topic_id"
                            value={formData.topic_id}
                            onChange={handleTopicChange}
                            className="w-full p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                          >
                            <option value="">--Select Topic (Optional)--</option>
                            {topics.map((topic) => (
                              <option key={topic.id} value={topic.id}>
                                {topic.title}
                              </option>
                            ))}
                          </select>
                          {errors.topic_id && <p className="text-red-500 text-sm mt-1">{errors.topic_id}</p>}
                        </div>
                      </div>
                      {/* Sub Topic Selection */}
                      {formData.topic_id && (
                        <div className="flex flex-col md:col-span-2 relative">
                          <label className="font-semibold text-gray-700 mb-2">Sub Topic</label>
                          <div className="relative">
                            <select
                              name="sub_topic_id"
                              value={formData.sub_topic_id}
                              onChange={handleInputChange}
                              className="w-full p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                            >
                              <option value="">--Select Sub Topic--</option>
                              {subTopics.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                  {sub.title}
                                </option>
                              ))}
                            </select>
                            {errors.sub_topic_id && <p className="text-red-500 text-sm mt-1">{errors.sub_topic_id}</p>}
                            {/* Question Count Display */}
                            {formData.sub_topic_id && questionCount > 0 && (
                              <div className="mt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowQuestionsModal(true);
                                    if (formData.sub_topic_id) {
                                      fetchQuestionsForModal(formData.sub_topic_id);
                                    }
                                  }}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                                >
                                  <span className="mr-1">📝</span>
                                  Total Questions: {questionCount}
                                  <span className="ml-1 text-xs">(Click to view)</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Test Title */}
                      <div className="flex flex-col md:col-span-2">
                        <label htmlFor="title" className="font-semibold text-gray-700 mb-2">
                          Test Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          id="title"
                          placeholder="Enter test title"
                          required
                          className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                      </div>
                      {/* Subject */}
                      <div className="flex flex-col md:col-span-2">
                        <label htmlFor="subject" className="font-semibold text-gray-700 mb-2">
                          Subject *
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          id="subject"
                          placeholder="Enter subject"
                          required
                          className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full"
                        />
                        {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                      </div>
                      {/* Date and Time */}
                      <div className="flex flex-col md:col-span-1">
                        <label htmlFor="date" className="font-semibold text-gray-700 mb-2">
                          Test Date (Optional)
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          id="date"
                          className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full"
                        />
                      </div>
                      <div className="flex flex-col md:col-span-1">
                        <label htmlFor="time_slot" className="font-semibold text-gray-700 mb-2">
                          Time Slot (Optional)
                        </label>
                        <input
                          type="text"
                          name="time_slot"
                          value={formData.time_slot}
                          onChange={handleInputChange}
                          id="time_slot"
                          placeholder="e.g., 9:00 AM - 11:00 AM"
                          className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full"
                        />
                      </div>
                      <div className="flex flex-col md:col-span-1">
                        <label htmlFor="duration_minutes" className="font-semibold text-gray-700 mb-2">
                          Duration (Minutes) *
                        </label>
                        <input
                          type="number"
                          name="duration_minutes"
                          value={formData.duration_minutes}
                          onChange={handleInputChange}
                          id="duration_minutes"
                          placeholder="Enter duration in minutes"
                          required
                          min="1"
                          className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full"
                        />
                        {errors.duration_minutes && <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>}
                      </div>
                      {/* Total Questions */}
                      <div className="flex flex-col md:col-span-1">
                        <label htmlFor="num_questions" className="font-semibold text-gray-700 mb-2">
                          Number of Questions *
                          {formData.sub_topic_id && questionCount > 0 && (
                            <span className="text-sm font-normal text-gray-500 ml-2">
                              (Max: {questionCount} available)
                            </span>
                          )}
                        </label>
                        <input
                          type="number"
                          name="num_questions"
                          value={formData.num_questions}
                          onChange={handleInputChange}
                          id="num_questions"
                          placeholder="Enter number of questions"
                          required
                          min="1"
                          max={formData.sub_topic_id && questionCount > 0 ? questionCount : undefined}
                          className={`p-3 md:p-4 border rounded-xl shadow-sm focus:ring-2 focus:border-orange-400 outline-none transition duration-200 w-full ${
                            formData.sub_topic_id && questionCount > 0 && parseInt(formData.num_questions) > questionCount
                              ? 'border-red-500 focus:ring-red-400'
                              : 'border-gray-300 focus:ring-orange-400'
                          }`}
                        />
                        {errors.num_questions && <p className="text-red-500 text-sm mt-1">{errors.num_questions}</p>}
                        {formData.sub_topic_id && questionCount > 0 && parseInt(formData.num_questions) > questionCount && (
                          <p className="text-red-500 text-sm mt-1">
                            ⚠️ Cannot exceed {questionCount} questions available in selected subtopic
                          </p>
                        )}
                        {/* Preview Questions Button */}
                        {formData.sub_topic_id && formData.num_questions && parseInt(formData.num_questions) <= questionCount && (
                          <div className="mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handlePreviewQuestions}
                              className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview {formData.num_questions} Questions
                            </Button>
                          </div>
                        )}
                      </div>
                      {/* Year & Department */}
                      <div className="flex flex-col md:flex-row gap-4 md:col-span-2">
                        {/* Year */}
                        <div className="flex-1 flex flex-col relative">
                          <label className="font-semibold text-gray-700 mb-2">Year (Optional)</label>
                          <div className="relative">
                            <select
                              name="year"
                              value={formData.year}
                              onChange={handleInputChange}
                              className="w-full p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                            >
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
                          <label className="font-semibold text-gray-700 mb-2">Department (Optional)</label>
                          <div className="relative">
                            <select
                              name="department_id"
                              value={formData.department_id}
                              onChange={handleInputChange}
                              className="w-full p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                            >
                              <option value="">--Select Department--</option>
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
                        <label htmlFor="description" className="font-semibold text-gray-700 mb-2">
                          Description (Optional)
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          id="description"
                          rows={4}
                          placeholder="Enter test description..."
                          className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full"
                        />
                      </div>
                      {/* Active Status */}
                      <div className="flex items-center gap-3 md:col-span-2">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          id="is_active"
                          className="w-4 h-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="font-semibold text-gray-700">
                          Active Test (students can take this test)
                        </label>
                      </div>
                      <div className="md:col-span-2 flex justify-center mt-6 gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            editingTest ? setEditTestOpen(false) : setCreateTestOpen(false);
                            resetForm();
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (editingTest ? "Updating..." : "Creating...") : (editingTest ? "Update Test" : "Create Test")}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filter Section */}
              <div className="bg-gray-50 rounded-lg mb-6 border">
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-lg font-semibold text-gray-800 hover:text-orange-600 transition-colors"
                  >
                    <span>Filter Tests</span>
                    {(() => {
                      const activeFilters = Object.values(filters).filter(value => value).length;
                      return activeFilters > 0 && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          {activeFilters}
                        </span>
                      );
                    })()}
                    <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {filteredTests.length} of {tests.length} tests
                    </span>
                    {(filters.testName || filters.topic || filters.dateFrom || filters.dateTo || filters.timeSlot) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={clearFilters}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
                
                {showFilters && (
                  <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Test Name Filter */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      📝 Test Name
                    </label>
                    <input
                      type="text"
                      value={filters.testName}
                      onChange={(e) => handleFilterChange('testName', e.target.value)}
                      placeholder="Search by test name..."
                      className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm"
                    />
                  </div>

                  {/* Topic Filter */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      📚 Topic
                    </label>
                    <input
                      type="text"
                      value={filters.topic}
                      onChange={(e) => handleFilterChange('topic', e.target.value)}
                      placeholder="Search by topic..."
                      className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm"
                    />
                  </div>

                  {/* Date From Filter */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      📅 Date From
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm"
                    />
                  </div>

                  {/* Date To Filter */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      📅 Date To
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm"
                    />
                  </div>

                  {/* Time Slot Filter */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      ⏰ Time Slot
                    </label>
                    <input
                      type="text"
                      value={filters.timeSlot}
                      onChange={(e) => handleFilterChange('timeSlot', e.target.value)}
                      placeholder="e.g. 9:00 AM, Morning..."
                      className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm"
                    />
                  </div>
                </div>

                  </div>
                )}
              </div>

              <TestsSection 
                tests={filteredTests}
                loading={testsLoading}
                error={testsError}
                onEdit={handleEditTest}
                onDelete={handleDeleteTest}
                onToggleStatus={handleToggleStatus}
                onViewQuestions={handleViewTestQuestions}
              />
            </CardContent>
          </Card>
        )}

        {/* Edit Test Modal */}
        <Dialog open={editTestOpen} onOpenChange={(open) => {
          setEditTestOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Test</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Same form fields as create, but with edit data */}
              {/* Topic Selection - Optional */}
              <div className="flex flex-col md:col-span-2 relative">
                <label className="font-semibold text-gray-700 mb-2">Select Topic (Optional)</label>
                <div className="relative">
                  <select
                    name="topic_id"
                    value={formData.topic_id}
                    onChange={handleTopicChange}
                    className="w-full p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                  >
                    <option value="">--Select Topic (Optional)--</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Sub Topic Selection */}
              {formData.topic_id && (
                <div className="flex flex-col md:col-span-2 relative">
                  <label className="font-semibold text-gray-700 mb-2">Sub Topic</label>
                  <div className="relative">
                    <select
                      name="sub_topic_id"
                      value={formData.sub_topic_id}
                      onChange={handleInputChange}
                      className="w-full p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                    >
                      <option value="">--Select Sub Topic--</option>
                      {subTopics.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.title}
                        </option>
                      ))}
                    </select>
                    {errors.sub_topic_id && <p className="text-red-500 text-sm mt-1">{errors.sub_topic_id}</p>}
                    {/* Question Count Display */}
                    {formData.sub_topic_id && questionCount > 0 && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowQuestionsModal(true);
                            if (formData.sub_topic_id) {
                              fetchQuestionsForModal(formData.sub_topic_id);
                            }
                          }}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                        >
                          <span className="mr-1">📝</span>
                          Total Questions: {questionCount}
                          <span className="ml-1 text-xs">(Click to view)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Test Title */}
              <div className="flex flex-col md:col-span-2">
                <label htmlFor="edit-title" className="font-semibold text-gray-700 mb-2">
                  Test Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  id="edit-title"
                  placeholder="Enter test title"
                  required
                  className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              {/* Subject */}
              <div className="flex flex-col md:col-span-2">
                <label htmlFor="edit-subject" className="font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  id="edit-subject"
                  placeholder="Enter subject"
                  required
                  className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full"
                />
                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
              </div>
              {/* Date and Time */}
              <div className="flex flex-col md:col-span-1">
                <label htmlFor="edit-date" className="font-semibold text-gray-700 mb-2">
                  Test Date (Optional)
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  id="edit-date"
                  className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full"
                />
              </div>
              <div className="flex flex-col md:col-span-1">
                <label htmlFor="edit-time-slot" className="font-semibold text-gray-700 mb-2">
                  Time Slot (Optional)
                </label>
                <input
                  type="text"
                  name="time_slot"
                  value={formData.time_slot}
                  onChange={handleInputChange}
                  id="edit-time-slot"
                  placeholder="e.g., 9:00 AM - 11:00 AM"
                  className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full"
                />
              </div>
              {/* Year & Department */}
              <div className="flex flex-col md:flex-row gap-4 md:col-span-2">
                {/* Year */}
                <div className="flex-1 flex flex-col relative">
                  <label className="font-semibold text-gray-700 mb-2">Year (Optional)</label>
                  <div className="relative">
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                    >
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
                  <label className="font-semibold text-gray-700 mb-2">Department (Optional)</label>
                  <div className="relative">
                    <select
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleInputChange}
                      className="w-full p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 text-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                    >
                      <option value="">--Select Department--</option>
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
              {/* Duration and Questions */}
              <div className="flex flex-col md:col-span-1">
                <label htmlFor="edit-duration" className="font-semibold text-gray-700 mb-2">
                  Duration (Minutes) *
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  id="edit-duration"
                  placeholder="Enter duration in minutes"
                  required
                  min="1"
                  className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full"
                />
                {errors.duration_minutes && <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>}
              </div>
              <div className="flex flex-col md:col-span-1">
                <label htmlFor="edit-num-questions" className="font-semibold text-gray-700 mb-2">
                  Number of Questions *
                  {formData.sub_topic_id && questionCount > 0 && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Max: {questionCount} available)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="num_questions"
                  value={formData.num_questions}
                  onChange={handleInputChange}
                  id="edit-num-questions"
                  placeholder="Enter number of questions"
                  required
                  min="1"
                  max={formData.sub_topic_id && questionCount > 0 ? questionCount : undefined}
                  className={`p-3 md:p-4 border rounded-xl shadow-sm focus:ring-2 focus:border-orange-400 outline-none transition duration-200 w-full ${
                    formData.sub_topic_id && questionCount > 0 && parseInt(formData.num_questions) > questionCount
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-orange-400'
                  }`}
                />
                {errors.num_questions && <p className="text-red-500 text-sm mt-1">{errors.num_questions}</p>}
                {formData.sub_topic_id && questionCount > 0 && parseInt(formData.num_questions) > questionCount && (
                  <p className="text-red-500 text-sm mt-1">
                    ⚠️ Cannot exceed {questionCount} questions available in selected subtopic
                  </p>
                )}
                {/* Preview Questions Button */}
                {formData.sub_topic_id && formData.num_questions && parseInt(formData.num_questions) <= questionCount && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handlePreviewQuestions}
                      className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview {formData.num_questions} Questions
                    </Button>
                  </div>
                )}
              </div>
              {/* Description */}
              <div className="flex flex-col md:col-span-2">
                <label htmlFor="edit-description" className="font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  id="edit-description"
                  rows={4}
                  placeholder="Enter test description..."
                  className="p-3 md:p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 w-full"
                />
              </div>
              {/* Active Status */}
              <div className="flex items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  id="edit-is-active"
                  className="w-4 h-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                />
                <label htmlFor="edit-is-active" className="font-semibold text-gray-700">
                  Active Test (students can take this test)
                </label>
              </div>
              <div className="md:col-span-2 flex justify-center mt-6 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditTestOpen(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Test"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {activeSection === "topics" && (
          <div className="min-h-[400px]">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Topics Management</h2>
               
              </div>
            </div>
            <TopicsSection onCreateTopic={handleCreateTopic} onCreateSubTopic={handleCreateSubTopic} />
          </div>
        )}

        {activeSection === "leaderboard" && (
          <Card>
            <CardContent className="p-6 min-h-[400px]">Leaderboard Section (implement leaderboard here)</CardContent>
          </Card>
        )}

        {activeSection === "reports" && (
          <Card>
            <CardContent className="min-h-[400px]">
              <ReportsSectionUI />
            </CardContent>
          </Card>
        )}

        {activeSection === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {profileLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading profile...</p>
                </div>
              ) : profileError ? (
                <div className="flex justify-center items-center h-64 text-red-500">
                  <p>{profileError}</p>
                  <Button onClick={fetchProfile} className="ml-4">Retry</Button>
                </div>
              ) : profile ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-4xl font-bold">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{profile.name}</h3>
                      <p className="text-muted-foreground">{profile.designation}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-foreground">{profile.email}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Department</label>
                      <p className="text-foreground">{profile.department}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Joined Date</label>
                      <p className="text-foreground">{new Date(profile.joinedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleEditProfile}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" onClick={() => setShowResetPasswordModal(true)}>
                      🔒 Reset Password
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p>No profile data available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="bg-orange-500 p-4 text-center">
        <h2 className="uppercase text-xl text-white">
          Developed By{" "}
          <a href="https://www.nscet.org/ispin">Innovative Software Product Industry of NSCET</a>
        </h2>
      </div>

      {/* Questions Modal */}
      <Dialog open={showQuestionsModal} onOpenChange={setShowQuestionsModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Available Questions in Selected Subtopic</DialogTitle>
            <p className="text-sm text-gray-600">
              Total: {questionCount} questions available
            </p>
          </DialogHeader>
          <div className="p-4">
            {availableQuestions.length > 0 ? (
              <div className="space-y-4">
                {availableQuestions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">
                        Question {index + 1}
                      </h4>
                      <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {question.marks || 1} marks
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{question.text || question.question_text}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="text-sm">
                        <span className="font-medium text-green-600">A: </span>
                        <span>{question.a || question.option_a}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-green-600">B: </span>
                        <span>{question.b || question.option_b}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-green-600">C: </span>
                        <span>{question.c || question.option_c}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-green-600">D: </span>
                        <span>{question.d || question.option_d}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-orange-600">Correct Answer: </span>
                      <span className="bg-orange-100 px-2 py-1 rounded text-orange-800">
                        {question.correct || question.correct_answer}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No questions found for this subtopic.</p>
              </div>
            )}
          </div>
          <div className="flex justify-end p-4 border-t">
            <Button onClick={() => setShowQuestionsModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Questions Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Preview Questions ({formData.num_questions} questions)
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Random selection of questions that will be assigned to your test
            </p>
          </DialogHeader>
          <div className="p-4">
            {previewLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">Loading preview questions...</div>
              </div>
            ) : previewQuestions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-800">🔍 Preview Questions:</span>
                    <span className="text-blue-600">{previewQuestions.length} questions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-blue-600">
                      Total Marks: {previewQuestions.reduce((sum, q) => sum + (q.marks || 1), 0)}
                    </div>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={handleRandomizePreview}
                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      🎲 Randomize
                    </Button>
                  </div>
                </div>
                {previewQuestions.map((question, index) => (
                  <div key={question.question_id || index} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                          Q{index + 1}
                        </span>
                        {question.topic_title && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {question.topic_title}
                          </span>
                        )}
                        {question.sub_topic_title && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {question.sub_topic_title}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                          {question.marks || 1} marks
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {question.question_id}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-800 font-medium mb-4 leading-relaxed">
                      {question.text || question.question_text}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className={`p-2 rounded border ${question.correct === 'A' || question.correct_option === 'A' ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="font-medium text-green-600">A: </span>
                        <span className={question.correct === 'A' || question.correct_option === 'A' ? 'text-green-800 font-medium' : 'text-gray-700'}>
                          {question.a || question.option_a}
                        </span>
                        {(question.correct === 'A' || question.correct_option === 'A') && <span className="ml-2 text-green-600">✓</span>}
                      </div>
                      <div className={`p-2 rounded border ${question.correct === 'B' || question.correct_option === 'B' ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="font-medium text-green-600">B: </span>
                        <span className={question.correct === 'B' || question.correct_option === 'B' ? 'text-green-800 font-medium' : 'text-gray-700'}>
                          {question.b || question.option_b}
                        </span>
                        {(question.correct === 'B' || question.correct_option === 'B') && <span className="ml-2 text-green-600">✓</span>}
                      </div>
                      <div className={`p-2 rounded border ${question.correct === 'C' || question.correct_option === 'C' ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="font-medium text-green-600">C: </span>
                        <span className={question.correct === 'C' || question.correct_option === 'C' ? 'text-green-800 font-medium' : 'text-gray-700'}>
                          {question.c || question.option_c}
                        </span>
                        {(question.correct === 'C' || question.correct_option === 'C') && <span className="ml-2 text-green-600">✓</span>}
                      </div>
                      <div className={`p-2 rounded border ${question.correct === 'D' || question.correct_option === 'D' ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="font-medium text-green-600">D: </span>
                        <span className={question.correct === 'D' || question.correct_option === 'D' ? 'text-green-800 font-medium' : 'text-gray-700'}>
                          {question.d || question.option_d}
                        </span>
                        {(question.correct === 'D' || question.correct_option === 'D') && <span className="ml-2 text-green-600">✓</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No questions found</div>
                <p className="text-gray-400">
                  No questions available for the selected subtopic and count.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-between p-4 border-t gap-2">
            <div className="text-sm text-gray-600">
              💡 These are sample questions. Final assignment will be random when you create the test.
            </div>
            <Button onClick={() => setShowPreviewModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Questions Modal */}
      <Dialog open={showTestQuestionsModal} onOpenChange={setShowTestQuestionsModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Test Questions: {selectedTestForQuestions?.title}
            </DialogTitle>
            <p className="text-sm text-gray-600">
              {selectedTestForQuestions && `Subject: ${selectedTestForQuestions.subject} | Duration: ${selectedTestForQuestions.duration_minutes} minutes`}
            </p>
          </DialogHeader>
          <div className="p-4">
            {testQuestionsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">Loading assigned questions...</div>
              </div>
            ) : testQuestions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-800">📋 Assigned Questions:</span>
                    <span className="text-blue-600">{testQuestions.length} questions</span>
                  </div>
                  <div className="text-sm text-blue-600">
                    Total Marks: {testQuestions.reduce((sum, q) => sum + (q.marks || 1), 0)}
                  </div>
                </div>
                {testQuestions.map((question, index) => (
                  <div key={question.test_question_id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                          Q{index + 1}
                        </span>
                        {question.topic_title && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {question.topic_title}
                          </span>
                        )}
                        {question.sub_topic_title && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {question.sub_topic_title}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                          {question.marks} marks
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {question.question_id}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-800 font-medium mb-4 leading-relaxed">
                      {question.text}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className={`p-2 rounded border ${question.correct === 'A' ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="font-medium text-green-600">A: </span>
                        <span className={question.correct === 'A' ? 'text-green-800 font-medium' : 'text-gray-700'}>
                          {question.a}
                        </span>
                        {question.correct === 'A' && <span className="ml-2 text-green-600">✓</span>}
                      </div>
                      <div className={`p-2 rounded border ${question.correct === 'B' ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="font-medium text-green-600">B: </span>
                        <span className={question.correct === 'B' ? 'text-green-800 font-medium' : 'text-gray-700'}>
                          {question.b}
                        </span>
                        {question.correct === 'B' && <span className="ml-2 text-green-600">✓</span>}
                      </div>
                      <div className={`p-2 rounded border ${question.correct === 'C' ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="font-medium text-green-600">C: </span>
                        <span className={question.correct === 'C' ? 'text-green-800 font-medium' : 'text-gray-700'}>
                          {question.c}
                        </span>
                        {question.correct === 'C' && <span className="ml-2 text-green-600">✓</span>}
                      </div>
                      <div className={`p-2 rounded border ${question.correct === 'D' ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="font-medium text-green-600">D: </span>
                        <span className={question.correct === 'D' ? 'text-green-800 font-medium' : 'text-gray-700'}>
                          {question.d}
                        </span>
                        {question.correct === 'D' && <span className="ml-2 text-green-600">✓</span>}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 border-t pt-2 mt-3">
                      Assigned on: {new Date(question.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No questions assigned yet</div>
                <p className="text-gray-400 mb-4">
                  Questions will be automatically assigned when you create a test with a subtopic selected.
                </p>
                {selectedTestForQuestions?.sub_topic_id && (
                  <Button 
                    onClick={async () => {
                      try {
                        await assignQuestionsToTest(
                          selectedTestForQuestions.test_id,
                          selectedTestForQuestions.sub_topic_id,
                          selectedTestForQuestions.num_questions
                        );
                        await fetchTestQuestions(selectedTestForQuestions.test_id);
                        alert('Questions assigned successfully!');
                      } catch (error) {
                        alert('Failed to assign questions: ' + error.message);
                      }
                    }}
                    className="bg-orange-500 text-white hover:bg-orange-600"
                  >
                    Assign Questions Now
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end p-4 border-t gap-2">
            {testQuestions.length > 0 && selectedTestForQuestions?.sub_topic_id && (
              <Button 
                variant="outline"
                onClick={async () => {
                  if (confirm('This will reassign questions randomly. Continue?')) {
                    try {
                      await assignQuestionsToTest(
                        selectedTestForQuestions.test_id,
                        selectedTestForQuestions.sub_topic_id,
                        selectedTestForQuestions.num_questions
                      );
                      await fetchTestQuestions(selectedTestForQuestions.test_id);
                      alert('Questions reassigned successfully!');
                    } catch (error) {
                      alert('Failed to reassign questions: ' + error.message);
                    }
                  }
                }}
              >
                🔄 Reassign Questions
              </Button>
            )}
            <Button onClick={() => setShowTestQuestionsModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={showEditProfileModal} onOpenChange={setShowEditProfileModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="profile-name" className="text-sm font-medium">
                Name *
              </label>
              <input
                type="text"
                id="profile-name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                placeholder="Enter your name"
                required
              />
              {profileErrors.name && <p className="text-red-500 text-sm">{profileErrors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="profile-email" className="text-sm font-medium">
                Email *
              </label>
              <input
                type="email"
                id="profile-email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                placeholder="Enter your email"
                required
              />
              {profileErrors.email && <p className="text-red-500 text-sm">{profileErrors.email}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditProfileModal(false)}
                disabled={profileSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={profileSubmitting}>
                {profileSubmitting ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={showResetPasswordModal} onOpenChange={setShowResetPasswordModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium">
                Current Password *
              </label>
              <input
                type="password"
                id="current-password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                placeholder="Enter current password"
                required
              />
              {passwordErrors.currentPassword && <p className="text-red-500 text-sm">{passwordErrors.currentPassword}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                New Password *
              </label>
              <input
                type="password"
                id="new-password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                placeholder="Enter new password (min 6 characters)"
                required
                minLength={6}
              />
              {passwordErrors.newPassword && <p className="text-red-500 text-sm">{passwordErrors.newPassword}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm New Password *
              </label>
              <input
                type="password"
                id="confirm-password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                placeholder="Confirm new password"
                required
              />
              {passwordErrors.confirmPassword && <p className="text-red-500 text-sm">{passwordErrors.confirmPassword}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                  });
                  setPasswordErrors({});
                }}
                disabled={passwordSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={passwordSubmitting}>
                {passwordSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Topic Modal */}
      <Dialog open={showCreateTopicModal} onOpenChange={setShowCreateTopicModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Topic</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTopicSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="topic-title" className="text-sm font-medium">
                Topic Title *
              </label>
              <input
                type="text"
                id="topic-title"
                value={topicData.title}
                onChange={(e) => setTopicData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                placeholder="Enter topic title"
                required
              />
              {topicErrors.title && <p className="text-red-500 text-sm">{topicErrors.title}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="topic-description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="topic-description"
                value={topicData.description}
                onChange={(e) => setTopicData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                placeholder="Enter topic description (optional)"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateTopicModal(false);
                  setTopicData({ title: "", description: "" });
                  setTopicErrors({});
                }}
                disabled={topicSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={topicSubmitting}>
                {topicSubmitting ? "Creating..." : "Create Topic"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Subtopic Modal */}
      <Dialog open={showCreateSubTopicModal} onOpenChange={setShowCreateSubTopicModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Create New Subtopic
              {selectedTopicForSubTopic && (
                <span className="text-sm text-gray-600 block mt-1">
                  under "{selectedTopicForSubTopic.title}"
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubTopicSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="subtopic-title" className="text-sm font-medium">
                Subtopic Title *
              </label>
              <input
                type="text"
                id="subtopic-title"
                value={subTopicData.title}
                onChange={(e) => setSubTopicData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                placeholder="Enter subtopic title"
                required
              />
              {subTopicErrors.title && <p className="text-red-500 text-sm">{subTopicErrors.title}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="subtopic-description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="subtopic-description"
                value={subTopicData.description}
                onChange={(e) => setSubTopicData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
                placeholder="Enter subtopic description (optional)"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateSubTopicModal(false);
                  setSelectedTopicForSubTopic(null);
                  setSubTopicData({ topicId: "", title: "", description: "" });
                  setSubTopicErrors({});
                }}
                disabled={subTopicSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={subTopicSubmitting}>
                {subTopicSubmitting ? "Creating..." : "Create Subtopic"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};