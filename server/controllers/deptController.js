
const db = require('../config/conn');

exports.getDepartments = (req, res) => {
	const sql = `
		SELECT d.id, d.short_name, d.full_name, d.hod_id,
			(SELECT name FROM users WHERE id = d.hod_id) AS hod_name,
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

exports.addDepartment = (req, res) => {
	const { short_name, full_name, hod_id } = req.body;
	if (!short_name || !full_name) {
		return res.status(400).json({ error: 'Department code and name required' });
	}
	const sql = 'INSERT INTO departments (short_name, full_name, hod_id) VALUES (?, ?, ?)';
	db.query(sql, [short_name, full_name, hod_id || null], (err, result) => {
		if (err) {
			console.error('Add department SQL error:', err);
			return res.status(500).json({ error: 'Failed to add department', details: err.sqlMessage || err.message });
		}
		res.json({ success: true, insertedId: result.insertId });
	});
};

// Delete Department
exports.deleteDepartment = (req, res) => {
	const { id } = req.params;
	if (!id) {
		return res.status(400).json({ error: 'Department ID required' });
	}
	const sql = 'DELETE FROM departments WHERE id = ?';
	db.query(sql, [id], (err, result) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to delete department' });
		}
		res.json({ success: true });
	});
};


exports.updateDepartment = (req, res) => {
	const { id } = req.params;
	const { short_name, full_name, hod_id } = req.body;
	if (!id || !short_name || !full_name) {
		return res.status(400).json({ error: 'Department ID, code, and name required' });
	}
	const sql = 'UPDATE departments SET short_name = ?, full_name = ?, hod_id = ? WHERE id = ?';
	db.query(sql, [short_name, full_name, hod_id || null, id], (err, result) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to update department' });
		}
		res.json({ success: true });
	});
};