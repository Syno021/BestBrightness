const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3306;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'best_b'
});

connection.connect();

app.post('/register', (req, res) => {
  const { name, surname, email, address, password } = req.body;
  const query = `INSERT INTO users (name, surname, email, address, password) VALUES (?, ?, ?, ?, ?)`;
  
  connection.query(query, [name, surname, email, address, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'User registered successfully!' });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
