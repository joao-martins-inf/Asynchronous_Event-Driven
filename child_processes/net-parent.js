const path = require('path');
let child = require("child_process").fork(path.join(__dirname, "net-child.js"));
let server = require("net").createServer();
server.on("connection", (socket) => {
    socket.end("Parent handled connection");
});
server.listen(8080, () => {
    child.send("Parent passing down server", server);
});