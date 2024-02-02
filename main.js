const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 9000;

app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'windows10',
  database: 'squareone',});

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


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  },
});

// Set up multer configuration
const upload = multer({
  storage: storage,
 limits: {
  fieldSize: 1024 * 1024 * 10, // 10MB (adjust as needed)
},
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only images are allowed (jpeg, jpg, png, gif)');
    }
  },
  stream: true,
});

// Route to handle administrator addition with file upload
app.post('/addadministrator', upload.single('profilepicture'), (req, res) => {
  const requestData = req.body;
  const imagePath = req.file ? req.file.path : null;

  const sql = 'INSERT INTO table1 (id, name, image) VALUES (?, ?, ?)';
  db.query(sql, [requestData.id, requestData.name, imagePath], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    } else {
      console.log('Data inserted successfully');
      return res.status(200).json({ message: 'Administrator added successfully' });
    }
  });
});

app.get('/administrators', (req, res) => {
  const sql = 'SELECT * FROM table1';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving administrators:', err);
      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    } else {
      return res.status(200).json(results);
    }
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
