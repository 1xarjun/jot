export function debounce(cb, delay) {
  let timeout;
  let lastArgs;

  function flush() {
    if (!timeout) return;
    clearTimeout(timeout);
    timeout = undefined;
    cb(...lastArgs);
  }

  function debounced(...args) {
    clearTimeout(timeout);
    lastArgs = args;
    timeout = setTimeout(() => {
      timeout = undefined;
      cb(...args);
    }, delay);
  };

  debounced.flush = flush
  return debounced;
}
