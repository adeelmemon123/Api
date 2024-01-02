const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'squareone',
  
  
  
});

db.connect((err) => {
  if (err) {
    console.error('Unable to connect to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

app.post('/addmember', (req, res) => {
  const requestData = req.body;

  const sql =
    'INSERT INTO addmember (membername, password, email, role, permission, profilepicture, roledescription) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(
    sql,
    [
      requestData.membername,
      requestData.password,
      requestData.email,
      requestData.role,
      requestData.permission,
      requestData.profilepicture,
      requestData.roledescription,
    ],
    (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ error: 'Internal Server Error', message: err.message });
      } else {
        console.log('Data inserted successfully');
        return res.status(200).json({ message: 'Data inserted successfully' });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
