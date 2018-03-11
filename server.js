'use strict';

const express = require('express');
const app = express();
const config = require('./configs');
const bodyParser = require('body-parser');
//const queryString = require('querystring');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const privateKey = fs.readFileSync('/etc/apache2/ssl/apache.key', 'utf-8');
const certificate = fs.readFileSync('/etc/apache2/ssl/apache.crt', 'utf-8');
const credentials = { key: privateKey, cert: certificate };

// Attach body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Add public folder
app.use(express.static(__dirname + '/public'));

// Set template engine
app.set('view engine', 'ejs');

// Initializing routes
require('./routes')(app);

const httpsServer = https.createServer(credentials, app);
// Starting server/app
httpsServer.listen(config.HTTPS_PORT, function(err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(`Server(https) running on ${config.HTTPS_PORT}`);
});
