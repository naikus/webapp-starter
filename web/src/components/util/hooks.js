import {useRef, useState, useEffect} from "react";

/**
 * @typedef {import("react").SetStateAction<Error|null|undefined>} SetErrorAction
 * @typedef {import("react").Dispatch<SetErrorAction>} ErrorDispatch
 */

function useOnMount(callback) {
  const ref = useRef();
  useEffect(() => {
    const {current} = ref;
    if(!current) {
      ref.current = callback() || (() => {});
    }
    /**
     * This is intntionally not returning a cleanup function the first time. We don't
     * want that. The cleanup function will only be returned on subsequent call. (i.e.
     * when the component is unmounted)
     */
    return current;
  }, []);
}

function useAsyncCall(asyncCall) {
  const [busy, setBusy] = useState(false),
      [error, setError] = useState();
  return [
    async (...args) => {
      setBusy(true);
      try {
        return await asyncCall(...args);
      }catch(err) {
        // @ts-ignore
        setError(err);
      }finally {
        setBusy(false);
      }
    },
    busy,
    error
  ];
}

function useAsyncCallImmediate(asyncCall, ...args) {
  const [busy, setBusy] = useState(true),
      [error, setError] = useState(null),
      [result, setResult] = useState(null),
      ref = useRef(false),
      execute = async () => {
        if(ref.current) {
          return;
        }
        ref.current = true;
        // setBusy(true);
        try {
          const res = await asyncCall(...args);
          setResult(res);
        }catch(err) {
          // @ts-ignore
          setError(err);
          // throw err;
        }finally {
          setBusy(false);
        }
      };

  // setTimeout(() => {
  execute();
  // }, 1000);

  return [
    result,
    busy,
    error
  ];
}

/**
 * Calls this effect only once (for the first time) and when the deps change
 * @param {function} fn 
 * @param {Array<any>} deps 
 */
function useEffectOnce(fn, deps = []) {
  /** @type {import("react").MutableRefObject<Function|undefined|null>} */
  const ref = useRef();
  useEffect(() => {
    if(!ref.current) {
      ref.current = fn;
      return;
    }else {
      return ref.current();
    }
  }, deps);
}


export {
  useEffectOnce,
  useOnMount,
  useAsyncCall,
  useAsyncCallImmediate
};