
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
