const express = require('express');
const mysql = require('mysql2');   // the translator library we just installed
const app = express();

// Create a connection to your MySQL database.
const db = mysql.createConnection({
  host: 'localhost',          // the database is on your own computer
  user: 'root',               // the default MySQL username
  password: 'Qwertyuiop12@',  // <-- put your real MySQL password here
  database: 'campus_portal',  // the database we created in Workbench
});

// Actually connect, and tell us if it worked or failed.
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

// The /jobs route now pulls from the REAL database instead of hardcoded data.
app.get('/jobs', (req, res) => {
  db.query('SELECT * FROM jobs', (err, results) => {
    if (err) {
      res.status(500).send('Error fetching jobs');
      return;
    }
    res.json(results);   // send the rows from the database as JSON
  });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});