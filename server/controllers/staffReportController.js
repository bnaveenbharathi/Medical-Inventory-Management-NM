const db = require('../config/conn');

// 1. Individual Student Report
exports.getStudentsByFaculty = (req, res) => {
  const facultyId = req.user?.id;
  
  if (!facultyId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  const sql = `
    SELECT DISTINCT u.id, u.name, u.email, u.roll_no as rollNo, 
           d.short_name as department, u.year
    FROM users u
    INNER JOIN student_tests st ON u.id = st.student_id
    INNER JOIN tests t ON st.test_id = t.test_id
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE t.added_by = ? AND u.role_id = '1'
    ORDER BY u.name
  `;
  
  db.query(sql, [facultyId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    res.json({ success: true, students: results });
  });
};

exports.getStudentReport = (req, res) => {
  const { studentId } = req.params;
  const facultyId = req.user?.id;
  
  if (!facultyId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  const sql = `
    SELECT 
      t.title as test,
      t.date as testDate,
      st.start_time as startTime,
      st.end_time as finishTime,
      st.score,
      t.num_questions as maxScore,
      ROUND((st.score / t.num_questions) * 100, 2) as accuracy,
      CASE 
        WHEN st.end_time IS NOT NULL AND st.start_time IS NOT NULL 
        THEN TIMESTAMPDIFF(MINUTE, st.start_time, st.end_time)
        ELSE NULL 
      END as timeTaken,
      CASE 
        WHEN st.end_time IS NOT NULL AND st.start_time IS NOT NULL 
        THEN CONCAT(
          FLOOR(TIMESTAMPDIFF(MINUTE, st.start_time, st.end_time) / 60), 'h ',
          MOD(TIMESTAMPDIFF(MINUTE, st.start_time, st.end_time), 60), 'm'
        )
        ELSE 'Not completed' 
      END as duration,
      t.duration_minutes as totalTime,
      st.status,
      (
        SELECT COUNT(*) + 1 
        FROM student_tests st2 
        WHERE st2.test_id = st.test_id AND st2.score > st.score
      ) as rank,
      (
        SELECT COUNT(*) 
        FROM student_tests st3 
        WHERE st3.test_id = st.test_id
      ) as totalStudents
    FROM student_tests st
    INNER JOIN tests t ON st.test_id = t.test_id
    WHERE st.student_id = ? AND t.added_by = ?
    ORDER BY t.date DESC
  `;
  
  db.query(sql, [studentId, facultyId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    // Add weak areas analysis (placeholder - would need more complex analysis)
    const testResults = results.map(test => ({
      ...test,
      weakAreas: ['Loops', 'Functions'] // This would be calculated based on question-wise performance
    }));
    
    res.json({ success: true, testResults });
  });
};

// Get detailed test history for a student with time calculations
exports.getStudentTestHistory = (req, res) => {
  const { studentId } = req.params;
  const facultyId = req.user?.id;
  
  if (!facultyId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  const sql = `
    SELECT 
      st.student_test_id,
      t.title as testTitle,
      t.date as testDate,
      st.start_time as startTime,
      st.end_time as finishTime,
      st.score,
      t.num_questions as totalQuestions,
      ROUND((st.score / t.num_questions) * 100, 2) as percentage,
      st.status,
      CASE 
        WHEN st.end_time IS NOT NULL AND st.start_time IS NOT NULL 
        THEN TIMESTAMPDIFF(SECOND, st.start_time, st.end_time)
        ELSE NULL 
      END as durationSeconds,
      CASE 
        WHEN st.end_time IS NOT NULL AND st.start_time IS NOT NULL 
        THEN CONCAT(
          FLOOR(TIMESTAMPDIFF(MINUTE, st.start_time, st.end_time) / 60), 'h ',
          MOD(TIMESTAMPDIFF(MINUTE, st.start_time, st.end_time), 60), 'm ',
          MOD(TIMESTAMPDIFF(SECOND, st.start_time, st.end_time), 60), 's'
        )
        ELSE 'Not completed' 
      END as formattedDuration,
      t.duration_minutes as allocatedTime,
      CASE 
        WHEN st.end_time IS NOT NULL AND st.start_time IS NOT NULL 
        THEN ROUND((TIMESTAMPDIFF(MINUTE, st.start_time, st.end_time) / t.duration_minutes) * 100, 2)
        ELSE NULL 
      END as timeUtilization
    FROM student_tests st
    INNER JOIN tests t ON st.test_id = t.test_id
    WHERE st.student_id = ? AND t.added_by = ?
    ORDER BY t.date DESC, st.start_time DESC
  `;
  
  db.query(sql, [studentId, facultyId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    // Format the results with additional calculated fields
    const testHistory = results.map(test => ({
      ...test,
      startTimeFormatted: test.startTime ? new Date(test.startTime).toLocaleString() : null,
      finishTimeFormatted: test.finishTime ? new Date(test.finishTime).toLocaleString() : null,
      isCompleted: test.status === 'completed' || test.finishTime !== null,
      timeTakenMinutes: test.durationSeconds ? Math.floor(test.durationSeconds / 60) : null,
      efficiency: test.score && test.durationSeconds ? 
        Math.round((test.score / (test.durationSeconds / 60)) * 100) / 100 : null // Score per minute
    }));
    
    res.json({ 
      success: true, 
      testHistory,
      summary: {
        totalTests: results.length,
        completedTests: results.filter(t => t.finishTime).length,
        averageScore: results.length > 0 ? 
          Math.round(results.reduce((sum, t) => sum + (t.score || 0), 0) / results.length * 100) / 100 : 0,
        averageDuration: results.filter(t => t.durationSeconds).length > 0 ?
          Math.round(results.filter(t => t.durationSeconds)
            .reduce((sum, t) => sum + t.durationSeconds, 0) / 
            results.filter(t => t.durationSeconds).length / 60 * 100) / 100 + ' minutes' : 'N/A'
      }
    });
  });
};

// 2. Test-wise Report
exports.getTestsByFaculty = (req, res) => {
  const facultyId = req.user?.id;
  
  if (!facultyId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  const sql = `
    SELECT t.test_id as id, t.title, t.date, t.duration_minutes as duration,
           COUNT(st.student_id) as students,
           t.num_questions as totalQuestions
    FROM tests t
    LEFT JOIN student_tests st ON t.test_id = st.test_id
    WHERE t.added_by = ?
    GROUP BY t.test_id, t.title, t.date, t.duration_minutes, t.num_questions
    ORDER BY t.date DESC
  `;
  
  db.query(sql, [facultyId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    res.json({ success: true, tests: results });
  });
};

exports.getTestAnalysis = (req, res) => {
  const { testId } = req.params;
  const facultyId = req.user?.id;
  
  if (!facultyId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  // Test info and stats
  const testInfoSql = `
    SELECT t.title, t.date, t.num_questions as totalQuestions, t.duration_minutes as duration,
           ROUND(AVG(st.score), 2) as avgScore,
           MAX(st.score) as highestScore,
           MIN(st.score) as lowestScore,
           ROUND((COUNT(CASE WHEN st.score >= 60 THEN 1 END) / COUNT(*)) * 100, 2) as passRate
    FROM tests t
    LEFT JOIN student_tests st ON t.test_id = st.test_id
    WHERE t.test_id = ? AND t.added_by = ?
    GROUP BY t.test_id
  `;

  // Top performers
  const topPerformersSql = `
    SELECT u.name, st.score,
           (SELECT COUNT(*) + 1 FROM student_tests st2 WHERE st2.test_id = st.test_id AND st2.score > st.score) as rank
    FROM student_tests st
    INNER JOIN users u ON st.student_id = u.id
    INNER JOIN tests t ON st.test_id = t.test_id
    WHERE st.test_id = ? AND t.added_by = ?
    ORDER BY st.score DESC
    LIMIT 10
  `;

  // Question analysis (simplified)
  const questionAnalysisSql = `
    SELECT q.text as question,
           COUNT(CASE WHEN ta.selected_option = q.correct THEN 1 END) as correctAnswers,
           COUNT(ta.test_answer_id) as totalAnswers,
           CASE 
             WHEN (COUNT(CASE WHEN ta.selected_option = q.correct THEN 1 END) / COUNT(ta.test_answer_id)) > 0.8 THEN 'Easy'
             WHEN (COUNT(CASE WHEN ta.selected_option = q.correct THEN 1 END) / COUNT(ta.test_answer_id)) > 0.5 THEN 'Medium'
             ELSE 'Hard'
           END as difficulty
    FROM test_questions tq
    INNER JOIN questions q ON tq.question_id = q.question_id
    LEFT JOIN test_answers ta ON tq.test_question_id = ta.test_question_id
    INNER JOIN tests t ON tq.test_id = t.test_id
    WHERE tq.test_id = ? AND t.added_by = ?
    GROUP BY q.question_id, q.text
    ORDER BY correctAnswers DESC
  `;

  // Execute all queries
  db.query(testInfoSql, [testId, facultyId], (err, testInfo) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    if (testInfo.length === 0) {
      return res.status(404).json({ error: 'Test not found or unauthorized' });
    }

    db.query(topPerformersSql, [testId, facultyId], (err, topPerformers) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err });
      }

      db.query(questionAnalysisSql, [testId, facultyId], (err, questionAnalysis) => {
        if (err) {
          return res.status(500).json({ error: 'Database error', details: err });
        }

        const response = {
          success: true,
          testAnalysis: {
            testInfo: testInfo[0],
            stats: {
              avgScore: testInfo[0].avgScore,
              highestScore: testInfo[0].highestScore,
              lowestScore: testInfo[0].lowestScore,
              passRate: testInfo[0].passRate
            },
            topPerformers,
            questionAnalysis
          }
        };

        res.json(response);
      });
    });
  });
};

// 3. Department/Batch Report
exports.getDepartmentReport = (req, res) => {
  const facultyId = req.user?.id;
  
  if (!facultyId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  const sql = `
    SELECT 
      d.short_name as department,
      COUNT(DISTINCT u.id) as students,
      COUNT(DISTINCT st.student_test_id) as testsAttended,
      ROUND(AVG(st.score), 2) as avgScore,
      ROUND((COUNT(CASE WHEN st.score >= 60 THEN 1 END) / COUNT(st.student_test_id)) * 100, 2) as passRate,
      ROUND((COUNT(DISTINCT st.student_id) / COUNT(DISTINCT u.id)) * 100, 2) as attendance
    FROM departments d
    LEFT JOIN users u ON d.id = u.department_id AND u.role = 'student'
    LEFT JOIN student_tests st ON u.id = st.student_id
    LEFT JOIN tests t ON st.test_id = t.test_id AND t.added_by = ?
    GROUP BY d.id, d.short_name
    HAVING students > 0
    ORDER BY d.short_name
  `;
  
  db.query(sql, [facultyId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    res.json({ success: true, departmentData: results });
  });
};

exports.getBatchReport = (req, res) => {
  const facultyId = req.user?.id;
  
  if (!facultyId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  
  
  const sql = `
    SELECT 
      CASE 
        WHEN u.roll_no IS NOT NULL AND LENGTH(u.roll_no) >= 2 THEN 
          CONCAT(d.short_name, ' - ', 
            CASE 
              WHEN u.roll_no REGEXP '^[0-9]{2}' THEN CONCAT('20', LEFT(u.roll_no, 2))
              WHEN u.roll_no REGEXP '^[0-9]{4}' THEN LEFT(u.roll_no, 4)
              ELSE YEAR(u.created_at)
            END
          )
        ELSE CONCAT(d.short_name, ' - ', YEAR(COALESCE(u.created_at, NOW())))
      END as batch,
      COUNT(DISTINCT u.id) as students,
      COUNT(DISTINCT st.student_test_id) as testsAttended,
      ROUND(AVG(st.score), 2) as avgScore,
      ROUND((COUNT(CASE WHEN st.score >= 60 THEN 1 END) / COUNT(st.student_test_id)) * 100, 2) as passRate,
      ROUND((COUNT(DISTINCT st.student_id) / COUNT(DISTINCT u.id)) * 100, 2) as attendance
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN student_tests st ON u.id = st.student_id
    LEFT JOIN tests t ON st.test_id = t.test_id AND t.added_by = ?
    WHERE u.role = 'student'
    GROUP BY batch
    HAVING students > 0
    ORDER BY batch
  `;
  
  db.query(sql, [facultyId], (err, results) => {
    if (err) {
      console.error('Batch report error:', err);
      // Fallback: Simple department-based grouping
      const fallbackSql = `
        SELECT 
          COALESCE(d.short_name, 'Unknown Department') as batch,
          COUNT(DISTINCT u.id) as students,
          COUNT(DISTINCT st.student_test_id) as testsAttended,
          ROUND(AVG(st.score), 2) as avgScore,
          ROUND((COUNT(CASE WHEN st.score >= 60 THEN 1 END) / COUNT(st.student_test_id)) * 100, 2) as passRate,
          ROUND((COUNT(DISTINCT st.student_id) / COUNT(DISTINCT u.id)) * 100, 2) as attendance
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN student_tests st ON u.id = st.student_id
        LEFT JOIN tests t ON st.test_id = t.test_id AND t.added_by = ?
        WHERE u.role = 'student'
        GROUP BY d.id, d.short_name
        HAVING students > 0
        ORDER BY batch
      `;
      
      db.query(fallbackSql, [facultyId], (fallbackErr, fallbackResults) => {
        if (fallbackErr) {
          return res.status(500).json({ error: 'Database error', details: fallbackErr });
        }
        
        res.json({ 
          success: true, 
          batchData: fallbackResults,
          note: 'Grouped by department (no batch field available)'
        });
      });
    } else {
      res.json({ 
        success: true, 
        batchData: results,
        note: 'Grouped by department and inferred year'
      });
    }
  });
};

// 4. Question Analysis Report
exports.getQuestionAnalysis = (req, res) => {
  const { testId } = req.params;
  const facultyId = req.user?.id;
  
  if (!facultyId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  const sql = `
    SELECT 
      q.text as question,
      COUNT(CASE WHEN ta.selected_option = q.correct THEN 1 END) as correctAnswers,
      COUNT(ta.test_answer_id) as totalAnswers,
      ROUND(AVG(ta.time_spent), 2) as avgTimeSpent,
      CASE 
        WHEN (COUNT(CASE WHEN ta.selected_option = q.correct THEN 1 END) / COUNT(ta.test_answer_id)) > 0.8 THEN 'Easy'
        WHEN (COUNT(CASE WHEN ta.selected_option = q.correct THEN 1 END) / COUNT(ta.test_answer_id)) > 0.5 THEN 'Medium'
        ELSE 'Hard'
      END as difficulty,
      COUNT(CASE WHEN ta.selected_option = 'A' THEN 1 END) as optionA,
      COUNT(CASE WHEN ta.selected_option = 'B' THEN 1 END) as optionB,
      COUNT(CASE WHEN ta.selected_option = 'C' THEN 1 END) as optionC,
      COUNT(CASE WHEN ta.selected_option = 'D' THEN 1 END) as optionD
    FROM test_questions tq
    INNER JOIN questions q ON tq.question_id = q.question_id
    LEFT JOIN test_answers ta ON tq.test_question_id = ta.test_question_id
    INNER JOIN tests t ON tq.test_id = t.test_id
    WHERE tq.test_id = ? AND t.added_by = ?
    GROUP BY q.question_id, q.text
    ORDER BY q.question_id
  `;
  
  db.query(sql, [testId, facultyId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    const questionData = results.map(row => ({
      question: row.question,
      correctAnswers: row.correctAnswers,
      totalAnswers: row.totalAnswers,
      avgTimeSpent: row.avgTimeSpent || 0,
      difficulty: row.difficulty,
      optionDistribution: {
        A: row.optionA || 0,
        B: row.optionB || 0,
        C: row.optionC || 0,
        D: row.optionD || 0
      }
    }));
    
    res.json({ success: true, questionData });
  });
};

// 5. Test Progress Report (Live Tests)
exports.getLiveTests = (req, res) => {
  const facultyId = req.user?.id;
  
  if (!facultyId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  const sql = `
    SELECT 
      t.test_id as id,
      t.title,
      t.date as startTime,
      t.duration_minutes as duration,
      COUNT(DISTINCT st.student_id) as totalStudents,
      COUNT(CASE WHEN st.end_time IS NOT NULL THEN 1 END) as submitted,
      COUNT(CASE WHEN st.end_time IS NULL AND st.start_time IS NOT NULL THEN 1 END) as inProgress,
      COUNT(CASE WHEN st.start_time IS NULL THEN 1 END) as notStarted
    FROM tests t
    LEFT JOIN student_tests st ON t.test_id = st.test_id
    WHERE t.added_by = ? 
      AND t.is_active = 1 
      AND DATE(t.date) = CURDATE()
    GROUP BY t.test_id, t.title, t.date, t.duration_minutes
    ORDER BY t.date DESC
  `;
  
  db.query(sql, [facultyId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    // Get students currently taking each test
    const liveTestsPromises = results.map(test => {
      return new Promise((resolve, reject) => {
        const studentsSql = `
          SELECT 
            u.name,
            GREATEST(0, ${test.duration} - TIMESTAMPDIFF(MINUTE, st.start_time, NOW())) as timeLeft,
            CASE 
              WHEN st.end_time IS NOT NULL THEN 100
              ELSE ROUND((TIMESTAMPDIFF(MINUTE, st.start_time, NOW()) / ${test.duration}) * 100, 2)
            END as progress
          FROM student_tests st
          INNER JOIN users u ON st.student_id = u.id
          WHERE st.test_id = ? 
            AND st.end_time IS NULL 
            AND st.start_time IS NOT NULL
          GROUP BY st.student_test_id, u.name, st.start_time
          LIMIT 10
        `;
        
        db.query(studentsSql, [test.id], (err, students) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              ...test,
              studentsInProgress: students || []
            });
          }
        });
      });
    });
    
    Promise.all(liveTestsPromises)
      .then(liveTests => {
        res.json({ success: true, liveTests });
      })
      .catch(err => {
        res.status(500).json({ error: 'Database error', details: err });
      });
  });
};

// Dashboard Statistics
exports.getDashboardStats = (req, res) => {
  const facultyId = req.user?.id;
  
  if (!facultyId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  const sql = `
    SELECT 
      COUNT(DISTINCT t.test_id) as totalTests,
      COUNT(DISTINCT tr.user_id) as totalStudents,
      ROUND(AVG(tr.score), 2) as avgScore,
      COUNT(DISTINCT CASE WHEN t.is_active = 1 THEN t.test_id END) as activeTests
    FROM tests t
    LEFT JOIN test_results tr ON t.test_id = tr.test_id
    WHERE t.added_by = ?
  `;
  
  db.query(sql, [facultyId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    res.json({ success: true, stats: results[0] });
  });
};