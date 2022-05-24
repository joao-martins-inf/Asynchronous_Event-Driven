const events = require('events');

function getEmitter() {
    let emitter = new events.EventEmitter();
    //process.nextTick(() => {
    //    emitter.emit('start');
    //});
    emitter.emit('start');
    return emitter;
}

let myEmitter = getEmitter();
myEmitter.on("start", () => {
    console.log("Started");
});