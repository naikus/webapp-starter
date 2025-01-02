import {useContext} from "react";
import RouterContext from "./Context";

/**
 * @typedef {import("simple-router").Router} Router
 */


/**
 * @returns {Router?}
 */
export default function useRouter() {
  return useContext(RouterContext);
}