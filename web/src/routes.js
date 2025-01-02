// import AboutView from "./modules/AboutView";
// import LandingView from "./modules/LandingView";
// import FormView from "./modules/FormView";

/**
 * @typedef RouteControllerData
 * @property {string} [forward]
 * @property {any} [component]
 * @property {any} [data]
 * @property {any} [config]
 */

/**
 * @typedef {import("simple-router").Router} Router
 * @typedef {import("simple-router").RouteDefn} RouteDefn
 */

/**
 * @typedef AppRouteDefn
 * @property {string} path 
 * @property {(context: any) => Promise<RouteControllerData>} controller
 * @extends {RouteDefn}
 */


/**
 * @type {AppRouteDefn[]}
 */
export default [
  /** @type {AppRouteDefn} */
  {
    path: "/",
    controller: async (context) => {
      return {
        forward: "/landing"
      };
    }
  },
  // Example of loading a view and it's dependencies lazily
  // Also how to pass query parameters e.g. "/landing?hello=world&world=hello"
  {
    path: "/landing{\\?:query}",
    controller: async (context) => {
      const {route: {params}} = context,
          {query = ""} = params,
          queryParams = new URLSearchParams(query);

      // console.log(queryParams.toString());
      const LandingView = (await import("./modules/LandingView")).default;
      return {
        // forward: "/route-error",
        component: LandingView,
        data: {
          queryParams
        }
      };
    }
  },
  {
    path: "/form",
    controller: async () => {
      const FormView = (await import("./modules/FormView")).default;
      return {
        // forward: "/route-error",
        component: FormView,
        // data passed to form view (can be fetched from server)
        data: {
          formTitle: "Hobby Form"
        },
        config: {
          requiresAuth: true
        }
      };
    }
  },
  {
    path: "/about",
    controller: async () => {
      const AboutView = (await import("./modules/AboutView")).default;

      return new Promise((res, rej) => {
        setTimeout(() => {
          res({
            component: AboutView,
            config: {
              appBar: false
            }
          });
        }, 1000);
      });
    }
  }
];
