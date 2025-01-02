/* global */
import React, {useState, useEffect, useRef} from "react";
import PropTypes from "prop-types";
import Portal from "../Portal";
import "./style.less";


const FOCUSABLE_ELEMS = "[tabindex], input, button, a[href], select, textarea, [contenteditable]",
    OVERLAY_FOCUS_DELAY = 300;
/**
 * Guards the focus within the overlay
 */
const FocusGuard = (props) => {
  /** @typedef {{current: import("react").DOMElement}} */
  const fcGuard = useRef(null),
      shiftKey = useRef(false),
      focusFirstElem = () => {
        const contextElem = fcGuard.current,
            // @ts-ignore
            elems = contextElem.querySelectorAll(FOCUSABLE_ELEMS);
        if(elems.length) {
          elems[1].focus();
        }
      },
      focusLastElem = () => {
        if(shiftKey) {
          const contextElem = fcGuard.current,
              // @ts-ignore
              elems = contextElem.querySelectorAll(FOCUSABLE_ELEMS);
          if(elems.length > 1) {
            elems[elems.length - 2].focus();
          }
        }
      };
      

  useEffect(() => {
    if(!fcGuard.current) {
      return;
    }

    const shiftKeyListener = e => {
      if(e.key === "Tab" && e.shiftKey) {
        shiftKey.current = true;
      }else {
        shiftKey.current = false;
      }
    };

    document.addEventListener("keydown", shiftKeyListener);
    setTimeout(() => {
      // focusFirstElem(fcGuard.current);
      focusFirstElem();
    }, OVERLAY_FOCUS_DELAY);
    return () => {
      document.removeEventListener("keydown", shiftKeyListener);
    };
  }, []);

  return (
    <div ref={fcGuard} className="focus-guard">
      <span className="fg-boundry" tabIndex={0} onFocus={focusLastElem} />
      {props.children}
      <span className="fg-boundry" tabIndex={0} onFocus={focusFirstElem} />
    </div>
  );
};
FocusGuard.propTypes = {
  onBlur: PropTypes.func,
  children: PropTypes.any
};

/**
 * Overlay comonent. Add the class "modal" to the overlay to make it a modal. Use the class
 * "bottom" to position the overlay at the bottom of the screen.
 * @param {{
 *   target?: string,
 *   className?: string,
 *   onClose?: function,
 *   children: React.ReactNode,
 *   show: boolean,
 * }} props
 */
function Overlay(props) {
  const {target = "body", show, className: clazz, onClose, children} = props,
    // [prevShow, setPrevShow] = useState(show),
    [wasShown, setWasShown] = useState(false),
    [anim, setAnim] = useState(false),
    [mount, setMount] = useState(false),
    /** @type {import("react").MutableRefObject<HTMLDivElement|null>} */
    overlayBackdropRef = useRef(null),
    {current: overlayBackdropElem} = overlayBackdropRef,
    overlayRef = useRef(null),
    overlayCloseAnimHandler = e => {
      // console.log("Animation end", e);
      if(e.animationName === "overlay_close") {
        setMount(false);
        onClose && onClose();
      }
    };

  useEffect(function registerCloseAnimListener() {
    if(!overlayBackdropElem) {
      return;
    }
    overlayBackdropElem.addEventListener("animationend", overlayCloseAnimHandler);
    return () => {
      overlayBackdropElem.removeEventListener("animationend", overlayCloseAnimHandler);
    };
  }, [overlayBackdropElem]);

  // mount & unmount
  useEffect(function showOverlay() {
    if(show) {
      setMount(true);
      setAnim(true);
      setWasShown(true);
    }else {
      if(wasShown) {
        setAnim(false);
      }
    }
  }, [show]);

  /*
  if(show !== prevShow && show) {
    console.log("Mounting...");
    setPrevShow(show);
    setMount(true);
    setAnim(true);
    setWasShown(true);
  }
  */

  // unmount
  /*
  useEffect(() => {
    if(!show && wasShown) {
      setAnim(false);
    }
  }, [show]);
  */
  /*
  if(show !== prevShow && !show && wasShown) {
    setPrevShow(show);
    setAnim(false);
  }
  */

  return mount ? (
    /* @ts-ignore */
    <Portal target={target}>
      {/* @ts-ignore */}
      <FocusGuard>
        <div ref={overlayBackdropRef} className={`overlay-backdrop ${anim ? "__visible" : ""}`}>
          <div ref={overlayRef} className={`overlay ${clazz}`}>
            {children}
          </div>
        </div>
      </FocusGuard>
    </Portal>
  ) : null;
}
Overlay.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  target: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.any
};

export default Overlay;
