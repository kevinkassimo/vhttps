# VHTTPS Virtual Host on HTTPS
This minimal package aims to allow hosting multiple HTTPS sites on a single server/IP address. 

## Install
`npm install --save vhttps`  

## Usage
```js
const vhttps = require('vhttps');

const defaultCredential = {
    cert: fs.readFileSync('./default-cert.pem'),
    key: fs.readFileSync('./default-key.pem'),
};

const credentialA = {
    hostname: 'a.com',
    cert: fs.readFileSync('./a-cert.pem'),
    key: fs.readFileSync('./a-key.pem'),
};

const credentialB = {
    hostname: 'b.com',
    cert: fs.readFileSync('./b-cert.pem'),
    key: fs.readFileSync('./b-key.pem'),
};

const server = vhttps.createServer(defaultCredential, [credentialA, credentialB], (req, res) => {
    switch (req.headers.host) {
        case 'a.com':
            // custom handlers based on which host you are using
            res.end('A.COM works!')
            break;
        case 'b.com':
            res.end('B.COM works!')
            break;
        default:
            res.end('???');
    }
});

server.listen(443);
```
Use with Express:  
```js
const fs = require('fs');
const express = require('express');
const vhost = require('vhost');
const vhttps = require('vhttps');

const app = express();

app.use(vhost('a.com', function (req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hello from a.com!')
}));

app.use(vhost('b.com', function (req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hello from b.com!');
}));

const defaultCredential = {
    cert: fs.readFileSync('./default-cert.pem'),
    key: fs.readFileSync('./default-key.pem'),
};

const credentialA = {
    hostname: 'a.com',
    cert: fs.readFileSync('./a-cert.pem'),
    key: fs.readFileSync('./a-key.pem'),
};

const credentialB = {
    hostname: 'b.com',
    cert: fs.readFileSync('./b-cert.pem'),
    key: fs.readFileSync('./b-key.pem'),
};

const httpsServer = vhttps.createServer(defaultCredential, [credentialA, credentialB], app);
httpsServer.listen(443);
```


## Next step
Will be trying to add Express integration.