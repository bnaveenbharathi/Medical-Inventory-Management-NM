import React, { useState } from "react";

const mockTopics = {
  1: {
    title: "Python Basics",
    description: "Introduction to Python programming.",
    subtopics: [
      { id: 101, title: "Variables", description: "Learn about variables in Python." },
      { id: 102, title: "Loops", description: "Learn about loops in Python." }
    ]
  },
  2: {
    title: "Data Structures",
    description: "Explore data structures in CS.",
    subtopics: [
      { id: 201, title: "Arrays", description: "Introduction to arrays." },
      { id: 202, title: "Linked Lists", description: "Introduction to linked lists." }
    ]
  },
  3: {
    title: "Algorithms",
    description: "Algorithm analysis and design.",
    subtopics: [
      { id: 301, title: "Sorting", description: "Sorting algorithms." },
      { id: 302, title: "Searching", description: "Searching algorithms." }
    ]
  }
};

export function TopicsSection() {
  const [topics] = useState(mockTopics);
  const [selectedTopicId, setSelectedTopicId] = useState(Object.keys(mockTopics)[0]);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState(mockTopics[Object.keys(mockTopics)[0]].subtopics[0].id);

  return (
    <div className="flex gap-6 ">
      {/* Topics List */}
      <div className="w-1/4 bg-white rounded-2xl shadow p-4">
        <h2 className="font-bold text-xl mb-2">Topics</h2>
        <ul className="space-y-2">
          {Object.entries(topics).map(([tid, topic]) => (
            <li key={tid}>
              <button
                className={`topic-btn w-full text-left px-3 py-2 rounded hover:bg-orange-100 ${selectedTopicId === tid ? 'bg-orange-200' : ''}`}
                onClick={() => {
                  setSelectedTopicId(tid);
                  setSelectedSubtopicId(topic.subtopics[0]?.id || null);
                }}
              >
                {topic.title}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-gray-600 text-sm">
          {selectedTopicId && topics[selectedTopicId]?.description}
        </div>
      </div>
      {/* Subtopics List */}
      <div className="w-1/4 bg-white rounded-2xl shadow p-4">
        <h2 className="font-bold text-xl mb-2">Subtopics</h2>
        <ul className="space-y-2">
          {selectedTopicId && topics[selectedTopicId]?.subtopics.length ? (
            topics[selectedTopicId].subtopics.map(sub => (
              <li key={sub.id} className="flex items-center justify-between">
                <button
                  className={`subtopic-btn flex-1 text-left px-3 py-2 rounded hover:bg-orange-100 ${selectedSubtopicId === sub.id ? 'bg-orange-200' : ''}`}
                  onClick={() => setSelectedSubtopicId(sub.id)}
                >
                  {sub.title}
                </button>
                <a href={`/Questions/${sub.id}`} className="ml-2 text-orange-500 hover:text-orange-700" title="View Questions">📄</a>
              </li>
            ))
          ) : (
            <li className="text-gray-400">No subtopics</li>
          )}
        </ul>
        <div className="mt-4 text-gray-600 text-sm">
          {selectedTopicId && selectedSubtopicId &&
            topics[selectedTopicId]?.subtopics.find(sub => sub.id === selectedSubtopicId)?.description}
        </div>
      </div>
      {/* Upload Questions Form */}
      <div className="flex-1">
        {selectedTopicId && selectedSubtopicId && (
          <section className="bg-white rounded-3xl shadow-xl p-8">
            <form id="upload-questions-form" encType="multipart/form-data" className="flex flex-col gap-6" action="#" method="post">
              <input type="hidden" name="topic_id" value={selectedTopicId} />
              <input type="hidden" name="subtopic_id" value={selectedSubtopicId} />
              <div className="flex flex-col">
                <label htmlFor="questionsFile" className="mb-2 font-semibold text-gray-700">
                  Upload Questions File (CSV/XLSX)
                </label>
                <input type="file" name="questionsFile" id="questionsFile" accept=".xlsx,.xlsm,.csv" required
                  className="p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none w-full transition duration-200 cursor-pointer" />
                <a href="/templates/questions-template.xlsx" download
                  className="text-orange-500 hover:text-orange-600 mt-2 text-sm">
                  Download template file
                </a>
              </div>
              <div className="flex justify-center mt-4">
                <button type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white rounded-2xl shadow-lg font-semibold transition duration-200">
                  Upload Questions
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
