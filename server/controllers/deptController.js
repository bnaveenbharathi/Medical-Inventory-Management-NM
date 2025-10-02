const db = require('../config/conn');

exports.getDepartments = (req, res) => {
	const sql = `
		SELECT d.id, d.short_name, d.full_name,
			(SELECT COUNT(*) FROM users WHERE department_id = d.id AND role_id = 1) AS student_count,
			(SELECT COUNT(*) FROM users WHERE department_id = d.id AND role_id IN (2,3)) AS faculty_count
		FROM departments d
	`;
	db.query(sql, (err, results) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to fetch departments' });
		}
		res.json(results);
	});
};
