export const debounce = (/** @type {any} */ cb, delay = 1000) => {
  /** @type {NodeJS.Timeout} */
  let timeout;
  return (/** @type {any} */ ...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};
