console.log("Running...");
// After 16 minutes, do nothing
setInterval(() => {}, 1e6); // Keeps Node running the process
// Subscribe to SIGINT, so some of our code runs when Node gets that signal
process.on("SIGINT", () => {
    console.log("We received the SIGINT signal!");
    process.exit(1);
});