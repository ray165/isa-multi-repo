// Server 2

const http = require('http');
const mysql = require('mysql');
const url = require('url');
var pg = require('pg');
require('dotenv').config();

// my sql create table
// const create_table = "CREATE TABLE IF NOT EXISTS patients (\
//     id SERIAL PRIMARY KEY,\
//     name VARCHAR(100) NOT NULL,\
//     dateOfBirth DATETIME";
const create_table = "CREATE TABLE IF NOT EXISTS patients (\
    id SERIAL PRIMARY KEY,\
    name VARCHAR(100) NOT NULL,\
    dateOfBirth DATE\
)";

var conString = process.env.ELPHA_URL //Can be found in the Details page
var db = new pg.Client(conString);

// my sql connection
// const db = mysql.createConnection({
//     host: 'sql.freedb.tech',
//     user: process.env.SQL_USER || 'freedb_rayadmin',
//     password: process.env.SQL_PASS || 'your_password',  // add env variable
//     database: 'freedb_lab5-db',
//     port: 3306
// });

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database.');
});

const headers = { 
    'Content-Type': 'text/plain',
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": '*'
  };

const server = http.createServer((req, res) => {
    const { method } = req;
    const execute = true;
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');

    console.log(req.method);
    console.log(pathname);
    console.log('body' + req.body);

    if (req.method === 'POST') {
        console.log("execute");
        handleExecute(req, res);
    }
    else if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end("Server is running");
        return;
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

var handleInsertDefault = (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        const data = JSON.parse(body);
        const query = data.query;
        console.log(query);
        handleQuery(res, query);
    });
}

var handleReadAll = (req, res) => {
    req.on('end', () => {
        try {
            const query = "SELECT * FROM patients";
            handleQuery(res, query);
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON data' }));
        }
    });
}

var handleExecute = (req, res) => {
    if (req.method === 'POST') {
        console.log("POST Method running");
            let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            const data = JSON.parse(body);
            const query = data.query;
            console.log(query);
            
            if (!isQueryValid(query)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end("Query is invalid. Contains: DROP or UPDATE");
                return;
            }

            handleQuery(res, query);
        });
    }
    else if (req.method === 'GET'){
        console.log("GET Method running");
        console.log(req.url);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end("GET Request");
        return
    }
}

const handleQuery = (res, query) => {
    console.log("handleQuery");
    console.log(query);
    console.log("dbPAss: " + process.env.SQL_PASS)
    

    // Create default table
    db.query(create_table, (err, results) => {
        if (err) {
            console.error(err);
        } else {
            console.log(results);
        }
    });

    // handle query
    db.query(query, (error, results) => {
        console.log("db.query results");
        console.log(error);
        console.log(results);

        if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        }
    });
}

const isQueryValid = (query) => {
    const invalids = ['DROP', 'UPDATE', 'DELETE']
    for (let val in invalids) {
        if (query.toUpperCase().includes(val)) {
            return false
        }
    }
    return true
}

const port = 3000; // Change to your desired port number
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
