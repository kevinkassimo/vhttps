# VHTTPS Virtual Host on HTTPS
This minimal package aims to allow hosting multiple HTTPS sites on a single server/IP address. 

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

vhttps.createServer(defaultCredential, [credentialA, credentialB], (req, res) => {
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

vhttps.listen(443);
```

## Next step
Will be trying to add Express integration.