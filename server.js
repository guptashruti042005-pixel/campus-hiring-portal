require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// NEW: Socket.io needs these two
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

// NEW: wrap the Express app in an HTTP server, then attach Socket.io to it
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173' },   // allow our React app to connect
});

// NEW: runs whenever a client connects via Socket.io
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

const JWT_SECRET = process.env.JWT_SECRET;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'campus_portal',
});

db.connect((err) => {
  if (err) {
    console.log('Database connection FAILED:', err.message);
    return;
  }
  console.log('Connected to MySQL database!');
});

app.get('/', (req, res) => {
  res.send('Hello from my server!');
});

app.get('/jobs', (req, res) => {
  db.query('SELECT * FROM jobs', (err, results) => {
    if (err) {
      res.status(500).send('Error fetching jobs');
      return;
    }
    res.json(results);
  });
});

app.post('/jobs', verifyToken, (req, res) => {
  const { title, company } = req.body;
  db.query(
    'INSERT INTO jobs (title, company) VALUES (?, ?)',
    [title, company],
    (err, result) => {
      if (err) {
        res.status(500).send('Error adding job');
        return;
      }

      const newJob = { id: result.insertId, title, company };

      // NEW: announce the new job to ALL connected clients, instantly
      io.emit('newJob', newJob);

      res.json({ message: 'Job added!', id: result.insertId });
    }
  );
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already registered' });
          }
          return res.status(500).json({ message: 'Error registering user' });
        }
        res.status(201).json({ message: 'User registered!', id: result.insertId });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ message: 'Login successful!', token });
  });
});

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

app.get('/profile', verifyToken, (req, res) => {
  res.json({ message: 'This is protected data', user: req.user });
});

// APPLY to a job
app.post('/apply', verifyToken , (req, res) => {
  const { job_id, user_id } = req.body;
  db.query(
    'INSERT INTO applications (job_id, user_id) VALUES (?, ?)',
    [job_id, user_id],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Already applied to this job' });
        }
        return res.status(500).json({ message: 'Error applying' });
      }
      res.json({ message: 'Applied successfully!', id: result.insertId });
    }
  );
});

// GET applications for a user (with JOIN to get job details)
app.get('/applications/:userId', (req, res) => {
  const { userId } = req.params;
  db.query(
    `SELECT applications.id, jobs.title, jobs.company, applications.applied_at
     FROM applications
     JOIN jobs ON applications.job_id = jobs.id
     WHERE applications.user_id = ?`,
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching applications' });
      }
      res.json(results);
    }
  );
});

// CHANGED: server.listen instead of app.listen
server.listen(5000, () => {
  console.log('Server is running on port 5000');
});