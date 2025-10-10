import {useContext} from "react";
import RouterContext from "./Context";

/**
 * @typedef {import("simple-router").Router} Router
 * @typedef {import("simple-router").RouteInfo} Route
 */


/**
 * @returns {{route?: Route, router?: Router}}
 */
export default function useRouter() {
  const router = useContext(RouterContext);
  return {route: router && router.getCurrentRoute(), router}
}