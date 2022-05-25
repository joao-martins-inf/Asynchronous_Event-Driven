const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
let pos = 0;
let messenger = new EventEmitter();
// Listener for EventEmitter
messenger.on("message", (msg) => {
    console.log(++pos + " MESSAGE: " + msg);
});
// (A) FIRST
console.log(++pos + " FIRST"); //sync goes first
// (B) NEXT
process.nextTick(() => { //
    console.log(++pos + " NEXT")
})
// (C) QUICK TIMER
setTimeout(() => {
    console.log(++pos + " QUICK TIMER")
}, 0)
// (D) LONG TIMER
setTimeout(() => {
    console.log(++pos + " LONG TIMER")
}, 10)
// (E) IMMEDIATE
setImmediate(() => {
    console.log(++pos + " IMMEDIATE")
})
// (F) MESSAGE HELLO!
messenger.emit("message", "Hello!"); // sync goes second
// (G) FIRST STAT
fs.stat(__filename, () => {
    console.log(++pos + " FIRST STAT");
});
// (H) LAST STAT
fs.stat(__filename, () => {
    console.log(++pos + " LAST STAT");
});
// (I) LAST
console.log(++pos + " LAST");


/**
 * What is the order of logged messages?
 *
 * A
 *
 *
 */