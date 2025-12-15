// server/events/index.js
const listeners = {};

exports.emitEvent = (event, payload) => {
  if (!listeners[event]) {
    return;
  }

  for (const handler of listeners[event]) {
    setImmediate(async () => {
      try {
        await handler(payload);
      } catch (err) {
        console.warn(`[Event ${event}]`, err.message);
      }
    });
  }
};

exports.onEvent = (event, handler) => {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(handler);
};
