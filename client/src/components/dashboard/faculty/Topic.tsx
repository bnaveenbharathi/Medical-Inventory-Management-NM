import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const API_BASE = import.meta.env.VITE_API_BASE;

// Question Modal Component
const QuestionModal = ({ isOpen, onClose, question, onSave, title, isEditing = false }) => {
  const [formData, setFormData] = useState({
    text: question?.text || "",
    a: question?.a || "",
    b: question?.b || "",
    c: question?.c || "",
    d: question?.d || "",
    correct: question?.correct || "A",
    marks: question?.marks || 1
  });

  useEffect(() => {
    if (question) {
      setFormData({
        text: question.text || "",
        a: question.a || "",
        b: question.b || "",
        c: question.c || "",
        d: question.d || "",
        correct: question.correct || "A",
        marks: question.marks || 1
      });
    }
  }, [question]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.text.trim() || !formData.a.trim() || !formData.b.trim() || !formData.c.trim() || !formData.d.trim()) {
      alert("Please fill in all fields");
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
            <textarea
              value={formData.text}
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
              rows={3}
              required
              placeholder="Enter your question here..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {['A', 'B', 'C', 'D'].map((option) => (
              <div key={option} className="flex items-center gap-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="correct"
                    value={option}
                    checked={formData.correct === option}
                    onChange={(e) => handleChange('correct', e.target.value)}
                    className="mr-2"
                  />
                  <span className="font-medium text-gray-700">{option}.</span>
                </label>
                <input
                  type="text"
                  value={formData[option.toLowerCase()]}
                  onChange={(e) => handleChange(option.toLowerCase(), e.target.value)}
                  className={`flex-1 p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200 ${formData.correct === option ? 'bg-green-50 border-green-300' : ''}`}
                  required
                  placeholder={`Option ${option} text`}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Marks</label>
            <input
              type="number"
              value={formData.marks}
              onChange={(e) => handleChange('marks', parseInt(e.target.value) || 1)}
              className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition duration-200"
              min="1"
              required
              placeholder="Enter marks for this question"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl shadow-lg font-semibold transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white rounded-2xl shadow-lg font-semibold transition duration-200"
            >
              {isEditing ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Upload Questions with Preview Component
const UploadQuestionsWithPreview = ({ selectedTopic, selectedSubtopic, onClose }) => {
  const [file, setFile] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (file.name.endsWith('.csv')) {
        const text = e.target.result;
        parseCsv(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        try {
          // For now, just show message for Excel support
          alert('Excel file detected. Please convert to CSV format for now.\nExpected CSV format: Question, Option A, Option B, Option C, Option D, Correct Answer');
        } catch (error) {
          alert('Error parsing Excel file. Please use CSV format.');
        }
      } else {
        alert('Unsupported file format. Please use CSV files.');
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const parseCsv = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const questions = [];
    
    // Skip header row, start from index 1
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',').map(col => col.trim().replace(/"/g, ''));
      if (columns.length >= 6) {
        questions.push({
          text: columns[0],
          a: columns[1],
          b: columns[2],
          c: columns[3],
          d: columns[4],
          correct: columns[5],
          marks: columns[6] ? parseInt(columns[6]) || 1 : 1
        });
      }
    }
    
    setPreviewQuestions(questions);
    setShowPreview(true);
  };

  const handleEditQuestion = (index) => {
    setEditingQuestion(previewQuestions[index]);
    setEditingIndex(index);
    setShowEditModal(true);
  };

  const handleSaveEditedQuestion = (formData) => {
    const updatedQuestions = [...previewQuestions];
    updatedQuestions[editingIndex] = formData;
    setPreviewQuestions(updatedQuestions);
    setEditingQuestion(null);
    setEditingIndex(null);
  };

  const handleAddNewQuestion = (formData) => {
    setPreviewQuestions(prev => [...prev, formData]);
  };

  const handleDeleteQuestion = (index) => {
    if (confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = previewQuestions.filter((_, i) => i !== index);
      setPreviewQuestions(updatedQuestions);
    }
  };

  const handleUpload = async () => {
    if (!previewQuestions.length) return;
    
    setUploading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      
      // Extract user_id from JWT token
      let userId = null;
      try {
        if (token) {
          const decoded: any = jwtDecode(token);
          userId = decoded.user_id;
        }
      } catch (error) {
        console.error('Error decoding JWT token:', error);
      }
      
      // Upload questions one by one to handle individual errors
      let successCount = 0;
      let errorCount = 0;
      
      for (const question of previewQuestions) {
        try {
          const payload = {
            sub_topic_id: selectedSubtopic.id,
            user_id: userId, 
            ...question
          };
          
          const response = await fetch(`${API_BASE}/question/addquestions`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });

          const result = await response.json();
          if (result.success) {
            successCount++;
          } else {
            console.error('Failed to upload question:', result.error);
            errorCount++;
          }
        } catch (error) {
          console.error('Error uploading question:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        alert(`Successfully uploaded ${successCount} questions!${errorCount > 0 ? ` ${errorCount} questions failed to upload.` : ''}`);
        
        // Reset form
        setFile(null);
        setPreviewQuestions([]);
        setShowPreview(false);
        setEditingIndex(null);
        const fileInput = document.getElementById('questionsFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Close modal if provided
        if (onClose) {
          onClose();
        }
      } else {
        alert('Failed to upload questions. Please check your connection and try again.');
      }
      
    } catch (error) {
      alert('Error uploading questions. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-gray-600">
          Selected Sub-topic: <span className="font-semibold text-orange-600">{selectedSubtopic?.title}</span>
        </p>
        <p className="text-gray-600">
          Topic: <span className="font-semibold text-orange-600">{selectedTopic?.title}</span>
        </p>
      </div>

      {!showPreview ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <label htmlFor="questionsFile" className="mb-2 font-semibold text-gray-700">
              Upload Questions File
            </label>
            <input 
              type="file" 
              id="questionsFile" 
              accept=".csv,.xlsx,.xls" 
              onChange={handleFileChange}
              className="p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none w-full transition duration-200 cursor-pointer" 
            />
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: CSV, Excel (.xlsx, .xls)<br />
              CSV format: Question, Option A, Option B, Option C, Option D, Correct Answer
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> After uploading, you can preview, edit, delete, and add more questions before final upload.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 font-medium">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            
            <button
              onClick={() => setShowPreview(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white rounded-2xl shadow-lg font-semibold transition duration-200"
            >
              ➕ Start Adding Questions Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-800">Preview: {previewQuestions.length} Questions</h4>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md font-semibold transition duration-200 flex items-center gap-2"
              >
                ➕ Add Question
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-3">
              {previewQuestions.map((question, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-2">{index + 1}. {question.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-600">Marks:</span>
                        <input
                          type="number"
                          value={question.marks || 1}
                          onChange={(e) => {
                            const updatedQuestions = [...previewQuestions];
                            updatedQuestions[index].marks = parseInt(e.target.value) || 1;
                            setPreviewQuestions(updatedQuestions);
                          }}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditQuestion(index)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition duration-200 flex items-center gap-1"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(index)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition duration-200 flex items-center gap-1"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <div key={option} className={`p-2 rounded-lg border ${question.correct === option ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="font-medium">{option}.</span> {question[option.toLowerCase()]}
                        {question.correct === option && <span className="ml-2 text-green-600">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {previewQuestions.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p>No questions in preview</p>
                  <p className="text-sm">Upload a CSV file or add questions manually</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setShowPreview(false);
                setPreviewQuestions([]);
                setFile(null);
                setEditingIndex(null);
              }}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl shadow-lg font-semibold transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || previewQuestions.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white rounded-2xl shadow-lg font-semibold transition duration-200 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : `🚀 Upload ${previewQuestions.length} Questions`}
            </button>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      <QuestionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingQuestion(null);
          setEditingIndex(null);
        }}
        question={editingQuestion}
        onSave={handleSaveEditedQuestion}
        title="Edit Question"
        isEditing={true}
      />

      {/* Add Question Modal */}
      <QuestionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        question={null}
        onSave={handleAddNewQuestion}
        title="Add New Question"
        isEditing={false}
      />
    </div>
  );
};

export function TopicsSection() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [questionsData, setQuestionsData] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [viewingSubtopic, setViewingSubtopic] = useState(null);

  // Fetch topics with subtopics from backend
  useEffect(() => {
    const fetchTopics = async () => {
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
        
        setTopics(data.topics);
        // Set initial selections
        if (data.topics.length > 0) {
          setSelectedTopicId(data.topics[0].id);
          if (data.topics[0].subtopics.length > 0) {
            setSelectedSubtopicId(data.topics[0].subtopics[0].id);
          }
        }
      } catch (error) {
        setError(error.message || "Failed to fetch topics");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopics();
  }, []);

  const selectedTopic = topics.find(t => t.id === selectedTopicId);
  const selectedSubtopic = selectedTopic?.subtopics.find(s => s.id === selectedSubtopicId);

  const handleViewQuestions = async (subtopic) => {
    setViewingSubtopic(subtopic);
    setShowQuestionsModal(true);
    setQuestionsLoading(true);
    
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE}/question/subtopics/${subtopic.id}/questions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setQuestionsData(data.questions || []);
      } else {
        console.error('Failed to fetch questions:', data.error);
        setQuestionsData([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestionsData([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading topics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Topics and Subtopics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topics List */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-xl mb-4">Topics</h2>
          <ul className="space-y-2">
            {topics.map(topic => (
              <li key={topic.id}>
                <button
                  className={`topic-btn w-full text-left px-4 py-3 rounded-lg hover:bg-orange-100 transition duration-200 ${selectedTopicId === topic.id ? 'bg-orange-200 border-l-4 border-orange-500' : 'border-l-4 border-transparent'}`}
                  onClick={() => {
                    setSelectedTopicId(topic.id);
                    setSelectedSubtopicId(topic.subtopics[0]?.id || null);
                  }}
                >
                  <div className="font-medium">{topic.title}</div>
                  <div className="text-sm text-gray-500 mt-1">{topic.subtopics?.length || 0} subtopics</div>
                </button>
              </li>
            ))}
          </ul>
          {selectedTopic && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Selected Topic</h3>
              <p className="text-gray-600 text-sm">{selectedTopic.description}</p>
            </div>
          )}
        </div>

        {/* Subtopics List */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-xl mb-4">Subtopics</h2>
          {selectedTopic?.subtopics.length ? (
            <ul className="space-y-2">
              {selectedTopic.subtopics.map(sub => (
                <li key={sub.id}>
                  <div className={`flex items-center justify-between p-4 rounded-lg hover:bg-orange-100 transition duration-200 ${selectedSubtopicId === sub.id ? 'bg-orange-200 border-l-4 border-orange-500' : 'border-l-4 border-transparent'}`}>
                    <button
                      className="subtopic-btn flex-1 text-left"
                      onClick={() => setSelectedSubtopicId(sub.id)}
                    >
                      <div className="font-medium">{sub.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{sub.description}</div>
                    </button>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span className="font-medium">{sub.question_count || 0}</span>
                        <span>questions</span>
                      </div>
                      <button 
                        onClick={() => handleViewQuestions(sub)}
                        className="text-orange-500 hover:text-orange-700 p-2" 
                        title="View Questions"
                      >
                        📄
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-400 py-8">
              {selectedTopic ? "No subtopics available" : "Select a topic to view subtopics"}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {selectedTopicId && selectedSubtopicId && (
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Manage Questions</h3>
              <p className="text-gray-600">
                Topic: <span className="font-medium text-orange-600">{selectedTopic?.title}</span> → 
                Subtopic: <span className="font-medium text-orange-600">{selectedSubtopic?.title}</span>
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white rounded-2xl shadow-lg font-semibold transition duration-200 flex items-center gap-2"
            >
              📤 Upload Questions
            </button>
          </div>
        </div>
      )}

      {/* Upload Questions Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Upload Questions</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <UploadQuestionsWithPreview 
                selectedTopic={selectedTopic}
                selectedSubtopic={selectedSubtopic}
                onClose={() => setShowUploadModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Questions Modal */}
      {showQuestionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Questions</h3>
                <p className="text-gray-600 mt-1">
                  {viewingSubtopic?.title} - {questionsData.length} question{questionsData.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowQuestionsModal(false);
                  setQuestionsData([]);
                  setViewingSubtopic(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {questionsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-gray-500">Loading questions...</div>
                </div>
              ) : questionsData.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {questionsData.map((question, index) => (
                    <div key={question.question_id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-lg mb-2">
                            {index + 1}. {question.text}
                          </h4>
                        </div>
                        <div className="ml-4 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                          {question.marks || 1} mark{(question.marks || 1) !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {['A', 'B', 'C', 'D'].map((option) => {
                          const isCorrect = question.correct === option;
                          return (
                            <div 
                              key={option} 
                              className={`p-3 rounded-lg border ${
                                isCorrect 
                                ? 'bg-green-100 text-green-800 border-green-300' 
                                : 'bg-white border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{option}.</span>
                                <span className="flex-1">{question[option.toLowerCase()]}</span>
                                {isCorrect && (
                                  <span className="text-green-600 font-bold">✓</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">No questions found</div>
                  <p className="text-gray-400 mt-2">This subtopic doesn't have any questions yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
