import React, {useEffect, useRef} from "react";
import {createPortal} from "react-dom";
import PropTypes from "prop-types";
import "./styles.less";

/**
 * Action component for AppBar
 * @param {{
 *  target: string
 *  className?: string,
 *  children: any
 * }} props
 */
const Actions = props => {
  const {target, className = ""} = props,
      element = useRef(document.createElement("div"));

  useEffect(function mountActionsOnTarget() {
    const targetElem = document.querySelector(`${target}`),
        {current} = element;
        
    current.className = `action-group ${className}`;

    if(!targetElem) {
      throw new Error(`target element ${target} not found`);
    }
    targetElem.appendChild(current);
    return () => {
      const {parentElement} = current;
      if(parentElement) {
        parentElement.removeChild(current);
      }
    };
  }, []);

  return createPortal(props.children, element.current);
};
Actions.displayName = "Actions";
Actions.propTypes = {
  target: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.any
};

export default Actions;