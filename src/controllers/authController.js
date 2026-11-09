const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      institution = 'National Institute of Technology',
      department = 'Computer Science & Engineering',
      bio = '',
      expertise = '',
      skills = '',
      experience_years = 0
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!['student', 'mentor'].includes(role)) {
      return res.status(400).json({ error: 'Role must be student or mentor' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users 
       (name, email, password, role, institution, department, bio, expertise, skills, experience_years)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        role,
        institution.trim(),
        department.trim(),
        bio.trim(),
        expertise.trim(),
        skills.trim(),
        parseInt(experience_years || 0, 10)
      ]
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      institution,
      department
    };

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'hypothesis_gate_jwt_secure_key_2026_xyz',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed due to a server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'hypothesis_gate_jwt_secure_key_2026_xyz',
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
      department: user.department,
      bio: user.bio,
      expertise: user.expertise,
      skills: user.skills,
      experience_years: user.experience_years,
      availability_status: user.availability_status,
      max_capacity: user.max_capacity
    };

    return res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed due to a server error' });
  }
}

async function getProfile(req, res) {
  try {
    const [users] = await pool.query(
      `SELECT id, name, email, role, institution, department, bio, expertise, skills, experience_years, availability_status, max_capacity, created_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: users[0] });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ error: 'Failed to retrieve profile' });
  }
}

async function updateProfile(req, res) {
  try {
    const {
      name,
      institution,
      department,
      bio,
      expertise,
      skills,
      experience_years,
      availability_status,
      max_capacity
    } = req.body;

    await pool.query(
      `UPDATE users 
       SET name = COALESCE(?, name),
           institution = COALESCE(?, institution),
           department = COALESCE(?, department),
           bio = COALESCE(?, bio),
           expertise = COALESCE(?, expertise),
           skills = COALESCE(?, skills),
           experience_years = COALESCE(?, experience_years),
           availability_status = COALESCE(?, availability_status),
           max_capacity = COALESCE(?, max_capacity)
       WHERE id = ?`,
      [
        name,
        institution,
        department,
        bio,
        expertise,
        skills,
        experience_years,
        availability_status,
        max_capacity,
        req.user.id
      ]
    );

    const [updated] = await pool.query(
      `SELECT id, name, email, role, institution, department, bio, expertise, skills, experience_years, availability_status, max_capacity 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    return res.json({ message: 'Profile updated successfully', user: updated[0] });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
