// Controller to handle uploading students with default role
const db = require('../config/conn');

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
