const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');  // Import CORS

const app = express();
const port = 3000;  // Use a port that doesn't conflict, change if necessary

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({  // Enable CORS for all origins
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type, Authorization'
}));

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'best_b'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Register Route
app.post('/register', (req, res) => {
  console.log('Incoming registration request:', req.body);  // Log request body for debugging

  const { name, surname, email, address, password } = req.body;
  const query = `INSERT INTO users (name, surname, email, address, password) VALUES (?, ?, ?, ?, ?)`;

  connection.query(query, [name, surname, email, address, password], (err, results) => {
    if (err) {
      console.error('Error inserting user into database:', err);  // Log database errors
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('User registered successfully:', results);  // Log success
    res.status(200).json({ message: 'User registered successfully!' });
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);  // Log when server starts
});
