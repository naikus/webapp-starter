import createRouter from "simple-router";
import RouterContext from "./Context";
import RouterProvider from  "./Provider";
import useRouter from "./useRouter";


/**
 * @typedef {import("simple-router").RouteDefn} RouteDefn
 * @typedef {import("simple-router").Router} Router
 * @typedef {import("simple-router").RouteInfo} RouteInfo
 * @typedef {import("simple-router").RouteAction} RouteAction
 * @typedef {import("simple-router").create} createRouter
 * @typedef {import("simple-router").RouteHistory} RouteHistory
 * @typedef {import("simple-router").RouteHistoryListener} RouteHistoryListener
 * @typedef {import("simple-router").RouteContext} RouteContext
 * @typedef {import("simple-router").EmptyRouteContext} EmptyRouteContext
 * @typedef {import("simple-router").Route} Route
 * @typedef {import("simple-router").create} createRouter
 */

/** @type {createRouter} */
export default createRouter;

export {
  useRouter,
  RouterContext,
  RouterProvider
};
