const http = require('http');
const url = require('url');
const util = require('./modules/utils');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/COMP4537/labs/3/getDate/') {
    const name = parsedUrl.query.name || 'Guest';
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
          <p>Hello ${name}, What a beautiful day. Server current date and time is ${util.getDateTime()}</p>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.end(htmlResponse);
  } else if (parsedUrl.pathname == `/COMP4537/labs/3/writeFile/`) {
    const text_data = String(parsedUrl.query.text) || '';

    try {
      fileWriter("file.txt", text_data);
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.write(`Data saved!\t ${text_data}`);
      return res.end();
    } catch (err) {
      console.error(err);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404!! Could not save the data: ${file_name}`);
    }
  } else if (parsedUrl.pathname.includes(`/COMP4537/labs/3/readFile/`)) {
    let parts = parsedUrl.pathname.split('/');
    let file_name = parts.pop() || parts.pop();

    fs.readFile(`./${file_name}`, (err, data) => {
      if (!err && data) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write(data);
        res.end();
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`404!! Could not find the file name: ${file_name}`);
      }
    })

  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const fileWriter = (fileName, data) => {
  // let absPathTextFile = `./COMP4537/labs/3/${fileName}`
  let absPathTextFile = `./${fileName}`

  fs.appendFile(absPathTextFile, data + "\n", (err) => {
    if (err) throw err;
    console.log(`${data} has been saved to file.txt`);
  })
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
