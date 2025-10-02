

const db = require('../config/conn');
const bcrypt = require('bcryptjs');

exports.getStudents = (req, res) => {
	const sql = `
		SELECT u.id, u.name, u.roll_no, u.email, u.department_id, d.short_name AS department_name, u.year
		FROM users u
		LEFT JOIN departments d ON u.department_id = d.id
		WHERE u.role_id = 1
	`;
	db.query(sql, (err, results) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to fetch students', details: err });
		}
		res.json(results);
	});
};


exports.uploadStudents = async (req, res) => {
	try {
		const students = req.body.students; 
		if (!Array.isArray(students) || !students.length) {
			return res.status(400).json({ error: 'No students data provided.' });
		}

		const defaultRole = 1;
		const values = students.map(s => [ 
             s.name || '', 
            s.roll || s.roll_no || s.roll_number || '',
			s.email || '',
			s.department || '',
			s.year || '',  
			defaultRole
		]);

		const sql = 'INSERT INTO users (name, roll_no, email, department_id, year, role_id) VALUES ?';
		db.query(sql, [values], (err, result) => {
			if (err) {
				return res.status(500).json({ error: 'Database error', details: err });
			}
			res.json({ success: true, inserted: result.affectedRows });
		});
	} catch (error) {
		res.status(500).json({ error: 'Server error', details: error });
	}
};


exports.deleteStudent = (req, res) => {
	const studentId = req.params.id;
	if (!studentId) {
		return res.status(400).json({ error: 'Student ID required.' });
	}
	const sql = 'DELETE FROM users WHERE id = ? AND role_id = 1';
	db.query(sql, [studentId], (err, result) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to delete student', details: err });
		}
		if (result.affectedRows === 0) {
			return res.status(404).json({ error: 'Student not found or already deleted.' });
		}
		res.json({ success: true, deleted: result.affectedRows });
	});
};


exports.resetStudentPassword = (req, res) => {
	const studentId = req.params.id;
	if (!studentId) {
		return res.status(400).json({ error: 'Student ID required.' });
	}
	const defaultPassword = 'nscet123';
	bcrypt.hash(defaultPassword, 10, (err, hash) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to hash password', details: err });
		}
		const sql = 'UPDATE users SET password = ? WHERE id = ? AND role_id = 1';
		db.query(sql, [hash, studentId], (err, result) => {
			if (err) {
				return res.status(500).json({ error: 'Failed to reset password', details: err });
			}
			if (result.affectedRows === 0) {
				return res.status(404).json({ error: 'Student not found.' });
			}
			res.json({ success: true, message: 'Password reset successfully.' });
		});
	});
};

exports.updateStudent = (req, res) => {
	const studentId = req.params.id;
	const { roll_no, name, email, department_id, year } = req.body;
	if (!studentId) {
		return res.status(400).json({ error: 'Student ID required.' });
	}
	const fields = [];
	const values = [];
	if (roll_no !== undefined) { fields.push('roll_no = ?'); values.push(roll_no); }
	if (name !== undefined) { fields.push('name = ?'); values.push(name); }
	if (email !== undefined) { fields.push('email = ?'); values.push(email); }
	if (department_id !== undefined) { fields.push('department_id = ?'); values.push(department_id); }
	if (year !== undefined) { fields.push('year = ?'); values.push(year); }
	if (!fields.length) {
		return res.status(400).json({ error: 'No fields to update.' });
	}
	const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND role_id = 1`;
	values.push(studentId);
	db.query(sql, values, (err, result) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to update student', details: err });
		}
		if (result.affectedRows === 0) {
			return res.status(404).json({ error: 'Student not found.' });
		}
		res.json({ success: true, updated: result.affectedRows });
	});
};


exports.addStudent = async (req, res) => {
	try {
		const { name, roll_no, email, department_id, year } = req.body;
		if (!name || !roll_no || !email || !department_id || !year) {
			return res.status(400).json({ error: 'All fields are required.' });
		}
		const defaultRole = 1;
		const sql = 'INSERT INTO users (name, roll_no, email, department_id, year, role_id) VALUES (?, ?, ?, ?, ?, ?)';
		db.query(sql, [name, roll_no, email, department_id, year, defaultRole], (err, result) => {
			if (err) {
				return res.status(500).json({ error: 'Database error', details: err });
			}
			res.json({ success: true, insertedId: result.insertId });
		});
	} catch (error) {
		res.status(500).json({ error: 'Server error', details: error });
	}
};