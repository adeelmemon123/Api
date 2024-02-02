const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 9000;

app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Define your routes or other middleware here

app.get('/', (req, res) => {
  res.send('Welcome to my API!');
});

// Example route
app.get('/api/users', (req, res) => {
  const users = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe' }
  ];
  res.json(users);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// fdlg,sfm