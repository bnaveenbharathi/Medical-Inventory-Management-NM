// MySQL connection
const db = require('../config/conn');

// GET /departments
exports.getDepartments = (req, res) => {
	const sql = 'SELECT id, short_name, full_name FROM departments ';
	db.query(sql, (err, results) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to fetch departments' });
		}
		res.json(results);
	});
};
