const Server = require('./test-server.js');

const server = new Server(9999);

module.exports = async () => {
  // ...
  // Set reference to mongod in order to close the server during teardown.
  global.__SERVER__ = server;
};
