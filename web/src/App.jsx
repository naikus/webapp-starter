import React, {useRef, useState, forwardRef, useEffect, useCallback} from "react";
import PropTypes from "prop-types";
import {CSSTransition, SwitchTransition} from "react-transition-group";

import "./App.less";

import createRouter, {useRouter, RouterProvider} from "@components/router";
import Progress from "@components/progress/Progress";
import Config from "@config";
import {Notifications, useNotifications} from "@components/notifications";
import {useOnMount} from "@components/util/hooks";
import routes from "./routes";

/**
 * @typedef {import("simple-router").Router} Router
 * @typedef {import("simple-router").RouteInfo} RouteInfo
 * @typedef {import("simple-router").create} createRouter 
 * @typedef {import("./components/notifications/index").NotifyFunction} NotifyFunction
 * @typedef {import("./routes").RouteControllerData} RouteControllerData
 */



// import top level styles
import "./index.less";

/**
 * @param {React.ComponentType} View 
 * @returns {React.ComponentType} 
 */
function createViewWrapper(View) {
  /* eslint-disable react/display-name */
  // Forward ref is for CSSTransition
  const Wrapper = forwardRef(
    /**
     * @param {any} props 
     * @param {import("react").LegacyRef<HTMLDivElement>} ref 
     * @returns 
     */
    (props, ref) => {
      const {className} = props;
      /*
      useOnMount(function restoreScrollPosition() {
        console.log("Restoring scroll postition...");
        // @todo
        // Restore it using the current route's path/runtimePath as key
        // e.g.
        // @ts-ignore
        ref.current.scrollTop = 700;
        return () => {
          // Store the curent position using the current router's path as key and restore it
        };
      });
      */

      return (
        <div className={`view-wrapper ${className}`} ref={ref}>
          {/* @ts-ignore */}
          {View ? <View context={props.context} /> : null}
        </div>
      );
    }
  );
  Wrapper.displayName = `ViewWrapper(${View.displayName || View.name})`;
  Wrapper.propTypes = {
    className: PropTypes.string,
    context: PropTypes.object
  };
  return React.memo(Wrapper, (prev, next) => {
    // console.debug("Context same?", prev.context === next.context);
    return prev.context === next.context;
  });
}


/**
 * Application wide nav bar
 * @param {{
 *  title?: string,
 *  logo: string,
 *  logoAltText?: string,
 *  children?: React.ReactNode
 * }} props 
 */
const AppBar = props => {
  const {title = "App", logo, logoAltText = "Logo", children} = props,
      {router} = useRouter(),
      /*
      [confirmLogout, setConfirmLogout] = useState(false),
      showConfirmLogout = useCallback(() => {
        setConfirmLogout(true)
      }, []),
      logout = useCallback(() => {
        setConfirmLogout(false);
        router && router.route("/logout");
      }, [router]),
      */
      goAbout = useCallback(() => {
        router && router.route("/about");
      }, [router]);

  /*
  useGlobalKeyListener(confirmLogout, "Escape", function cancelLogout() {
    setConfirmLogout(false);
  });
  */

  return (
    <>
      <div className={`actionbar app-bar`}>
        <div className="branding">
          <img className="logo" alt={logoAltText} src={logo} />
          <h2 className="title">{title}</h2>
        </div>
        <div className="actions">
          {
            /*
              * Actions used Views or anywhere else will appear here 
              * Each view can define actions using the <Actions> component and those will appear here
              */
          }
        </div>
        <div className="actions global-actions">
          <button className="action about-action"
              title={`About ${Config.appName}`}
              onClick={goAbout}
              aria-label="About">
            <i className="icon icon-info"></i>
          </button>
        </div>
      </div>
      {/** Logout Overlay */}
      {/* 
        <Overlay className={`top modal alert`}
            show={confirmLogout}>
          <div className="title">
            <h4>Sign Out?</h4>
          </div>
          <div className="content">
            Do you want to sign out?
          </div>
          <div className="actions">
            <button className="inline" onClick={() => (setConfirmLogout(false))}>No</button>
            <button className="primary inline" onClick={logout}>Sign Out</button>
          </div>
        </Overlay>
      */}
    </>
  );
};
AppBar.displayName = "AppBar";
AppBar.propTypes = {
  title: PropTypes.string,
  logo: PropTypes.string,
  logoAltText: PropTypes.string,
  children: PropTypes.node
};



/**
 * @param {{
 *  router: Router
 * }} props 
 */
function RouteLoadingIndicator(props) {
  const {router} = props,
      [isRouteLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    if(!router) {
      return;
    }

    const unsubs = [
      router.on("before-route", event => {
        setRouteLoading(true);
      }),
      router.on("route", event => {
        setRouteLoading(false);
      }),
      router.on("route-error", event => {
        setRouteLoading(false);
      })
    ];

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [router]);

  return isRouteLoading ? <Progress className="global" /> : null;
}
RouteLoadingIndicator.displayName = "RouteLoadingIndicator";


/**
 * @typedef {"top" | "left"} AppBarPosition
 */
/**
 * 
 * @param {{
 *  appBarPosition?: AppBarPosition
 * }} props 
 */
function App({appBarPosition = "left"}) {
  /** @type {import("react").MutableRefObject<Router|undefined>} */
  const [router, setRouter] = useState(null),
      /** @type {[RouteControllerData, (state: RouteControllerData) => void]} */
      [routeContext = {
        config: {appBar: false}
      }, setRouteContext] = useState(),
      {component: View, config = {}, route, data} = routeContext,
      {appBar = true} = config,
      transitionRef = useRef(null),
      transitionKey = route ? route.path : "root",
      /** @type {NotifyFunction} */
      notify = useNotifications();

  /*
  // Set theme based on system preference
  useOnMount(() => {
    if(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.firstElementChild.dataset.theme = "dark";
    }else {
      document.firstElementChild.dataset.theme = "light";
    }
  }, []);
  */

  // Router setup
  useOnMount(function setupRouter() {
    /** @type {Router} */
    // @ts-ignore
    const router = createRouter(routes, {
          defaultRoute: "/",
          errorRoute: "/~error"
        }),
        unsubs = [
          router.on("route", event => {
            // console.log("Setting route", context);
            // notify.toast(`Setting route ${context.route.runtimePath}`);
            /** @type {RouteControllerData} */
            const context = event.detail,
                {component /*, config = {}, data */} = context;
            /*
            let {requiresAuth} = config, authEnabled = true;
            if(authEnabled && requiresAuth) {
              const auth = await authService.getAuth();
              if(!auth.user) {
                // console.debug("Authentication required");
                notify({
                  content: "Please sign in to continue",
                  type: "error"
                });
                return router.route("/auth", {
                  // after authentication, forward to the original route
                  forwardTo: context.route.runtimePath
                });
              }
            }
            */

            if(component) {
              // console.debug("Creating wrapper", component.displayName);
              // A wrapper needs to be created every time as views are not cached
              context.component = createViewWrapper(context.component);
            }
            setRouteContext(context);
          }),
          router.on("route-error", event => {
            const {detail: {path, error}} = event;
            if(error && error.type === "abort") {
              return;
            }
            notify({
              content: (
                <span>
                  {`${path}: ${error.message || error}`}. <a href="#/">Home</a>
                </span>
              ),
              type: "error",
              sticky: true
            });
          })
        ];

    setRouter(router);
    router.start();
    router.route(router.getBrowserRoute() || "/");

    return () => {
      unsubs.forEach(unsub => unsub());
      router.stop();
      setRouter(null);
    };
  });

  if(!router) {
    // This message is because changes to the App.jsx don't work with viet hot reloading since the
    // router is null when the app is unmounted
    console.warn("Please refresh the page. Ignore if app is loaded");
    return null;
  }

  return (
    // @ts-ignore
    <RouterProvider router={router}>
      <div className={`app appbar-${appBarPosition}`}>
        {appBar ? 
          // @ts-ignore
          <AppBar logo={Config.logo} title={Config.appName} logoAltText="Logo" />
        : null}
 
        <SwitchTransition>
          {/* @ts-ignore */}
          <CSSTransition classNames={"fadeup"}
            nodeRef={transitionRef} 
            key={transitionKey} 
            timeout={{enter: 400, exit: 10}}>
            {/* @ts-ignore */}
            {View
              // @ts-ignore
              ? <View className={!appBar ? "no-appbar" : ""} context={{config, data}} ref={transitionRef} /> 
              : <div />
            }
          </CSSTransition>
        </SwitchTransition>

        <RouteLoadingIndicator router={router} />
        {/* @ts-ignore */}
        <Notifications  />
      </div>
    </RouterProvider>
  );
}
App.displayName = "App";
App.propTypes = {
  appBarPosition: PropTypes.oneOf(["top", "left"])
};

export default App;
