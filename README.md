
# Asynchronous Event Driven

In this repo we will delve deeper into how Node implements event driven programming.
We will begin by unpacking the ideas and theories
that event-driven languages and environments derive from and grapple
with, in an effort to clear away misconceptions and encourage mastery.
Following this introduction to events, we'll look at the key Node.js
technology—the event loop. We'll then go into more detail on how Node
implements timers, callbacks, and I/O events, and how you as a Node
developer can use them. We'll further discuss management of concurrency
using modern tools such as Promises, Generators, and async/await. We'll
practice the theory as we build up some simple but exemplary file and data
driven applications. These examples highlight Node's strengths, and show
how Node is succeeding in its ambition to simplify network application
designs

---
## Node unique design

Clock cycles in typical system tasks. (taken from Ryan Dahl's original presentation on Node)

| L1 cache | L2Cache   | RAM        | Disk              | Network            |
|----------|-----------|------------|-------------------|--------------------|
| 3 cycles | 14 cycles | 250 cycles | 41,000,000 cycles | 240,000,000 cycles |

---

## The event loop

The following three points are important to remember, as we break down
the event loop:

* The event loop runs in the same (single) thread your JavaScript code
  runs in. Blocking the event loop means blocking the entire thread.
  
* You don't start and/or stop the event loop. The event loop starts as soon
  as a process starts, and ends when no further callbacks remain to be
  performed. The event loop may, therefore, run forever.
  
* The event loop delegates many I/O operations to libuv, which manages
  these operations (using the power of the OS itself, such as thread
  pools), notifying the event loop when results are available. An easy-to-reason-about single-threaded programming model is reinforced with
  the efficiency of multithreading.

For example, the following while loop will never terminate:


```javascript
let stop = false;
setTimeout(() => {
 stop = true;
}, 1000);
while (stop === false) {};
```

Even though one might expect, in approximately one second, the
assignment of a Boolean true to the variable stop, tripping
the while conditional and interrupting its loop; this will never happen. Why?
This while loop starves the event loop by running infinitely, greedily
checking and rechecking a value that is never given a chance to change, as
the event loop is never given a chance to schedule our timer callback for
execution. This proves the event loop (which manages timers), and runs on
the same thread.
According to the Node documentation, "The event loop is what allows
Node.js to perform non-blocking I/O operations — despite the fact that
JavaScript is single-threaded — by offloading operations to the system

useful links:

- [What is EVENT-DRIVEN PROGRAMMING?](https://www.youtube.com/watch?v=QQnz4QHNZKc)
- [Node delegates I/O work to libuv](http://nikhilm.github.io/uvbook/basics.html#event-loops)
- [What is event loop](https://www.youtube.com/watch?v=EI7sN1dDwcY)
## Event loop ordering, phases, and priorities

- [Three strategies for js Event-loop](https://www.youtube.com/watch?v=IvLltoCt8QU)

## Signals

"A signal is a limited form of inter-process communication used in Unix, Unix-like, and other
Portable Operating System Interface (POSIX) compliant operating systems. It is
asynchronous notification sent to a process, or to a specific thread, within the same process in order to
notify it of an event that occurred"

For example, the SIGINT signal is sent to a process when its controlling
terminal detects a Ctrl + C (or equivalent) keystroke. This signal tells a
process that an interrupt has been requested. If a Node process has bound a
callback to this event, that function might log the request prior to
terminating, do some other cleanup work, or even ignore the request

```javascript
// sigint.js
console.log("Running...");
// After 16 minutes, do nothing
setInterval(() => {}, 1e6); // Keeps Node running the process
// Subscribe to SIGINT, so some of our code runs when Node gets that signal
process.on("SIGINT", () => {
  console.log("We received the SIGINT signal!");
  process.exit(1);
});
```

The following is the output for sigint.js:

```
Running...
(then press Ctrl+C)
We received the SIGINT signal!
```

considering a situation in which a Node process is doing some ongoing
work, such as parsing logs. It might be useful to be able to send that process
a signal, such as update your configuration files, or restart the scan. You
may want to send such signals from the command line. You might prefer to
have another process do so — a practice known as Inter-Process
Communication (IPC).

In ``ipc.js`` Node will wait for around 16 minutes before running the empty
function, keeping the process open, so you'll have to Ctrl + C to get your
prompt back. Note that this works just fine even though here, we haven't
subscribed to the SIGINT signal

To send a command to a process, you must determine its process ID. With a
PID in hand, you can address a process and communicate with it. If the PID
assigned to ipc.js after being run through Node is 123, then we can send that
process a SIGUSR1 signal using the kill command:
``$ kill –s SIGUSR1 123``\
\
a little help to find PID in linux: ``ps aux | grep ipc.js``

## Child processes
To create a child process, require Node's child_process module, and call the
fork method. Pass the name of the program file the new process should
execute:

```javascript
let cp = require("child_process");
let child = cp.fork(__dirname + "/lovechild.js");
```
You can keep any number of subprocesses running with this method. On
multicore machines, the operating system will distribute forked processes
across the available hardware cores.

Extending the preceding example, we can now have the forking process
(``parent.js``) send, and listen for, messages from the forked process (``child.js``)

Don't run ``lovechild.js`` yourself; ``parent.js`` will do that for you with fork!


Another very powerful idea is to pass a network server an object to a child.
This technique allows multiple processes, including the parent, to share the
responsibility for servicing connection requests, spreading load across
cores.

For example, the following program will start a network server, fork a child
process, and pass the server reference from the parent down to the child:

```javascript
// net-parent.js
const path = require('path');
let child = require("child_process").fork(path.join(__dirname, "net-child.js"));
let server = require("net").createServer();
server.on("connection", (socket) => {
 socket.end("Parent handled connection");
});
server.listen(8080, () => {
 child.send("Parent passing down server", server);
});
```

In addition to passing a message to a child process as the first argument to
send, the preceding code also sends the server handle to itself as a second
argument. Our child server can now help out with the family's service
business:

```javascript
// net-child.js
process.on("message", function(message, server) {
 console.log(message);
 server.on("connection", function(socket) {
 socket.end("Child handled connection");
 });
});
```

## File events

Most applications make some use of the filesystem, in particular, those that
function as web services. As well, a professional application will likely log
information about usage, cache pre-rendered data views, or make other
changes to files and directory structures. Node allows developers to register
for notifications on file events through the``fs.watch``method. The watch
method broadcasts changed events on both files and directories.\
\
\
The ``watch`` method accepts three arguments:
- The file or directory path being watched. If the file does not exist, an
ENOENT (no entity) error will be thrown, so using fs.exists at some
prior useful point is encouraged.
- An optional options object, including:
  - Persistent (Boolean default true): Node keeps processes alive, as
  long as there is something to do. Set this option to false to let
  Node close the process even if your code still has a file watcher
  watching.
  - Recursive (Boolean default false): Whether to automatically
  descend into subdirectories. Note: This is not consistently
  implemented across platforms. For this reason, and for
  performance reasons, you should explicitly control the file list
  you are watching, rather than randomly watching directories.
  - Encoding (String default utf8): Character encoding of passed
  filenames. You probably don't need to change this.
- The listener function, which receives two arguments:
  The name of the change event (one of rename or change)
  The filename that was changed (important when watching
  directories)
\

This example will set up a watcher on itself, change its own filename, and
exit:

```javascript
const fs = require('fs');
fs.watch(__filename, { persistent: false }, (event, filename) => {
 console.log(event);
 console.log(filename);
})
setImmediate(function() {
 fs.rename(__filename, __filename + '.new', () => {});
});
```

Close your watcher channel whenever you want to use code like this:
```javascript
let w = fs.watch('file', () => {});
w.close();
```

It should be noted that fs.watch depends a great deal on how the host OS
handles file events, and the Node documentation says this:\
"The ``fs.watch`` API is not 100% consistent across platforms, and is
unavailable in some situations."

## Deferred execution

### process.nextTick


