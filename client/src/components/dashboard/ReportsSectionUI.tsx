import React, { useState } from "react";

const mockOverallReport = [
  { test: "Python Basics", students: 40, avgScore: 78, highest: 98, lowest: 45 },
  { test: "Data Structures", students: 38, avgScore: 82, highest: 99, lowest: 60 },
];
const mockWeeklyReport = [
  { week: "Sep 1-7", tests: 2, avgScore: 75 },
  { week: "Sep 8-14", tests: 3, avgScore: 80 },
];
const mockMonthlyReport = [
  { month: "September", tests: 5, avgScore: 78 },
  { month: "August", tests: 4, avgScore: 74 },
];
const mockStudentReport = [
  { name: "John Doe", test: "Python Basics", score: 88, rank: 2 },
  { name: "Jane Smith", test: "Data Structures", score: 92, rank: 1 },
];

export function ReportsSectionUI() {
  const [tab, setTab] = useState("overall");
  return (
    <div>
      <div className="flex gap-4 mb-6">
        <button className={`px-4 py-2 rounded ${tab === "overall" ? "bg-orange-500 text-white" : "bg-gray-100"}`} onClick={() => setTab("overall")}>Overall Test Report</button>
        <button className={`px-4 py-2 rounded ${tab === "weekly" ? "bg-orange-500 text-white" : "bg-gray-100"}`} onClick={() => setTab("weekly")}>Weekly Report</button>
        <button className={`px-4 py-2 rounded ${tab === "monthly" ? "bg-orange-500 text-white" : "bg-gray-100"}`} onClick={() => setTab("monthly")}>Monthly Report</button>
        <button className={`px-4 py-2 rounded ${tab === "student" ? "bg-orange-500 text-white" : "bg-gray-100"}`} onClick={() => setTab("student")}>Student Report</button>
      </div>
      {tab === "overall" && (
        <div>
          <h3 className="font-bold text-lg mb-2">Overall Test Report</h3>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Test</th>
                <th className="p-2">Students</th>
                <th className="p-2">Avg Score</th>
                <th className="p-2">Highest</th>
                <th className="p-2">Lowest</th>
              </tr>
            </thead>
            <tbody>
              {mockOverallReport.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{r.test}</td>
                  <td className="p-2">{r.students}</td>
                  <td className="p-2">{r.avgScore}</td>
                  <td className="p-2">{r.highest}</td>
                  <td className="p-2">{r.lowest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "weekly" && (
        <div>
          <h3 className="font-bold text-lg mb-2">Weekly Test Report</h3>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Week</th>
                <th className="p-2">Tests Conducted</th>
                <th className="p-2">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {mockWeeklyReport.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{r.week}</td>
                  <td className="p-2">{r.tests}</td>
                  <td className="p-2">{r.avgScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "monthly" && (
        <div>
          <h3 className="font-bold text-lg mb-2">Monthly Test Report</h3>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Month</th>
                <th className="p-2">Tests Conducted</th>
                <th className="p-2">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {mockMonthlyReport.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{r.month}</td>
                  <td className="p-2">{r.tests}</td>
                  <td className="p-2">{r.avgScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "student" && (
        <div>
          <h3 className="font-bold text-lg mb-2">Individual Student Report</h3>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Student</th>
                <th className="p-2">Test</th>
                <th className="p-2">Score</th>
                <th className="p-2">Rank</th>
              </tr>
            </thead>
            <tbody>
              {mockStudentReport.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.test}</td>
                  <td className="p-2">{r.score}</td>
                  <td className="p-2">{r.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}