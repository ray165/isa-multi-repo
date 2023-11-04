const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');

const app = express();
const port = 3000; // Change this to your desired port

// Configure your ElephantSQL database connection
const connectionString = 'INSERT_YOUR_ELEPHANTSQL_URL_HERE'; // Replace with your ElephantSQL URL
const client = new Client({
  connectionString: connectionString,
});

// Connect to the database
client.connect((err) => {
  if (err) {
    console.error('Could not connect to ElephantSQL', err);
  } else {
    console.log('Connected to ElephantSQL');
  }
});

// Middleware to parse JSON in the request body
app.use(bodyParser.json());

// 1. Create a new dictionary entry
app.post('/api/v1/definition', async (req, res) => {
  const { word, definition, 'word-language': wordLanguage, 'definition-language': definitionLanguage } = req.body;

  // Check if the word already exists in the database
  const checkWordQuery = 'SELECT * FROM entry WHERE word = $1';
  const checkResult = await client.query(checkWordQuery, [word]);

  if (checkResult.rows.length > 0) {
    // Word already exists, prompt to update using PATCH
    res.status(409).json({
      error: 'Word conflict',
      message: getUserMessage('entryConflict').replace('%WORD%', word),
      entry: req.body,
    });
  } else {
    // Word doesn't exist, insert a new entry into the database
    const insertQuery = 'INSERT INTO entry (word, definition, word_language, definition_language) VALUES ($1, $2, $3, $4)';
    await client.query(insertQuery, [word, definition, wordLanguage, definitionLanguage]);

    // Get the total number of entries
    const totalEntriesQuery = 'SELECT count(*) FROM entry';
    const totalEntriesResult = await client.query(totalEntriesQuery);

    res.status(201).json({
      message: getUserMessage('entryCreated'),
      entry: req.body,
      total: totalEntriesResult.rows[0].count,
    });
  }
});

// 2. Update the definition of an existing word
app.patch('/api/v1/definition/:word', async (req, res) => {
  const { word } = req.params;
  const { definition } = req.body;

  // Check if the word exists in the database
  const checkWordQuery = 'SELECT * FROM entry WHERE word = $1';
  const checkResult = await client.query(checkWordQuery, [word]);

  if (checkResult.rows.length === 0) {
    res.status(404).json({
      error: 'Entry Not Found',
      message: getUserMessage('entryNotFound').replace('%WORD%', word),
      entry: { word },
    });
  } else {
    // Update the definition
    const updateQuery = 'UPDATE entry SET definition = $1 WHERE word = $2';
    await client.query(updateQuery, [definition, word]);

    // Get the total number of entries
    const totalEntriesQuery = 'SELECT count(*) FROM entry';
    const totalEntriesResult = await client.query(totalEntriesQuery);

    res.json({
      message: getUserMessage('entryUpdated'),
      entry: { word, definition },
      total: totalEntriesResult.rows[0].count,
    });
  }
});

// 3. Retrieve the definition of a word
app.get('/api/v1/definition/:word', async (req, res) => {
  const { word } = req.params;

  // Fetch the definition from the database
  const definitionQuery = 'SELECT definition FROM entry WHERE word = $1';
  const definitionResult = await client.query(definitionQuery, [word]);

  if (definitionResult.rows.length === 0) {
    res.status(404).json({
      error: 'Entry Not Found',
      message: getUserMessage('entryNotFound').replace('%WORD%', word),
      entry: { word },
    });
  } else {
    res.json({
      word,
      definition: definitionResult.rows[0].definition,
    });
  }
});

// 4. Remove a word and its definition
app.delete('/api/v1/definition/:word', async (req, res) => {
  const { word } = req.params;

  // Check if the word exists in the database
  const checkWordQuery = 'SELECT * FROM entry WHERE word = $1';
  const checkResult = await client.query(checkWordQuery, [word]);

  if (checkResult.rows.length === 0) {
    res.status(404).json({
      error: 'Entry Not Found',
      message: getUserMessage('entryNotFound').replace('%WORD%', word),
      entry: { word },
    });
  } else {
    // Delete the entry from the database
    const deleteQuery = 'DELETE FROM entry WHERE word = $1';
    await client.query(deleteQuery, [word]);

    // Get the total number of entries
    const totalEntriesQuery = 'SELECT count(*) FROM entry';
    const totalEntriesResult = await client.query(totalEntriesQuery);

    res.json({
      message: getUserMessage('entryDeleted'),
      entry: { word },
      total: totalEntriesResult.rows[0].count,
    });
  }
});

// 5. Retrieve all languages
app.get('/api/v1/languages', async (req, res) => {
  // Fetch a list of supported languages from your database
  const languagesQuery = 'SELECT * FROM language';
  const languagesResult = await client.query(languagesQuery);

  const languages = languagesResult.rows.map((row) => ({
    code: row.code,
    name: row.name,
  }));

  res.json({ languages });
});

function getUserMessage(messageKey) {
    const userMessagesPath = path.join(__dirname, 'userMessages.json');
    const userMessages = JSON.parse(fs.readFileSync(userMessagesPath));
  
    if (messageKey in userMessages) {
      return userMessages[messageKey];
    } else {
      return userMessages['messageNotFound'];
    }
}

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
