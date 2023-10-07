const http = require('http');
const url = require('url');
const qs = require('querystring');

// Create an array to store word definitions
const dictionary = [];

// Function to handle POST requests
function handlePostRequest(request, response) {
  let body = '';

  request.on('data', (data) => {
    body += data;
  });

  request.on('end', () => {
    const parsedData = qs.parse(body);
    const word = parsedData.word;
    const definition = parsedData.definition;

    if (!word || !definition) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Word and definition are required fields.' }));
    } else {
      const existingEntry = dictionary.find((entry) => entry.word === word);
      if (existingEntry) {
        response.writeHead(409, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: `${word} already exists.` }));
      } else {
        dictionary.push({ word, definition });
        response.writeHead(201, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: `Request #${dictionary.length}`, entry: `${word}: ${definition}` }));
      }
    }
  });
}

// Function to handle GET requests
function handleGetRequest(request, response) {
  const query = url.parse(request.url, true).query;
  const word = query.word;

  if (!word) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Word parameter is required for GET request.' }));
  } else {
    const entry = dictionary.find((entry) => entry.word === word);
    if (entry) {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ word, definition: entry.definition }));
    } else {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: `Request #${dictionary.length + 1}, word '${word}' not found.` }));
    }
  }
}

const server = http.createServer((request, response) => {
  const { method } = request;

  if (method === 'POST') {
    handlePostRequest(request, response);
  } else if (method === 'GET') {
    handleGetRequest(request, response);
  } else {
    response.writeHead(405, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Method not allowed.' }));
  }
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
