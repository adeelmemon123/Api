const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 9000;

app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Define your routes or other middleware here

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
