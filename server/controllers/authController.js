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

// Update user profile
exports.updateProfile = async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Check if email already exists for another user
  const checkEmailQuery = 'SELECT id FROM users WHERE email = ? AND id != ?';
  
  db.query(checkEmailQuery, [email, userId], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({ error: 'Database error', details: checkErr });
    }
    
    if (checkResults.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Update user profile
    const updateQuery = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    
    db.query(updateQuery, [name, email, userId], (updateErr, updateResult) => {
      if (updateErr) {
        return res.status(500).json({ error: 'Database error', details: updateErr });
      }
      
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ 
        success: true, 
        message: 'Profile updated successfully' 
      });
    });
  });
};

// Reset password
exports.resetPassword = async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id in token' });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  // Get current password from database
  const getUserQuery = 'SELECT password FROM users WHERE id = ?';
  
  db.query(getUserQuery, [userId], (getUserErr, getUserResults) => {
    if (getUserErr) {
      return res.status(500).json({ error: 'Database error', details: getUserErr });
    }
    
    if (getUserResults.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentHashedPassword = getUserResults[0].password;

    // Verify current password
    bcrypt.compare(currentPassword, currentHashedPassword, (compareErr, isMatch) => {
      if (compareErr) {
        return res.status(500).json({ error: 'Error comparing passwords' });
      }
      
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      bcrypt.genSalt(10, (saltErr, salt) => {
        if (saltErr) {
          return res.status(500).json({ error: 'Error generating salt' });
        }
        
        bcrypt.hash(newPassword, salt, (hashErr, hashedNewPassword) => {
          if (hashErr) {
            return res.status(500).json({ error: 'Error hashing password' });
          }
          
          // Update password in database
          const updatePasswordQuery = 'UPDATE users SET password = ? WHERE id = ?';
          
          db.query(updatePasswordQuery, [hashedNewPassword, userId], (updateErr, updateResult) => {
            if (updateErr) {
              return res.status(500).json({ error: 'Database error', details: updateErr });
            }
            
            if (updateResult.affectedRows === 0) {
              return res.status(404).json({ error: 'User not found' });
            }
            
            res.json({ 
              success: true, 
              message: 'Password reset successfully' 
            });
          });
        });
      });
    });
  });
};
