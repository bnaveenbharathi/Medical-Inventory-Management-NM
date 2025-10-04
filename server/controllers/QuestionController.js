const db = require('../config/conn');

exports.getTopics = (req, res) => {
	const sql = `
		SELECT t.topic_id, t.title, t.description, t.added_by, t.by_admin, t.created_at, t.updated_at,
					 u.id as user_id, u.name as user_name, u.email as user_email
		FROM topics t
		LEFT JOIN users u ON t.added_by = u.id
		WHERE 1
	`;
	db.query(sql, (err, results) => {
		if (err) return res.status(500).json({ error: 'Database error', details: err });
		res.json({ success: true, topics: results });
	});
};


exports.getSubTopics = (req, res) => {
	const sql = `
		SELECT s.sub_topic_id, s.topic_id, s.title, s.description, s.added_by, s.by_admin, s.created_at, s.updated_at,
					 u.id as user_id, u.name as user_name, u.email as user_email,
					 COUNT(q.question_id) as question_count
		FROM sub_topics s
		LEFT JOIN users u ON s.added_by = u.id
		LEFT JOIN questions q ON q.sub_topic_id = s.sub_topic_id
		GROUP BY s.sub_topic_id, s.topic_id, s.title, s.description, s.added_by, s.by_admin, s.created_at, s.updated_at, u.id, u.name, u.email
		ORDER BY s.created_at DESC
	`;
	db.query(sql, (err, results) => {
		if (err) return res.status(500).json({ error: 'Database error', details: err });
		res.json({ success: true, sub_topics: results });
	});
};

exports.getSubTopicsWithQuestions = (req, res) => {
	const sql = `
		SELECT s.sub_topic_id, s.topic_id, s.title AS sub_topic_title, s.description AS sub_topic_description, s.added_by, s.by_admin, s.created_at, s.updated_at,
					 u.id as user_id, u.name as user_name, u.email as user_email,
					 q.question_id, q.question_text AS question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option
		FROM sub_topics s
		LEFT JOIN users u ON s.added_by = u.id
		LEFT JOIN questions q ON q.sub_topic_id = s.sub_topic_id
		WHERE 1
		ORDER BY s.sub_topic_id, q.question_id
	`;
	db.query(sql, (err, results) => {
		if (err) return res.status(500).json({ error: 'Database error', details: err });
		const subTopicsMap = {};
		results.forEach(row => {
			if (!subTopicsMap[row.sub_topic_id]) {
				subTopicsMap[row.sub_topic_id] = {
					sub_topic_id: row.sub_topic_id,
					topic_id: row.topic_id,
					title: row.sub_topic_title,
					description: row.sub_topic_description,
					added_by: row.added_by,
					by_admin: row.by_admin,
					created_at: row.created_at,
					updated_at: row.updated_at,
					user_id: row.user_id,
					user_name: row.user_name,
					user_email: row.user_email,
					questions: []
				};
			}
			if (row.question_id) {
				subTopicsMap[row.sub_topic_id].questions.push({
					question_id: row.question_id,
					text: row.question_text,
					a: row.option_a,
					b: row.option_b,
					c: row.option_c,
					d: row.option_d,
					correct: row.correct_option,
				
				});
			}
		});
		res.json({ success: true, sub_topics: Object.values(subTopicsMap) });
	});
};

exports.updateQuestion = (req, res) => {
	const { question_id } = req.params;
	const { text, a, b, c, d, correct } = req.body;
	if (!question_id || !text || !a || !b || !c || !d || !correct) {
		return res.status(400).json({ error: 'Missing required fields' });
	}
	const sql = `UPDATE questions SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_option = ? WHERE question_id = ?`;
	db.query(sql, [text, a, b, c, d, correct, question_id], (err, result) => {
		if (err) return res.status(500).json({ error: 'Database error', details: err });
		if (result.affectedRows === 0) return res.status(404).json({ error: 'Question not found' });
		res.json({ success: true });
	});
};

exports.getQuestionsByTopicAndStaff = (req, res) => {
	const { topic_id } = req.params;
	const userId = req.user?.id;
	
	if (!topic_id) {
		return res.status(400).json({ error: 'Topic ID required' });
	}
	if (!userId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token' });
	}

	const sql = `
		SELECT q.question_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option,
					 q.sub_topic_id, q.added_by, q.created_at, q.updated_at,
					 s.title AS sub_topic_title, s.topic_id,
					 t.title AS topic_title
		FROM questions q
		JOIN sub_topics s ON q.sub_topic_id = s.sub_topic_id
		JOIN topics t ON s.topic_id = t.topic_id
		WHERE t.topic_id = ? AND q.added_by = ?
		ORDER BY q.created_at DESC
	`;
	
	db.query(sql, [topic_id, userId], (err, results) => {
		if (err) return res.status(500).json({ error: 'Database error', details: err });
		
		const formattedResults = results.map(row => ({
			question_id: row.question_id,
			text: row.question_text,
			a: row.option_a,
			b: row.option_b,
			c: row.option_c,
			d: row.option_d,
			correct: row.correct_option,
			sub_topic_id: row.sub_topic_id,
			sub_topic_title: row.sub_topic_title,
			topic_id: row.topic_id,
			topic_title: row.topic_title,
			added_by: row.added_by,
			created_at: row.created_at,
			updated_at: row.updated_at
		}));
		
		res.json({ success: true, questions: formattedResults });
	});
};


exports.getQuestionsBySubTopicAndStaff = (req, res) => {
	const { sub_topic_id } = req.params;
	const userId = req.user_id;
	
	if (!sub_topic_id) {
		return res.status(400).json({ error: 'Sub Topic ID required' });
	}
	if (!userId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token' });
	}

	const sql = `
		SELECT q.question_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option,
					 q.sub_topic_id, q.created_at, q.updated_at
		FROM questions q
		WHERE q.sub_topic_id = ? AND q.added_by = ?
		ORDER BY q.created_at DESC
	`;
	
	db.query(sql, [sub_topic_id, userId], (err, results) => {
		if (err) return res.status(500).json({ error: 'Database error', details: err });
		
		const formattedResults = results.map(row => ({
			question_id: row.question_id,
			text: row.question_text,
			a: row.option_a,
			b: row.option_b,
			c: row.option_c,
			d: row.option_d,
			correct: row.correct_option,
			sub_topic_id: row.sub_topic_id,
			created_at: row.created_at,
			updated_at: row.updated_at
		}));
		
		res.json({ success: true, questions: formattedResults });
	});
};

exports.getQuestionsBySubTopic = (req, res) => {
	const { sub_topic_id } = req.params;
	const userId = req.user?.id;
	
	if (!sub_topic_id) {
		return res.status(400).json({ error: 'Sub Topic ID required' });
	}
	if (!userId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token' });
	}

	const sql = `
		SELECT q.question_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option,
					 q.sub_topic_id, q.created_at, q.mark as marks
		FROM questions q
		WHERE q.sub_topic_id = ?
		ORDER BY q.created_at DESC 
	`;
	
	db.query(sql, [sub_topic_id], (err, results) => {
		if (err) return res.status(500).json({ error: 'Database error', details: err });
		
		const formattedResults = results.map(row => ({
			question_id: row.question_id,
			text: row.question_text,
			a: row.option_a,
			b: row.option_b,
			c: row.option_c,
			d: row.option_d,
			correct: row.correct_option,
			sub_topic_id: row.sub_topic_id,
			marks: row.marks || 1,
			created_at: row.created_at,
			updated_at: row.updated_at
		}));
		
		res.json({ success: true, questions: formattedResults });
	});
};


exports.addQuestion = (req, res) => {
	const { sub_topic_id, text, a, b, c, d, correct, user_id, marks } = req.body;
	const userId = user_id || req.user?.id; 
	const questionMarks = marks || 1; 
	
	if (!sub_topic_id || !text || !a || !b || !c || !d || !correct) {
		return res.status(400).json({ error: 'All fields are required: sub_topic_id, text, a, b, c, d, correct' });
	}
	if (!userId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token' });
	}

	const sql = `
		INSERT INTO questions (sub_topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, created_by, by_admin, mark)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`;
	
	db.query(sql, [sub_topic_id, text, a, b, c, d, correct, userId, 0, questionMarks], (err, result) => {
		if (err) return res.status(500).json({ error: 'Database error', details: err });
		
		res.json({ 
			success: true, 
			message: 'Question added successfully',
			question_id: result.insertId 
		});
	});
};

