# VHTTPS Virtual Host on HTTPS
This minimal package aims to allow hosting multiple HTTPS sites with multiple certificates on a single server/IP address, without the need to use any reverse proxy. 

## Install
`npm install --save vhttps`  

## Usage
Use `vhttps.init`:  
```js
const vhttps = require('vhttps');

const options = {
    cert: fs.readFileSync('./default-cert.pem'),
    key: fs.readFileSync('./default-key.pem'),
};

const cred_a = {
    cert: fs.readFileSync('./a-cert.pem'),
    key: fs.readFileSync('./a-key.pem'),
};

const cred_b = {
    cert: fs.readFileSync('./b-cert.pem'),
    key: fs.readFileSync('./b-key.pem'),
};

// Create an vhttps instance
const server = vhttps.init();

// Set HTTPS options (with default certificate)
server.setOptions(options);

// Introduce handlers to different domain names
server.use('a.com', cred_a, (req, res) => {
    res.end('A.COM WORKS!');
});
server.use('b.com', cred_b, (req, res) => {
    res.end('B.COM WORKS!');
});

// (optional) Add default handler
server.use((req, res) => {
    res.end('DEFAULT.COM WORKS!');
});

// Listen at port 443
server.listen(443);
```
Use `vhttps.init` with Express:  
```js
const vhttps = require('vhttps');
const express = require('express');

const options = {};

const router_a = express.Router();
router_a.get('/', (req, res) => {
    res.end('A.COM WORKS!');
});

const router_b = express.Router();
router_b.get('/', (req, res) => {
    res.end('B.COM WORKS!');
});

const cred_a = {
    cert: fs.readFileSync('./a-cert.pem'),
    key: fs.readFileSync('./a-key.pem'),
};

const cred_b = {
    cert: fs.readFileSync('./b-cert.pem'),
    key: fs.readFileSync('./b-key.pem'),
};

// Create an vhttps instance
const server = vhttps.init();

// Introduce handlers to different domain names
server.use('a.com', cred_a, router_a);
server.use('b.com', cred_b, router_b);

// Listen at port 443
server.listen(443);
```

Direct usage for `vhttps.createServer`:  
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
Direct usage for `vhttps.createServer` with Express `vhost`:  
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
