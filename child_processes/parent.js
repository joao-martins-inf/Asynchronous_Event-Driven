const cp = require("child_process");
let child = cp.fork(__dirname + "/lovechild.js");
child.on("message", (m) => {
    console.log("Child said: ", m); // Parent got a message up from our child
});
child.send("I love you"); // Send a message down to our child