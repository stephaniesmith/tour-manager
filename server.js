/* eslint no-console: off */
const http = require('http');
const app = require('./lib/app');
const connect = require('./lib/utils/connect');

const PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tours';

connect(MONGODB_URI);

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log('server running on port ', server.address().port);
});