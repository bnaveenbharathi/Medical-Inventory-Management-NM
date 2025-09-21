const db = require('../config/conn');
const bcrypt = require('bcryptjs');

// Fetch user details by roll number (with department name)
exports.getUserByRollNo = (req, res) => {
  const { rollNo } = req.params;
  db.query(
    `SELECT u.roll_no, u.name, u.email, d.full_name AS department
     FROM users u
     LEFT JOIN departments d ON u.department_id = d.id
     WHERE u.roll_no = ?`,
    [rollNo],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (results.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json(results[0]);
    }
  );
};

// Signup: set password if not already set
exports.signup = async (req, res) => {
  const { rollNo, password } = req.body;
  db.query('SELECT password FROM users WHERE roll_no = ?', [rollNo], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    const currentPassword = results[0].password;
      if (currentPassword && currentPassword.trim() !== '') {
        return res.status(400).json({ error: 'Password already set for this user' });
      }
      // Hash password before saving
     
      bcrypt.genSalt(10, (saltErr, salt) => {
        if (saltErr) return res.status(500).json({ error: 'Error generating salt' });
        bcrypt.hash(password, salt, (hashErr, hashedPassword) => {
          if (hashErr) return res.status(500).json({ error: 'Error hashing password' });
          db.query('UPDATE users SET password = ? WHERE roll_no = ?', [hashedPassword, rollNo], (err2) => {
            if (err2) return res.status(500).json({ error: 'DB error' });
            return res.json({ success: true });
          });
        });
      });
  });
};

// Login (with department name)
exports.login = (req, res) => {
  const { rollNo, password } = req.body;
  db.query(
    `SELECT u.roll_no, u.name, u.email, d.full_name AS department, u.password
     FROM users u
     LEFT JOIN departments d ON u.department_id = d.id
     WHERE u.roll_no = ?`,
    [rollNo],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length === 0) return res.status(404).json({ error: 'User not found' });
      const user = results[0];
      if (!user.password) return res.status(400).json({ error: 'Password not set. Please sign up.' });
      bcrypt.compare(password, user.password, (compareErr, isMatch) => {
        if (compareErr) return res.status(500).json({ error: 'Error comparing passwords' });
        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid password' });
        }
        res.json({
          roll_no: user.roll_no,
          name: user.name,
          email: user.email,
          department: user.department
        });
      });
    }
  );
};
