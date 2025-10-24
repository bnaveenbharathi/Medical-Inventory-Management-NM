
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

// facutly controller
exports.getFaculty = (req, res) => {
	const sql = `
		SELECT u.id, u.name, u.roll_no, u.email, u.department_id, d.short_name AS department_name
		FROM users u
		LEFT JOIN departments d ON u.department_id = d.id
		WHERE u.role_id = 2
	`;
	db.query(sql, (err, results) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to fetch students', details: err });
		}
		res.json(results);
	});
};


exports.resetFacultyPassword = (req, res) => {
	const staffId = req.params.id;
	if (!staffId) {
		return res.status(400).json({ error: 'Staff ID required.' });
	}
	const defaultPassword = 'nscet123';
	bcrypt.hash(defaultPassword, 10, (err, hash) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to hash password', details: err });
		}
		const sql = 'UPDATE users SET password = ? WHERE id = ? AND role_id = 2';
		db.query(sql, [hash, staffId], (err, result) => {
			if (err) {
				return res.status(500).json({ error: 'Failed to reset password', details: err });
			}
			if (result.affectedRows === 0) {
				return res.status(404).json({ error: 'Staff not found.' });
			}
			res.json({ success: true, message: 'Password reset successfully.' });
		});
	});
};



exports.addStaff = async (req, res) => {
	try {
		const { name, roll_no, email, department_id} = req.body;
		if (!name || !roll_no || !email || !department_id ) {
			return res.status(400).json({ error: 'All fields are required.' });
		}
		const defaultRole = 2;
		const sql = 'INSERT INTO users (name, roll_no, email, department_id, role_id) VALUES (?, ?, ?, ?, ?)';
		db.query(sql, [name, roll_no, email, department_id, defaultRole], (err, result) => {
			if (err) {
				return res.status(500).json({ error: 'Database error', details: err });
			}
			res.json({ success: true, insertedId: result.insertId });
		});
	} catch (error) {
		res.status(500).json({ error: 'Server error', details: error });
	}
};

exports.deleteFaculty = (req, res) => {
	const staffId = req.params.id;
	if (!staffId) {
		return res.status(400).json({ error: 'Staff ID required.' });
	}
	const sql = 'DELETE FROM users WHERE id = ? AND role_id = 2';
	db.query(sql, [staffId], (err, result) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to delete staff', details: err });
		}
		if (result.affectedRows === 0) {
			return res.status(404).json({ error: 'Staff not found or already deleted.' });
		}
		res.json({ success: true, deleted: result.affectedRows });
	});
};



exports.updateFaculty = (req, res) => {
	const staffId = req.params.id;
	const { roll_no, name, email, department_id } = req.body;
	if (!staffId) {
		return res.status(400).json({ error: 'Staff ID required.' });
	}
	const fields = [];
	const values = [];
	if (roll_no !== undefined) { fields.push('roll_no = ?'); values.push(roll_no); }
	if (name !== undefined) { fields.push('name = ?'); values.push(name); }
	if (email !== undefined) { fields.push('email = ?'); values.push(email); }
	if (department_id !== undefined) { fields.push('department_id = ?'); values.push(department_id); }
	if (!fields.length) {
		return res.status(400).json({ error: 'No fields to update.' });
	}
	const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND role_id = 2`;
	values.push(staffId);
	db.query(sql, values, (err, result) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to update staff', details: err });
		}
		if (result.affectedRows === 0) {
			return res.status(404).json({ error: 'Staff not found.' });
		}
		res.json({ success: true, updated: result.affectedRows });
	});
};


exports.adminResetPassword = (req, res) => {
	let staffId = 1;
	
	const { password } = req.body;
	if (!password) {
		return res.status(400).json({ error: 'Password required.' });
	}
	bcrypt.hash(password, 10, (err, hash) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to hash password', details: err });
		}
		const sql = 'UPDATE users SET password = ? WHERE id = ? AND role_id = 5';
		db.query(sql, [hash, staffId], (err, result) => {
			if (err) {
				return res.status(500).json({ error: 'Failed to reset password', details: err });
			}
			if (result.affectedRows === 0) {
				return res.status(404).json({ error: 'Staff not found.' });
			}
			res.json({ success: true, message: 'Password reset successfully.' });
		});
	});
};

exports.getProfile = (req, res) => {
	const userId = req.user?.id;
	if (!userId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
	}
	const sql = `
		SELECT u.id, u.roll_no, u.name, u.email, u.password, u.year, u.role_id, u.department_id, d.full_name AS department_name, u.created_at, u.updated_at
		FROM users u
		LEFT JOIN departments d ON u.department_id = d.id
		WHERE u.id = ?
	`;
	db.query(sql, [userId], (err, results) => {
		if (err) {
			return res.status(500).json({ error: 'Database error', details: err });
		}
		if (!results.length) {
			return res.status(404).json({ error: 'User not found.' });
		}
		res.json({ success: true, profile: results[0] });
	});
};

// HOD Staff Management Controllers
// Get all faculty staff in HOD's department
exports.getDepartmentStaff = (req, res) => {
	const hodId = req.user?.id;
	if (!hodId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
	}

	// First, get the HOD's department
	const hodSql = 'SELECT department_id FROM users WHERE id = ? AND role_id = 3';
	db.query(hodSql, [hodId], (err, hodResults) => {
		if (err) {
			return res.status(500).json({ error: 'Database error', details: err });
		}
		if (!hodResults.length) {
			return res.status(404).json({ error: 'HOD not found or invalid role.' });
		}

		const departmentId = hodResults[0].department_id;
		if (!departmentId) {
			return res.status(400).json({ error: 'HOD department not found.' });
		}

		// Fetch all faculty (role_id = 2) in the same department
		const staffSql = `
			SELECT 
				u.id, 
				u.name, 
				u.roll_no,
				u.email, 
				u.department_id, 
				d.short_name AS department_name,
				d.full_name AS department_full_name,
				u.created_at,
				'Faculty' AS role
			FROM users u
			LEFT JOIN departments d ON u.department_id = d.id
			WHERE u.role_id = 2 AND u.department_id = ?
			ORDER BY u.name ASC
		`;

		db.query(staffSql, [departmentId], (err, staffResults) => {
			if (err) {
				return res.status(500).json({ error: 'Failed to fetch department staff', details: err });
			}
			res.json({ 
				success: true, 
				staff: staffResults,
				departmentId: departmentId 
			});
		});
	});
};

// Get staff member details with statistics (tests conducted and students attended)
exports.getStaffDetails = (req, res) => {
	const staffId = req.params.id;
	const hodId = req.user?.id;
	
	if (!staffId) {
		return res.status(400).json({ error: 'Staff ID required.' });
	}
	if (!hodId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
	}

	// First, verify HOD's department matches staff's department
	const verifySql = `
		SELECT 
			s.id AS staff_id,
			s.name AS staff_name,
			s.email AS staff_email,
			s.roll_no AS staff_roll_no,
			s.department_id,
			s.created_at AS staff_joined_date,
			d.short_name AS department_name,
			d.full_name AS department_full_name,
			h.id AS hod_id,
			h.department_id AS hod_department_id
		FROM users s
		LEFT JOIN departments d ON s.department_id = d.id
		CROSS JOIN users h
		WHERE s.id = ? AND s.role_id = 2 
		AND h.id = ? AND h.role_id = 3
		AND s.department_id = h.department_id
	`;

	db.query(verifySql, [staffId, hodId], (err, verifyResults) => {
		if (err) {
			return res.status(500).json({ error: 'Database error', details: err });
		}
		if (!verifyResults.length) {
			return res.status(403).json({ error: 'Access denied. Staff not in your department or invalid credentials.' });
		}

		const staffInfo = verifyResults[0];

		// Get tests conducted by this staff member
		const testsSql = `
			SELECT 
				t.test_id,
				t.title,
				t.subject,
				t.num_questions,
				t.duration_minutes,
				t.is_active,
				t.date,
				t.time_slot,
				t.created_at,
				topic.title AS topic_title,
				st.title AS sub_topic_title,
				COUNT(DISTINCT sta.student_id) AS students_attended,
				COUNT(DISTINCT CASE WHEN sta.status = 'completed' THEN sta.student_id END) AS students_completed
			FROM tests t
			LEFT JOIN topics topic ON t.topic_id = topic.id
			LEFT JOIN sub_topics st ON t.sub_topic_id = st.id
			LEFT JOIN student_tests sta ON t.test_id = sta.test_id
			WHERE t.created_by = ?
			GROUP BY t.test_id
			ORDER BY t.created_at DESC
		`;

		db.query(testsSql, [staffId], (err, testsResults) => {
			if (err) {
				return res.status(500).json({ error: 'Failed to fetch tests', details: err });
			}

			// Get overall statistics
			const statsSql = `
				SELECT 
					COUNT(DISTINCT t.test_id) AS total_tests,
					COUNT(DISTINCT CASE WHEN t.is_active = 1 THEN t.test_id END) AS active_tests,
					COUNT(DISTINCT sta.student_id) AS total_students_participated,
					COUNT(DISTINCT CASE WHEN sta.status = 'completed' THEN sta.id END) AS total_completed_tests,
					COALESCE(AVG(sta.score), 0) AS average_score
				FROM tests t
				LEFT JOIN student_tests sta ON t.test_id = sta.test_id
				WHERE t.created_by = ?
			`;

			db.query(statsSql, [staffId], (err, statsResults) => {
				if (err) {
					return res.status(500).json({ error: 'Failed to fetch statistics', details: err });
				}

				res.json({
					success: true,
					staff: {
						id: staffInfo.staff_id,
						name: staffInfo.staff_name,
						email: staffInfo.staff_email,
						roll_no: staffInfo.staff_roll_no,
						department_id: staffInfo.department_id,
						department_name: staffInfo.department_name,
						department_full_name: staffInfo.department_full_name,
						joined_date: staffInfo.staff_joined_date,
						role: 'Faculty'
					},
					statistics: statsResults[0],
					tests: testsResults
				});
			});
		});
	});
};

// Update staff member (HOD can only update staff in their department)
exports.updateDepartmentStaff = (req, res) => {
	const staffId = req.params.id;
	const hodId = req.user?.id;
	const { name, email, roll_no } = req.body;

	if (!staffId) {
		return res.status(400).json({ error: 'Staff ID required.' });
	}
	if (!hodId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
	}

	// First, verify HOD can edit this staff (same department)
	const verifySql = `
		SELECT s.id, s.department_id
		FROM users s
		INNER JOIN users h ON s.department_id = h.department_id
		WHERE s.id = ? AND s.role_id = 2 
		AND h.id = ? AND h.role_id = 3
	`;

	db.query(verifySql, [staffId, hodId], (err, verifyResults) => {
		if (err) {
			return res.status(500).json({ error: 'Database error', details: err });
		}
		if (!verifyResults.length) {
			return res.status(403).json({ error: 'Access denied. Staff not in your department.' });
		}

		// Build update query
		const fields = [];
		const values = [];
		
		if (name !== undefined) { fields.push('name = ?'); values.push(name); }
		if (email !== undefined) { fields.push('email = ?'); values.push(email); }
		if (roll_no !== undefined) { fields.push('roll_no = ?'); values.push(roll_no); }

		if (!fields.length) {
			return res.status(400).json({ error: 'No fields to update.' });
		}

		const updateSql = `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND role_id = 2`;
		values.push(staffId);

		db.query(updateSql, values, (err, result) => {
			if (err) {
				return res.status(500).json({ error: 'Failed to update staff', details: err });
			}
			if (result.affectedRows === 0) {
				return res.status(404).json({ error: 'Staff not found.' });
			}
			res.json({ success: true, message: 'Staff updated successfully.', updated: result.affectedRows });
		});
	});
};

// Delete staff member (HOD can only delete staff in their department)
exports.deleteDepartmentStaff = (req, res) => {
	const staffId = req.params.id;
	const hodId = req.user?.id;

	if (!staffId) {
		return res.status(400).json({ error: 'Staff ID required.' });
	}
	if (!hodId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
	}

	// First, verify HOD can delete this staff (same department)
	const verifySql = `
		SELECT s.id, s.name, s.department_id
		FROM users s
		INNER JOIN users h ON s.department_id = h.department_id
		WHERE s.id = ? AND s.role_id = 2 
		AND h.id = ? AND h.role_id = 3
	`;

	db.query(verifySql, [staffId, hodId], (err, verifyResults) => {
		if (err) {
			return res.status(500).json({ error: 'Database error', details: err });
		}
		if (!verifyResults.length) {
			return res.status(403).json({ error: 'Access denied. Staff not in your department.' });
		}

		// Delete the staff member
		const deleteSql = 'DELETE FROM users WHERE id = ? AND role_id = 2';
		db.query(deleteSql, [staffId], (err, result) => {
			if (err) {
				return res.status(500).json({ error: 'Failed to delete staff', details: err });
			}
			if (result.affectedRows === 0) {
				return res.status(404).json({ error: 'Staff not found or already deleted.' });
			}
			res.json({ success: true, message: 'Staff deleted successfully.', deleted: result.affectedRows });
		});
	});
};

// Add new staff member to HOD's department
exports.addDepartmentStaff = async (req, res) => {
	try {
		const hodId = req.user?.id;
		const { name, roll_no, email, password } = req.body;

		if (!hodId) {
			return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
		}

		if (!name || !roll_no || !email) {
			return res.status(400).json({ error: 'Name, roll number, and email are required.' });
		}

		// Get HOD's department
		const hodSql = 'SELECT department_id FROM users WHERE id = ? AND role_id = 3';
		db.query(hodSql, [hodId], async (err, hodResults) => {
			if (err) {
				return res.status(500).json({ error: 'Database error', details: err });
			}
			if (!hodResults.length) {
				return res.status(404).json({ error: 'HOD not found or invalid role.' });
			}

			const departmentId = hodResults[0].department_id;
			if (!departmentId) {
				return res.status(400).json({ error: 'HOD department not found.' });
			}

			// Hash password if provided, otherwise use default
			const defaultPassword = password || 'nscet123';
			const hashedPassword = await bcrypt.hash(defaultPassword, 10);

			const facultyRole = 2;
			const insertSql = 'INSERT INTO users (name, roll_no, email, password, department_id, role_id) VALUES (?, ?, ?, ?, ?, ?)';
			
			db.query(insertSql, [name, roll_no, email, hashedPassword, departmentId, facultyRole], (err, result) => {
				if (err) {
					if (err.code === 'ER_DUP_ENTRY') {
						return res.status(400).json({ error: 'Email or roll number already exists.' });
					}
					return res.status(500).json({ error: 'Database error', details: err });
				}
				res.json({ 
					success: true, 
					message: 'Staff added successfully.',
					insertedId: result.insertId 
				});
			});
		});
	} catch (error) {
		res.status(500).json({ error: 'Server error', details: error });
	}
};

// Reset staff password (HOD can reset password for staff in their department)
exports.resetDepartmentStaffPassword = (req, res) => {
	const staffId = req.params.id;
	const hodId = req.user?.id;
	const { password } = req.body;

	if (!staffId) {
		return res.status(400).json({ error: 'Staff ID required.' });
	}
	if (!hodId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
	}

	// First, verify HOD can reset this staff's password (same department)
	const verifySql = `
		SELECT s.id, s.department_id
		FROM users s
		INNER JOIN users h ON s.department_id = h.department_id
		WHERE s.id = ? AND s.role_id = 2 
		AND h.id = ? AND h.role_id = 3
	`;

	db.query(verifySql, [staffId, hodId], (err, verifyResults) => {
		if (err) {
			return res.status(500).json({ error: 'Database error', details: err });
		}
		if (!verifyResults.length) {
			return res.status(403).json({ error: 'Access denied. Staff not in your department.' });
		}

		const newPassword = password || 'nscet123';
		bcrypt.hash(newPassword, 10, (err, hash) => {
			if (err) {
				return res.status(500).json({ error: 'Failed to hash password', details: err });
			}

			const updateSql = 'UPDATE users SET password = ? WHERE id = ? AND role_id = 2';
			db.query(updateSql, [hash, staffId], (err, result) => {
				if (err) {
					return res.status(500).json({ error: 'Failed to reset password', details: err });
				}
				if (result.affectedRows === 0) {
					return res.status(404).json({ error: 'Staff not found.' });
				}
				res.json({ success: true, message: 'Password reset successfully.' });
			});
		});
	});
};

// ============= HOD Student Management Functions =============

// Get all students in HOD's department
exports.getDepartmentStudents = (req, res) => {
	const hodId = req.user?.id;

	if (!hodId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
	}

	const sql = `
		SELECT 
			s.id, 
			s.name, 
			s.roll_no, 
			s.email, 
			s.department_id,
			s.year,
			d.short_name AS department_name,
			d.full_name AS department_full_name,
			s.created_at
		FROM users s
		INNER JOIN departments d ON s.department_id = d.id
		INNER JOIN users h ON s.department_id = h.department_id
		WHERE s.role_id = 1
		AND h.id = ? AND h.role_id = 3
		ORDER BY s.year, s.name
	`;

	db.query(sql, [hodId], (err, results) => {
		if (err) {
			return res.status(500).json({ error: 'Database error', details: err });
		}
		res.json({ 
			success: true, 
			students: results 
		});
	});
};

// Get detailed student information with test attendance
exports.getStudentDetails = (req, res) => {
	const studentId = req.params.id;
	const hodId = req.user?.id;

	if (!studentId) {
		return res.status(400).json({ error: 'Student ID required.' });
	}
	if (!hodId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
	}

	// First verify the student is in HOD's department
	const verifySql = `
		SELECT s.id, s.name, s.roll_no, s.email, s.year, 
			   d.short_name AS department_name, d.name AS department_full_name,
			   s.created_at AS joined_date
		FROM users s
		INNER JOIN departments d ON s.department_id = d.id
		INNER JOIN users h ON s.department_id = h.department_id
		WHERE s.id = ? AND s.role_id = 1 
		AND h.id = ? AND h.role_id = 3
	`;

	db.query(verifySql, [studentId, hodId], (err, studentResults) => {
		if (err) {
			return res.status(500).json({ error: 'Database error', details: err });
		}
		if (!studentResults.length) {
			return res.status(403).json({ error: 'Access denied. Student not in your department.' });
		}

		const student = studentResults[0];

		// Get test attendance details
		const testsSql = `
			SELECT 
				t.test_id,
				t.title,
				t.subject,
				top.title AS topic_title,
				st.title AS sub_topic_title,
				t.duration_minutes,
				t.num_questions,
				sta.status,
				sta.score,
				sta.start_time,
				sta.end_time,
				sta.time_taken_minutes,
				u.name AS created_by_name
			FROM student_tests sta
			INNER JOIN tests t ON sta.test_id = t.test_id
			LEFT JOIN topics top ON t.topic_id = top.id
			LEFT JOIN sub_topics st ON t.sub_topic_id = st.id
			LEFT JOIN users u ON t.created_by = u.id
			WHERE sta.student_id = ?
			ORDER BY sta.start_time DESC
		`;

		db.query(testsSql, [studentId], (err, testsResults) => {
			if (err) {
				return res.status(500).json({ error: 'Database error fetching tests', details: err });
			}

			// Calculate statistics
			const completedTests = testsResults.filter(t => t.status === 'completed');
			const inProgressTests = testsResults.filter(t => t.status === 'in-progress');
			const totalTests = testsResults.length;
			const averageScore = completedTests.length > 0 
				? completedTests.reduce((sum, t) => sum + (t.score || 0), 0) / completedTests.length 
				: 0;

			res.json({
				success: true,
				student: {
					...student,
					role: 'Student'
				},
				tests: testsResults,
				statistics: {
					total_tests_attended: totalTests,
					tests_completed: completedTests.length,
					tests_in_progress: inProgressTests.length,
					average_score: parseFloat(averageScore.toFixed(2))
				}
			});
		});
	});
};

// Add new student to HOD's department
exports.addDepartmentStudent = async (req, res) => {
	try {
		const { name, roll_no, email, year, password } = req.body;
		const hodId = req.user?.id;

		if (!name || !roll_no || !email || !year) {
			return res.status(400).json({ error: 'Name, roll number, email, and year are required.' });
		}
		if (!hodId) {
			return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
		}

		// Get HOD's department
		const deptSql = 'SELECT department_id FROM users WHERE id = ? AND role_id = 3';
		db.query(deptSql, [hodId], (err, deptResults) => {
			if (err) {
				return res.status(500).json({ error: 'Database error', details: err });
			}
			if (!deptResults.length) {
				return res.status(403).json({ error: 'HOD not found or unauthorized.' });
			}

			const departmentId = deptResults[0].department_id;
			const defaultPassword = password || 'nscet123';

			// Hash password
			bcrypt.hash(defaultPassword, 10, (err, hash) => {
				if (err) {
					return res.status(500).json({ error: 'Failed to hash password', details: err });
				}

				const sql = `
					INSERT INTO users (name, roll_no, email, department_id, year, role_id, password) 
					VALUES (?, ?, ?, ?, ?, 1, ?)
				`;
				
				db.query(sql, [name, roll_no, email, departmentId, year, hash], (err, result) => {
					if (err) {
						if (err.code === 'ER_DUP_ENTRY') {
							return res.status(400).json({ error: 'Email or roll number already exists.' });
						}
						return res.status(500).json({ error: 'Database error', details: err });
					}
					res.json({ 
						success: true, 
						message: 'Student added successfully.',
						insertedId: result.insertId 
					});
				});
			});
		});
	} catch (error) {
		res.status(500).json({ error: 'Server error', details: error });
	}
};

// Update student in HOD's department
exports.updateDepartmentStudent = (req, res) => {
	const studentId = req.params.id;
	const hodId = req.user?.id;
	const { name, roll_no, email, year } = req.body;

	if (!studentId) {
		return res.status(400).json({ error: 'Student ID required.' });
	}
	if (!hodId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
	}

	// First, verify HOD can update this student (same department)
	const verifySql = `
		SELECT s.id, s.department_id
		FROM users s
		INNER JOIN users h ON s.department_id = h.department_id
		WHERE s.id = ? AND s.role_id = 1 
		AND h.id = ? AND h.role_id = 3
	`;

	db.query(verifySql, [studentId, hodId], (err, verifyResults) => {
		if (err) {
			return res.status(500).json({ error: 'Database error', details: err });
		}
		if (!verifyResults.length) {
			return res.status(403).json({ error: 'Access denied. Student not in your department.' });
		}

		// Build update query dynamically
		const fields = [];
		const values = [];
		
		if (name !== undefined) { fields.push('name = ?'); values.push(name); }
		if (roll_no !== undefined) { fields.push('roll_no = ?'); values.push(roll_no); }
		if (email !== undefined) { fields.push('email = ?'); values.push(email); }
		if (year !== undefined) { fields.push('year = ?'); values.push(year); }

		if (!fields.length) {
			return res.status(400).json({ error: 'No fields to update.' });
		}

		const updateSql = `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND role_id = 1`;
		values.push(studentId);

		db.query(updateSql, values, (err, result) => {
			if (err) {
				if (err.code === 'ER_DUP_ENTRY') {
					return res.status(400).json({ error: 'Email or roll number already exists.' });
				}
				return res.status(500).json({ error: 'Failed to update student', details: err });
			}
			if (result.affectedRows === 0) {
				return res.status(404).json({ error: 'Student not found.' });
			}
			res.json({ 
				success: true, 
				message: 'Student updated successfully.',
				updated: result.affectedRows 
			});
		});
	});
};

// Delete student from HOD's department
exports.deleteDepartmentStudent = (req, res) => {
	const studentId = req.params.id;
	const hodId = req.user?.id;

	if (!studentId) {
		return res.status(400).json({ error: 'Student ID required.' });
	}
	if (!hodId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
	}

	// First, verify HOD can delete this student (same department)
	const verifySql = `
		SELECT s.id, s.department_id
		FROM users s
		INNER JOIN users h ON s.department_id = h.department_id
		WHERE s.id = ? AND s.role_id = 1 
		AND h.id = ? AND h.role_id = 3
	`;

	db.query(verifySql, [studentId, hodId], (err, verifyResults) => {
		if (err) {
			return res.status(500).json({ error: 'Database error', details: err });
		}
		if (!verifyResults.length) {
			return res.status(403).json({ error: 'Access denied. Student not in your department.' });
		}

		const deleteSql = 'DELETE FROM users WHERE id = ? AND role_id = 1';
		db.query(deleteSql, [studentId], (err, result) => {
			if (err) {
				return res.status(500).json({ error: 'Failed to delete student', details: err });
			}
			if (result.affectedRows === 0) {
				return res.status(404).json({ error: 'Student not found or already deleted.' });
			}
			res.json({ 
				success: true, 
				message: 'Student deleted successfully.',
				deleted: result.affectedRows 
			});
		});
	});
};

// Reset student password (HOD can reset password for students in their department)
exports.resetDepartmentStudentPassword = (req, res) => {
	const studentId = req.params.id;
	const hodId = req.user?.id;
	const { password } = req.body;

	if (!studentId) {
		return res.status(400).json({ error: 'Student ID required.' });
	}
	if (!hodId) {
		return res.status(401).json({ error: 'Unauthorized: No user id in token.' });
	}

	// First, verify HOD can reset this student's password (same department)
	const verifySql = `
		SELECT s.id, s.department_id
		FROM users s
		INNER JOIN users h ON s.department_id = h.department_id
		WHERE s.id = ? AND s.role_id = 1 
		AND h.id = ? AND h.role_id = 3
	`;

	db.query(verifySql, [studentId, hodId], (err, verifyResults) => {
		if (err) {
			return res.status(500).json({ error: 'Database error', details: err });
		}
		if (!verifyResults.length) {
			return res.status(403).json({ error: 'Access denied. Student not in your department.' });
		}

		const newPassword = password || 'nscet123';
		bcrypt.hash(newPassword, 10, (err, hash) => {
			if (err) {
				return res.status(500).json({ error: 'Failed to hash password', details: err });
			}

			const updateSql = 'UPDATE users SET password = ? WHERE id = ? AND role_id = 1';
			db.query(updateSql, [hash, studentId], (err, result) => {
				if (err) {
					return res.status(500).json({ error: 'Failed to reset password', details: err });
				}
				if (result.affectedRows === 0) {
					return res.status(404).json({ error: 'Student not found.' });
				}
				res.json({ success: true, message: 'Password reset successfully.' });
			});
		});
	});
};

