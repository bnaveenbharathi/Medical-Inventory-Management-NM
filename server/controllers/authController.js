const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || '123';
const db = require('../config/conn');
const bcrypt = require('bcryptjs');

// Fetch user details by roll number
exports.getUserByRollNo = (req, res) => {
  const { rollNo } = req.params;
  db.query(
    `SELECT u.roll_no, u.name, r.role_name, u.email, d.full_name AS department
     FROM users u
     LEFT JOIN departments d ON u.department_id = d.id
     LEFT JOIN roles r ON u.role_id = r.role_id
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

// Signup- set password if not already set
exports.signup = async (req, res) => {
  const { rollNo, password } = req.body;
  db.query('SELECT password FROM users WHERE roll_no = ?', [rollNo], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    const currentPassword = results[0].password;
      if (currentPassword && currentPassword.trim() !== '') {
        return res.status(400).json({ error: 'Password already set for this user' });
      }
      
     
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

// Login- fetch role, compare password, return role
exports.login = (req, res) => {
  const { rollNo, password } = req.body;
  db.query(
    `SELECT u.id, u.roll_no, u.name, u.email, d.full_name AS department, u.password, u.role_id, r.role_name
     FROM users u
     LEFT JOIN departments d ON u.department_id = d.id
     LEFT JOIN roles r ON u.role_id = r.role_id
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
        // Generate JWT token
        const token = jwt.sign({
          user_id:user.id,
          roll_no: user.roll_no,
          name: user.name,
          email: user.email,
          department: user.department,
          role_id: user.role_id,
          role_name: user.role_name
        }, JWT_SECRET, { expiresIn: '2h' });
        res.json({
          token,
          user: {
            user_id:user.id,
            roll_no: user.roll_no,
            name: user.name,
            email: user.email,
            department: user.department,
            role_id: user.role_id,
            role_name: user.role_name
          }
        });
      });
    }
  );
};
