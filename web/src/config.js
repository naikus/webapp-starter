// @ts-nocheck
// Brand directory is set at build time. See vite.config.js -> alias for how this works!
import BrandConfig from  "@branding/index.js";
import {version} from "../package.json";

const config = {
  appName: import.meta.env.APP_NAME || "React Starter",
  appVersion: version,
  appNs: import.meta.env.APP_NS || "reactstarter",
  apiServer: import.meta.env.APP_API_SERVER || "http://localhost:7001",
  apiBasePath: import.meta.env.APP_API_BASE_PATH || "/api",
  branding: import.meta.env.APP_BRANDING,
  ...BrandConfig
};

export default config;