import {FastifyInstance} from "fastify";

export interface Webapp {
  /** The fastify instance */
  server: FastifyInstance;
  /**
   * Register's the api routes under the path specified by Config.webapp.apiPath. To add hooks to
   * the API (/api) for your routes,
   * see {@link https://fastify.dev/docs/latest/Reference/Hooks#route-level-hooks|Route level hooks}
   * @param {ApiRegistration} apiReg The api registration function
   * @param {RegOpts} options The options to register the api
   */
  registerApi(apiReg: (api: FastifyInstance, options: any) => void, options: any);
}