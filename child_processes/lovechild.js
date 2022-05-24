process.on("message", (m) => {
    console.log("Parent said: ", m); // Child got a message down from the parent
    process.send("I love you too"); // Send a message up to our parent
});
