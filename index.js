const server = require("./app/server/server");
const port = process.env.SERVICE_PORT;

server.listen(port, () => { console.log('We are live on ' + port); });