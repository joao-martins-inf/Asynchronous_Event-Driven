setTimeout(() => {
    console.log("now stop");
}, 100);
let intervalId = setInterval(() => {
    console.log("running")
}, 1);
intervalId.unref();
