// Server 2

const http = require('http');
const mysql = require('mysql');
const url = require('url');

const create_table = "CREATE TABLE IF NOT EXISTS patients (\
    id MEDIUMINT NOT NULL AUTO_INCREMENT,\
    name VARCHAR(100) NOT NULL,\
    dateOfBirth DATETIME,\
    PRIMARY KEY (id)";

const db = mysql.createConnection({
    host: 'sql.freedb.tech',
    user: 'freedb_rayadmin',
    password: 'your_password',  // add env variable
    database: 'freedb_lab5-db',
    port: 3306
});

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;

    if (req.method === 'POST' && pathname  === '/api/v1/sql/insertDefault') {
        handleInsertDefault(req, res);
    } else if (req.method === 'GET' || req.method === 'POST' && pathname === '/api/v1/sql/runQuery') {
        // something
    } else if (req.method === 'GET' && pathname === '/api/v1/sql/readAll') {
        handleReadAll(req, res);
    } else {
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
        try {
            const data = JSON.parse(body);
            const query = data.query;
            handleQuery(res, query);
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON data' }));
        }
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

const handleQuery = (res, query) => {
    db.connect();

    db.query(create_table, (err, results) => {
        if (err) {
            console.error(err);
        } else {
            console.log(results);
        }
    });

    db.query(query, (error, results) => {
        if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        }

        db.end();
    });
}

const port = 3000; // Change to your desired port number
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
