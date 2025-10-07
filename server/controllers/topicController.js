const db = require('../config/conn');

exports.getTopicsWithSubTopics = (req, res) => {
  const userId = req.user?.id; 
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
  }

  const sql = `
    SELECT t.topic_id AS topic_id, t.title AS topic_title, t.description AS topic_desc,
           s.sub_topic_id AS sub_topic_id, s.title AS sub_title, s.description AS sub_desc,
           COUNT(q.question_id) AS question_count
    FROM topics t
    LEFT JOIN sub_topics s ON s.topic_id = t.topic_id
    LEFT JOIN questions q ON q.sub_topic_id = s.sub_topic_id
    WHERE t.by_admin = 1 OR t.added_by = ?
    GROUP BY t.topic_id, t.title, t.description, s.sub_topic_id, s.title, s.description
    ORDER BY t.created_at DESC, s.sub_topic_id ASC
  `;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch topics', details: err });
    }

    const topics = {};
    results.forEach(row => {
      const tid = row.topic_id;
      if (!topics[tid]) {
        topics[tid] = {
          id: row.topic_id,
          title: row.topic_title,
          description: row.topic_desc,
          subtopics: []
        };
      }
      if (row.sub_topic_id) {
        topics[tid].subtopics.push({
          id: row.sub_topic_id,
          title: row.sub_title,
          description: row.sub_desc,
          question_count: row.question_count || 0
        });
      }
    });

    const topicsArray = Object.values(topics);
    res.json({ success: true, topics: topicsArray });
  });
};

exports.getSubTopics = (req, res) => {
  const topicId = req.params.topicId;
  if (!topicId) {
    return res.status(400).json({ error: 'Topic ID required.' });
  }
  const sql = `
    SELECT st.sub_topic_id, st.title, st.description, st.topic_id, st.added_by, u.name AS added_by_name
    FROM sub_topics st
    LEFT JOIN users u ON st.added_by = u.id
    WHERE st.topic_id = ?
    ORDER BY st.sub_topic_id DESC
  `;
  db.query(sql, [topicId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch sub-topics', details: err });
    }
    res.json({ success: true, subTopics: results });
  });
};

// Create Topic
exports.createTopic = (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
  }

  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Topic title is required.' });
  }

  // Check if topic title already exists
  const checkSql = 'SELECT topic_id FROM topics WHERE title = ?';
  db.query(checkSql, [title.trim()], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: 'Topic with this title already exists.' });
    }

    // Create new topic with by_admin = 0 and added_by = userId
    const insertSql = 'INSERT INTO topics (title, description, added_by, by_admin) VALUES (?, ?, ?, 0)';
    db.query(insertSql, [title.trim(), description || null, userId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create topic', details: err });
      }
      res.json({ 
        success: true, 
        message: 'Topic created successfully',
        topicId: result.insertId 
      });
    });
  });
};

// Create Sub-topic
exports.createSubTopic = (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
  }

  const { topicId, title, description } = req.body;
  if (!topicId || !title || !title.trim()) {
    return res.status(400).json({ error: 'Topic ID and sub-topic title are required.' });
  }

  // Check if topic exists and user has access to it
  const checkTopicSql = 'SELECT added_by, by_admin FROM topics WHERE topic_id = ?';
  db.query(checkTopicSql, [topicId], (err, topicResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    if (topicResults.length === 0) {
      return res.status(404).json({ error: 'Topic not found.' });
    }

    const topic = topicResults[0];
    if (topic.by_admin !== 1 && topic.added_by !== userId) {
      return res.status(403).json({ error: 'You can only add sub-topics to topics you created or admin topics.' });
    }

    // Check if sub-topic title already exists in this topic
    const checkSubTopicSql = 'SELECT sub_topic_id FROM sub_topics WHERE topic_id = ? AND title = ?';
    db.query(checkSubTopicSql, [topicId, title.trim()], (err, subTopicResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err });
      }
      if (subTopicResults.length > 0) {
        return res.status(400).json({ error: 'Sub-topic with this title already exists in this topic.' });
      }

      // Create new sub-topic
      const insertSql = 'INSERT INTO sub_topics (topic_id, title, description, added_by) VALUES (?, ?, ?, ?)';
      db.query(insertSql, [topicId, title.trim(), description || null, userId], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to create sub-topic', details: err });
        }
        res.json({ 
          success: true, 
          message: 'Sub-topic created successfully',
          subTopicId: result.insertId 
        });
      });
    });
  });
};
