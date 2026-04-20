const http = require('http');

const payload = JSON.stringify({
  email: 'admin@system.com',
  password: 'Admin@123',
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk.toString('utf8'); });
  res.on('end', () => {
    console.log('status=' + res.statusCode);
    console.log('body=' + data);
  });
});

req.on('error', (e) => {
  console.error('request_error=' + e.message);
});

req.write(payload);
req.end();

