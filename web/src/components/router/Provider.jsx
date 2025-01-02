import React from  "react";
import PropTypes from "prop-types";
import Context from "./Context";

/**
 * @typedef {import("simple-router").Router} Router
 * @typedef {import("react").Context<Router>} RouterContext
 */


/**
 * A Router context provider
 * @param {{
 *   router: Router,
 *   children: any
 * }} props
 */
function Provider(props) {
  const {router, children} = props;
  return (
    // @ts-ignore
    <Context.Provider value={router}>
      {children}
    </Context.Provider>
  );
}
Provider.displayName = "RouterProvider";
Provider.propTypes = {
  router: PropTypes.object,
  children: PropTypes.node
};

export default Provider;