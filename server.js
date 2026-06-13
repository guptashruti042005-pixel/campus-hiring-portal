require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const cors = require('cors');
app.use(cors());

// Middleware: the "security guard" that checks for a valid token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  // No header at all -> blocked
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Header looks like "Bearer eyJhbGci..." -> grab just the token part
  const token = authHeader.split(' ')[1];

  // Verify the token using our secret
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;   // attach the user info to the request
    next();               // token valid -> let the request continue
  });
}

app.use(express.json());

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

app.post('/jobs', (req, res) => {
  const { title, company } = req.body;
  db.query(
    'INSERT INTO jobs (title, company) VALUES (?, ?)',
    [title, company],
    (err, result) => {
      if (err) {
        res.status(500).send('Error adding job');
        return;
      }
      res.json({ message: 'Job added!', id: result.insertId });
    }
  );
});

// REGISTER a new user
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Hash the password before storing it. 10 = "salt rounds" (work factor).
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      (err, result) => {
        if (err) {
          // If email already exists, MySQL throws a duplicate error
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
// LOGIN a user
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Step 1: find the user by email
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    // No user with that email
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Step 2: compare typed password against the stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Step 3: password correct -> create a JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },   // data stored inside the token
      JWT_SECRET,                            // secret used to sign it
      { expiresIn: '1h' }                    // token expires in 1 hour
    );

    res.json({ message: 'Login successful!', token });
  });
});

// PROTECTED route - only works with a valid token
app.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: 'This is protected data',
    user: req.user,   // the id + email we baked into the token
  });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});