const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

app.use(cookieParser());
const myName = 'Venkat' 
app.use((req, res, next) => {
  res.cookie('name', 'myName');
  next();
});

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
