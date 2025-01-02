function addListener(target, event, handler, once) {
  const h = once
      ? evt => {
        if(once) {
          target.removeEventListener(event, h);
        }
        handler(evt);
      }
      : handler;
  target.addEventListener(event, h);
  return () => {
    target.removeEventListener(event, h);
  };
}

/**
 * Creates a new promise and returns it with its resolve and reject methods.
 * This is useful if you want to return a promise and resolve it later (e.g. on an event) but
 * you don't want to wrap everything in the promise.
 * @returns {{resolve: Function, reject: Function, promise: Promise}} An object with the 
 * resolve, reject and promise
 */
function promiseWithResolver() {
  /** @type {(any) => void} */
  let resolve,
      /** @type {(any) => void} */
      reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // @ts-ignore
  return {resolve, reject, promise};
}

export {promiseWithResolver, addListener};