'use strict';

const express = require('express');
const app = express();
const config = require('./configs');
const bodyParser = require('body-parser');
//const queryString = require('querystring');
const path = require('path');
const http = require('http');
//const https = require('https');
//const fs = require('fs');
//const privateKey = fs.readFileSync('privateKey.key', 'utf-8');
//const certificate = fs.readFileSync('certificate.crt', 'utf-8');
//const credentials = { key: privateKey, cert: certificate };

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

const httpServer = http.createServer(app);

httpServer.listen(config.HTTP_PORT, function(err) {
  if (err) {
    console.log('Server error: ', err);
    return;
  }
  console.log(`Server(https) running on ${config.HTTP_PORT}`);
});

//const httpsServer = https.createServer(credentials, app);
// Starting server/app
/*
httpsServer.listen(config.HTTPS_PORT, function(err) {
    if (err) {
        console.log('Server error: ', err);
        return;
    }
    console.log(`Server(https) running on ${config.HTTPS_PORT}`);
});
*/
