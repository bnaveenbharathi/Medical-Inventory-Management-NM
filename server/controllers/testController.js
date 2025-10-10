const db = require('../config/conn');

// Get all tests created by the authenticated user
exports.getTestsByUser = (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  const sql = `
    SELECT t.test_id, t.title, t.description, t.subject, t.added_by, t.topic_id, t.sub_topic_id, 
           t.num_questions, t.department_id, t.year, t.date, t.time_slot, t.duration_minutes, 
           t.created_at, t.is_active,
           tp.title as topic_title,
           st.title as sub_topic_title,
           d.full_name as department_name,
           d.short_name as dept_short_name
    FROM tests t
    LEFT JOIN topics tp ON t.topic_id = tp.topic_id
    LEFT JOIN sub_topics st ON t.sub_topic_id = st.sub_topic_id
    LEFT JOIN departments d ON t.department_id = d.id
    WHERE t.added_by = ?
    ORDER BY t.created_at DESC
  `;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    const formattedResults = results.map(row => ({
      test_id: row.test_id,
      title: row.title,
      description: row.description,
      subject: row.subject,
      added_by: row.added_by,
      topic_id: row.topic_id,
      topic_title: row.topic_title,
      sub_topic_id: row.sub_topic_id,
      sub_topic_title: row.sub_topic_title,
      num_questions: row.num_questions,
      department_id: row.department_id,
      department_name: row.department_name,
      dept_short_name: row.dept_short_name,
      year: row.year,
      date: row.date,
      time_slot: row.time_slot,
      duration_minutes: row.duration_minutes,
      created_at: row.created_at,
      is_active: row.is_active
    }));
    
    res.json({ success: true, tests: formattedResults });
  });
};

// Get a specific test by ID (only if created by the authenticated user)
exports.getTestById = (req, res) => {
  const { test_id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }
  
  if (!test_id) {
    return res.status(400).json({ error: 'Test ID required' });
  }

  const sql = `
    SELECT t.test_id, t.title, t.description, t.subject, t.added_by, t.topic_id, t.sub_topic_id, 
           t.num_questions, t.department_id, t.year, t.date, t.time_slot, t.duration_minutes, 
           t.created_at, t.is_active,
           tp.title as topic_title,
           st.title as sub_topic_title
    FROM tests t
    LEFT JOIN topics tp ON t.topic_id = tp.topic_id
    LEFT JOIN sub_topics st ON t.sub_topic_id = st.sub_topic_id
    WHERE t.test_id = ? AND t.added_by = ?
  `;
  
  db.query(sql, [test_id, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Test not found or access denied' });
    }
    
    const test = results[0];
    const formattedResult = {
      test_id: test.test_id,
      title: test.title,
      description: test.description,
      subject: test.subject,
      added_by: test.added_by,
      topic_id: test.topic_id,
      topic_title: test.topic_title,
      sub_topic_id: test.sub_topic_id,
      sub_topic_title: test.sub_topic_title,
      num_questions: test.num_questions,
      department_id: test.department_id,
      year: test.year,
      date: test.date,
      time_slot: test.time_slot,
      duration_minutes: test.duration_minutes,
      created_at: test.created_at,
      is_active: test.is_active
    };
    
    res.json({ success: true, test: formattedResult });
  });
};

// Create a new test
exports.createTest = (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  const {
    title, description, subject, topic_id, sub_topic_id, num_questions,
    department_id, year, date, time_slot, duration_minutes, is_active
  } = req.body;

  if (!title || !subject || !num_questions || !duration_minutes) {
    return res.status(400).json({ 
      error: 'Required fields: title, subject, num_questions, duration_minutes' 
    });
  }

  const sql = `
    INSERT INTO tests (title, description, subject, added_by, topic_id, sub_topic_id, 
                      num_questions, department_id, year, date, time_slot, duration_minutes, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    title, description, subject, userId, topic_id, sub_topic_id,
    num_questions, department_id, year, date, time_slot, duration_minutes,
    is_active !== undefined ? is_active : 1
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    res.json({ 
      success: true, 
      message: 'Test created successfully',
      test_id: result.insertId 
    });
  });
};

// Update an existing test
exports.updateTest = (req, res) => {
  const { test_id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }
  
  if (!test_id) {
    return res.status(400).json({ error: 'Test ID required' });
  }

  const {
    title, description, subject, topic_id, sub_topic_id, num_questions,
    department_id, year, date, time_slot, duration_minutes, is_active
  } = req.body;

  // First, verify the test exists and belongs to the user
  const checkSql = 'SELECT test_id FROM tests WHERE test_id = ? AND added_by = ?';
  
  db.query(checkSql, [test_id, userId], (err, checkResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    if (checkResults.length === 0) {
      return res.status(404).json({ error: 'Test not found or access denied' });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (subject !== undefined) {
      updateFields.push('subject = ?');
      updateValues.push(subject);
    }
    if (topic_id !== undefined) {
      updateFields.push('topic_id = ?');
      updateValues.push(topic_id);
    }
    if (sub_topic_id !== undefined) {
      updateFields.push('sub_topic_id = ?');
      updateValues.push(sub_topic_id);
    }
    if (num_questions !== undefined) {
      updateFields.push('num_questions = ?');
      updateValues.push(num_questions);
    }
    if (department_id !== undefined) {
      updateFields.push('department_id = ?');
      updateValues.push(department_id);
    }
    if (year !== undefined) {
      updateFields.push('year = ?');
      updateValues.push(year);
    }
    if (date !== undefined) {
      updateFields.push('date = ?');
      updateValues.push(date);
    }
    if (time_slot !== undefined) {
      updateFields.push('time_slot = ?');
      updateValues.push(time_slot);
    }
    if (duration_minutes !== undefined) {
      updateFields.push('duration_minutes = ?');
      updateValues.push(duration_minutes);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(test_id, userId);

    const updateSql = `
      UPDATE tests 
      SET ${updateFields.join(', ')} 
      WHERE test_id = ? AND added_by = ?
    `;

    db.query(updateSql, updateValues, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Test not found or no changes made' });
      }
      
      res.json({ 
        success: true, 
        message: 'Test updated successfully' 
      });
    });
  });
};

// Delete a test
exports.deleteTest = (req, res) => {
  const { test_id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }
  
  if (!test_id) {
    return res.status(400).json({ error: 'Test ID required' });
  }

  const sql = 'DELETE FROM tests WHERE test_id = ? AND added_by = ?';
  
  db.query(sql, [test_id, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Test not found or access denied' });
    }
    
    res.json({ 
      success: true, 
      message: 'Test deleted successfully' 
    });
  });
};

// Toggle test active status
exports.toggleTestStatus = (req, res) => {
  const { test_id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }
  
  if (!test_id) {
    return res.status(400).json({ error: 'Test ID required' });
  }

  const sql = `
    UPDATE tests 
    SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END 
    WHERE test_id = ? AND added_by = ?
  `;
  
  db.query(sql, [test_id, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Test not found or access denied' });
    }
    
    res.json({ 
      success: true, 
      message: 'Test status updated successfully' 
    });
  });
};

// Assign questions to test
exports.assignQuestionsToTest = async (req, res) => {
  const { test_id } = req.params;
  const { sub_topic_id, num_questions } = req.body;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }
  
  try {
    if (!test_id || !sub_topic_id || !num_questions) {
      return res.status(400).json({ error: 'Missing required fields: test_id, sub_topic_id, num_questions' });
    }

    // Verify test belongs to user
    const checkTestSql = 'SELECT test_id FROM tests WHERE test_id = ? AND added_by = ?';
    const testResult = await new Promise((resolve, reject) => {
      db.query(checkTestSql, [test_id, userId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (testResult.length === 0) {
      return res.status(404).json({ error: 'Test not found or access denied' });
    }

    // Get all available questions for the subtopic
    const getQuestionsQuery = `
      SELECT question_id FROM questions 
      WHERE sub_topic_id = ? 
      ORDER BY RAND() 
      LIMIT ?
    `;
    
    const questions = await new Promise((resolve, reject) => {
      db.query(getQuestionsQuery, [sub_topic_id, num_questions], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    if (questions.length < num_questions) {
      return res.status(400).json({ 
        error: `Only ${questions.length} questions available, but ${num_questions} requested` 
      });
    }

    // Delete existing test questions if any
    const deleteQuery = 'DELETE FROM test_questions WHERE test_id = ?';
    await new Promise((resolve, reject) => {
      db.query(deleteQuery, [test_id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Insert new test questions
    const insertPromises = questions.map(question => {
      return new Promise((resolve, reject) => {
        const insertQuery = 'INSERT INTO test_questions (test_id, question_id) VALUES (?, ?)';
        db.query(insertQuery, [test_id, question.question_id], (insertErr, result) => {
          if (insertErr) reject(insertErr);
          else resolve(result);
        });
      });
    });

    await Promise.all(insertPromises);
    
    res.json({ 
      success: true, 
      message: `Successfully assigned ${questions.length} questions to test`,
      assigned_count: questions.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Get test questions
exports.getTestQuestions = (req, res) => {
  const { test_id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }
  
  // First verify test belongs to user
  const checkTestSql = 'SELECT test_id FROM tests WHERE test_id = ? AND added_by = ?';
  
  db.query(checkTestSql, [test_id, userId], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({ error: 'Database error', details: checkErr });
    }
    
    if (checkResults.length === 0) {
      return res.status(404).json({ error: 'Test not found or access denied' });
    }
    
    const query = `
      SELECT tq.test_question_id, tq.test_id, tq.question_id, tq.created_at,
             q.question_text as text, q.option_a as a, q.option_b as b, 
             q.option_c as c, q.option_d as d, q.correct_option as correct, 
             q.mark as marks,
             st.title as sub_topic_title,
             t.title as topic_title
      FROM test_questions tq
      JOIN questions q ON tq.question_id = q.question_id
      LEFT JOIN sub_topics st ON q.sub_topic_id = st.sub_topic_id
      LEFT JOIN topics t ON st.topic_id = t.topic_id
      WHERE tq.test_id = ?
      ORDER BY tq.created_at ASC
    `;
    
    db.query(query, [test_id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err });
      }
      
      const formattedResults = results.map(row => ({
        test_question_id: row.test_question_id,
        test_id: row.test_id,
        question_id: row.question_id,
        text: row.text,
        a: row.a,
        b: row.b,
        c: row.c,
        d: row.d,
        correct: row.correct,
        marks: row.marks || 1,
        sub_topic_title: row.sub_topic_title,
        topic_title: row.topic_title,
        created_at: row.created_at
      }));
      
      res.json({ 
        success: true, 
        questions: formattedResults,
        total_questions: formattedResults.length
      });
    });
  });
};

// Get test questions count
exports.getTestQuestionsCount = (req, res) => {
  const { test_id } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }
  
  // First verify test belongs to user
  const checkTestSql = 'SELECT test_id FROM tests WHERE test_id = ? AND added_by = ?';
  
  db.query(checkTestSql, [test_id, userId], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({ error: 'Database error', details: checkErr });
    }
    
    if (checkResults.length === 0) {
      return res.status(404).json({ error: 'Test not found or access denied' });
    }
    
    const query = 'SELECT COUNT(*) as question_count FROM test_questions WHERE test_id = ?';
    
    db.query(query, [test_id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err });
      }
      
      res.json({ 
        success: true, 
        question_count: results[0].question_count 
      });
    });
  });
};

// Get preview questions for test creation
exports.getPreviewQuestions = (req, res) => {
  const { sub_topic_id } = req.params;
  const { num_questions } = req.query;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }
  
  if (!sub_topic_id) {
    return res.status(400).json({ error: 'Sub topic ID is required' });
  }
  
  const limit = num_questions ? parseInt(num_questions) : 10;
  
  const query = `
    SELECT q.question_id, q.question_text as text, q.option_a as a, q.option_b as b, 
           q.option_c as c, q.option_d as d, q.correct_option as correct, 
           q.mark as marks,
           st.title as sub_topic_title,
           t.title as topic_title
    FROM questions q
    LEFT JOIN sub_topics st ON q.sub_topic_id = st.sub_topic_id
    LEFT JOIN topics t ON st.topic_id = t.topic_id
    WHERE q.sub_topic_id = ?
    ORDER BY RAND()
    LIMIT ?
  `;
  
  db.query(query, [sub_topic_id, limit], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    const formattedResults = results.map(row => ({
      question_id: row.question_id,
      text: row.text,
      a: row.a,
      b: row.b,
      c: row.c,
      d: row.d,
      correct: row.correct,
      marks: row.marks || 1,
      sub_topic_title: row.sub_topic_title,
      topic_title: row.topic_title
    }));
    
    res.json({ 
      success: true, 
      questions: formattedResults,
      total_questions: formattedResults.length
    });
  });
};

// Get random questions for preview
exports.getPreviewQuestions = (req, res) => {
  const { sub_topic_id } = req.params;
  const { num_questions } = req.query;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }
  
  if (!sub_topic_id || !num_questions) {
    return res.status(400).json({ error: 'Subtopic ID and number of questions are required' });
  }
  
  const query = `
    SELECT q.question_id, q.question_text as text, q.option_a as a, q.option_b as b, 
           q.option_c as c, q.option_d as d, q.correct_option as correct, 
           q.mark as marks,
           st.title as sub_topic_title,
           t.title as topic_title
    FROM questions q
    LEFT JOIN sub_topics st ON q.sub_topic_id = st.sub_topic_id
    LEFT JOIN topics t ON st.topic_id = t.topic_id
    WHERE q.sub_topic_id = ?
    ORDER BY RAND()
    LIMIT ?
  `;
  
  db.query(query, [sub_topic_id, parseInt(num_questions)], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    const formattedResults = results.map(row => ({
      question_id: row.question_id,
      text: row.text,
      a: row.a,
      b: row.b,
      c: row.c,
      d: row.d,
      correct: row.correct,
      marks: row.marks || 1,
      sub_topic_title: row.sub_topic_title,
      topic_title: row.topic_title
    }));
    
    res.json({ 
      success: true, 
      questions: formattedResults,
      total_questions: formattedResults.length
    });
  });
};
