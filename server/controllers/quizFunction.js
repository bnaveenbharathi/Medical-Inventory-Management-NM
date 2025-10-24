
const db = require('../config/conn');

exports.getQuizQuestions = (req, res) => {
  const { testId } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  if (!testId) {
    return res.status(400).json({ error: 'Test ID is required' });
  }

  const testQuery = `
    SELECT t.test_id, t.title, t.description, t.subject, t.num_questions, 
           t.duration_minutes, t.is_active, t.department_id, t.year, t.topic_id, t.sub_topic_id,
           u.year as student_year, u.department_id as student_dept_id
    FROM tests t
    JOIN users u ON u.id = ?
    WHERE t.test_id = ? AND t.is_active = 1 
    AND t.department_id = u.department_id AND t.year = u.year
  `;

  db.query(testQuery, [userId, testId], (err, testResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }

    if (testResults.length === 0) {
      return res.status(404).json({ error: 'Test not found or not accessible' });
    }

    const test = testResults[0];

    const questionsQuery = `
      SELECT q.question_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.mark,
             st.title as sub_topic_title, tp.title as topic_title
      FROM questions q
      LEFT JOIN sub_topics st ON q.sub_topic_id = st.sub_topic_id
      LEFT JOIN topics tp ON st.topic_id = tp.topic_id
      WHERE q.sub_topic_id = ?
      ORDER BY RAND()
      LIMIT ?
    `;

    db.query(questionsQuery, [test.sub_topic_id, test.num_questions], (err, questionResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error while fetching questions', details: err });
      }

      const formattedQuestions = questionResults.map(row => ({
        question_id: row.question_id,
        text: row.question_text,
        options: [row.option_a, row.option_b, row.option_c, row.option_d],
        marks: row.mark || 1,
        sub_topic_title: row.sub_topic_title,
        topic_title: row.topic_title
      }));

      res.json({
        success: true,
        test: {
          test_id: test.test_id,
          title: test.title,
          description: test.description,
          subject: test.subject,
          duration_minutes: test.duration_minutes,
          total_questions: test.num_questions
        },
        questions: formattedQuestions,
        total_questions: formattedQuestions.length
      });
    });
  });
};

exports.startTest = (req, res) => {
  const { testId } = req.params;
  const userId = req.user?.id;
  
  console.log('Start test called with:', { testId, userId });
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  const checkQuery = `
    SELECT student_test_id, status FROM student_tests 
    WHERE student_id = ? AND test_id = ?
  `;

  db.query(checkQuery, [userId, testId], (err, existingResults) => {
    if (err) {
      console.error('Check existing session error:', err);
      return res.status(500).json({ error: 'Database error', details: err });
    }

    console.log('Existing sessions found:', existingResults);

    if (existingResults.length > 0) {
      const existingSession = existingResults[0];
      console.log('Found existing session:', existingSession);
      
      // If already completed, return special response
      if (existingSession.status === 'completed') {
        return res.status(200).json({ 
          success: false,
          already_completed: true,
          message: 'This test has already been completed. You cannot retake this test.',
          title: 'Test Already Completed'
        });
      }
      
      return res.json({ 
        success: true, 
        message: 'Test session already exists',
        student_test_id: existingSession.student_test_id 
      });
    }

    // Create new test session
    const insertQuery = `
      INSERT INTO student_tests (student_id, test_id, start_time, status)
      VALUES (?, ?, NOW(), 'in_progress')
    `;

    console.log('Creating new test session with:', { userId, testId });

    db.query(insertQuery, [userId, testId], (err, result) => {
      if (err) {
        console.error('Insert test session error:', err);
        return res.status(500).json({ error: 'Failed to start test session', details: err });
      }

      console.log('Test session created successfully:', result.insertId);

      res.json({
        success: true,
        student_test_id: result.insertId,
        message: 'Test session started successfully'
      });
    });
  });
};

// Save student answer
exports.saveAnswer = (req, res) => {
  const { student_test_id, question_id, answer } = req.body;
  const userId = req.user?.id;

  console.log('Save answer called with:', { student_test_id, question_id, answer, userId });

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  // Verify the test session belongs to this user
  const verifyQuery = `
    SELECT st.student_test_id FROM student_tests st 
    WHERE st.student_test_id = ? AND st.student_id = ? AND st.status = 'in_progress'
  `;

  db.query(verifyQuery, [student_test_id, userId], (err, verifyResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }

    if (verifyResults.length === 0) {
      return res.status(403).json({ error: 'Invalid test session' });
    }

    // Get correct answer for the question
    const correctAnswerQuery = `SELECT correct_option FROM questions WHERE question_id = ?`;

    db.query(correctAnswerQuery, [question_id], (err, correctResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err });
      }

      const isCorrect = correctResults.length > 0 && correctResults[0].correct_option === answer;

      // Check if answer already exists, update or insert
      const checkAnswerQuery = `
        SELECT student_answers_id FROM student_answers 
        WHERE student_test_id = ? AND question_id = ?
      `;

      db.query(checkAnswerQuery, [student_test_id, question_id], (err, existingAnswer) => {
        if (err) {
          return res.status(500).json({ error: 'Database error', details: err });
        }

        let query, params;
        if (existingAnswer.length > 0) {
          // Update existing answer
          query = `
            UPDATE student_answers 
            SET answer = ?, is_correct = ?, marked_at = NOW() 
            WHERE student_test_id = ? AND question_id = ?
          `;
          params = [answer, isCorrect ? 1 : 0, student_test_id, question_id];
        } else {
          // Insert new answer
          query = `
            INSERT INTO student_answers (student_test_id, question_id, answer, is_correct, marked_at)
            VALUES (?, ?, ?, ?, NOW())
          `;
          params = [student_test_id, question_id, answer, isCorrect ? 1 : 0];
        }

        db.query(query, params, (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to save answer', details: err });
          }

          res.json({
            success: true,
            message: 'Answer saved successfully',
            is_correct: isCorrect
          });
        });
      });
    });
  });
};

// Submit test and calculate final score
exports.submitTest = (req, res) => {
  const { student_test_id } = req.body;
  const userId = req.user?.id;

  console.log('Submit test called with:', { student_test_id, userId });

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  if (!student_test_id) {
    return res.status(400).json({ error: 'Student test ID is required' });
  }

  // First, let's check what exists in the database
  const debugQuery = `
    SELECT st.student_test_id, st.student_id, st.test_id, st.status, st.start_time 
    FROM student_tests st 
    WHERE st.student_test_id = ?
  `;

  db.query(debugQuery, [student_test_id], (err, debugResults) => {
    if (err) {
      console.error('Debug query error:', err);
      return res.status(500).json({ error: 'Database error', details: err });
    }

    console.log('Debug query results:', debugResults);

    if (debugResults.length === 0) {
      return res.status(404).json({ error: 'Test session not found' });
    }

    const testSession = debugResults[0];
    console.log('Found test session:', testSession);

    // Check if the session belongs to the current user
    if (testSession.student_id !== userId) {
      return res.status(403).json({ error: 'Test session belongs to different user' });
    }

    // Check if status is correct (it might be different from 'in_progress')
    if (testSession.status !== 'in_progress') {
      console.log('Status mismatch. Expected: in_progress, Found:', testSession.status);
      // Let's be more lenient and allow any non-completed status
      if (testSession.status === 'completed') {
        return res.status(400).json({ error: 'Test already completed' });
      }
    }

    // Proceed with score calculation
    calculateAndSaveScore(student_test_id, res);
  });
};

function calculateAndSaveScore(student_test_id, res) {
  // Calculate score
  const scoreQuery = `
    SELECT 
      COUNT(*) as total_questions,
      SUM(CASE WHEN sa.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
      (SUM(CASE WHEN sa.is_correct = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as score_percentage
    FROM student_answers sa
    WHERE sa.student_test_id = ?
  `;

  console.log('Calculating score for student_test_id:', student_test_id);

  db.query(scoreQuery, [student_test_id], (err, scoreResults) => {
    if (err) {
      console.error('Score calculation error:', err);
      return res.status(500).json({ error: 'Database error while calculating score', details: err });
    }

    console.log('Score calculation results:', scoreResults);

    // Handle case where no answers were submitted
    const totalQuestions = scoreResults[0]?.total_questions || 0;
    const correctAnswers = scoreResults[0]?.correct_answers || 0;
    const score = scoreResults[0]?.score_percentage || 0;

    console.log('Final score data:', { totalQuestions, correctAnswers, score });

    // Update test session with end time and score
    const updateQuery = `
      UPDATE student_tests 
      SET end_time = NOW(), score = ?, status = 'completed'
      WHERE student_test_id = ?
    `;

    db.query(updateQuery, [score, student_test_id], (err, result) => {
      if (err) {
        console.error('Update test session error:', err);
        return res.status(500).json({ error: 'Failed to submit test', details: err });
      }

      console.log('Test session updated successfully');

      res.json({
        success: true,
        message: 'Test submitted successfully',
        results: {
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          score: Math.round(score)
        }
      });
    });
  });
}