import React from "react";

/**
 * @typedef {import("simple-router").Router} Router
 * @typedef {import("react").Context<Router?>} RouterContext
 */

/** @type {RouterContext} */
// @ts-ignore
const RouterContext = React.createContext(null);
RouterContext.displayName = "RouterContext";

export default RouterContext;