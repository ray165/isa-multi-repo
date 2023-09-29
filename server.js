const express = require('express');
const app = express();

app.get('/COMP4537/labs/3/getDate/', (req, res) => {
  const name = req.query.name || 'Guest';
  const currentTime = new Date().toString();

  const greeting = `Hello ${name}, What a beautiful day. Server current date and time is ${currentTime}`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Color', 'blue');

  res.send(greeting);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});