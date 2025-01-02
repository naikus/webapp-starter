import React, {useEffect, useRef} from "react";
import {createPortal} from "react-dom";
import PropTypes from "prop-types";

/**
 * 
 * @param {{
 *  target?: string,
 *  replace?: string,
 *  children: any
 * }} props 
 * @returns {import("react").ReactPortal}
 */
const Portal = props => {
  const {target = "body", replace = "", children} = props,
      portalRef = useRef(document.createElement("div")),
      portalElem = portalRef.current,
      /** @type {import("react").MutableRefObject<HTMLElement|null>} */
      targetRef = useRef(typeof target === "string" ? document.querySelector(target) : target),
      targetElem = targetRef.current;

  useEffect(function mountElementOnTarget() {
    if(!targetElem) {
      console.warn(`Portal target ${target} not found`);
        return;
    }
    if(replace) {
      const existing = targetElem.querySelector(replace);
      // @ts-ignore
      existing && existing.parentNode.removeChild(existing);
    }
    portalElem.className = "portal";
    targetElem.appendChild(portalElem);
    return () => {
      targetElem.removeChild(portalElem);
    };
  }, []);
  // }, [children]); @TODO: this is causing the portal to be removed and re-added on every render

  /*
  useEffect(() => {
    portalElem.className = "portal";
    targetElem.appendChild(portalElem);
    return () => {
      targetElem.removeChild(portalElem);
    };
  }, []);
  */

  // render
  return createPortal(children, portalElem);
};
Portal.propTypes = {
  target: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  replace: PropTypes.string
};
Portal.displayName = "Portal";

export default Portal;
