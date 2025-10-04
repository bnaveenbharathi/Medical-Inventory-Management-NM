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
