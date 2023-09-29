const express = require('express');
const app = express();

app.get('/COMP4537/labs/3/getDate/', (req, res) => {
  const name = req.query.name || 'Guest';
  const currentTime = new Date().toString();

  const greeting = `Hello ${name}, What a beautiful day. Server current date and time is ${currentTime}`;

  const htmlResponse = `
    <html>
        <head>
        <style>
            body {
            color: blue;
            }
        </style>
        </head>
        <body>
        <p>Hello ${name}, What a beautiful day. Server current date and time is ${currentTime}</p>
        </body>
    </html>
    `;

  res.setHeader('Content-Type', 'text/html');

  res.send(htmlResponse);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
